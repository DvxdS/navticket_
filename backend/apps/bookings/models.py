# Backend/apps/bookings/models.py

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils import timezone
from apps.bookings.services.emails_service import EmailService
from apps.bookings.services.qr_service import QRCodeService
from django.db import transaction
import uuid


# Status choices
BOOKING_STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('confirmed', 'Confirmed'),
    ('cancelled', 'Cancelled'),
    ('completed', 'Completed'),
]

PAYMENT_STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('paid', 'Paid'),
    ('refunded', 'Refunded'),
    ('failed', 'Failed'),
]

ID_TYPE_CHOICES = [
    ('passport', 'Passport'),
    ('national_id', 'National ID'),
    ('driver_license', 'Driver License'),
    ('voter_id', 'Voter ID'),
]

AGE_CATEGORY_CHOICES = [
    ('adult', 'Adult'),
    ('child', 'Child'),
    ('infant', 'Infant'),
]


class Booking(models.Model):
    """Core booking entity linking users, trips, and passengers"""
    
    # Relationships
    trip = models.ForeignKey(
        'transport.Trip', 
        on_delete=models.CASCADE,
        related_name='bookings',
        help_text="The trip being booked"
    )
    user = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE,
    related_name='bookings',
    null=True,  # Add this
    blank=True,  # Add this
    help_text="User who made the booking"
)
    
    # Booking info
    booking_reference = models.CharField(
        max_length=20, 
        unique=True, 
        db_index=True,
        help_text="Unique booking reference code (e.g., NVT-20251201-ABC123)"
    )
    
    # Pricing
    ticket_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Price per seat"
    )
    platform_fee = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(0)],
        help_text="Platform service fee"
    )
    total_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Total amount to pay (price × passengers + fees)"
    )
    
    # Passenger count
    total_passengers = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Number of passengers in this booking"
    )
    selected_seats = models.JSONField(
        default=list,
        blank=True,
        help_text="List of selected seat numbers ['1A', '1B', '2C']"
    )
    
    # Status tracking
    booking_status = models.CharField(
        max_length=20, 
        choices=BOOKING_STATUS_CHOICES, 
        default='pending',
        db_index=True,
        help_text="Current booking status"
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending',
        db_index=True,
        help_text="Payment status"
    )
    
    # Contact info (for booking confirmation)
    contact_email = models.EmailField(
    default='noreply@navticket.com',
    help_text="Email for booking confirmation"
)
    contact_phone = models.CharField(
        max_length=20,
        default='', 
        blank=True,  
        help_text="Phone for booking notifications"
    )
    
    # QR code for ticket
    qr_code_data = models.TextField(blank=True, help_text="QR code data for verification")
    qr_code_generated_at = models.DateTimeField(null=True, blank=True)
    ticket_sent_at = models.DateTimeField(null=True, blank=True, help_text="When e-ticket was emailed")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'booking_status']),
            models.Index(fields=['trip', 'booking_status']),
            models.Index(fields=['booking_reference']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.booking_reference} - {self.user.email}"
    
    def generate_and_save_qr(self):
        """Generate QR code data and save to model"""
        
        self.qr_code_data = QRCodeService.generate_qr_data(self)
        self.qr_code_generated_at = timezone.now()
        self.save(update_fields=['qr_code_data', 'qr_code_generated_at'])
    
    def send_confirmation_email(self):
        """Send booking confirmation email with ticket and calendar"""
       
        success = EmailService.send_booking_confirmation(self)
        if success:
            self.ticket_sent_at = timezone.now()
            self.save(update_fields=['ticket_sent_at'])
        return success
    
    def cancel(self):
        """Cancel booking and release seats"""
        if self.booking_status == 'cancelled':
            return False
        
        self.booking_status = 'cancelled'
        self.cancelled_at = timezone.now()
        self.save()
        
        # Release seats back to trip
        self.trip.available_seats += self.total_passengers
        self.trip.save()
        
        return True
    
    def is_cancellable(self):
        """Check if booking can be cancelled"""
        from datetime import datetime
        
        # Can't cancel if already cancelled or completed
        if self.booking_status in ['cancelled', 'completed']:
            return False
        
        # Can't cancel if trip is in the past or too close
        trip_datetime = datetime.combine(self.trip.departure_date, self.trip.departure_time)
        
        # Make timezone-aware if needed
        if timezone.is_naive(trip_datetime):
            trip_datetime = timezone.make_aware(trip_datetime)
        
        now = timezone.now()
        hours_until_departure = (trip_datetime - now).total_seconds() / 3600
        
        return hours_until_departure > 2  # Must cancel at least 2 hours before
    def assign_seats(self, seat_numbers):
        """Assign specific seats to this booking"""
        
        # Import here to avoid circular import
        from apps.bookings.models import Seat
        
        # Validate seat count matches passengers
        if len(seat_numbers) != self.total_passengers:
            raise ValueError(
                f"Seat count ({len(seat_numbers)}) must match passenger count ({self.total_passengers})"
            )
        
        with transaction.atomic():
            # Get seats and lock them
            seats = Seat.objects.select_for_update().filter(
                trip=self.trip,
                seat_number__in=seat_numbers
            )
            
            # Check all seats exist
            if seats.count() != len(seat_numbers):
                missing = set(seat_numbers) - set(seats.values_list('seat_number', flat=True))
                raise ValueError(f"Seats do not exist: {missing}")
            
            # Check all seats are available
            unavailable = seats.filter(is_available=False)
            if unavailable.exists():
                unavailable_numbers = list(unavailable.values_list('seat_number', flat=True))
                raise ValueError(f"Seats already taken: {unavailable_numbers}")
            
            # Assign seats to this booking
            seats.update(
                booking=self,
                is_available=False,
                reserved_until=None,
                passenger_name=None  # Will be updated when passengers are added
            )
            
            # Save seat numbers to booking
            self.selected_seats = seat_numbers
            self.save(update_fields=['selected_seats'])
            
            return seats
    
    def release_seats(self):
        """Release all seats assigned to this booking"""
        
        # Import here to avoid circular import
        from apps.bookings.models import Seat
        
        seats = Seat.objects.filter(booking=self)
        seats.update(
            booking=None,
            is_available=True,
            reserved_until=None,
            passenger_name=None
        )
        
        self.selected_seats = []
        self.save(update_fields=['selected_seats'])
    
    def cancel(self):
        """Cancel booking and release seats"""
        if self.booking_status == 'cancelled':
            return False
        
        self.booking_status = 'cancelled'
        self.cancelled_at = timezone.now()
        
        # Release seats when cancelling
        self.release_seats()
        
        # Release seats back to trip
        self.trip.available_seats += self.total_passengers
        self.trip.save()
        
        self.save(update_fields=['booking_status', 'cancelled_at'])
        
        return True


