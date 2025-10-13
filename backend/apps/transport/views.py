# Backend/apps/transport/views.py

from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, date
from rest_framework import viewsets

from .models import Route, Trip
from .serializers import (
    RouteListSerializer, RouteCreateSerializer, 
    TripListSerializer, TripCreateSerializer, 
    TripUpdateSerializer, TripDetailSerializer,
    TripSearchSerializer,
    TripTemplateSerializer, TripTemplateCreateSerializer,
    TripTemplateListSerializer, TripTemplateSummarySerializer
)
from shared.permissions import (
    IsCompanyUser, IsVerifiedCompany, 
    IsCompanyOwner, IsTripOwner
)

from apps.transport.models import TripTemplate
from apps.transport.services.trip_generator import TripGeneratorService
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
    permission_classes = []  # Explicitly allow public access
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
            'route',
            'route__origin_city',
            'route__destination_city',
            'route__bus_company',
            'departure_station',        # ✅ Add this
            'arrival_station',          # ✅ Add this
            'departure_station__city',  # ✅ Add this (for station city info)
            'arrival_station__city',    # ✅ Add this (for station city info)
        )
        
        # Search by origin and destination cities
        origin_city_id = self.request.query_params.get('origin_city')
        destination_city_id = self.request.query_params.get('destination_city')
        
        if origin_city_id:
            queryset = queryset.filter(route__origin_city_id=origin_city_id)
        
        if destination_city_id:
            queryset = queryset.filter(route__destination_city_id=destination_city_id)
        
        # Search by origin and destination stations
        origin_station_id = self.request.query_params.get('origin_station')
        destination_station_id = self.request.query_params.get('destination_station')
        
        if origin_station_id:
            queryset = queryset.filter(departure_station_id=origin_station_id)
        
        if destination_station_id:
            queryset = queryset.filter(arrival_station_id=destination_station_id)
        
        # Filter by departure date
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
        
        # Bus type filtering
        bus_type = self.request.query_params.get('bus_type')
        if bus_type:
            queryset = queryset.filter(bus_type=bus_type)
        
        # Company filtering (optional)
        company_id = self.request.query_params.get('company')
        if company_id:
            queryset = queryset.filter(route__bus_company_id=company_id)
        
        return queryset


# ===================== PUBLIC DATA ENDPOINTS =====================

@api_view(['GET'])
def public_cities(request):
    """
    Public endpoint to get all active cities
    No authentication required
    """
    from apps.locations.models import City
    
    cities = City.objects.filter(is_active=True).order_by('name')
    
    return Response([
        {
            'id': city.id,
            'name': city.name,
            'state_province': city.state_province,
            'display_name': city.display_name
        }
        for city in cities
    ])


@api_view(['GET'])
def public_stations(request):
    """
    Public endpoint to get all active bus stations
    No authentication required
    """
    from apps.locations.models import BusStation
    
    stations = BusStation.objects.filter(is_active=True).select_related('city', 'company').order_by('city__name', 'name')
    
    return Response([
        {
            'id': station.id,
            'name': station.name,
            'city_id': station.city.id,
            'city_name': station.city.name,
            'company_id': station.company.id,
            'company_name': station.company.name,
            'address': station.address,
            'phone_number': station.phone_number
        }
        for station in stations
    ])


