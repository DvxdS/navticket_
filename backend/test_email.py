# Backend/test_email.py

import os
import sys
import django

# Add the Backend directory to Python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'navticket.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def test_email():
    """Test if email configuration works"""
    try:
        send_mail(
            subject='Navticket Email Test',
            message='This is a test email from Navticket.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['davidsoro595@gmail.com'],  # Replace with your email
            fail_silently=False,
        )
        print("✅ Email sent successfully!")
        print(f"From: {settings.DEFAULT_FROM_EMAIL}")
        print(f"Host: {settings.EMAIL_HOST}")
    except Exception as e:
        print(f"❌ Email failed: {str(e)}")

if __name__ == '__main__':
    test_email()