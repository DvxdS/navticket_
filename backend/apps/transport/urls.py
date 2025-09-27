# Backend/apps/transport/urls.py

from django.urls import path
from . import views

app_name = 'transport'

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
    
    # ===================== PUBLIC SEARCH ENDPOINTS =====================
    
    # Public trip search (no authentication required)
    path('search/trips/', 
         views.TripSearchView.as_view(), 
         name='trip-search'),
    
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