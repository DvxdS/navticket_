from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, BusCompany
from .serializers import UserRegistrationSerializer, UserLoginSerializer, CompanyRegistrationSerializer
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

# Create your views here.
