# Backend/apps/locations/models.py

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from apps.accounts.models import BusCompany


class City(models.Model):
    """
    Master data for cities in Côte d'Ivoire where bus services operate
    Used for route origin/destination and trip search functionality
    """
    name = models.CharField(
        max_length=100, 
        db_index=True,
        help_text="City name in French (e.g., 'Abidjan', 'Bouaké')"
    )
    country = models.CharField(
        max_length=100, 
        default="Côte d'Ivoire",
        help_text="Country name"
    )
    state_province = models.CharField(
        max_length=100, 
        blank=True,
        help_text="Region/Province (e.g., 'Lagunes', 'Vallée du Bandama')"
    )
    
    # Geographic coordinates for mapping and distance calculation
    latitude = models.DecimalField(
        max_digits=10, 
        decimal_places=8, 
        null=True, 
        blank=True,
        validators=[
            MinValueValidator(-90.0),
            MaxValueValidator(90.0)
        ],
        help_text="Latitude coordinate"
    )
    longitude = models.DecimalField(
        max_digits=11, 
        decimal_places=8, 
        null=True, 
        blank=True,
        validators=[
            MinValueValidator(-180.0),
            MaxValueValidator(180.0)
        ],
        help_text="Longitude coordinate"
    )
    
    # Operational data
    timezone = models.CharField(
        max_length=50, 
        default='Africa/Abidjan',
        help_text="Timezone identifier"
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Whether this city is available for new routes"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        verbose_name_plural = "Cities"
        unique_together = ['name', 'country']  # Prevent duplicate cities
        indexes = [
            models.Index(fields=['name', 'is_active']),
            models.Index(fields=['country', 'is_active']),
        ]
        ordering = ['name']

    def __str__(self):
        return f"{self.name}, {self.state_province}" if self.state_province else self.name

    @property
    def display_name(self):
        """Formatted city name for frontend display"""
        if self.state_province:
            return f"{self.name}, {self.state_province}"
        return self.name

    def get_coordinates(self):
        """Get latitude and longitude as tuple"""
        if self.latitude and self.longitude:
            return (float(self.latitude), float(self.longitude))
        return None


class BusStation(models.Model):
    """
    Bus stations/terminals where buses depart from and arrive at.
    A company can have multiple stations in the same city.
    
    Example:
    - Gare d'Adjamé (Abidjan) - Company A
    - Gare de Yopougon (Abidjan) - Company A
    - Gare Routière (San Pedro) - Company A
    """
    
    company = models.ForeignKey(
        BusCompany,
        on_delete=models.CASCADE,
        related_name='bus_stations',
        help_text="Company that owns/operates this station"
    )
    
    city = models.ForeignKey(
        City,
        on_delete=models.PROTECT,
        related_name='bus_stations',
        help_text="City where this station is located"
    )
    
    name = models.CharField(
        max_length=200,
        help_text="Station name (e.g., 'Gare d'Adjamé')"
    )
    
    address = models.TextField(
        help_text="Full address of the station"
    )
    
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        help_text="Contact phone number for this station"
    )
    
    # Optional: GPS coordinates for future map features
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=8,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(-90.0),
            MaxValueValidator(90.0)
        ],
        help_text="GPS latitude"
    )
    
    longitude = models.DecimalField(
        max_digits=11,
        decimal_places=8,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(-180.0),
            MaxValueValidator(180.0)
        ],
        help_text="GPS longitude"
    )
    
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Whether this station is currently operational"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['city__name', 'name']
        verbose_name = "Bus Station"
        verbose_name_plural = "Bus Stations"
        # Ensure unique station names per company per city
        unique_together = [['company', 'city', 'name']]
        indexes = [
            models.Index(fields=['company', 'city']),
            models.Index(fields=['is_active']),
            models.Index(fields=['city', 'is_active']),
        ]
    
    def __str__(self):
        
        return f"{self.name} - {self.city.name} ({self.company.name})"
    
    @property
    def display_name(self):
        """Full display name with city"""
        return f"{self.name}, {self.city.name}"
    
    @property
    def full_address(self):
        """Complete address with city and state"""
        return f"{self.address}, {self.city.display_name}"
    
    def get_coordinates(self):
        """Get latitude and longitude as tuple"""
        if self.latitude and self.longitude:
            return (float(self.latitude), float(self.longitude))
        return None
    
    def clean(self):
        """Validation before saving"""
        # Ensure station city exists
        if not self.city_id:
            raise ValidationError("Station must be associated with a city")
        
        # Ensure company owns this station
        if not self.company_id:
            raise ValidationError("Station must be associated with a company")
        
        # Ensure city is active
        if self.city and not self.city.is_active:
            raise ValidationError(f"Cannot create station in inactive city: {self.city.name}")
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)