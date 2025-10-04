# Backend/apps/payments/views.py

# Backend/apps/payments/views.py

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
    serializer_class = PaymentInitializeSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        booking_reference = serializer.validated_data['booking_reference']
        success_url = serializer.validated_data['success_url']
        cancel_url = serializer.validated_data['cancel_url']
        
        # Get booking
        booking = get_object_or_404(Booking, booking_reference=booking_reference)
        
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
    booking_reference = request.data.get('booking_reference')
    
    if not booking_reference:
        return Response({
            'success': False,
            'message': 'booking_reference is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get the latest payment for this booking
    payment = Payment.objects.filter(
        booking__booking_reference=booking_reference,
        user=request.user
    ).order_by('-created_at').first()
    
    if not payment:
        return Response({
            'success': False,
            'message': 'Payment not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if not payment.stripe_checkout_session_id:
        return Response({
            'success': False,
            'message': 'Payment session not found'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    success, message = verify_stripe_payment(payment.stripe_checkout_session_id)
    
    if success:
        # Generate QR and send email
        booking = payment.booking
        if not booking.qr_code_data:
            booking.generate_and_save_qr()
        booking.send_confirmation_email()
        
        return Response({
            'success': True,
            'message': message,
            'data': {
                'booking_reference': booking_reference,
                'payment_status': payment.status,
                'booking_status': payment.booking.booking_status
            }
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'success': False,
            'message': message
        }, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    """Handle Stripe webhook events"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return Response({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError:
        return Response({'error': 'Invalid signature'}, status=400)
    
    # Log webhook
    WebhookLog.objects.create(
        provider='stripe',
        event_type=event['type'],
        payload=event
    )
    
    # Handle checkout.session.completed
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        try:
            # Find payment by stripe session id
            payment = Payment.objects.get(
                stripe_payment_intent_id=session['id'],
                status='pending'
            )
            
            # Update payment status
            payment.status = 'completed'
            payment.processed_at = timezone.now()
            payment.save()
            
            # Update booking status
            booking = payment.booking
            booking.booking_status = 'confirmed'
            booking.save()
            
            # 🎫 NEW: Generate QR code and send email
            booking.generate_and_save_qr()
            booking.send_confirmation_email()
            
            logger.info(f"Payment completed and email sent for booking {booking.booking_reference}")
            
        except Payment.DoesNotExist:
            logger.error(f"Payment not found for session {session['id']}")
    
    return Response({'status': 'success'}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_stats_view(request):
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

# Create your views here.
