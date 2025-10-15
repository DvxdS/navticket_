from django.urls import path
from .views import booking_views, ticket_views

app_name = 'bookings'

urlpatterns = [
    # Booking URLs (class-based views)
    path('', booking_views.BookingListView.as_view(), name='list-bookings'),
    path('create/', booking_views.BookingCreateView.as_view(), name='create-booking'),
    path('stats/', booking_views.user_booking_stats, name='booking-stats'),
    path('<str:booking_reference>/', booking_views.BookingDetailView.as_view(), name='get-booking'),
    path('<str:booking_reference>/cancel/', booking_views.cancel_booking_view, name='cancel-booking'),
    


    # E-Ticket URLs
    path('<str:booking_reference>/ticket/download/', ticket_views.download_ticket, name='download-ticket'),
    path('<str:booking_reference>/calendar/download/', ticket_views.download_calendar, name='download-calendar'),
    path('<str:booking_reference>/qr-code/', ticket_views.get_qr_code, name='get-qr-code'),
    path('<str:booking_reference>/ticket/resend/', ticket_views.resend_ticket, name='resend-ticket'),
    path('<str:booking_reference>/ticket/info/', ticket_views.ticket_info, name='ticket-info'),



    #seat urls
     path(
        'trips/<int:trip_id>/seats/',
        booking_views.get_seat_map,
        name='get-seat-map'
    ),
    path(
        'trips/<int:trip_id>/seats/regenerate/',
        booking_views.regenerate_trip_seats,
        name='regenerate-seats'
    ),
    path(
        'seats/reserve/',
        booking_views.reserve_seats,
        name='reserve-seats'
    ),
    path(
        'seats/release/',
        booking_views.release_seats,
        name='release-seats'
    ),
]