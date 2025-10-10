# Backend/apps/transport/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'transport'

# Router for ViewSet-based endpoints (TripTemplate)
router = DefaultRouter()
router.register(r'templates', views.TripTemplateViewSet, basename='template')

urlpatterns = [
    # ===================== ROUTE ENDPOINTS =====================
    
    # Company Routes Management
    path('routes/', 
         views.RouteListCreateView.as_view(), 
         name='route-list-create'),
    
    path('routes/<int:pk>/', 
         views.RouteDetailView.as_view(), 
         name='route-detail'),
    
    # ===================== TRIP ENDPOINTS =====================
    
    # Company Trip Management
    path('trips/', 
         views.TripListCreateView.as_view(), 
         name='trip-list-create'),
    
    path('trips/<int:pk>/', 
         views.TripDetailView.as_view(), 
         name='trip-detail'),
    
    # Bulk trip creation
    path('trips/bulk/', 
         views.TripBulkCreateView.as_view(), 
         name='trip-bulk-create'),
    
    # ===================== TRIP TEMPLATE ENDPOINTS (ViewSet) =====================
    # All template routes are handled by the router:
    # GET    /templates/                    - List templates
    # POST   /templates/                    - Create template
    # GET    /templates/{id}/               - Template details
    # PUT    /templates/{id}/               - Update template
    # PATCH  /templates/{id}/               - Partial update
    # DELETE /templates/{id}/               - Delete (soft) template
    # POST   /templates/{id}/generate/      - Generate trips
    # GET    /templates/{id}/preview/       - Preview trips
    # POST   /templates/{id}/activate/      - Activate template
    # POST   /templates/{id}/deactivate/    - Deactivate template
    # GET    /templates/summary/            - Dashboard summary
    # GET    /templates/active/             - Active templates only
    # GET    /templates/{id}/generated_trips/ - View generated trips
    
    path('', include(router.urls)),  # Include all template routes
    
    # ===================== PUBLIC SEARCH ENDPOINTS =====================
    
    # Public trip search (no authentication required)
    path('search/trips/', 
         views.TripSearchView.as_view(), 
         name='trip-search'),
    
    # Public data endpoints (no authentication required)
    path('public/cities/', 
         views.public_cities, 
         name='public-cities'),
    
    path('public/stations/', 
         views.public_stations, 
         name='public-stations'),
    
    path('public/companies/', 
         views.public_companies, 
         name='public-companies'),
    
    # ===================== COMPANY STATISTICS ENDPOINTS =====================
    
    # Company dashboard statistics
    path('statistics/', 
         views.company_trip_statistics, 
         name='company-statistics'),
    
    # Trip calendar view
    path('calendar/', 
         views.trip_calendar, 
         name='trip-calendar'),
]