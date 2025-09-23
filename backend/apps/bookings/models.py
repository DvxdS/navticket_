# apps/bookings/models.py
from django.db import models

STATUS_CHOICES = (
    ('pending', 'Pending'),
    ('confirmed', 'Confirmed'),
    ('cancelled', 'Cancelled'),
)


ID_TYPE_CHOICES = (
    ('passport', 'Passport'),
    ('national_id', 'National ID'),
    ('driver_license', 'Driver License'),
)

class Passenger(models.Model):
    """Traveler information for tickets and emergency contacts"""
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    id_type = models.CharField(max_length=20, choices=ID_TYPE_CHOICES)
    id_number = models.CharField(max_length=50)
    date_of_birth = models.DateField(null=True, blank=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Booking(models.Model):
    """Core booking entity linking trips, passengers, and payments"""
    trip = models.ForeignKey('transport.Trip', on_delete=models.CASCADE)
    passenger = models.ForeignKey(Passenger, on_delete=models.CASCADE)
    booking_reference = models.CharField(max_length=20, unique=True)
    seat_number = models.CharField(max_length=10, blank=True)
    ticket_price = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    qr_code_data = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
# Create your models here.
