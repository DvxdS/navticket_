# Backend/apps/payments/serializers.py

from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    booking_reference = serializers.CharField(source='booking.booking_reference', read_only=True)
    trip_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id',
            'booking_reference',
            'trip_info',
            'payment_method',
            'amount',
            'currency',
            'status',
            'payment_url',
            'transaction_id',
            'created_at',
            'completed_at'
        ]
        read_only_fields = fields
    
    def get_trip_info(self, obj):
        trip = obj.booking.trip
        return {
            'origin': trip.route.origin_city.name,
            'destination': trip.route.destination_city.name,
            'departure_date': trip.departure_date,
            'departure_time': trip.departure_time
        }


class PaymentInitializeSerializer(serializers.Serializer):
    booking_reference = serializers.CharField(required=True)
    payment_method = serializers.ChoiceField(
        choices=['stripe_card'],
        default='stripe_card'
    )
    success_url = serializers.URLField(required=True)
    cancel_url = serializers.URLField(required=True)
    
    def validate_booking_reference(self, value):
        from apps.bookings.models import Booking
        
        try:
            booking = Booking.objects.get(booking_reference=value)
        except Booking.DoesNotExist:
            raise serializers.ValidationError("Booking not found")
        
        # Check if booking belongs to user
        request = self.context.get('request')
        if booking.user != request.user:
            raise serializers.ValidationError("You don't have permission to pay for this booking")
        
        # Check if already paid
        if booking.payment_status == 'paid':
            raise serializers.ValidationError("This booking has already been paid")
        
        # Check if booking is cancelled
        if booking.booking_status == 'cancelled':
            raise serializers.ValidationError("Cannot pay for a cancelled booking")
        
        return value


class PaymentVerifySerializer(serializers.Serializer):
    session_id = serializers.CharField(required=True)