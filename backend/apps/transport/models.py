# apps/transport/models.py
from django.db import models

class Route(models.Model):
    """Fixed paths between cities with base pricing"""
    bus_company = models.ForeignKey('accounts.BusCompany', on_delete=models.CASCADE)
    origin_city = models.ForeignKey('locations.City', on_delete=models.CASCADE, related_name='origin_routes')
    destination_city = models.ForeignKey('locations.City', on_delete=models.CASCADE, related_name='destination_routes')
    distance_km = models.PositiveIntegerField(null=True, blank=True)
    estimated_duration_minutes = models.PositiveIntegerField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('cancelled', 'Cancelled'),  
        ('completed', 'Completed'),
        ('in_progress', 'In Progress'),
        ('delayed', 'Delayed'),
        ('on_time', 'On Time'),
        ('early', 'Early'),
        ('late', 'Late'),
    )
class Trip(models.Model):
    """Scheduled departures with specific timing and capacity"""
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    departure_date = models.DateField()
    departure_time = models.TimeField()
    arrival_time = models.TimeField()
    total_seats = models.PositiveIntegerField(default=50)
    available_seats = models.PositiveIntegerField(default=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    bus_number = models.CharField(max_length=50, blank=True)
    bus_type = models.CharField(max_length=50, default='Standard')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    created_at = models.DateTimeField(auto_now_add=True)


    