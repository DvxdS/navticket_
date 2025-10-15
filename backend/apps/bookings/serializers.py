# Backend/apps/bookings/serializers.py

from rest_framework import serializers
from django.utils import timezone
from datetime import datetime
from .models import Booking, Passenger, Seat
from apps.transport.models import Trip
from apps.bookings.services.booking_services import (
    validate_trip_bookable,
    check_seat_availability,
    create_booking_with_passengers
)


class PassengerSerializer(serializers.ModelSerializer):
    """Serializer for passenger details"""
    
    class Meta:
        model = Passenger
        fields = [
            'id',
            'first_name',
            'last_name',
            'phone',
            'email',
            'id_type',
            'id_number',
            'date_of_birth',
            'age_category',
            'seat_number',
            'emergency_contact_name',
            'emergency_contact_phone',
            'full_name'
        ]
        read_only_fields = ['id', 'full_name']
    
    def validate_first_name(self, value):
        """Validate first name is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("First name is required")
        return value.strip()
    
    def validate_last_name(self, value):
        """Validate last name is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Last name is required")
        return value.strip()


class PassengerCreateSerializer(serializers.Serializer):
    """Serializer for creating passengers (nested in booking creation)"""
    
    first_name = serializers.CharField(max_length=100, required=True)
    last_name = serializers.CharField(max_length=100, required=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    id_type = serializers.ChoiceField(
        choices=['passport', 'national_id', 'driver_license', 'voter_id'],
        required=False,
        allow_blank=True
    )
    id_number = serializers.CharField(max_length=50, required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    age_category = serializers.ChoiceField(
        choices=['adult', 'child', 'infant'],
        default='adult'
    )
    seat_number = serializers.CharField(max_length=10, required=False, allow_blank=True)
    emergency_contact_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    emergency_contact_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    def validate_first_name(self, value):
        """Validate first name"""
        if not value or not value.strip():
            raise serializers.ValidationError("First name is required")
        return value.strip()
    
    def validate_last_name(self, value):
        """Validate last name"""
        if not value or not value.strip():
            raise serializers.ValidationError("Last name is required")
        return value.strip()


class TripBasicSerializer(serializers.ModelSerializer):
    """Basic trip info for booking display"""
    origin_city = serializers.CharField(source='route.origin_city.name', read_only=True)
    destination_city = serializers.CharField(source='route.destination_city.name', read_only=True)
    company_name = serializers.CharField(source='route.bus_company.name', read_only=True)
    
    class Meta:
        model = Trip
        fields = [
            'id',
            'origin_city',
            'destination_city',
            'company_name',
            'departure_date',
            'departure_time',
            'arrival_time',
            'bus_type',
            'price'
        ]


class BookingListSerializer(serializers.ModelSerializer):
    """Serializer for listing user's bookings"""
    
    trip = TripBasicSerializer(read_only=True)
    passenger_count = serializers.IntegerField(source='total_passengers', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id',
            'booking_reference',
            'trip',
            'passenger_count',
            'total_amount',
            'booking_status',
            'payment_status',
            'created_at'
        ]
        read_only_fields = fields


class BookingDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed booking view"""
    
    trip = TripBasicSerializer(read_only=True)
    passengers = PassengerSerializer(many=True, read_only=True)
    is_cancellable = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id',
            'booking_reference',
            'trip',
            'passengers',
            'ticket_price',
            'platform_fee',
            'total_amount',
            'total_passengers',
            'booking_status',
            'payment_status',
            'contact_email',
            'contact_phone',
            'qr_code_data',
            'is_cancellable',
            'created_at',
            'updated_at',
            'cancelled_at'
        ]
        read_only_fields = fields


class BookingCreateSerializer(serializers.Serializer):
    """Serializer for creating a new booking"""
    
    trip_id = serializers.IntegerField(required=True)
    passengers = PassengerCreateSerializer(many=True, required=True)
    contact_email = serializers.EmailField(required=True)
    contact_phone = serializers.CharField(max_length=20, required=True)
    
    def validate_trip_id(self, value):
        """Validate trip exists and is bookable"""
        try:
            trip = Trip.objects.get(id=value)
        except Trip.DoesNotExist:
            raise serializers.ValidationError("Trip not found")
        
        # Check if trip is bookable
        is_valid, error = validate_trip_bookable(trip)
        if not is_valid:
            raise serializers.ValidationError(error)
        
        return value
    
    def validate_passengers(self, value):
        """Validate passengers list"""
        if not value:
            raise serializers.ValidationError("At least one passenger is required")
        
        if len(value) > 10:
            raise serializers.ValidationError("Maximum 10 passengers per booking")
        
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        trip_id = attrs.get('trip_id')
        passengers = attrs.get('passengers', [])
        
        # Get trip
        try:
            trip = Trip.objects.get(id=trip_id)
        except Trip.DoesNotExist:
            raise serializers.ValidationError({"trip_id": "Trip not found"})
        
        # Check seat availability
        is_available, error = check_seat_availability(trip, len(passengers))
        if not is_available:
            raise serializers.ValidationError({"passengers": error})
        
        return attrs
    
    def create(self, validated_data):
        """Create booking with passengers"""
        trip_id = validated_data['trip_id']
        passengers_data = validated_data['passengers']
        contact_email = validated_data['contact_email']
        contact_phone = validated_data['contact_phone']
        
        # Get trip
        trip = Trip.objects.get(id=trip_id)
        
        # Get user from context
        user = self.context['request'].user
        
        # Create booking
        booking, error = create_booking_with_passengers(
            trip=trip,
            user=user,
            passengers_data=passengers_data,
            contact_email=contact_email,
            contact_phone=contact_phone
        )
        
        if error:
            raise serializers.ValidationError(error)
        
        return booking


class BookingCancelSerializer(serializers.Serializer):
    """Serializer for cancelling a booking"""
    
    reason = serializers.CharField(
        max_length=500,
        required=False,
        allow_blank=True,
        help_text="Optional cancellation reason"
    )

class SeatSerializer(serializers.ModelSerializer):
    """Serializer for individual seat information"""
    
    class Meta:
        model = Seat
        fields = [
            'id',
            'seat_number',
            'row',
            'position',
            'is_available',
            'passenger_name',
            'reserved_until'
        ]
        read_only_fields = ['id', 'reserved_until']


class SeatMapSerializer(serializers.Serializer):
    """Serializer for complete seat map with trip context"""
    
    trip_id = serializers.IntegerField()
    seat_layout = serializers.CharField()
    total_seats = serializers.IntegerField()
    available_seats = serializers.IntegerField()
    booked_seats = serializers.IntegerField()
    reserved_seats = serializers.IntegerField()
    occupancy_rate = serializers.FloatField()
    seats = SeatSerializer(many=True, read_only=True)


class SeatReservationSerializer(serializers.Serializer):
    """Serializer for seat reservation requests"""
    
    trip_id = serializers.IntegerField()
    seat_numbers = serializers.ListField(
        child=serializers.CharField(max_length=5),
        min_length=1,
        max_length=10,
        help_text="List of seat numbers to reserve (e.g., ['1A', '1B'])"
    )
    
    def validate_seat_numbers(self, value):
        """Ensure seat numbers are unique"""
        if len(value) != len(set(value)):
            raise serializers.ValidationError("Duplicate seat numbers not allowed")
        return value
    
    def validate(self, data):
        """Validate trip exists and seats are valid"""
        from apps.transport.models import Trip
        
        trip_id = data.get('trip_id')
        seat_numbers = data.get('seat_numbers')
        
        # Check trip exists
        try:
            trip = Trip.objects.get(id=trip_id)
        except Trip.DoesNotExist:
            raise serializers.ValidationError({"trip_id": "Trip not found"})
        
        # Check seats exist for this trip
        existing_seats = Seat.objects.filter(
            trip=trip,
            seat_number__in=seat_numbers
        ).values_list('seat_number', flat=True)
        
        missing_seats = set(seat_numbers) - set(existing_seats)
        if missing_seats:
            raise serializers.ValidationError({
                "seat_numbers": f"Invalid seats: {list(missing_seats)}"
            })
        
        data['trip'] = trip
        return data


class SeatReleaseSerializer(serializers.Serializer):
    """Serializer for releasing reserved seats"""
    
    trip_id = serializers.IntegerField()
    seat_numbers = serializers.ListField(
        child=serializers.CharField(max_length=5),
        min_length=1,
        help_text="List of seat numbers to release"
    )


class BookingWithSeatsSerializer(serializers.ModelSerializer):
    """Extended booking serializer with seat information"""
    
    booked_seats = SeatSerializer(many=True, read_only=True)
    passenger_count = serializers.IntegerField(source='total_passengers', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id',
            'booking_reference',
            'trip',
            'total_passengers',
            'passenger_count',
            'selected_seats',
            'booked_seats',
            'ticket_price',
            'total_amount',
            'booking_status',
            'payment_status',
            'created_at'
        ]
        read_only_fields = ['id', 'booking_reference', 'booked_seats', 'created_at']