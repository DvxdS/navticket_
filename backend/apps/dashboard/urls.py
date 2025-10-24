# Backend/apps/dashboard/urls.py

from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    # Overview
    path('overview/', views.dashboard_overview, name='overview'),
    
    # Analytics
    path('analytics/revenue/', views.revenue_analytics, name='revenue-analytics'),
    path('analytics/popular-routes/', views.popular_routes, name='popular-routes'),
    
    # Trip Management
    path('trips/', views.trip_list_management, name='trip-list'),
    path('trips/<int:trip_id>/toggle-status/', views.toggle_trip_status, name='toggle-trip-status'),
    
    # Route Management
    path('routes/', views.route_list_management, name='route-list'),
    path('routes/<int:route_id>/toggle-status/', views.toggle_route_status, name='toggle-route-status'),
    
    # Booking Management
    path('bookings/', views.booking_list_management, name='booking-list'),
]