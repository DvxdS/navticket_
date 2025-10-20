from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Traveler endpoints
    path('traveler/register/', views.traveler_register, name='traveler-register'),
    path('traveler/login/', views.traveler_login, name='traveler-login'),
    
    # Company endpoints
    path('company/register/', views.company_register, name='company-register'),
    path('company/login/', views.company_login, name='company-login'),
    
    # Token refresh endpoint
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', views.logout_view, name='logout'),  # ← Add this
    path('me/', views.get_current_user, name='current-user'),  # ← Add this
]