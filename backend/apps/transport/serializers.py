from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, time, date
from .models import Route, Trip, TripTemplate
from apps.locations.models import City, BusStation
from apps.locations.serializers import BusStationSerializer

class TripTemplateSerializer(serializers.ModelSerializer):
    """
    Serializer complet pour TripTemplate
    Utilisé pour l'affichage des modèles de trajets récurrents
    """
    
    bus_company_name = serializers.CharField(
        source='bus_company.name',
        read_only=True
    )
    
    departure_station = BusStationSerializer(read_only=True)
    arrival_station = BusStationSerializer(read_only=True)
    
    route_display = serializers.CharField(read_only=True)
    duration_hours = serializers.FloatField(read_only=True)
    operates_on_display = serializers.CharField(read_only=True)
    days_choices = serializers.SerializerMethodField()
    
    class Meta:
        model = TripTemplate
        fields = [
            'id',
            'bus_company',
            'bus_company_name',
            'departure_station',
            'arrival_station',
            'departure_time',
            'duration_minutes',
            'operates_on_days',
            'operates_on_display',
            'days_choices',
            'bus_type',
            'bus_number',
            'total_seats',
            'price',
            'valid_from',
            'valid_until',
            'is_active',
            'route_display',
            'duration_hours',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'bus_company',
            'bus_company_name',
            'route_display',
            'duration_hours',
            'operates_on_display',
            'created_at',
            'updated_at'
        ]
    
    def get_days_choices(self, obj):
        """Retourne les choix de jours en français"""
        return [
            {'value': day[0], 'label': day[1]} 
            for day in TripTemplate.DAYS_OF_WEEK
        ]


