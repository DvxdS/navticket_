# apps/dashboard/views.py
# Backend/apps/dashboard/views.py

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from datetime import timedelta, datetime

from apps.transport.models import Trip
from apps.bookings.models import Booking
from apps.payments.models import Payment
from apps.transport.models import Route


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def dashboard_overview(request):
    """
    Main dashboard overview with aggregated stats
    GET /api/v1/dashboard/overview/
    """
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Today's stats
    today_bookings = Booking.objects.filter(created_at__date=today)
    today_revenue = Payment.objects.filter(
        created_at__date=today,
        status='completed'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Trip stats
    total_trips = Trip.objects.count()
    upcoming_trips = Trip.objects.filter(
        departure_date__gte=today,
        status='active'
    ).count()
    today_trips = Trip.objects.filter(departure_date=today).count()
    
    # Booking stats
    total_bookings = Booking.objects.count()
    pending_bookings = Booking.objects.filter(payment_status='pending').count()
    confirmed_bookings = Booking.objects.filter(booking_status='confirmed').count()
    
    # Revenue stats
    total_revenue = Payment.objects.filter(
        status='completed'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    week_revenue = Payment.objects.filter(
        created_at__gte=week_ago,
        status='completed'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    month_revenue = Payment.objects.filter(
        created_at__gte=month_ago,
        status='completed'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Active routes
    active_routes = Route.objects.filter(is_active=True).count()
    
    # Recent bookings
    recent_bookings = Booking.objects.select_related(
        'trip__route__origin_city',
        'trip__route__destination_city',
        'user'
    ).order_by('-created_at')[:5]
    
    recent_bookings_data = [{
        'booking_reference': booking.booking_reference,
        'passenger_name': f"{booking.user.first_name} {booking.user.last_name}",
        'route': f"{booking.trip.route.origin_city.name} → {booking.trip.route.destination_city.name}",
        'amount': str(booking.total_amount),
        'status': booking.booking_status,
        'payment_status': booking.payment_status,
        'created_at': booking.created_at.isoformat(),
    } for booking in recent_bookings]
    
    # Today's trips
    todays_trips = Trip.objects.filter(
        departure_date=today
    ).select_related(
        'route__origin_city',
        'route__destination_city',
        'route__bus_company'
    ).order_by('departure_time')[:10]
    
    todays_trips_data = [{
        'id': trip.id,
        'route': f"{trip.route.origin_city.name} → {trip.route.destination_city.name}",
        'departure_time': trip.departure_time.strftime('%H:%M'),
        'price': str(trip.price),
        'available_seats': trip.available_seats,
        'total_seats': trip.total_seats,
        'occupancy_rate': round((trip.total_seats - trip.available_seats) / trip.total_seats * 100, 1) if trip.total_seats > 0 else 0,
        'status': trip.status,
    } for trip in todays_trips]
    
    return Response({
        'success': True,
        'data': {
            'today': {
                'bookings': today_bookings.count(),
                'revenue': float(today_revenue),
                'trips': today_trips,
            },
            'overview': {
                'total_trips': total_trips,
                'upcoming_trips': upcoming_trips,
                'total_bookings': total_bookings,
                'pending_bookings': pending_bookings,
                'confirmed_bookings': confirmed_bookings,
                'total_revenue': float(total_revenue),
                'active_routes': active_routes,
            },
            'revenue': {
                'today': float(today_revenue),
                'week': float(week_revenue),
                'month': float(month_revenue),
                'total': float(total_revenue),
            },
            'recent_bookings': recent_bookings_data,
            'todays_trips': todays_trips_data,
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def revenue_analytics(request):
    """
    Revenue analytics with trends
    GET /api/v1/dashboard/analytics/revenue/
    """
    days = int(request.GET.get('days', 30))
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days)
    
    # Daily revenue for chart
    daily_revenue = []
    current_date = start_date
    
    while current_date <= end_date:
        day_revenue = Payment.objects.filter(
            created_at__date=current_date,
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        daily_revenue.append({
            'date': current_date.isoformat(),
            'revenue': float(day_revenue),
        })
        current_date += timedelta(days=1)
    
    return Response({
        'success': True,
        'data': {
            'daily_revenue': daily_revenue,
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def popular_routes(request):
    """
    Most popular routes by bookings
    GET /api/v1/dashboard/analytics/popular-routes/
    """
    from django.db.models import Count
    
    routes = Route.objects.annotate(
        booking_count=Count('trip__booking')
    ).select_related(
        'origin_city',
        'destination_city'
    ).order_by('-booking_count')[:10]
    
    routes_data = [{
        'id': route.id,
        'name': f"{route.origin_city.name} → {route.destination_city.name}",
        'booking_count': route.booking_count,
        'is_active': route.is_active,
    } for route in routes]
    
    return Response({
        'success': True,
        'data': routes_data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def trip_list_management(request):
    """
    Trip list with filters for management
    GET /api/v1/dashboard/trips/
    """
    trips = Trip.objects.all().select_related(
        'route__origin_city',
        'route__destination_city',
        'route__bus_company'
    ).order_by('-departure_date', '-departure_time')
    
    # Filters
    status_filter = request.GET.get('status')
    date_filter = request.GET.get('date')
    route_filter = request.GET.get('route')
    
    if status_filter:
        trips = trips.filter(status=status_filter)
    
    if date_filter:
        trips = trips.filter(departure_date=date_filter)
    
    if route_filter:
        trips = trips.filter(route_id=route_filter)
    
    # Pagination
    from rest_framework.pagination import PageNumberPagination
    paginator = PageNumberPagination()
    paginator.page_size = 20
    paginated_trips = paginator.paginate_queryset(trips, request)
    
    trips_data = [{
        'id': trip.id,
        'route': {
            'origin': trip.route.origin_city.name,
            'destination': trip.route.destination_city.name,
            'full_name': f"{trip.route.origin_city.name} → {trip.route.destination_city.name}",
        },
        'company': trip.route.bus_company.name,
        'departure_date': trip.departure_date.isoformat(),
        'departure_time': trip.departure_time.strftime('%H:%M'),
        'arrival_time': trip.arrival_time.strftime('%H:%M'),
        'price': str(trip.price),
        'available_seats': trip.available_seats,
        'total_seats': trip.total_seats,
        'booked_seats': trip.total_seats - trip.available_seats,
        'occupancy_rate': round((trip.total_seats - trip.available_seats) / trip.total_seats * 100, 1) if trip.total_seats > 0 else 0,
        'status': trip.status,
        'bus_type': trip.bus_type,
    } for trip in paginated_trips]
    
    return paginator.get_paginated_response({
        'success': True,
        'data': trips_data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def toggle_trip_status(request, trip_id):
    """
    Activate/deactivate trip
    POST /api/v1/dashboard/trips/<id>/toggle-status/
    """
    try:
        trip = Trip.objects.get(id=trip_id)
        
        if trip.status == 'active':
            trip.status = 'cancelled'
            message = 'Trip deactivated successfully'
        else:
            trip.status = 'active'
            message = 'Trip activated successfully'
        
        trip.save()
        
        return Response({
            'success': True,
            'message': message,
            'data': {
                'id': trip.id,
                'status': trip.status
            }
        })
    except Trip.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Trip not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def route_list_management(request):
    """
    Route list with management options
    GET /api/v1/dashboard/routes/
    """
    routes = Route.objects.all().select_related(
        'origin_city',
        'destination_city',
        'bus_company'
    ).annotate(
        trip_count=Count('trip'),
        booking_count=Count('trip__booking')
    ).order_by('-is_active', 'origin_city__name')
    
    routes_data = [{
        'id': route.id,
        'origin': route.origin_city.name,
        'destination': route.destination_city.name,
        'full_name': f"{route.origin_city.name} → {route.destination_city.name}",
        'company': route.bus_company.name,
        'base_price': str(route.base_price),
        'distance_km': route.distance_km,
        'estimated_duration': route.estimated_duration,
        'is_active': route.is_active,
        'trip_count': route.trip_count,
        'booking_count': route.booking_count,
    } for route in routes]
    
    return Response({
        'success': True,
        'data': routes_data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def toggle_route_status(request, route_id):
    """
    Activate/deactivate route
    POST /api/v1/dashboard/routes/<id>/toggle-status/
    """
    try:
        route = Route.objects.get(id=route_id)
        route.is_active = not route.is_active
        route.save()
        
        message = 'Route activated' if route.is_active else 'Route deactivated'
        
        return Response({
            'success': True,
            'message': message,
            'data': {
                'id': route.id,
                'is_active': route.is_active
            }
        })
    except Route.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Route not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def booking_list_management(request):
    """
    Booking list for management
    GET /api/v1/dashboard/bookings/
    """
    bookings = Booking.objects.all().select_related(
        'trip__route__origin_city',
        'trip__route__destination_city',
        'user'
    ).order_by('-created_at')
    
    # Filters
    status_filter = request.GET.get('status')
    payment_status = request.GET.get('payment_status')
    search = request.GET.get('search')
    
    if status_filter:
        bookings = bookings.filter(booking_status=status_filter)
    
    if payment_status:
        bookings = bookings.filter(payment_status=payment_status)
    
    if search:
        bookings = bookings.filter(
            Q(booking_reference__icontains=search) |
            Q(user__email__icontains=search) |
            Q(user__first_name__icontains=search) |
            Q(user__last_name__icontains=search)
        )
    
    # Pagination
    from rest_framework.pagination import PageNumberPagination
    paginator = PageNumberPagination()
    paginator.page_size = 20
    paginated_bookings = paginator.paginate_queryset(bookings, request)
    
    bookings_data = [{
        'id': booking.id,
        'booking_reference': booking.booking_reference,
        'passenger': {
            'name': f"{booking.user.first_name} {booking.user.last_name}",
            'email': booking.user.email,
            'phone': booking.contact_phone,
        },
        'trip': {
            'route': f"{booking.trip.route.origin_city.name} → {booking.trip.route.destination_city.name}",
            'departure_date': booking.trip.departure_date.isoformat(),
            'departure_time': booking.trip.departure_time.strftime('%H:%M'),
        },
        'total_passengers': booking.total_passengers,
        'total_amount': str(booking.total_amount),
        'booking_status': booking.booking_status,
        'payment_status': booking.payment_status,
        'created_at': booking.created_at.isoformat(),
    } for booking in paginated_bookings]
    
    return paginator.get_paginated_response({
        'success': True,
        'data': bookings_data
    })

#class PassengerManifestView(APIView):
    """Download passenger manifests for trips"""
    #pass

# Create your views here.
