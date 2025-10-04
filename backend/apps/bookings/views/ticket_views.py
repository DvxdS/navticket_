# Backend/apps/bookings/views/ticket_views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import FileResponse, HttpResponse
from django.shortcuts import get_object_or_404
from apps.bookings.models import Booking
from apps.bookings.services.ticket_service import TicketService
from apps.bookings.services.calendar_service import CalendarService
from apps.bookings.services.emails_service import EmailService
from apps.bookings.services.qr_service import QRCodeService


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_ticket(request, booking_reference):
    """
    Download PDF ticket for a booking
    
    GET /api/v1/bookings/{booking_reference}/ticket/download/
    """
    booking = get_object_or_404(Booking, booking_reference=booking_reference)
    
    # Check ownership (travelers only see their bookings)
    if hasattr(request.user, 'traveler'):
        if booking.user != request.user:
            return Response({'error': 'Not authorized'}, status=403)
    
    # Check booking is confirmed
    if booking.status != 'confirmed':
        return Response(
            {'error': f'Cannot download ticket. Booking status is {booking.status}'}, 
            status=400
        )
    
    # Generate PDF
    pdf_buffer = TicketService.generate_ticket_pdf(booking)
    filename = TicketService.get_ticket_filename(booking)
    
    # Return as file response
    response = FileResponse(pdf_buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_calendar(request, booking_reference):
    """
    Download calendar (.ics) file for a booking
    
    GET /api/v1/bookings/{booking_reference}/calendar/download/
    """
    booking = get_object_or_404(Booking, booking_reference=booking_reference)
    
    # Check ownership
    if hasattr(request.user, 'traveler'):
        if booking.user != request.user:
            return Response({'error': 'Not authorized'}, status=403)
    
    # Check booking is confirmed
    if booking.status != 'confirmed':
        return Response(
            {'error': f'Cannot download calendar. Booking status is {booking.status}'}, 
            status=400
        )
    
    # Generate calendar file
    calendar_data = CalendarService.generate_calendar_event(booking)
    filename = CalendarService.get_calendar_filename(booking)
    
    # Return as file response
    response = HttpResponse(calendar_data, content_type='text/calendar')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_qr_code(request, booking_reference):
    """
    Get QR code image for a booking
    
    GET /api/v1/bookings/{booking_reference}/qr-code/
    """
    booking = get_object_or_404(Booking, booking_reference=booking_reference)
    
    # Check ownership
    if hasattr(request.user, 'traveler'):
        if booking.user != request.user:
            return Response({'error': 'Not authorized'}, status=403)
    
    # Check booking is confirmed
    if booking.status != 'confirmed':
        return Response(
            {'error': f'Cannot get QR code. Booking status is {booking.status}'}, 
            status=400
        )
    
    # Generate QR code if not exists
    if not booking.qr_code_data:
        booking.generate_and_save_qr()
    
    # Generate QR code image
    qr_image = QRCodeService.generate_qr_code_image(booking)
    
    # Return as image
    response = HttpResponse(qr_image.getvalue(), content_type='image/png')
    response['Content-Disposition'] = f'inline; filename="qr_{booking.booking_reference}.png"'
    
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_ticket(request, booking_reference):
    """
    Resend ticket email for a booking
    
    POST /api/v1/bookings/{booking_reference}/ticket/resend/
    """
    booking = get_object_or_404(Booking, booking_reference=booking_reference)
    
    # Check ownership
    if hasattr(request.user, 'traveler'):
        if booking.user != request.user:
            return Response({'error': 'Not authorized'}, status=403)
    
    # Check booking is confirmed
    if booking.status != 'confirmed':
        return Response(
            {'error': f'Cannot resend ticket. Booking status is {booking.status}'}, 
            status=400
        )
    
    # Generate QR if not exists
    if not booking.qr_code_data:
        booking.generate_and_save_qr()
    
    # Send email
    success = booking.send_confirmation_email()
    
    if success:
        return Response({
            'message': 'Ticket resent successfully',
            'email': booking.passenger.email
        })
    else:
        return Response(
            {'error': 'Failed to send email. Please try again later.'}, 
            status=500
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ticket_info(request, booking_reference):
    """
    Get ticket information and status
    
    GET /api/v1/bookings/{booking_reference}/ticket/info/
    """
    booking = get_object_or_404(Booking, booking_reference=booking_reference)
    
    # Check ownership
    if hasattr(request.user, 'traveler'):
        if booking.user != request.user:
            return Response({'error': 'Not authorized'}, status=403)
    
    return Response({
        'booking_reference': booking.booking_reference,
        'status': booking.status,
        'has_qr_code': bool(booking.qr_code_data),
        'qr_generated_at': booking.qr_code_generated_at,
        'ticket_sent_at': booking.ticket_sent_at,
        'passenger_email': booking.passenger.email,
        'can_download': booking.status == 'confirmed',
        'download_urls': {
            'ticket_pdf': f'/api/v1/bookings/{booking.booking_reference}/ticket/download/',
            'calendar': f'/api/v1/bookings/{booking.booking_reference}/calendar/download/',
            'qr_code': f'/api/v1/bookings/{booking.booking_reference}/qr-code/',
        }
    })