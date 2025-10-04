# Backend/apps/bookings/views/booking_views.py

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from ..models import Booking
from ..serializers import (
    BookingCreateSerializer,
    BookingListSerializer,
    BookingDetailSerializer,
    BookingCancelSerializer
)
from ..services.booking_services import cancel_booking


class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        detail_serializer = BookingDetailSerializer(booking)
        return Response({
            'success': True,
            'message': 'Booking created successfully',
            'data': detail_serializer.data
        }, status=status.HTTP_201_CREATED)


class BookingListView(generics.ListAPIView):
    serializer_class = BookingListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Booking.objects.filter(user=self.request.user)
        booking_status = self.request.query_params.get('status')
        if booking_status:
            queryset = queryset.filter(booking_status=booking_status)
        ordering = self.request.query_params.get('ordering', '-created_at')
        queryset = queryset.order_by(ordering)
        return queryset.select_related('trip', 'trip__route', 'trip__route__origin_city', 
                                      'trip__route__destination_city', 'trip__route__bus_company')


class BookingDetailView(generics.RetrieveAPIView):
    serializer_class = BookingDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'booking_reference'
    
    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related(
            'trip', 'trip__route', 'trip__route__origin_city',
            'trip__route__destination_city', 'trip__route__bus_company'
        ).prefetch_related('passengers')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_booking_view(request, booking_reference):
    booking = get_object_or_404(Booking, booking_reference=booking_reference, user=request.user)
    serializer = BookingCancelSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    success, message = cancel_booking(booking)
    if success:
        return Response({
            'success': True,
            'message': message,
            'data': {
                'booking_reference': booking.booking_reference,
                'status': booking.booking_status,
                'cancelled_at': booking.cancelled_at
            }
        }, status=status.HTTP_200_OK)
    else:
        return Response({'success': False, 'message': message}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_booking_stats(request):
    user = request.user
    bookings = Booking.objects.filter(user=user)
    stats = {
        'total_bookings': bookings.count(),
        'pending': bookings.filter(booking_status='pending').count(),
        'confirmed': bookings.filter(booking_status='confirmed').count(),
        'cancelled': bookings.filter(booking_status='cancelled').count(),
        'completed': bookings.filter(booking_status='completed').count(),
        'total_spent': sum(b.total_amount for b in bookings.filter(payment_status='paid'))
    }
    return Response({'success': True, 'data': stats})