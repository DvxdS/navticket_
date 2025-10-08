# Backend/apps/locations/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.locations.views import CityViewSet, BusStationViewSet

app_name = 'locations'

router = DefaultRouter()
router.register(r'cities', CityViewSet, basename='city')
router.register(r'stations', BusStationViewSet, basename='station')

urlpatterns = [
    path('', include(router.urls)),
]