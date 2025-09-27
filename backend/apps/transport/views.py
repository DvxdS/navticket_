# Backend/apps/transport/views.py

from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, date

from .models import Route, Trip
from .serializers import (
    RouteListSerializer, RouteCreateSerializer, 
    TripListSerializer, TripCreateSerializer, 
    TripUpdateSerializer, TripDetailSerializer,
    TripSearchSerializer
)
from shared.permissions import (
    IsCompanyUser, IsVerifiedCompany, 
    IsCompanyOwner, IsTripOwner
)


# ===================== ROUTE VIEWS =====================

class RouteListCreateView(generics.ListCreateAPIView):
    """
    GET: List all routes for the authenticated company
    POST: Create a new route for the authenticated company
    """
    permission_classes = [IsAuthenticated, IsCompanyUser, IsVerifiedCompany]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['origin_city', 'destination_city', 'is_active']
    search_fields = ['origin_city__name', 'destination_city__name']
    ordering_fields = ['origin_city__name', 'destination_city__name', 'created_at']
    ordering = ['origin_city__name', 'destination_city__name']
    
    def get_queryset(self):
        """Return routes for the authenticated company only"""
        return Route.objects.filter(
            bus_company=self.request.user.company
        ).select_related('origin_city', 'destination_city', 'bus_company')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RouteCreateSerializer
        return RouteListSerializer
    
    def perform_create(self, serializer):
        """Auto-assign company from authenticated user"""
        serializer.save(bus_company=self.request.user.company)


class RouteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Get route details
    PUT/PATCH: Update route
    DELETE: Delete route (soft delete by setting is_active=False)
    """
    permission_classes = [IsAuthenticated, IsCompanyOwner]
    serializer_class = RouteCreateSerializer
    
    def get_queryset(self):
        """Return routes for the authenticated company only"""
        return Route.objects.filter(
            bus_company=self.request.user.company
        ).select_related('origin_city', 'destination_city')
    
    def perform_destroy(self, instance):
        """Soft delete - set is_active to False"""
        instance.is_active = False
        instance.save()


# ===================== TRIP VIEWS =====================

class TripListCreateView(generics.ListCreateAPIView):
    """
    GET: List all trips for the authenticated company
    POST: Create a new trip for the authenticated company
    """
    permission_classes = [IsAuthenticated, IsCompanyUser, IsVerifiedCompany]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['status', 'departure_date', 'bus_type', 'route__origin_city', 'route__destination_city']
    search_fields = ['route__origin_city__name', 'route__destination_city__name', 'bus_number']
    ordering_fields = ['departure_date', 'departure_time', 'price', 'created_at']
    ordering = ['-departure_date', '-departure_time']
    
    def get_queryset(self):
        """Return trips for the authenticated company only"""
        queryset = Trip.objects.filter(
            route__bus_company=self.request.user.company
        ).select_related(
            'route__origin_city', 
            'route__destination_city', 
            'route__bus_company',
            'created_by'
        )
        
        # Additional filtering based on query parameters
        departure_date = self.request.query_params.get('departure_date')
        if departure_date:
            try:
                date_obj = datetime.strptime(departure_date, '%Y-%m-%d').date()
                queryset = queryset.filter(departure_date=date_obj)
            except ValueError:
                pass
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            try:
                date_from_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
                queryset = queryset.filter(departure_date__gte=date_from_obj)
            except ValueError:
                pass
                
        if date_to:
            try:
                date_to_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
                queryset = queryset.filter(departure_date__lte=date_to_obj)
            except ValueError:
                pass
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TripCreateSerializer
        return TripListSerializer


class TripDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Get trip details
    PUT/PATCH: Update trip
    DELETE: Cancel trip (set status to 'cancelled')
    """
    permission_classes = [IsAuthenticated, IsTripOwner]
    
    def get_queryset(self):
        """Return trips for the authenticated company only"""
        return Trip.objects.filter(
            route__bus_company=self.request.user.company
        ).select_related(
            'route__origin_city',
            'route__destination_city', 
            'route__bus_company',
            'created_by'
        )
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TripUpdateSerializer
        return TripDetailSerializer
    
    def perform_destroy(self, instance):
        """Soft delete - set status to cancelled"""
        instance.status = 'cancelled'
        instance.save()