class Seat(models.Model):
    """Individual seat for a specific trip"""
    
    trip = models.ForeignKey(
        'transport.Trip',
        on_delete=models.CASCADE,
        related_name='seats'
    )
    
    seat_number = models.CharField(
        max_length=5,
        help_text="Ex: 1A, 1B, 2C, 2D"
    )
    
    row = models.IntegerField(
        help_text="Numéro de rangée (commence à 1)"
    )
    
    position = models.CharField(
        max_length=20,
        choices=[
            # For Standard 3x2 layout
            ('left_window', 'Fenêtre gauche'),
            ('left_middle', 'Milieu gauche'),
            ('left_aisle', 'Couloir gauche'),
            ('right_aisle', 'Couloir droit'),
            ('right_window', 'Fenêtre droite'),
        ]
    )
    
    is_available = models.BooleanField(
        default=True,
        help_text="Siège disponible pour réservation"
    )
    
    booking = models.ForeignKey(
        Booking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='booked_seats'
    )
    
    passenger_name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    
    reserved_until = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Expiration de la réservation temporaire"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['trip', 'seat_number']
        ordering = ['row', 'position']
        indexes = [
            models.Index(fields=['trip', 'is_available']),
        ]
    
    def __str__(self):
        return f"Siège {self.seat_number} - Voyage {self.trip.id}"
    


class Passenger(models.Model):
    """Individual passenger details for each booking"""
    
    # Relationship
    booking = models.ForeignKey(
    Booking,
    on_delete=models.CASCADE,
    related_name='passengers',
    null=True,  # Add this
    blank=True,  # Add this
    help_text="Booking this passenger belongs to"
)
    
    # Personal info
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    
    # Contact
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    
    # Identification
    id_type = models.CharField(
        max_length=20, 
        choices=ID_TYPE_CHOICES,
        blank=True
    )
    id_number = models.CharField(max_length=50, blank=True)
    
    # Age info
    date_of_birth = models.DateField(null=True, blank=True)
    age_category = models.CharField(
        max_length=10,
        choices=AGE_CATEGORY_CHOICES,
        default='adult',
        help_text="Age category for pricing"
    )
    
    # Seat assignment
    seat_number = models.CharField(
        max_length=10, 
        blank=True,
        help_text="Assigned seat number"
    )
    
    # Emergency contact
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['id']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.booking.booking_reference}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
