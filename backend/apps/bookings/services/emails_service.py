# Backend/apps/bookings/services/email_service.py

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
from .ticket_service import TicketService
from .calendar_service import CalendarService
from .qr_service import QRCodeService
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Send booking confirmation emails with tickets and calendar invites"""
    
    @staticmethod
    def send_booking_confirmation(booking):
        """
        Send complete booking confirmation email with:
        - HTML email with trip details
        - PDF ticket attachment
        - Calendar .ics file
        - QR code as attachment
        
        Args:
            booking: Booking instance
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        try:
            # Get passenger email
            passenger = booking.passengers.first()
            if not passenger:
                logger.warning(f"No passenger for booking {booking.booking_reference}")
                return False
            recipient_email = passenger.email
            
            if not recipient_email:
                logger.warning(f"No email for booking {booking.booking_reference}")
                return False
            
            # Prepare context for email template
            trip = booking.trip
            route = trip.route
            
            context = {
                'booking': booking,
                'passenger': passenger,
                'trip': trip,
                'route': route,
                'company': route.bus_company.name,
                'company_name': settings.COMPANY_NAME,
                'support_email': settings.COMPANY_SUPPORT_EMAIL,
                'support_phone': getattr(settings, 'COMPANY_PHONE', '+225 XX XX XX XX XX'),
            }
            
            # Render email templates
            html_content = render_to_string('bookings/emails/booking_confirmation.html', context)
            text_content = strip_tags(html_content)
            
            # Create email
            subject = f'🎫 Réservation Confirmée - {route.origin_city.name} → {route.destination_city.name}'
            from_email = settings.DEFAULT_FROM_EMAIL
            to_email = [recipient_email]
            
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=from_email,
                to=to_email
            )
            
            # Attach HTML version
            email.attach_alternative(html_content, "text/html")
            
            # Generate and attach PDF ticket
            pdf_buffer = TicketService.generate_ticket_pdf(booking)
            pdf_filename = TicketService.get_ticket_filename(booking)
            email.attach(pdf_filename, pdf_buffer.getvalue(), 'application/pdf')
            
            # Generate and attach calendar file
            calendar_data = CalendarService.generate_calendar_event(booking)
            calendar_filename = CalendarService.get_calendar_filename(booking)
            email.attach(calendar_filename, calendar_data, 'text/calendar')
            
            # Attach QR code as regular attachment (not inline)
            qr_image = QRCodeService.generate_qr_code_image(booking, size=250)
            email.attach(
                f'qr_code_{booking.booking_reference}.png',
                qr_image.getvalue(),
                'image/png'
            )
            
            # Send email
            email.send(fail_silently=False)
            
            logger.info(f"Booking confirmation sent to {recipient_email} for {booking.booking_reference}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send booking confirmation for {booking.booking_reference}: {str(e)}")
            return False
    
    @staticmethod
    def send_booking_cancellation(booking):
        """
        Send booking cancellation notification
        
        Args:
            booking: Booking instance
            
        Returns:
            bool: True if sent successfully
        """
        try:
            passenger = booking.passengers.first()
            if not passenger:
                logger.warning(f"No passenger for booking {booking.booking_reference}")
                return False
            recipient_email = passenger.email
            
            if not recipient_email:
                return False
            
            trip = booking.trip
            route = trip.route
            
            context = {
                'booking': booking,
                'passenger': passenger,
                'trip': trip,
                'route': route,
                'company_name': settings.COMPANY_NAME,
                'support_email': settings.COMPANY_SUPPORT_EMAIL,
            }
            
            html_content = render_to_string('bookings/emails/booking_cancellation.html', context)
            text_content = strip_tags(html_content)
            
            subject = f'❌ Réservation Annulée - {booking.booking_reference}'
            from_email = settings.DEFAULT_FROM_EMAIL
            to_email = [recipient_email]
            
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=from_email,
                to=to_email
            )
            
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)
            
            logger.info(f"Cancellation email sent for {booking.booking_reference}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send cancellation email: {str(e)}")
            return False
    
    @staticmethod
    def send_trip_reminder(booking):
        """
        Send trip reminder 24 hours before departure
        
        Args:
            booking: Booking instance
            
        Returns:
            bool: True if sent successfully
        """
        try:
            passenger = booking.passengers.first()
            if not passenger:
                logger.warning(f"No passenger for booking {booking.booking_reference}")
                return False
            recipient_email = passenger.email
            
            if not recipient_email:
                return False
            
            trip = booking.trip
            route = trip.route
            
            context = {
                'booking': booking,
                'passenger': passenger,
                'trip': trip,
                'route': route,
                'company_name': settings.COMPANY_NAME,
                'support_email': settings.COMPANY_SUPPORT_EMAIL,
            }
            
            html_content = render_to_string('bookings/emails/trip_reminder.html', context)
            text_content = strip_tags(html_content)
            
            subject = f'⏰ Rappel Voyage - Demain: {route.origin_city.name} → {route.destination_city.name}'
            from_email = settings.DEFAULT_FROM_EMAIL
            to_email = [recipient_email]
            
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=from_email,
                to=to_email
            )
            
            email.attach_alternative(html_content, "text/html")
            
            # Re-attach ticket and QR code
            pdf_buffer = TicketService.generate_ticket_pdf(booking)
            pdf_filename = TicketService.get_ticket_filename(booking)
            email.attach(pdf_filename, pdf_buffer.getvalue(), 'application/pdf')
            
            qr_image = QRCodeService.generate_qr_code_image(booking, size=250)
            email.attach(
                f'qr_code_{booking.booking_reference}.png',
                qr_image.getvalue(),
                'image/png'
            )
            
            email.send(fail_silently=False)
            
            logger.info(f"Trip reminder sent for {booking.booking_reference}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send trip reminder: {str(e)}")
            return False