class TripBulkCreateView(generics.CreateAPIView):
    """
    POST: Create multiple trips at once
    Useful for creating recurring trips or multiple schedules
    """
    permission_classes = [IsAuthenticated, IsCompanyUser, IsVerifiedCompany]
    serializer_class = TripCreateSerializer
    
    def create(self, request, *args, **kwargs):
        """Handle bulk trip creation"""
        trips_data = request.data.get('trips', [])
        
        if not trips_data:
            return Response(
                {'error': 'No trips data provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(trips_data) > 50:  # Limit bulk operations
            return Response(
                {'error': 'Cannot create more than 50 trips at once'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_trips = []
        errors = []
        
        for i, trip_data in enumerate(trips_data):
            serializer = TripCreateSerializer(data=trip_data, context={'request': request})
            if serializer.is_valid():
                trip = serializer.save()
                created_trips.append(TripListSerializer(trip).data)
            else:
                errors.append({
                    'index': i,
                    'data': trip_data,
                    'errors': serializer.errors
                })
        
        response_data = {
            'created_count': len(created_trips),
            'created_trips': created_trips,
            'errors_count': len(errors),
            'errors': errors
        }
        
        if errors and not created_trips:
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
        elif errors:
            return Response(response_data, status=status.HTTP_207_MULTI_STATUS)
        else:
            return Response(response_data, status=status.HTTP_201_CREATED)


# ===================== PUBLIC SEARCH VIEWS =====================

class TripSearchView(generics.ListAPIView):
    """
    Public endpoint for travelers to search available trips
    No authentication required for search
    """
    serializer_class = TripListSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['bus_type', 'departure_date']
    ordering_fields = ['departure_time', 'price']
    ordering = ['departure_time']
    
    def get_queryset(self):
        """Return only bookable trips (published and available)"""
        queryset = Trip.objects.filter(
            status__in=['scheduled', 'on_time'],
            available_seats__gt=0,
            departure_date__gte=timezone.now().date()
        ).select_related(
            'route__origin_city',
            'route__destination_city',
            'route__bus_company'
        )
        
        # Search by origin and destination
        origin_city_id = self.request.query_params.get('origin_city')
        destination_city_id = self.request.query_params.get('destination_city')
        
        if origin_city_id:
            queryset = queryset.filter(route__origin_city_id=origin_city_id)
        
        if destination_city_id:
            queryset = queryset.filter(route__destination_city_id=destination_city_id)
        
        # Filter by departure date
        departure_date = self.request.query_params.get('departure_date')
        if departure_date:
            try:
                date_obj = datetime.strptime(departure_date, '%Y-%m-%d').date()
                queryset = queryset.filter(departure_date=date_obj)
            except ValueError:
                pass
        
        # Price range filtering
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass
        
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass
        
        return queryset


# ===================== COMPANY STATISTICS VIEWS =====================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCompanyUser])
def company_trip_statistics(request):
    """
    Get statistics about company trips
    """
    company = request.user.company
    
    # Get trip counts by status
    trip_stats = {}
    for status_code, status_name in Trip.STATUS_CHOICES:
        count = Trip.objects.filter(
            route__bus_company=company,
            status=status_code
        ).count()
        trip_stats[status_code] = {
            'name': status_name,
            'count': count
        }
    
    # Get upcoming trips
    upcoming_trips = Trip.objects.filter(
        route__bus_company=company,
        departure_date__gte=timezone.now().date(),
        status__in=['scheduled', 'on_time']
    ).count()
    
    # Get total routes
    total_routes = Route.objects.filter(
        bus_company=company,
        is_active=True
    ).count()
    
    # Recent trips
    recent_trips = Trip.objects.filter(
        route__bus_company=company
    ).select_related(
        'route__origin_city',
        'route__destination_city'
    ).order_by('-created_at')[:5]
    
    return Response({
        'company_name': company.name,
        'trip_statistics': trip_stats,
        'upcoming_trips_count': upcoming_trips,
        'total_active_routes': total_routes,
        'recent_trips': TripListSerializer(recent_trips, many=True).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCompanyUser])
def trip_calendar(request):
    """
    Get trips organized by calendar dates
    Useful for dashboard calendar views
    """
    company = request.user.company
    
    # Get month and year from query params
    month = request.GET.get('month', timezone.now().month)
    year = request.GET.get('year', timezone.now().year)
    
    try:
        month = int(month)
        year = int(year)
    except ValueError:
        return Response(
            {'error': 'Invalid month or year parameter'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get trips for the specified month
    trips = Trip.objects.filter(
        route__bus_company=company,
        departure_date__month=month,
        departure_date__year=year
    ).select_related(
        'route__origin_city',
        'route__destination_city'
    ).order_by('departure_date', 'departure_time')
    
    # Group trips by date
    calendar_data = {}
    for trip in trips:
        date_str = trip.departure_date.strftime('%Y-%m-%d')
        if date_str not in calendar_data:
            calendar_data[date_str] = []
        
        calendar_data[date_str].append(TripListSerializer(trip).data)
    
    return Response({
        'month': month,
        'year': year,
        'calendar_data': calendar_data,
        'total_trips': trips.count()
    })