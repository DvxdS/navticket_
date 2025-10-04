# Backend/apps/payments/urls.py

from django.urls import path
from .views import (
    PaymentInitializeView,
    PaymentListView,
    PaymentDetailView,
    verify_payment_view,
    stripe_webhook,
    payment_stats_view
)

app_name = 'payments'

urlpatterns = [
    path('initialize/', PaymentInitializeView.as_view(), name='payment-initialize'),
    path('', PaymentListView.as_view(), name='payment-list'),
    path('verify/', verify_payment_view, name='payment-verify'),
    path('stats/', payment_stats_view, name='payment-stats'),
    path('webhook/stripe/', stripe_webhook, name='stripe-webhook'),
    path('<int:pk>/', PaymentDetailView.as_view(), name='payment-detail'),
]