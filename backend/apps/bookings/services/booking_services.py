# Backend/apps/bookings/services.py

from django.db import transaction
from django.utils import timezone
from datetime import datetime
import random
import string


def generate_booking_reference():
    """
    Generate unique booking reference code
    Format: NVT-YYYYMMDD-XXXXX
    Example: NVT-20251201-A1B2C
    """
    date_str = timezone.now().strftime('%Y%m%d')
    random_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"NVT-{date_str}-{random_code}"


def check_seat_availability(trip, requested_seats):
    """
    Check if trip has enough available seats
    
    Args:
        trip: Trip instance
        requested_seats: Number of seats requested
    
    Returns:
        tuple: (bool, str) - (is_available, error_message)
    """
    if trip.available_seats < requested_seats:
        return False, f"Only {trip.available_seats} seats available, but {requested_seats} requested"
    
    return True, ""


def validate_trip_bookable(trip):
    """
    Validate if trip can accept bookings
    
    Args:
        trip: Trip instance
    
    Returns:
        tuple: (bool, str) - (is_valid, error_message)
    """
    # Check trip status
    if trip.status not in ['scheduled', 'on_time']:
        return False, f"Trip is {trip.status} and cannot be booked"
    
    # Check if trip is in the past
    trip_datetime = datetime.combine(trip.departure_date, trip.departure_time)
    
    # Make timezone-aware if needed
    if timezone.is_naive(trip_datetime):
        trip_datetime = timezone.make_aware(trip_datetime)
    
    if trip_datetime <= timezone.now():
        return False, "Cannot book trips in the past"
    
    # Check if seats available
    if trip.available_seats <= 0:
        return False, "No seats available for this trip"
    
    return True, ""


def calculate_booking_price(trip, num_passengers):
    """
    Calculate total booking price for Ivorian bus transport
    
    Business Rules:
    - Fixed price per passenger (no age discounts)
    - Company sets price based on bus type (Standard/VIP/Luxury)
    - Platform fee: flat 500 XOF per booking (not per passenger)
    
    Args:
        trip: Trip instance
        num_passengers: Number of passengers
    
    Returns:
        dict: {
            'ticket_price': Decimal (per passenger),
            'subtotal': Decimal (tickets only),
            'platform_fee': Decimal (500 XOF flat),
            'total_amount': Decimal
        }
    """
    from decimal import Decimal
    
    # Price per passenger (already set by company based on bus type)
    price_per_passenger = trip.price
    
    # Calculate ticket subtotal
    ticket_subtotal = price_per_passenger * num_passengers
    
    # Fixed platform fee per booking (500 XOF)
    platform_fee = Decimal('500.00')
    
    # Total amount
    total_amount = ticket_subtotal + platform_fee
    
    return {
        'ticket_price': price_per_passenger,
        'subtotal': ticket_subtotal,
        'platform_fee': platform_fee,
        'total_amount': total_amount
    }


@transaction.atomic
def create_booking_with_passengers(trip, user, passengers_data, contact_email, contact_phone):
    """
    Create booking with passengers atomically
    All operations succeed or all rollback
    
    Args:
        trip: Trip instance
        user: User making the booking
        passengers_data: List of passenger dictionaries
        contact_email: Contact email for booking
        contact_phone: Contact phone for booking
    
    Returns:
        tuple: (Booking instance or None, error_message or None)
    """
    from apps.bookings.models import Booking, Passenger
    from django.db.models import F
    
    num_passengers = len(passengers_data)
    
    # Validate trip is bookable
    is_valid, error = validate_trip_bookable(trip)
    if not is_valid:
        return None, error
    
    # Check seat availability
    is_available, error = check_seat_availability(trip, num_passengers)
    if not is_available:
        return None, error
    
    # Calculate pricing
    pricing = calculate_booking_price(trip, num_passengers)
    
    # Generate unique booking reference
    booking_reference = generate_booking_reference()
    
    # Ensure uniqueness
    while Booking.objects.filter(booking_reference=booking_reference).exists():
        booking_reference = generate_booking_reference()
    
    try:
        # Create booking
        booking = Booking.objects.create(
            trip=trip,
            user=user,
            booking_reference=booking_reference,
            ticket_price=pricing['ticket_price'],
            platform_fee=pricing['platform_fee'],
            total_amount=pricing['total_amount'],
            total_passengers=num_passengers,
            contact_email=contact_email,
            contact_phone=contact_phone,
            booking_status='pending',
            payment_status='pending'
        )
        
        # Create passengers
        for passenger_data in passengers_data:
            Passenger.objects.create(
                booking=booking,
                first_name=passenger_data['first_name'],
                last_name=passenger_data['last_name'],
                phone=passenger_data.get('phone', ''),
                email=passenger_data.get('email', ''),
                id_type=passenger_data.get('id_type', ''),
                id_number=passenger_data.get('id_number', ''),
                date_of_birth=passenger_data.get('date_of_birth'),
                age_category=passenger_data.get('age_category', 'adult'),
                seat_number=passenger_data.get('seat_number', ''),
                emergency_contact_name=passenger_data.get('emergency_contact_name', ''),
                emergency_contact_phone=passenger_data.get('emergency_contact_phone', '')
            )
        
        # Update trip available seats using F() to avoid race conditions
        trip.available_seats = F('available_seats') - num_passengers
        trip.save(update_fields=['available_seats'])
        
        # Refresh to get actual value
        trip.refresh_from_db()
        
        return booking, None
        
    except Exception as e:
        # Transaction will automatically rollback
        return None, f"Booking creation failed: {str(e)}"


@transaction.atomic
def cancel_booking(booking):
    """
    Cancel booking and release seats back to trip
    
    Args:
        booking: Booking instance
    
    Returns:
        tuple: (bool, str) - (success, message)
    """
    from django.db.models import F
    
    # Check if cancellable
    if not booking.is_cancellable():
        return False, "This booking cannot be cancelled"
    
    try:
        # Update booking status
        booking.booking_status = 'cancelled'
        booking.cancelled_at = timezone.now()
        booking.save()
        
        # Release seats back to trip using F() expression
        trip = booking.trip
        trip.available_seats = F('available_seats') + booking.total_passengers
        trip.save(update_fields=['available_seats'])
        
        return True, "Booking cancelled successfully"
        
    except Exception as e:
        return False, f"Cancellation failed: {str(e)}"