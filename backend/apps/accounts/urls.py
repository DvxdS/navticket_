from django.urls import path
from . import views

urlpatterns = [
    path('traveler/register/', views.traveler_register, name='traveler-register'),
    path('traveler/login/', views.traveler_login, name='traveler-login'),
    path('company/register/', views.company_register, name='company-register'),
    path('company/login/', views.company_login, name='company-login'),
]