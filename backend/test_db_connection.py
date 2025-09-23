#!/usr/bin/env python
"""
Test script to verify database connection
"""
import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'navticket.settings')
django.setup()

from django.db import connection
from django.core.exceptions import ImproperlyConfigured

def test_database_connection():
    """Test the database connection"""
    try:
        # Test the connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            print("✅ Database connection successful!")
            print(f"Query result: {result}")
            
        # Test database info
        db_settings = connection.settings_dict
        print(f"\n📊 Database Configuration:")
        print(f"   Engine: {db_settings['ENGINE']}")
        print(f"   Host: {db_settings['HOST']}")
        print(f"   Port: {db_settings['PORT']}")
        print(f"   Database: {db_settings['NAME']}")
        print(f"   User: {db_settings['USER']}")
        print(f"   SSL Mode: {db_settings['OPTIONS'].get('sslmode', 'Not set')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print(f"Error type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    print("🔍 Testing database connection...")
    print("=" * 50)
    
    # Check environment variables
    print("📋 Environment Variables:")
    env_vars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT']
    for var in env_vars:
        value = os.getenv(var, 'Not set')
        if var == 'DB_PASSWORD' and value != 'Not set':
            value = '*' * len(value)  # Hide password
        print(f"   {var}: {value}")
    
    print("\n" + "=" * 50)
    
    success = test_database_connection()
    
    if success:
        print("\n🎉 Database connection test completed successfully!")
        sys.exit(0)
    else:
        print("\n💥 Database connection test failed!")
        sys.exit(1)

