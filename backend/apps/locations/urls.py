# Backend/apps/locations/urls.py

from django.urls import path
from rest_framework import generics
from .models import City
from apps.transport.serializers import CitySerializer

app_name = 'locations'

class CityListView(generics.ListAPIView):
    """Public endpoint to list all active cities"""
    queryset = City.objects.filter(is_active=True).order_by('name')
    serializer_class = CitySerializer

urlpatterns = [
    # Public city list for frontend dropdowns
    path('cities/', CityListView.as_view(), name='city-list'),
]