# Backend/apps/locations/serializers.py

from rest_framework import serializers
from apps.locations.models import City, BusStation


class CitySerializer(serializers.ModelSerializer):
    """
    Serializer for City model
    Used for public listing and station relationships
    """
    
    class Meta:
        model = City
        fields = [
            'id',
            'name',
            'state_province',
            'country',
            'display_name',
            'timezone',
            'is_active'
        ]
        read_only_fields = ['id', 'display_name']


class CityDetailSerializer(serializers.ModelSerializer):
    """
    Detailed city serializer with coordinates
    """
    coordinates = serializers.SerializerMethodField()
    
    class Meta:
        model = City
        fields = [
            'id',
            'name',
            'state_province',
            'country',
            'display_name',
            'latitude',
            'longitude',
            'coordinates',
            'timezone',
            'is_active'
        ]
        read_only_fields = ['id', 'display_name', 'coordinates']
    
    def get_coordinates(self, obj):
        """Get coordinates as dict"""
        coords = obj.get_coordinates()
        if coords:
            return {
                'latitude': coords[0],
                'longitude': coords[1]
            }
        return None


class BusStationSerializer(serializers.ModelSerializer):
    """
    Full serializer for BusStation
    Used for listing and detail views
    """
    
    city = CitySerializer(read_only=True)
    company_name = serializers.CharField(
        source='company.name',  # Changed from business_name to name
        read_only=True
    )
    coordinates = serializers.SerializerMethodField()
    
    class Meta:
        model = BusStation
        fields = [
            'id',
            'company',
            'company_name',
            'city',
            'name',
            'address',
            'phone_number',
            'latitude',
            'longitude',
            'coordinates',
            'is_active',
            'display_name',
            'full_address',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'company',
            'company_name',
            'display_name',
            'full_address',
            'coordinates',
            'created_at',
            'updated_at'
        ]
    
    def get_coordinates(self, obj):
        """Get coordinates as dict"""
        coords = obj.get_coordinates()
        if coords:
            return {
                'latitude': coords[0],
                'longitude': coords[1]
            }
        return None


class BusStationCreateSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for creating/updating stations
    """
    
    city_id = serializers.PrimaryKeyRelatedField(
        queryset=City.objects.filter(is_active=True),
        source='city',
        write_only=True,
        help_text="ID of the city where station is located"
    )
    
    class Meta:
        model = BusStation
        fields = [
            'city_id',
            'name',
            'address',
            'phone_number',
            'latitude',
            'longitude',
            'is_active'
        ]
    
    def validate_city_id(self, value):
        """Ensure city is active"""
        if not value.is_active:
            raise serializers.ValidationError(
                f"Cannot create station in inactive city: {value.name}"
            )
        return value
    
    def create(self, validated_data):
        """Auto-assign company from authenticated user"""
        request = self.context.get('request')
        
        if not request:
            raise serializers.ValidationError("Request context is required")
        
        user = request.user
        
        # ✅ FIX: Your User model has 'company' ForeignKey
        if not user.company:
            raise serializers.ValidationError(
                f"User '{user.email}' (role: {user.role}) is not associated with any bus company. "
                f"Please contact support to link your account to a company."
            )
        
        # Verify user is company_admin or company_staff
        if not user.is_company_user:
            raise serializers.ValidationError(
                f"Only company users can create stations. Your role is: {user.get_role_display()}"
            )
        
        validated_data['company'] = user.company
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Prevent changing company"""
        validated_data.pop('company', None)
        return super().update(instance, validated_data)


class BusStationListSerializer(serializers.ModelSerializer):
    """
    Minimal serializer for dropdown/select lists
    """
    city_name = serializers.CharField(source='city.name', read_only=True)
    
    class Meta:
        model = BusStation
        fields = [
            'id',
            'name',
            'city_name',
            'display_name',
            'is_active'
        ]
        read_only_fields = ['id', 'display_name', 'city_name']