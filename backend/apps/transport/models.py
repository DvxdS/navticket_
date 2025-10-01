# Backend/apps/transport/models.py

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.conf import settings
from datetime import datetime, time


class Route(models.Model):
    """Fixed paths between cities with base pricing - Company specific routes"""
    bus_company = models.ForeignKey(
        'accounts.BusCompany', 
        on_delete=models.CASCADE,
        related_name='company_routes',
        help_text="Company that operates this route"
    )
    origin_city = models.ForeignKey(
        'locations.City', 
        on_delete=models.CASCADE, 
        related_name='origin_routes',
        help_text="Starting city"
    )
    destination_city = models.ForeignKey(
        'locations.City', 
        on_delete=models.CASCADE, 
        related_name='destination_routes',
        help_text="Ending city"
    )
    
    # Route specifications
    distance_km = models.PositiveIntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(2000)],
        help_text="Distance in kilometers"
    )
    estimated_duration_minutes = models.PositiveIntegerField(
        validators=[MinValueValidator(30), MaxValueValidator(1440)],  # 30 min to 24 hours
        help_text="Estimated travel time in minutes"
    )
    base_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(500), MaxValueValidator(50000)],
        help_text="Base price in CFA francs"
    )
    
    # Operational status
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Whether this route is available for new trips"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        unique_together = ['bus_company', 'origin_city', 'destination_city']  # Company can't duplicate routes
        indexes = [
            models.Index(fields=['bus_company', 'is_active']),
            models.Index(fields=['origin_city', 'destination_city', 'is_active']),
            models.Index(fields=['is_active']),
        ]
        ordering = ['origin_city__name', 'destination_city__name']

    def __str__(self):
        return f"{self.bus_company.name}: {self.origin_city.name} → {self.destination_city.name}"

    def clean(self):
        """Validation to prevent same city as origin and destination"""
        if self.origin_city == self.destination_city:
            raise ValidationError("Origin and destination cannot be the same city")

    @property
    def route_display(self):
        """Formatted route name for display"""
        return f"{self.origin_city.name} → {self.destination_city.name}"
    
    @property
    def duration_hours(self):
        """Get duration in hours as float"""
        return round(self.estimated_duration_minutes / 60, 1)




BUS_TYPE_CHOICES = [
    ('standard', 'Standard'),
    ('vip', 'VIP'),
    ('luxury', 'Luxury'),
    ('express', 'Express'),
    ('sleeper', 'Sleeper'),
]


class Trip(models.Model):
    """Scheduled departures with specific timing and capacity"""
    # Trip status choices
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
        ('in_progress', 'In Progress'),
        ('delayed', 'Delayed'),
        ('on_time', 'On Time'),
        ('early', 'Early'),
        ('late', 'Late'),
]
    route = models.ForeignKey(
        Route, 
        on_delete=models.CASCADE,
        related_name='trips',
        help_text="Route for this trip"
    )
    
    # Schedule information
    departure_date = models.DateField(
        db_index=True,
        help_text="Date of departure"
    )
    departure_time = models.TimeField(
        help_text="Time of departure"
    )
    arrival_time = models.TimeField(
        help_text="Expected arrival time"
    )
    
    # Capacity management
    total_seats = models.PositiveIntegerField(
        default=50,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text="Total number of seats in the bus"
    )
    available_seats = models.PositiveIntegerField(
        default=50,
        validators=[MinValueValidator(0)],
        help_text="Number of available seats"
    )
    
    # Pricing and bus details
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(500), MaxValueValidator(50000)],
        help_text="Trip price in CFA francs"
    )
    bus_number = models.CharField(
        max_length=50, 
        blank=True,
        help_text="Bus identification number"
    )
    bus_type = models.CharField(
        max_length=20, 
        choices=BUS_TYPE_CHOICES,
        default='standard',
        help_text="Type of bus service"
    )
    
    # Trip status and management
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='draft',
        db_index=True,
        help_text="Current status of the trip"
    )
    
    # User tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_trips',
        null=True,
        blank=True,
        help_text="User who created this trip"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['route', 'departure_date', 'status']),
            models.Index(fields=['departure_date', 'status']),
            models.Index(fields=['status']),
            models.Index(fields=['departure_date']),
        ]
        ordering = ['-departure_date', '-departure_time']

    def __str__(self):
        return f"{self.route.route_display} - {self.departure_date} {self.departure_time}"

    def clean(self):
        """Custom validation for trip data"""
        # Validate departure date is in future for new trips
        if self.departure_date and self.departure_date < timezone.now().date():
            if self.pk is None:  # New trip
                raise ValidationError("Departure date cannot be in the past")
        
        # Validate available seats don't exceed total seats
        if self.available_seats > self.total_seats:
            raise ValidationError("Available seats cannot exceed total seats")
        
        # Validate arrival time is after departure time (same day trips)
        if self.departure_time and self.arrival_time:
            if self.arrival_time <= self.departure_time:
                raise ValidationError("Arrival time must be after departure time")

    @property
    def departure_datetime(self):
        """Combine date and time for easier comparison"""
        return datetime.combine(self.departure_date, self.departure_time)
    
    @property
    def arrival_datetime(self):
        """Combine date and time for arrival"""
        return datetime.combine(self.departure_date, self.arrival_time)

    @property
    def is_full(self):
        """Check if trip is fully booked"""
        return self.available_seats == 0

    @property
    def occupancy_rate(self):
        """Get occupancy percentage"""
        if self.total_seats > 0:
            occupied = self.total_seats - self.available_seats
            return round((occupied / self.total_seats) * 100, 1)
        return 0

    def get_company(self):
        """Get the bus company for this trip"""
        return self.route.bus_company

    def can_be_booked(self):
        """Check if trip can accept new bookings"""
        from django.utils import timezone
        
        # Make sure comparison uses timezone-aware datetime
        now = timezone.now()
        trip_datetime = timezone.make_aware(
            datetime.combine(self.departure_date, self.departure_time)
        ) if timezone.is_naive(datetime.combine(self.departure_date, self.departure_time)) else datetime.combine(self.departure_date, self.departure_time)
        
        return (
            self.status in ['scheduled', 'on_time'] and
            self.available_seats > 0 and
            trip_datetime > now
        )