@api_view(['GET'])
def public_companies(request):
    """
    Public endpoint to get all active bus companies
    No authentication required
    """
    from apps.accounts.models import BusCompany
    
    companies = BusCompany.objects.filter(is_active=True).order_by('name')
    
    return Response([
        {
            'id': company.id,
            'name': company.name,
            'business_name': company.business_name,
            'phone_number': company.phone_number,
            'email': company.email,
            'verification_status': company.verification_status
        }
        for company in companies
    ])


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
class TripTemplateViewSet(viewsets.ModelViewSet):
    
    serializer_class = TripTemplateSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'is_active',
        'bus_type',
        'departure_station__city',
        'arrival_station__city'
    ]
    search_fields = [
        'bus_number',
        'departure_station__name',
        'arrival_station__name',
        'departure_station__city__name',
        'arrival_station__city__name'
    ]
    ordering_fields = [
        'departure_time',
        'price',
        'created_at',
        'valid_from'
    ]
    ordering = ['departure_station__city__name', 'departure_time']
    
    def get_queryset(self):
        """Les compagnies voient uniquement leurs propres modèles"""
        user = self.request.user
        
        if hasattr(user, 'company') and user.company:
            return TripTemplate.objects.filter(
                bus_company=user.company
            ).select_related(
                'bus_company',
                'departure_station',
                'departure_station__city',
                'arrival_station',
                'arrival_station__city'
            ).prefetch_related(
                'generated_trips'
            ).order_by('departure_station__city__name', 'departure_time')
        
        return TripTemplate.objects.none()
    
    def get_serializer_class(self):
        """Utiliser différents serializers selon l'action"""
        if self.action in ['create', 'update', 'partial_update']:
            return TripTemplateCreateSerializer
        elif self.action == 'list':
            return TripTemplateListSerializer
        elif self.action == 'summary':
            return TripTemplateSummarySerializer
        return TripTemplateSerializer
    
    def get_serializer_context(self):
        """
        Ensure request context is always passed to serializers
        This is critical for dynamic queryset filtering in serializers
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_destroy(self, instance):
        """Suppression douce - désactive le modèle au lieu de le supprimer"""
        instance.is_active = False
        instance.save()
    
    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
        """
        Générer manuellement des trajets depuis ce modèle
        
        POST /api/v1/transport/templates/{id}/generate/
        Body: {
            "days_ahead": 30
        }
        """
        template = self.get_object()
        days_ahead = request.data.get('days_ahead', 30)
        
        # Valider days_ahead
        try:
            days_ahead = int(days_ahead)
            if days_ahead < 1 or days_ahead > 90:
                return Response(
                    {"error": "days_ahead doit être entre 1 et 90"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {"error": "days_ahead doit être un nombre entier"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not template.is_active:
            return Response(
                {"error": "Le modèle doit être actif pour générer des trajets"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Générer les trajets
        try:
            result = TripGeneratorService.generate_trips_for_template(
                template=template,
                days_ahead=days_ahead,
                skip_existing=True
            )
            
            if result['success']:
                return Response(result, status=status.HTTP_201_CREATED)
            else:
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Erreur lors de la génération: {str(e)}',
                'trips_generated': 0
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """
        Prévisualiser les trajets qui seront générés
        
        GET /api/v1/transport/templates/{id}/preview/?days_ahead=7
        """
        from datetime import datetime, timedelta
        
        template = self.get_object()
        days_ahead = int(request.query_params.get('days_ahead', 7))
        
        if days_ahead < 1 or days_ahead > 90:
            return Response(
                {"error": "days_ahead doit être entre 1 et 90"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculer les dates où des trajets seront générés
        preview_dates = []
        start_date = max(timezone.now().date(), template.valid_from)
        
        for i in range(days_ahead):
            check_date = start_date + timedelta(days=i)
            
            # Vérifier si valide à cette date
            if template.is_valid_on_date(check_date):
                day_name = dict(TripTemplate.DAYS_OF_WEEK)[check_date.isoweekday()]
                preview_dates.append({
                    'date': check_date,
                    'day_name': day_name,
                    'departure_time': template.departure_time,
                    'price': template.price,
                    'seats': template.total_seats
                })
        
        return Response({
            'template_id': template.id,
            'route': template.route_display,
            'days_ahead': days_ahead,
            'trips_count': len(preview_dates),
            'preview': preview_dates[:10]  # Afficher max 10 pour aperçu
        })
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activer un modèle de trajet
        
        POST /api/v1/transport/templates/{id}/activate/
        """
        template = self.get_object()
        
        if template.is_active:
            return Response(
                {"message": "Le modèle est déjà actif"},
                status=status.HTTP_200_OK
            )
        
        template.is_active = True
        template.save()
        
        serializer = self.get_serializer(template)
        return Response({
            "message": f"Modèle '{template.route_display}' activé avec succès",
            "template": serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Désactiver un modèle de trajet
        
        POST /api/v1/transport/templates/{id}/deactivate/
        """
        template = self.get_object()
        
        if not template.is_active:
            return Response(
                {"message": "Le modèle est déjà désactivé"},
                status=status.HTTP_200_OK
            )
        
        template.is_active = False
        template.save()
        
        serializer = self.get_serializer(template)
        return Response({
            "message": f"Modèle '{template.route_display}' désactivé avec succès",
            "template": serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Résumé des modèles pour le dashboard
        
        GET /api/v1/transport/templates/summary/
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        active_count = queryset.filter(is_active=True).count()
        inactive_count = queryset.filter(is_active=False).count()
        
        # Statistiques par type de bus
        by_bus_type = {}
        for choice in TripTemplate._meta.get_field('bus_type').choices:
            bus_type_code = choice[0]
            bus_type_label = choice[1]
            count = queryset.filter(bus_type=bus_type_code, is_active=True).count()
            if count > 0:
                by_bus_type[bus_type_label] = count
        
        # Modèles récents
        recent_templates = queryset.order_by('-created_at')[:5]
        serializer = TripTemplateSummarySerializer(recent_templates, many=True)
        
        return Response({
            'total_templates': queryset.count(),
            'active_templates': active_count,
            'inactive_templates': inactive_count,
            'by_bus_type': by_bus_type,
            'recent_templates': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Liste uniquement les modèles actifs
        
        GET /api/v1/transport/templates/active/
        """
        queryset = self.get_queryset().filter(is_active=True)
        serializer = TripTemplateListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def generated_trips(self, request, pk=None):
        """
        Voir tous les trajets générés depuis ce modèle
        
        GET /api/v1/transport/templates/{id}/generated_trips/
        """
        template = self.get_object()
        
        # Filtrer par date si fournie
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        trips = template.generated_trips.all()
        
        if date_from:
            trips = trips.filter(departure_date__gte=date_from)
        
        if date_to:
            trips = trips.filter(departure_date__lte=date_to)
        
        trips = trips.order_by('departure_date', 'departure_time')
        
        # Utiliser le TripSerializer existant
        from apps.transport.serializers import TripSerializer
        serializer = TripSerializer(trips, many=True, context={'request': request})
        
        return Response({
            'template_id': template.id,
            'route': template.route_display,
            'total_generated_trips': trips.count(),
            'trips': serializer.data
        })