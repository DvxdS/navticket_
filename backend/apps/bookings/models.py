# Backend/apps/bookings/models.py

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils import timezone
from apps.bookings.services.emails_service import EmailService
from apps.bookings.services.qr_service import QRCodeService
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
