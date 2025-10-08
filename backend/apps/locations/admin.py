# Backend/apps/locations/admin.py

from django.contrib import admin
from apps.locations.models import City, BusStation


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ['name', 'state_province', 'country', 'is_active', 'created_at']
    list_filter = ['is_active', 'state_province', 'country']
    search_fields = ['name', 'state_province']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'country', 'state_province', 'is_active')
        }),
        ('Geographic Data', {
            'fields': ('latitude', 'longitude', 'timezone'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(BusStation)
class BusStationAdmin(admin.ModelAdmin):
    list_display = [
        'name', 
        'city', 
        'company_name', 
        'phone_number', 
        'is_active', 
        'created_at'
    ]
    list_filter = ['is_active', 'city', 'company']
    search_fields = [
        'name', 
        'address', 
        'company__name',  # ✅ Changed from business_name to name
        'city__name'
    ]
    ordering = ['city__name', 'name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('company', 'city', 'name', 'is_active')
        }),
        ('Contact Details', {
            'fields': ('address', 'phone_number')
        }),
        ('Geographic Data (Optional)', {
            'fields': ('latitude', 'longitude'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def company_name(self, obj):
        """Display company name"""
        return obj.company.name  # 
    company_name.short_description = 'Company'
    company_name.admin_order_field = 'company__name'
    
    def get_queryset(self, request):
        """Optimize queries with select_related"""
        qs = super().get_queryset(request)
        return qs.select_related('city', 'company')