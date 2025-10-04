# Backend/apps/bookings/services/qr_service.py

import qrcode
import hashlib
from io import BytesIO
from django.conf import settings


class QRCodeService:
    """Generate and verify QR codes for bookings"""
    
    @staticmethod
    def generate_qr_data(booking):
        """
        Generate secure QR code data with hash verification
        
        Format: BOOKING_REF|PASSENGER_NAME|HASH
        """
        # Get first passenger from the booking
        passenger = booking.passengers.first()
        if not passenger:
            raise ValueError("No passenger found for booking")
        
        secret_key = settings.SECRET_KEY
        data_to_hash = f"{booking.booking_reference}|{passenger.phone}|{secret_key}"
        verification_hash = hashlib.sha256(data_to_hash.encode()).hexdigest()[:16]
        
        qr_data = f"{booking.booking_reference}|{passenger.first_name} {passenger.last_name}|{verification_hash}"
        
        return qr_data
    
    @staticmethod
    def generate_qr_code_image(booking, size=300):
        """
        Generate QR code image
        
        Args:
            booking: Booking instance
            size: Image size in pixels
            
        Returns:
            BytesIO: QR code image as PNG
        """
        qr_data = QRCodeService.generate_qr_data(booking)
        
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        # Generate image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Resize if needed
        if size:
            img = img.resize((size, size))
        
        # Save to BytesIO
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        return buffer
    
    @staticmethod
    def verify_qr_data(qr_data_string):
        """
        Verify QR code authenticity
        
        Returns:
            tuple: (is_valid, booking_reference, error_message)
        """
        try:
            parts = qr_data_string.split('|')
            if len(parts) != 3:
                return False, None, "Invalid QR code format"
            
            booking_reference, passenger_name, provided_hash = parts
            
            # Find booking
            from apps.bookings.models import Booking
            try:
                booking = Booking.objects.get(booking_reference=booking_reference)
            except Booking.DoesNotExist:
                return False, None, "Booking not found"
            
            # Get first passenger
            passenger = booking.passengers.first()
            if not passenger:
                return False, None, "No passenger found"
            
            # Verify hash
            secret_key = settings.SECRET_KEY
            data_to_hash = f"{booking.booking_reference}|{passenger.phone}|{secret_key}"
            expected_hash = hashlib.sha256(data_to_hash.encode()).hexdigest()[:16]
            
            if provided_hash != expected_hash:
                return False, None, "Invalid QR code - tampering detected"
            
            # Check booking status
            if booking.booking_status != 'confirmed':
                return False, booking_reference, f"Booking status is {booking.booking_status}"
            
            return True, booking_reference, None
            
        except Exception as e:
            return False, None, str(e)