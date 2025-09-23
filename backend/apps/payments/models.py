# apps/payments/models.py
from django.db import models

STATUS_CHOICES = (
    ('pending', 'Pending'),
    ('completed', 'Completed'),
    ('failed', 'Failed'),
)

class Payment(models.Model):
    """Track all payment transactions and statuses"""
    booking = models.ForeignKey('bookings.Booking', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='XOF')
    payment_method = models.CharField(max_length=50)
    stripe_payment_intent_id = models.CharField(max_length=100, blank=True)
    external_transaction_id = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    processed_at = models.DateTimeField(null=True, blank=True)
    failure_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
# Create your models here.
