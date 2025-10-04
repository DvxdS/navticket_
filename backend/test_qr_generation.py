import os
import sys
import django

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'navticket.settings')
django.setup()

from apps.bookings.models import Booking

# Get your booking
booking_ref = "NVT-20251004-4I4JL"
booking = Booking.objects.get(booking_reference=booking_ref)

print(f"Booking: {booking.booking_reference}")
print(f"QR data: '{booking.qr_code_data}'")

# Try to send email
print("\nTrying to send confirmation email...")
try:
    success = booking.send_confirmation_email()
    if success:
        print("✅ Email sent successfully!")
        print(f"Sent to: {booking.passengers.first().email}")
    else:
        print("❌ Email failed to send")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()