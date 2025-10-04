# Backend/apps/payments/services.py

import stripe
from stripe import StripeError
from django.conf import settings
from decimal import Decimal
import json
from .models import Payment

stripe.api_key = settings.STRIPE_SECRET_KEY


def create_stripe_checkout_session(booking, success_url, cancel_url):
    payment = None
    try:
        payment = Payment.objects.create(
            booking=booking,
            user=booking.user,
            payment_method='stripe_card',
            amount=booking.total_amount,
            currency='XOF',
            status='pending'
        )
        
        amount_in_cents = int(booking.total_amount * 100)
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'xof',
                    'unit_amount': amount_in_cents,
                    'product_data': {
                        'name': f'Bus Ticket - {booking.trip.route.origin_city.name} to {booking.trip.route.destination_city.name}',
                        'description': f'Booking Reference: {booking.booking_reference}',
                        'images': [],
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            client_reference_id=str(booking.id),
            metadata={
                'booking_id': booking.id,
                'booking_reference': booking.booking_reference,
                'user_id': booking.user.id,
            }
        )
        
        payment.stripe_checkout_session_id = checkout_session.id
        payment.payment_url = checkout_session.url
        payment.status = 'processing'
        payment.save()
        
        return payment, checkout_session.url, None
        
    except StripeError as e:
        if payment:
            payment.mark_failed(str(e))
        return None, None, str(e)
    except Exception as e:
        return None, None, f"Payment creation failed: {str(e)}"


def verify_stripe_payment(session_id):
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status == 'paid':
            payment = Payment.objects.filter(
                stripe_checkout_session_id=session_id
            ).first()
            
            if payment:
                payment.stripe_payment_intent_id = session.payment_intent
                payment.transaction_id = session.payment_intent
                payment.mark_completed()
                return True, "Payment verified successfully"
            
            return False, "Payment record not found"
        
        return False, f"Payment not completed. Status: {session.payment_status}"
        
    except StripeError as e:
        return False, str(e)


def handle_stripe_webhook(payload, sig_header):
    from .models import WebhookLog
    
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET
    
    if not webhook_secret:
        try:
            event = json.loads(payload)
        except Exception as e:
            return False, f"Invalid payload: {str(e)}"
    else:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError as e:
            return False, f"Invalid payload: {str(e)}"
        except StripeError as e:
            return False, f"Invalid signature: {str(e)}"
    
    try:
        webhook_log = WebhookLog.objects.create(
            provider='stripe',
            event_type=event['type'],
            payload=event
        )
        
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            
            payment = Payment.objects.filter(
                stripe_checkout_session_id=session['id']
            ).first()
            
            if payment:
                payment.stripe_payment_intent_id = session.get('payment_intent')
                payment.transaction_id = session.get('payment_intent')
                payment.mark_completed()
                webhook_log.processed = True
                webhook_log.save()
                
                return True, "Payment completed"
        
        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            
            payment = Payment.objects.filter(
                stripe_payment_intent_id=payment_intent['id']
            ).first()
            
            if payment:
                payment.mark_failed(payment_intent.get('last_payment_error', {}).get('message', 'Payment failed'))
                webhook_log.processed = True
                webhook_log.save()
        
        return True, f"Webhook {event['type']} received"
        
    except Exception as e:
        return False, f"Webhook processing failed: {str(e)}"