# Backend/apps/accounts/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
import uuid


class BusCompany(models.Model):
    """Bus company model with security validation"""
    
    VERIFICATION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]
    
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone = models.CharField(validators=[phone_regex], max_length=17)
    address = models.TextField(blank=True)
    
    # Business validation
    business_license = models.CharField(max_length=100, blank=True)
    tax_number = models.CharField(max_length=50, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)  # Changed to True by default
    verification_status = models.CharField(
        max_length=20, 
        choices=VERIFICATION_STATUS_CHOICES, 
        default='pending'
    )
    # Keep old field for backward compatibility
    is_verified = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        # Align with existing database table name used by FK constraints
        db_table = 'accounts_buscompany'
        verbose_name_plural = 'Bus Companies'
        
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Sync verification_status with is_verified
        if self.verification_status == 'verified':
            self.is_verified = True
        super().save(*args, **kwargs)


class User(AbstractUser):
    """Custom user model with Supabase integration"""
    
    # Role choices
    TRAVELER = 'traveler'
    COMPANY_ADMIN = 'company_admin'
    COMPANY_STAFF = 'company_staff'
    SUPER_ADMIN = 'super_admin'
    
    ROLE_CHOICES = [
        (TRAVELER, 'Traveler'),
        (COMPANY_ADMIN, 'Company Admin'),
        (COMPANY_STAFF, 'Company Staff'),
        (SUPER_ADMIN, 'Super Admin'),
    ]
    
    # Phone validator
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=TRAVELER)
    
    # ===== ADDED: Company relationship =====
    company = models.ForeignKey(
        BusCompany,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        help_text="Associated bus company for company users"
    )
    
    # Supabase integration
    supabase_user_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    
    # Security fields
    is_email_verified = models.BooleanField(default=False)
    failed_login_attempts = models.IntegerField(default=0)
    last_failed_login = models.DateTimeField(null=True, blank=True)
    account_locked_until = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'accounts_user'
        
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
    
    @property
    def is_traveler(self):
        return self.role == self.TRAVELER
    
    @property
    def is_company_user(self):
        return self.role in [self.COMPANY_ADMIN, self.COMPANY_STAFF]