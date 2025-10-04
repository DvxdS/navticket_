# Backend/apps/bookings/services/ticket_service.py

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from .qr_service import QRCodeService
import logging

logger = logging.getLogger(__name__)


class TicketService:
    """Generate PDF e-tickets"""
    
    @staticmethod
    def generate_ticket_pdf(booking):
        """
        Generate beautiful PDF ticket with QR code
        
        Args:
            booking: Booking instance
            
        Returns:
            BytesIO: PDF file content
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=12,
            fontName='Helvetica-Bold'
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=6,
        )
        
        # Title
        elements.append(Paragraph("🎫 NAVTICKET E-TICKET", title_style))
        elements.append(Spacer(1, 0.3*inch))
        
        # Booking Reference (prominent)
        ref_style = ParagraphStyle(
            'Reference',
            parent=styles['Normal'],
            fontSize=16,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#dc2626'),
            fontName='Helvetica-Bold',
            spaceAfter=20
        )
        elements.append(Paragraph(f"Booking Reference: {booking.booking_reference}", ref_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Trip Information
        trip = booking.trip
        route = trip.route
        
        trip_data = [
            ['Route', f"{route.origin_city.name} → {route.destination_city.name}"],
            ['Transport Company', route.bus_company.name],
            ['Departure', trip.departure_datetime.strftime('%d %B %Y at %H:%M')],
            ['Arrival', trip.arrival_datetime.strftime('%d %B %Y at %H:%M')],
            ['Duration', f"{route.estimated_duration_minutes}m"],
        ]
        
        elements.append(Paragraph("Trip Details", heading_style))
        trip_table = Table(trip_data, colWidths=[2*inch, 4*inch])
        trip_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e0e7ff')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        elements.append(trip_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Passenger Information
        passenger = booking.passengers.first()
        if not passenger:
            logger.warning(f"No passenger for booking {booking.booking_reference}")
            return False
        passenger_data = [
            ['Passenger Name', f"{passenger.first_name} {passenger.last_name}"],
            ['Phone', passenger.phone],
            ['Email', passenger.email or 'N/A'],
            ['Seat Number', passenger.seat_number or 'Will be assigned'],
        ]
        
        elements.append(Paragraph("Passenger Details", heading_style))
        passenger_table = Table(passenger_data, colWidths=[2*inch, 4*inch])
        passenger_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e0e7ff')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        elements.append(passenger_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Payment Information
        payment_data = [
            ['Ticket Price', f"{booking.ticket_price} XOF"],
            ['Platform Fee', f"{booking.platform_fee} XOF"],
            ['Total Amount', f"{booking.total_amount} XOF"],
            ['Payment Status', booking.payment_status.upper()],
        ]
        
        elements.append(Paragraph("Payment Details", heading_style))
        payment_table = Table(payment_data, colWidths=[2*inch, 4*inch])
        payment_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e0e7ff')),
            ('BACKGROUND', (0, 3), (1, 3), colors.HexColor('#86efac')),  # Highlight status
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        elements.append(payment_table)
        elements.append(Spacer(1, 0.4*inch))
        
        # QR Code
        qr_image = QRCodeService.generate_qr_code_image(booking, size=200)
        qr_img = Image(qr_image, width=2*inch, height=2*inch)
        
        elements.append(Paragraph("Boarding QR Code", heading_style))
        qr_table = Table([[qr_img]], colWidths=[6*inch])
        qr_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(qr_table)
        elements.append(Spacer(1, 0.2*inch))
        
        # Instructions
        instructions = """
        <b>Important Information:</b><br/>
        • Please arrive at the departure location 30 minutes before departure time<br/>
        • Keep this e-ticket on your phone or print it<br/>
        • Present the QR code at boarding<br/>
        • Carry a valid ID document<br/>
        • Contact support@navticket.com for any issues
        """
        elements.append(Paragraph(instructions, normal_style))
        
        # Footer
        elements.append(Spacer(1, 0.5*inch))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.grey,
            alignment=TA_CENTER
        )
        elements.append(Paragraph("Thank you for choosing Navticket! Have a safe journey.", footer_style))
        elements.append(Paragraph("www.navticket.com | support@navticket.com", footer_style))
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        
        return buffer
    
    @staticmethod
    def get_ticket_filename(booking):
        """Generate filename for ticket PDF"""
        return f'navticket_ticket_{booking.booking_reference}.pdf'