# Backend/apps/payments/models.py

from django.db import models
from django.conf import settings
from decimal import Decimal


PAYMENT_METHOD_CHOICES = [
    ('stripe_card', 'Stripe Card'),
    ('wave', 'Wave Mobile Money'),
    ('orange_money', 'Orange Money'),
    ('mtn_money', 'MTN Mobile Money'),
]

PAYMENT_STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('processing', 'Processing'),
    ('completed', 'Completed'),
    ('failed', 'Failed'),
    ('cancelled', 'Cancelled'),
    ('refunded', 'Refunded'),
]


class Payment(models.Model):
    """Payment transaction record"""
    
    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.CASCADE,
        related_name='payments'
    )
    user = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE,
    related_name='payments',
    null=True,  
    blank=True  
)
    
    # Payment details
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='stripe_card'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Amount in XOF"
    )
    currency = models.CharField(max_length=3, default='XOF')
    
    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending',
        db_index=True
    )
    
    # Provider references
    stripe_payment_intent_id = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        unique=True,
        help_text="Stripe PaymentIntent ID"
    )
    stripe_checkout_session_id = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Stripe Checkout Session ID"
    )
    
    # Transaction details
    transaction_id = models.CharField(
        max_length=500,
        blank=True,
        help_text="Provider transaction reference"
    )
    payment_url = models.URLField(
        max_length=1000,
        blank=True,
        help_text="Payment page URL for user"
    )
    
    
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional payment data"
    )
    
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['booking', 'status']),
            models.Index(fields=['stripe_payment_intent_id']),
        ]
    
    def __str__(self):
        return f"Payment {self.id} - {self.booking.booking_reference} - {self.status}"
    
    def mark_completed(self):
        """Mark payment as completed and update booking"""
        from django.utils import timezone
        
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()
        
        # Update booking status
        self.booking.payment_status = 'paid'
        self.booking.booking_status = 'confirmed'
        self.booking.save()
    
    def mark_failed(self, reason=''):
        """Mark payment as failed"""
        self.status = 'failed'
        if reason:
            self.metadata['failure_reason'] = reason
        self.save()


class WebhookLog(models.Model):
    """Log webhook events for debugging"""
    
    provider = models.CharField(max_length=50)
    event_type = models.CharField(max_length=100)
    payload = models.JSONField()
    processed = models.BooleanField(default=False)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.provider} - {self.event_type} - {self.created_at}"