class TripTemplateCreateSerializer(serializers.ModelSerializer):
    """
    Serializer simplifié pour créer/modifier des modèles de trajets
    """
    
    departure_station_id = serializers.PrimaryKeyRelatedField(
        queryset=BusStation.objects.none(),
        source='departure_station',
        write_only=True,
        help_text="ID de la gare de départ"
    )
    
    arrival_station_id = serializers.PrimaryKeyRelatedField(
        queryset=BusStation.objects.none(),
        source='arrival_station',
        write_only=True,
        help_text="ID de la gare d'arrivée"
    )
    
    class Meta:
        model = TripTemplate
        fields = [
            'departure_station_id',
            'arrival_station_id',
            'departure_time',
            'duration_minutes',
            'operates_on_days',
            'bus_type',
            'bus_number',
            'total_seats',
            'price',
            'valid_from',
            'valid_until',
            'is_active'
        ]
    
    def __init__(self, *args, **kwargs):
        """Dynamically set queryset based on request user's company"""
        super().__init__(*args, **kwargs)
        
        request = self.context.get('request')
        
        if request and hasattr(request.user, 'company') and request.user.company:
            company_stations = BusStation.objects.filter(
                company=request.user.company,
                is_active=True
            )
            
            self.fields['departure_station_id'].queryset = company_stations
            self.fields['arrival_station_id'].queryset = company_stations
    
    def validate(self, data):
        """Validation globale"""
        request = self.context.get('request')
        
        # Valider que les gares sont différentes
        departure_station = data.get('departure_station')
        arrival_station = data.get('arrival_station')
        
        if departure_station and arrival_station:
            if departure_station.id == arrival_station.id:
                raise serializers.ValidationError({
                    'arrival_station_id': "La gare d'arrivée doit être différente de la gare de départ"
                })
            
            # Valider que les gares appartiennent à la compagnie de l'utilisateur
            if request and hasattr(request.user, 'company') and request.user.company:
                user_company = request.user.company
                
                if departure_station.company != user_company:
                    raise serializers.ValidationError({
                        'departure_station_id': "La gare de départ doit appartenir à votre compagnie"
                    })
                
                if arrival_station.company != user_company:
                    raise serializers.ValidationError({
                        'arrival_station_id': "La gare d'arrivée doit appartenir à votre compagnie"
                    })
        
        # Valider les dates
        valid_from = data.get('valid_from')
        valid_until = data.get('valid_until')
        
        if valid_until and valid_from and valid_until < valid_from:
            raise serializers.ValidationError({
                'valid_until': "La date de fin doit être après la date de début"
            })
        
        return data
    
    def create(self, validated_data):
        """Auto-assigner la compagnie depuis l'utilisateur authentifié"""
        request = self.context.get('request')
        
        if not request or not hasattr(request.user, 'company') or not request.user.company:
            raise serializers.ValidationError(
                "L'utilisateur doit être associé à une compagnie de bus"
            )
        
        validated_data['bus_company'] = request.user.company
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Empêcher de changer la compagnie"""
        validated_data.pop('bus_company', None)
        return super().update(instance, validated_data)


class TripTemplateListSerializer(serializers.ModelSerializer):
    """
    Serializer minimal pour les listes de modèles (dropdowns, tableaux)
    """
    
    departure_city = serializers.CharField(
        source='departure_station.city.name',
        read_only=True
    )
    arrival_city = serializers.CharField(
        source='arrival_station.city.name',
        read_only=True
    )
    route_display = serializers.CharField(read_only=True)
    operates_on_display = serializers.CharField(read_only=True)
    
    class Meta:
        model = TripTemplate
        fields = [
            'id',
            'departure_city',
            'arrival_city',
            'route_display',
            'departure_time',
            'operates_on_display',
            'bus_type',
            'price',
            'is_active'
        ]


class TripTemplateSummarySerializer(serializers.ModelSerializer):
    """
    Serializer résumé pour affichage rapide (dashboard, statistiques)
    """
    
    route_display = serializers.CharField(read_only=True)
    operates_on_display = serializers.CharField(read_only=True)
    generated_trips_count = serializers.SerializerMethodField()
    next_departure = serializers.SerializerMethodField()
    
    class Meta:
        model = TripTemplate
        fields = [
            'id',
            'route_display',
            'departure_time',
            'operates_on_display',
            'bus_type',
            'price',
            'total_seats',
            'is_active',
            'generated_trips_count',
            'next_departure'
        ]
    
    def get_generated_trips_count(self, obj):
        """Nombre de trajets générés depuis ce modèle"""
        return obj.generated_trips.filter(
            status='scheduled',
            departure_date__gte=timezone.now().date()
        ).count()
    
    def get_next_departure(self, obj):
        """Prochain départ généré depuis ce modèle"""
        next_trip = obj.generated_trips.filter(
            status='scheduled',
            departure_date__gte=timezone.now().date()
        ).order_by('departure_date', 'departure_time').first()
        
        if next_trip:
            return {
                'date': next_trip.departure_date,
                'time': next_trip.departure_time,
                'available_seats': next_trip.available_seats
            }
        return None


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
        request = self.context.get('request')
        
        if not request or not getattr(request, 'user', None):
            raise serializers.ValidationError('Authentication context missing')
        
        user = request.user
        company = getattr(user, 'company', None)
        
        if company is None:
            raise serializers.ValidationError('Your account is not linked to a company')
        
        try:
            from apps.accounts.models import BusCompany
            if not BusCompany.objects.filter(pk=company.pk, is_active=True).exists():
                raise serializers.ValidationError('Your company does not exist or is inactive')
            
            fresh_company = BusCompany.objects.filter(pk=company.pk).only('verification_status').first()
            if fresh_company and getattr(fresh_company, 'verification_status', 'pending') != 'verified':
                raise serializers.ValidationError('Company must be verified to create routes')
        except Exception:
            raise serializers.ValidationError('Unable to validate company association')

        if attrs['origin_city'] == attrs['destination_city']:
            raise serializers.ValidationError(
                "Origin and destination cities cannot be the same"
            )
        
        return attrs
    
    def create(self, validated_data):
        """Auto-assign company from request user"""
        request = self.context.get('request')
        if request and hasattr(request.user, 'company') and request.user.company:
            from apps.accounts.models import BusCompany
            company_id = request.user.company_id
            company = BusCompany.objects.filter(pk=company_id, is_active=True).first()
            
            if not company:
                raise serializers.ValidationError({'company': 'Linked company does not exist or is inactive'})
            
            if getattr(company, 'verification_status', 'pending') != 'verified':
                raise serializers.ValidationError({'company': 'Company must be verified to create routes'})
            
            validated_data['bus_company'] = company
        
        return super().create(validated_data)


class TripSerializer(serializers.ModelSerializer):
    """Basic trip serializer with template info"""
    route = RouteListSerializer(read_only=True)
    departure_datetime = serializers.ReadOnlyField()
    arrival_datetime = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    occupancy_rate = serializers.ReadOnlyField()
    can_be_booked = serializers.ReadOnlyField()
    company_name = serializers.CharField(source='route.bus_company.name', read_only=True)
    template_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Trip
        fields = [
            'id', 'route', 'company_name', 'departure_date', 'departure_time', 
            'arrival_time', 'departure_datetime', 'arrival_datetime',
            'total_seats', 'available_seats', 'occupancy_rate', 'is_full',
            'price', 'bus_number', 'bus_type', 'status', 'can_be_booked',
            'template_info', 'created_at'
        ]
    
    def get_template_info(self, obj):
        """Info sur le modèle si généré automatiquement"""
        if hasattr(obj, 'template') and obj.template and hasattr(obj, 'is_template_generated') and obj.is_template_generated:
            return {
                'id': obj.template.id,
                'route': obj.template.route_display,
                'bus_type': obj.template.get_bus_type_display()
            }
        return None


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
        
        if departure_time and arrival_time:
            if arrival_time <= departure_time:
                raise serializers.ValidationError({
                    'arrival_time': 'Arrival time must be after departure time'
                })
        
        if departure_time and arrival_time:
            dep_minutes = departure_time.hour * 60 + departure_time.minute
            arr_minutes = arrival_time.hour * 60 + arrival_time.minute
            duration_minutes = arr_minutes - dep_minutes
            
            if duration_minutes < 30:
                raise serializers.ValidationError(
                    'Trip duration must be at least 30 minutes'
                )
            if duration_minutes > 720:
                raise serializers.ValidationError(
                    'Trip duration cannot exceed 12 hours'
                )
        
        return attrs
    
    def create(self, validated_data):
        """Set defaults and create trip"""
        validated_data['available_seats'] = validated_data['total_seats']
        
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
            
            allowed_transitions = {
                'draft': ['scheduled', 'cancelled'],
                'scheduled': ['in_progress', 'cancelled', 'delayed', 'on_time'],
                'in_progress': ['completed', 'delayed', 'on_time', 'late', 'early'],
                'delayed': ['in_progress', 'completed', 'cancelled'],
                'on_time': ['completed', 'in_progress'],
                'early': ['completed'],
                'late': ['completed'],
                'completed': [],
                'cancelled': []
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