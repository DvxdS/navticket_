from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from .models import User, BusCompany
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
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


class CompanyLoginSerializer(serializers.Serializer):
    """Company user login serializer"""
    
    email = serializers.EmailField()
    password = serializers.CharField(
        style={'input_type': 'password'},
        write_only=True
    )
    
    def validate(self, attrs):
        email = attrs.get('email', '').lower()
        password = attrs.get('password', '')
        if not email or not password:
            raise serializers.ValidationError('Email and password are required.')
        return {
            'email': email,
            'password': password
        }


class LogoutSerializer(serializers.Serializer):
    """Serializer for logout - to blacklist refresh token"""
    refresh = serializers.CharField(required=True)
    
    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs
    
    def save(self, **kwargs):
        try:
            RefreshToken(self.token).blacklist()
        except TokenError:
            raise serializers.ValidationError('Token is invalid or expired')


class CurrentUserSerializer(serializers.ModelSerializer):
    """Detailed serializer for current authenticated user"""
    company = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'phone', 
                  'role', 'is_active', 'date_joined', 'company')
        read_only_fields = fields
    
    def get_company(self, obj):
        """Get company details if user is a company user"""
        if obj.is_company_user and obj.company:
            return {
                'id': obj.company.id,
                'name': obj.company.name,
                'email': obj.company.email,
                'phone': obj.company.phone,
                'address': obj.company.address,
                'verification_status': obj.company.verification_status,
                'is_active': obj.company.is_active,
            }
        return None