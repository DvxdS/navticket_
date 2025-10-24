from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, BusCompany
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    CompanyRegistrationSerializer, 
    CompanyLoginSerializer,
    LogoutSerializer,
    CurrentUserSerializer
)
from shared.supabase_client import supabase_service
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def traveler_register(request):
    """Register new traveler"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            # Register with Supabase first
            supabase_response = supabase_service.register_user(
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
                metadata={
                    'first_name': serializer.validated_data['first_name'],
                    'last_name': serializer.validated_data['last_name']
                }
            )
            
            # Create Django user
            user = User.objects.create_user(
                username=serializer.validated_data['email'],
                email=serializer.validated_data['email'],
                first_name=serializer.validated_data['first_name'],
                last_name=serializer.validated_data['last_name'],
                phone=serializer.validated_data.get('phone', ''),
                role=User.TRAVELER
            )
            
            return Response({
                'message': 'Registration successful. Please check your email for verification.',
                'user_id': user.id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Registration failed: {e}")
            return Response({
                'error': 'Registration failed. Please try again.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def traveler_login(request):
    """Login traveler"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        try:
            # Authenticate with Supabase
            supabase_response = supabase_service.authenticate_user(
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password']
            )
            
            # Get Django user
            user = User.objects.get(email=serializer.validated_data['email'])
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            return Response({
                'access_token': str(access_token),
                'refresh_token': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role
                }
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.error(f"Login failed: {e}")
            return Response({
                'error': 'Login failed. Please try again.'
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def company_register(request):
    """Register a new bus company and create a company admin user"""
    company_serializer = CompanyRegistrationSerializer(data=request.data)
    user_serializer = UserRegistrationSerializer(data=request.data)
    
    if company_serializer.is_valid() and user_serializer.is_valid():
        try:
            # Register admin in Supabase first
            supabase_response = supabase_service.register_user(
                email=user_serializer.validated_data['email'],
                password=user_serializer.validated_data['password'],
                metadata={
                    'first_name': user_serializer.validated_data['first_name'],
                    'last_name': user_serializer.validated_data['last_name'],
                    'role': User.COMPANY_ADMIN
                }
            )
            
            # Create company
            company = BusCompany.objects.create(
                name=company_serializer.validated_data['name'],
                email=company_serializer.validated_data['email'],
                phone=company_serializer.validated_data['phone'],
                address=company_serializer.validated_data.get('address', ''),
                business_license=company_serializer.validated_data.get('business_license', ''),
                tax_number=company_serializer.validated_data.get('tax_number', ''),
                verification_status='verified',  # Auto-verify for testing
                is_active=True
            )
            
            # Create Django admin user linked to the company
            admin_user = User.objects.create_user(
                username=user_serializer.validated_data['email'],
                email=user_serializer.validated_data['email'],
                password=user_serializer.validated_data['password'],
                first_name=user_serializer.validated_data['first_name'],
                last_name=user_serializer.validated_data['last_name'],
                phone=user_serializer.validated_data.get('phone', ''),
                role=User.COMPANY_ADMIN,
                company=company
            )
            
            # Generate JWT tokens for immediate login
            refresh = RefreshToken.for_user(admin_user)
            access_token = refresh.access_token
            
            return Response({
                'message': 'Company registration successful!',
                'company': {
                    'id': company.id,
                    'name': company.name,
                    'email': company.email,
                    'verification_status': company.verification_status
                },
                'user': {
                    'id': admin_user.id,
                    'email': admin_user.email,
                    'first_name': admin_user.first_name,
                    'last_name': admin_user.last_name,
                    'role': admin_user.role
                },
                'company_access': str(access_token),
                'company_refresh': str(refresh)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Company registration failed: {e}")
            return Response({
                'error': f'Company registration failed: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # Merge errors from both serializers
    errors = {}
    if not company_serializer.is_valid():
        errors.update(company_serializer.errors)
    if not user_serializer.is_valid():
        errors.update(user_serializer.errors)
    return Response(errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def company_login(request):
    """Authenticate company users (admin and staff)"""
    serializer = CompanyLoginSerializer(data=request.data)
    if serializer.is_valid():
        try:
            # Authenticate with Supabase
            supabase_response = supabase_service.authenticate_user(
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password']
            )
            
            # Fetch Django user
            user = User.objects.get(email=serializer.validated_data['email'])
            
            if not user.is_company_user:
                return Response({'error': 'Unauthorized role for company access.'}, status=status.HTTP_403_FORBIDDEN)
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            return Response({
                'company_access_token': str(access_token),
                'company_refresh_token': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role
                }
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.error(f"Company login failed: {e}")
            return Response({'error': 'Login failed. Please try again.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout user by blacklisting refresh token
    POST /api/v1/auth/logout/
    Body: { "refresh": "refresh_token_here" }
    """
    serializer = LogoutSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        serializer.save()
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({
            'error': 'Logout failed',
            'detail': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get current authenticated user details
    GET /api/v1/auth/me/
    """
    serializer = CurrentUserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)