# apps/locations/models.py
from django.db import models

class City(models.Model):
    """Standardized city/location master data"""
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='Côte d\'Ivoire')
    state_province = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    timezone = models.CharField(max_length=50, default='Africa/Abidjan')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['name', 'country']
        verbose_name_plural = 'Cities'


