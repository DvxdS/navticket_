# Backend/apps/locations/models.py

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


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