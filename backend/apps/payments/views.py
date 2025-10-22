# Backend/apps/payments/views.py - FIXES APPLIED

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.conf import settings
from django.utils import timezone
import stripe
import logging

from .models import Payment, WebhookLog
from .serializers import (
    PaymentSerializer,
    PaymentInitializeSerializer,
    PaymentVerifySerializer
)
from .services import (
    create_stripe_checkout_session,
    verify_stripe_payment,
    handle_stripe_webhook
)
from apps.bookings.models import Booking

logger = logging.getLogger(__name__)


class PaymentInitializeView(generics.CreateAPIView):
    """
    Initialize payment and create Stripe checkout session
    POST /api/payments/initialize/
    """
    serializer_class = PaymentInitializeSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        booking_reference = serializer.validated_data['booking_reference']
        success_url = serializer.validated_data['success_url']
        cancel_url = serializer.validated_data['cancel_url']
        
        # Get booking
        booking = get_object_or_404(
            Booking, 
            booking_reference=booking_reference,
            user=request.user  # Ensure user owns the booking
        )
        
        # Check if booking is already paid
        if booking.payment_status == 'paid':
            return Response({
                'success': False,
                'message': 'Booking already paid'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create Stripe checkout session
        payment, checkout_url, error = create_stripe_checkout_session(
            booking=booking,
            success_url=success_url,
            cancel_url=cancel_url
        )
        
        if error:
            return Response({
                'success': False,
                'message': error
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'message': 'Payment initialized successfully',
            'data': {
                'payment_id': payment.id,
                'payment_url': checkout_url,
                'amount': str(payment.amount),
                'currency': payment.currency
            }
        }, status=status.HTTP_201_CREATED)


class PaymentListView(generics.ListAPIView):
    """List user's payments"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user).select_related(
            'booking',
            'booking__trip',
            'booking__trip__route',
            'booking__trip__route__origin_city',
            'booking__trip__route__destination_city'
        )


class PaymentDetailView(generics.RetrieveAPIView):
    """Get payment details"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user).select_related(
            'booking',
            'booking__trip',
            'booking__trip__route',
            'booking__trip__route__origin_city',
            'booking__trip__route__destination_city'
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment_view(request):
    """
    Verify payment status after user returns from Stripe
    POST /api/payments/verify/
    Body: { "booking_reference": "NVT-..." }
    """
    booking_reference = request.data.get('booking_reference')
    
    if not booking_reference:
        return Response({
            'success': False,
            'message': 'booking_reference is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get booking
    try:
        booking = Booking.objects.get(
            booking_reference=booking_reference,
            user=request.user
        )
    except Booking.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Booking not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Get the latest payment for this booking
    payment = Payment.objects.filter(
        booking=booking,
        user=request.user
    ).order_by('-created_at').first()
    
    if not payment:
        return Response({
            'success': False,
            'message': 'Payment not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check if already completed
    if payment.status == 'completed':
        return Response({
            'success': True,
            'message': 'Payment already confirmed',
            'data': {
                'booking_reference': booking_reference,
                'payment_status': payment.status,
                'booking_status': booking.booking_status
            }
        }, status=status.HTTP_200_OK)
    
    if not payment.stripe_checkout_session_id:
        return Response({
            'success': False,
            'message': 'Payment session not found'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify with Stripe
    success, message = verify_stripe_payment(payment.stripe_checkout_session_id)
    
    if success:
        # Refresh payment and booking from database
        payment.refresh_from_db()
        booking.refresh_from_db()
        
        # Generate QR code if not exists
        if not booking.qr_code_data:
            booking.generate_and_save_qr()
        
        # Send confirmation email
        booking.send_confirmation_email()
        
        logger.info(f"✅ Payment verified and email sent for booking {booking_reference}")
        
        return Response({
            'success': True,
            'message': 'Payment confirmed successfully',
            'data': {
                'booking_reference': booking_reference,
                'payment_status': payment.status,
                'booking_status': booking.booking_status
            }
        }, status=status.HTTP_200_OK)
    else:
        # Payment failed or incomplete
        payment.status = 'failed'
        payment.save()
        
        return Response({
            'success': False,
            'message': message
        }, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    """
    Handle Stripe webhook events
    POST /api/payments/webhook/stripe/
    
    Note: For local testing without webhook, use verify_payment_view instead
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        logger.error(f"❌ Invalid webhook payload: {e}")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"❌ Invalid webhook signature: {e}")
        return HttpResponse(status=400)
    
    # Log webhook
    webhook_log = WebhookLog.objects.create(
        provider='stripe',
        event_type=event['type'],
        payload=event
    )
    
    # Handle checkout.session.completed
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        session_id = session['id']
        
        try:
            # ✅ FIX: Search by stripe_checkout_session_id (not stripe_payment_intent_id)
            payment = Payment.objects.get(
                stripe_checkout_session_id=session_id,
                status='pending'
            )
            
            # Update payment status
            payment.stripe_payment_intent_id = session.get('payment_intent')
            payment.status = 'completed'
            payment.completed_at = timezone.now()
            payment.save()
            
            # Update booking status
            booking = payment.booking
            booking.payment_status = 'paid'
            booking.booking_status = 'confirmed'
            booking.save()
            
            # Generate QR code and send email
            if not booking.qr_code_data:
                booking.generate_and_save_qr()
            booking.send_confirmation_email()
            
            # Mark webhook as processed
            webhook_log.processed = True
            webhook_log.save()
            
            logger.info(f"✅ Webhook processed: Payment completed for booking {booking.booking_reference}")
            
        except Payment.DoesNotExist:
            logger.error(f"❌ Payment not found for session {session_id}")
            webhook_log.error_message = f"Payment not found for session {session_id}"
            webhook_log.save()
    
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        
        try:
            payment = Payment.objects.get(
                stripe_payment_intent_id=payment_intent['id']
            )
            
            payment.status = 'failed'
            payment.save()
            
            webhook_log.processed = True
            webhook_log.save()
            
            logger.warning(f"⚠️ Payment failed for payment {payment.id}")
            
        except Payment.DoesNotExist:
            logger.error(f"❌ Payment not found for intent {payment_intent['id']}")
    
    return HttpResponse(status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_stats_view(request):
    """Get user's payment statistics"""
    user = request.user
    payments = Payment.objects.filter(user=user)
    
    stats = {
        'total_payments': payments.count(),
        'completed': payments.filter(status='completed').count(),
        'pending': payments.filter(status='pending').count(),
        'failed': payments.filter(status='failed').count(),
        'total_spent': sum(p.amount for p in payments.filter(status='completed'))
    }
    
    return Response({
        'success': True,
        'data': stats
    })