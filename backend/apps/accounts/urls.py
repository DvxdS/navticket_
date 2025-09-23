from django.urls import path
from . import views

urlpatterns = [
    path('traveler/register/', views.traveler_register, name='traveler-register'),
    path('traveler/login/', views.traveler_login, name='traveler-login'),
]