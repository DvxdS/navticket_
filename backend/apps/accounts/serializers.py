from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from .models import User, BusCompany
import re

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Secure user registration serializer"""
    
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'phone', 'password', 'password_confirm')
        extra_kwargs = {
            'email': {'validators': [validate_email]},
            'first_name': {'required': True, 'min_length': 2},
            'last_name': {'required': True, 'min_length': 2},
        }
    
    def validate(self, attrs):
        """Validate password confirmation and security rules"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Password fields do not match.'
            })
        
        # Additional security validations
        email = attrs.get('email', '').lower()
        password = attrs.get('password', '')
        
        # Check if password contains email
        if email.split('@')[0] in password.lower():
            raise serializers.ValidationError({
                'password': 'Password cannot contain parts of your email address.'
            })
        
        return attrs
    
    def validate_email(self, value):
        """Validate email format and uniqueness"""
        value = value.lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value


class UserLoginSerializer(serializers.Serializer):
    """Secure login serializer"""
    
    email = serializers.EmailField()
    password = serializers.CharField(
        style={'input_type': 'password'},
        write_only=True
    )
    
    def validate(self, attrs):
        """Validate login credentials"""
        email = attrs.get('email', '').lower()
        password = attrs.get('password', '')
        
        if not email or not password:
            raise serializers.ValidationError('Email and password are required.')
        
        return {
            'email': email,
            'password': password
        }


class CompanyRegistrationSerializer(serializers.ModelSerializer):
    """Company registration serializer"""
    
    class Meta:
        model = BusCompany
        fields = ('name', 'email', 'phone', 'address', 'business_license', 'tax_number')
        extra_kwargs = {
            'name': {'required': True, 'min_length': 3},
            'email': {'validators': [validate_email]},
            'phone': {'required': True},
        }
    
    def validate_email(self, value):
        """Validate business email uniqueness"""
        value = value.lower()
        if BusCompany.objects.filter(email=value).exists():
            raise serializers.ValidationError('A company with this email already exists.')
        return value