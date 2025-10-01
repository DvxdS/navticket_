# Backend/shared/permissions.py

from rest_framework.permissions import BasePermission


class IsCompanyUser(BasePermission):
    """
    Permission that checks if user belongs to a company
    Required for all company-specific operations
    """
    message = "You must be associated with a bus company to perform this action."
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Use company_id to avoid triggering DB fetch that may raise DoesNotExist
        company_id = getattr(request.user, 'company_id', None)
        if not company_id:
            return False
        # Ensure the company row actually exists
        try:
            from apps.accounts.models import BusCompany
            return BusCompany.objects.filter(pk=company_id).exists()
        except Exception:
            return False


class IsVerifiedCompany(BasePermission):
    """
    Permission that checks if the company is verified
    Only verified companies can create/modify trips
    """
    message = "Your company must be verified to perform this action."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        company_id = getattr(request.user, 'company_id', None)
        if not company_id:
            return False
        try:
            from apps.accounts.models import BusCompany
            company = BusCompany.objects.filter(pk=company_id).only('verification_status').first()
            return bool(company and company.verification_status == 'verified')
        except Exception:
            return False


class IsCompanyOwnerOrReadOnly(BasePermission):
    """
    Object-level permission to only allow companies to edit their own data
    Read permissions for any request, write permissions only to company owners
    """
    message = "You can only modify your own company's data."
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for any request (GET, HEAD, OPTIONS)
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
            
        # Check if user belongs to a company
        if not hasattr(request.user, 'company') or not request.user.company:
            return False
            
        # Write permissions only for company owners
        # Handle different object types that might have company relationships
        if hasattr(obj, 'bus_company'):
            return obj.bus_company == request.user.company
        elif hasattr(obj, 'company'):
            return obj.company == request.user.company
        elif hasattr(obj, 'route') and hasattr(obj.route, 'bus_company'):
            return obj.route.bus_company == request.user.company
            
        return False


class IsCompanyOwner(BasePermission):
    """
    Object-level permission to only allow companies to access their own data
    Stricter than IsCompanyOwnerOrReadOnly - no read access to other company data
    """
    message = "You can only access your own company's data."
    
    def has_object_permission(self, request, view, obj):
        # Check if user belongs to a company
        if not hasattr(request.user, 'company') or not request.user.company:
            return False
            
        # Check ownership based on object type
        if hasattr(obj, 'bus_company'):
            return obj.bus_company == request.user.company
        elif hasattr(obj, 'company'):
            return obj.company == request.user.company
        elif hasattr(obj, 'route') and hasattr(obj.route, 'bus_company'):
            return obj.route.bus_company == request.user.company
            
        return False


class IsRouteOwner(BasePermission):
    """
    Specific permission for route-related operations
    """
    message = "You can only access routes belonging to your company."
    
    def has_object_permission(self, request, view, obj):
        if not hasattr(request.user, 'company') or not request.user.company:
            return False
            
        return obj.bus_company == request.user.company


class IsTripOwner(BasePermission):
    """
    Specific permission for trip-related operations
    """
    message = "You can only access trips belonging to your company."
    
    def has_object_permission(self, request, view, obj):
        if not hasattr(request.user, 'company') or not request.user.company:
            return False
            
        return obj.route.bus_company == request.user.company


class IsAdminOrCompanyOwner(BasePermission):
    """
    Permission for admin operations or company owners
    Useful for sensitive operations
    """
    message = "You must be an admin or company owner to perform this action."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Allow staff/admin users
        if request.user.is_staff or request.user.is_superuser:
            return True
            
        # Allow company users
        return hasattr(request.user, 'company') and request.user.company is not None
    
    def has_object_permission(self, request, view, obj):
        # Allow staff/admin users
        if request.user.is_staff or request.user.is_superuser:
            return True
            
        # Check company ownership
        if not hasattr(request.user, 'company') or not request.user.company:
            return False
            
        if hasattr(obj, 'bus_company'):
            return obj.bus_company == request.user.company
        elif hasattr(obj, 'company'):
            return obj.company == request.user.company
        elif hasattr(obj, 'route') and hasattr(obj.route, 'bus_company'):
            return obj.route.bus_company == request.user.company
            
        return False