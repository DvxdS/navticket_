# Backend/apps/bookings/views/booking_views.py

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from ..models import Booking, Seat
from ..serializers import (
    BookingCreateSerializer,
    BookingListSerializer,
    BookingDetailSerializer,
    BookingCancelSerializer,
    SeatMapSerializer,
    SeatReservationSerializer,
    SeatReleaseSerializer
)

from ..utils import (
    generate_seats_for_trip,
    release_expired_reservations,
    get_seat_availability_summary
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


@api_view(['GET'])
@permission_classes([AllowAny])
def get_seat_map(request, trip_id):
    """
    Get complete seat map for a trip.
    Auto-generates seats if none exist.
    
    GET /api/bookings/trips/{trip_id}/seats/
    """
    
    try:
        trip = Trip.objects.get(id=trip_id)
    except Trip.DoesNotExist:
        return Response(
            {'error': 'Trip not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Generate seats if none exist
    if not trip.seats.exists():
        generate_seats_for_trip(trip)
    
    # Release expired reservations before showing map
    release_expired_reservations()
    
    # Get availability summary
    summary = get_seat_availability_summary(trip)
    
    # Prepare response data
    data = {
        'trip_id': trip.id,
        'seat_layout': trip.seat_layout,
        'total_seats': summary['total'],
        'available_seats': summary['available'],
        'booked_seats': summary['booked'],
        'reserved_seats': summary['reserved'],
        'occupancy_rate': summary['occupancy_rate'],
        'seats': trip.seats.all()
    }
    
    serializer = SeatMapSerializer(data)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reserve_seats(request):
    """
    Temporarily reserve seats for 5 minutes.
    Prevents double-booking during checkout.
    
    POST /api/bookings/seats/reserve/
    Body: {
        "trip_id": 1,
        "seat_numbers": ["1A", "1B"]
    }
    """
    
    serializer = SeatReservationSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    trip = serializer.validated_data['trip']
    seat_numbers = serializer.validated_data['seat_numbers']
    
    # Release expired reservations first
    release_expired_reservations()
    
    # Get requested seats with lock
    seats = Seat.objects.select_for_update().filter(
        trip=trip,
        seat_number__in=seat_numbers
    )
    
    # Check availability
    unavailable = seats.filter(is_available=False)
    if unavailable.exists():
        unavailable_list = list(unavailable.values_list('seat_number', flat=True))
        return Response(
            {
                'error': 'Some seats are already taken or reserved',
                'unavailable_seats': unavailable_list
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Reserve seats for 5 minutes
    reservation_expiry = timezone.now() + timedelta(minutes=5)
    seats.update(
        is_available=False,
        reserved_until=reservation_expiry
    )
    
    return Response(
        {
            'message': 'Seats reserved successfully',
            'reserved_seats': seat_numbers,
            'reserved_until': reservation_expiry,
            'expires_in_seconds': 300
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def release_seats(request):
    """
    Release temporarily reserved seats.
    Called when user cancels or session expires.
    
    POST /api/bookings/seats/release/
    Body: {
        "trip_id": 1,
        "seat_numbers": ["1A", "1B"]
    }
    """
    
    serializer = SeatReleaseSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    trip_id = serializer.validated_data['trip_id']
    seat_numbers = serializer.validated_data['seat_numbers']
    
    # Only release seats that are reserved (not permanently booked)
    released = Seat.objects.filter(
        trip_id=trip_id,
        seat_number__in=seat_numbers,
        booking__isnull=True,  # Not permanently booked
        is_available=False
    ).update(
        is_available=True,
        reserved_until=None,
        passenger_name=None
    )
    
    return Response(
        {
            'message': 'Seats released successfully',
            'released_count': released,
            'seat_numbers': seat_numbers
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def regenerate_trip_seats(request, trip_id):
    """
    Regenerate seats for a trip (admin/company only).
    Useful if seat layout changes.
    
    POST /api/bookings/trips/{trip_id}/seats/regenerate/
    """
    
    try:
        trip = Trip.objects.get(id=trip_id)
    except Trip.DoesNotExist:
        return Response(
            {'error': 'Trip not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if trip has any bookings
    if trip.bookings.filter(booking_status__in=['confirmed', 'completed']).exists():
        return Response(
            {'error': 'Cannot regenerate seats for trip with confirmed bookings'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Regenerate seats
    seats = generate_seats_for_trip(trip)
    
    return Response(
        {
            'message': 'Seats regenerated successfully',
            'total_seats': len(seats),
            'layout': trip.seat_layout
        },
        status=status.HTTP_200_OK
    )