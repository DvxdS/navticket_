# Backend/apps/transport/serializers.py

from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, time, date
from .models import Route, Trip
from apps.locations.models import City


class CitySerializer(serializers.ModelSerializer):
    """Basic city info for nested serialization"""
    class Meta:
        model = City
        fields = ['id', 'name', 'state_province', 'display_name']


class RouteListSerializer(serializers.ModelSerializer):
    """Route serializer for listing with city details"""
    origin_city = CitySerializer(read_only=True)
    destination_city = CitySerializer(read_only=True)
    route_display = serializers.ReadOnlyField()
    duration_hours = serializers.ReadOnlyField()
    
    class Meta:
        model = Route
        fields = [
            'id', 'origin_city', 'destination_city', 'route_display',
            'distance_km', 'estimated_duration_minutes', 'duration_hours',
            'base_price', 'is_active', 'created_at'
        ]


class RouteCreateSerializer(serializers.ModelSerializer):
    """Route serializer for creation/update"""
    
    class Meta:
        model = Route
        fields = [
            'origin_city', 'destination_city', 'distance_km', 
            'estimated_duration_minutes', 'base_price'
        ]
    
    def validate(self, attrs):
        """Cross-field validation"""
        if attrs['origin_city'] == attrs['destination_city']:
            raise serializers.ValidationError(
                "Origin and destination cities cannot be the same"
            )
        return attrs
    
    def create(self, validated_data):
        """Auto-assign company from request user"""
        request = self.context.get('request')
        if request and hasattr(request.user, 'company'):
            validated_data['bus_company'] = request.user.company
        return super().create(validated_data)


class TripListSerializer(serializers.ModelSerializer):
    """Trip serializer for listing with route and company info"""
    route = RouteListSerializer(read_only=True)
    departure_datetime = serializers.ReadOnlyField()
    arrival_datetime = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    occupancy_rate = serializers.ReadOnlyField()
    can_be_booked = serializers.ReadOnlyField()
    company_name = serializers.CharField(source='route.bus_company.name', read_only=True)
    
    class Meta:
        model = Trip
        fields = [
            'id', 'route', 'company_name', 'departure_date', 'departure_time', 
            'arrival_time', 'departure_datetime', 'arrival_datetime',
            'total_seats', 'available_seats', 'occupancy_rate', 'is_full',
            'price', 'bus_number', 'bus_type', 'status', 'can_be_booked',
            'created_at'
        ]


class TripCreateSerializer(serializers.ModelSerializer):
    """Trip serializer for creation with validation"""
    
    class Meta:
        model = Trip
        fields = [
            'route', 'departure_date', 'departure_time', 'arrival_time',
            'total_seats', 'price', 'bus_number', 'bus_type'
        ]
    
    def validate_departure_date(self, value):
        """Ensure departure date is in the future"""
        if value < timezone.now().date():
            raise serializers.ValidationError(
                "Departure date cannot be in the past"
            )
        return value
    
    def validate_route(self, value):
        """Ensure route belongs to the requesting company"""
        request = self.context.get('request')
        if request and hasattr(request.user, 'company'):
            if value.bus_company != request.user.company:
                raise serializers.ValidationError(
                    "You can only create trips for your company's routes"
                )
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        departure_time = attrs.get('departure_time')
        arrival_time = attrs.get('arrival_time')
        
        # Validate time sequence
        if departure_time and arrival_time:
            if arrival_time <= departure_time:
                raise serializers.ValidationError({
                    'arrival_time': 'Arrival time must be after departure time'
                })
        
        # Validate reasonable trip duration
        if departure_time and arrival_time:
            dep_minutes = departure_time.hour * 60 + departure_time.minute
            arr_minutes = arrival_time.hour * 60 + arrival_time.minute
            duration_minutes = arr_minutes - dep_minutes
            
            if duration_minutes < 30:
                raise serializers.ValidationError(
                    'Trip duration must be at least 30 minutes'
                )
            if duration_minutes > 720:  # 12 hours
                raise serializers.ValidationError(
                    'Trip duration cannot exceed 12 hours'
                )
        
        return attrs
    
    def create(self, validated_data):
        """Set defaults and create trip"""
        # Set available seats equal to total seats initially
        validated_data['available_seats'] = validated_data['total_seats']
        
        # Set created_by if available
        request = self.context.get('request')
        if request and request.user:
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)


class TripUpdateSerializer(serializers.ModelSerializer):
    """Trip serializer for updates with limited fields"""
    
    class Meta:
        model = Trip
        fields = [
            'departure_date', 'departure_time', 'arrival_time',
            'price', 'bus_number', 'bus_type', 'status'
        ]
    
    def validate_departure_date(self, value):
        """Only allow future dates"""
        if value < timezone.now().date():
            raise serializers.ValidationError(
                "Departure date cannot be in the past"
            )
        return value
    
    def validate_status(self, value):
        """Validate status transitions"""
        if self.instance:
            current_status = self.instance.status
            
            # Define allowed status transitions
            allowed_transitions = {
                'draft': ['scheduled', 'cancelled'],
                'scheduled': ['in_progress', 'cancelled', 'delayed', 'on_time'],
                'in_progress': ['completed', 'delayed', 'on_time', 'late', 'early'],
                'delayed': ['in_progress', 'completed', 'cancelled'],
                'on_time': ['completed', 'in_progress'],
                'early': ['completed'],
                'late': ['completed'],
                'completed': [],  # No transitions from completed
                'cancelled': []   # No transitions from cancelled
            }
            
            if value not in allowed_transitions.get(current_status, []):
                raise serializers.ValidationError(
                    f"Cannot change status from {current_status} to {value}"
                )
        
        return value


class TripDetailSerializer(serializers.ModelSerializer):
    """Detailed trip serializer with all related info"""
    route = RouteListSerializer(read_only=True)
    departure_datetime = serializers.ReadOnlyField()
    arrival_datetime = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    occupancy_rate = serializers.ReadOnlyField()
    can_be_booked = serializers.ReadOnlyField()
    company_name = serializers.CharField(source='route.bus_company.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Trip
        fields = [
            'id', 'route', 'company_name', 'departure_date', 'departure_time',
            'arrival_time', 'departure_datetime', 'arrival_datetime',
            'total_seats', 'available_seats', 'occupancy_rate', 'is_full',
            'price', 'bus_number', 'bus_type', 'status', 'can_be_booked',
            'created_by_name', 'created_at', 'updated_at'
        ]


class TripSearchSerializer(serializers.Serializer):
    """Serializer for trip search filters"""
    origin_city = serializers.IntegerField(required=False)
    destination_city = serializers.IntegerField(required=False)
    departure_date = serializers.DateField(required=False)
    min_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    bus_type = serializers.CharField(required=False)
    status = serializers.CharField(required=False)
    
    def validate_departure_date(self, value):
        """Ensure search date is not in the past"""
        if value and value < timezone.now().date():
            raise serializers.ValidationError(
                "Cannot search for trips in the past"
            )
        return value