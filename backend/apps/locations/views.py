# Backend/apps/locations/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.locations.models import City, BusStation
from apps.locations.serializers import (
    CitySerializer,
    BusStationSerializer,
    BusStationCreateSerializer,
    BusStationListSerializer
)
from shared.permissions import IsCompanyUser


class CityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only endpoint for cities
    No authentication required - used for search dropdowns
    
    Endpoints:
    - GET /api/v1/locations/cities/ - List all active cities
    - GET /api/v1/locations/cities/{id}/ - Get city details
    """
    queryset = City.objects.filter(is_active=True)
    serializer_class = CitySerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['state_province', 'country', 'is_active']
    search_fields = ['name', 'state_province']
    ordering_fields = ['name', 'state_province']
    ordering = ['name']


class BusStationViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for bus stations
    AUTHENTICATION REQUIRED - Companies manage their own stations
    """
    serializer_class = BusStationSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['city', 'is_active']
    search_fields = ['name', 'address', 'city__name']
    ordering_fields = ['name', 'city__name', 'created_at']
    ordering = ['city__name', 'name']
    
    def get_queryset(self):
        """
        Company users see only their own stations
        ✅ FIX: Use user.company instead of user.buscompany
        """
        user = self.request.user
        
        # Check if user has a company assigned
        if hasattr(user, 'company') and user.company:
            return BusStation.objects.filter(
                company=user.company
            ).select_related('city', 'company').order_by('city__name', 'name')
        
        return BusStation.objects.none()
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action in ['create', 'update', 'partial_update']:
            return BusStationCreateSerializer
        elif self.action == 'list_minimal':
            return BusStationListSerializer
        return BusStationSerializer
    
    def perform_destroy(self, instance):
        """Soft delete - mark as inactive instead of deleting"""
        instance.is_active = False
        instance.save()
    
    @action(detail=False, methods=['get'], url_path='by-city')
    def by_city(self, request):
        """Get all active stations for a specific city"""
        city_id = request.query_params.get('city_id')
        
        if not city_id:
            return Response(
                {
                    "error": "city_id parameter is required",
                    "example": "/api/v1/locations/stations/by-city/?city_id=1"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            city_id = int(city_id)
        except ValueError:
            return Response(
                {"error": "city_id must be a valid integer"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        stations = self.get_queryset().filter(
            city_id=city_id,
            is_active=True
        )
        
        serializer = self.get_serializer(stations, many=True)
        
        return Response({
            "city_id": city_id,
            "count": stations.count(),
            "stations": serializer.data
        })
    
    @action(detail=False, methods=['get'], url_path='minimal')
    def list_minimal(self, request):
        """Get minimal station list for dropdowns"""
        queryset = self.filter_queryset(
            self.get_queryset().filter(is_active=True)
        )
        serializer = BusStationListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a station"""
        station = self.get_object()
        station.is_active = True
        station.save()
        
        serializer = self.get_serializer(station)
        return Response({
            "message": f"Station '{station.name}' activated successfully",
            "station": serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a station"""
        station = self.get_object()
        station.is_active = False
        station.save()
        
        serializer = self.get_serializer(station)
        return Response({
            "message": f"Station '{station.name}' deactivated successfully",
            "station": serializer.data
        })