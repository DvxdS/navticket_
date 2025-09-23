# apps/accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

ROLE_CHOICES = (
    ("traveler", "Traveler"),
    ("company_admin", "Company Admin"),
    ("staff", "Staff"),
)


class User(AbstractUser):
    """Custom user model for platform access"""
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='company_admin')
    bus_company = models.ForeignKey('BusCompany', on_delete=models.CASCADE, null=True, blank=True)
    is_email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class BusCompany(models.Model):
    """Bus operators using the platform"""
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    address = models.TextField(blank=True)
    city = models.ForeignKey('locations.City', on_delete=models.SET_NULL, null=True)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
