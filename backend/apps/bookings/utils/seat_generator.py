"""
Seat generation utility for bus trips.
Handles automatic seat layout generation based on bus configuration.
"""

from django.db import transaction
from apps.bookings.models import Seat


class SeatLayoutConfig:
    """Seat layout configurations for different bus types"""
    
    STANDARD = {
        'code': '3x2',
        'seats_per_row': 5,
        'positions': ['left_window', 'left_middle', 'left_aisle', 'right_aisle', 'right_window'],
        'columns': ['A', 'B', 'C', 'D', 'E']
    }
    
    VIP = {
        'code': '2x2',
        'seats_per_row': 4,
        'positions': ['left_window', 'left_aisle', 'right_aisle', 'right_window'],
        'columns': ['A', 'B', 'C', 'D']
    }
    
    @classmethod
    def get_config(cls, layout_code):
        """Get configuration by layout code"""
        configs = {'3x2': cls.STANDARD, '2x2': cls.VIP}
        return configs.get(layout_code, cls.STANDARD)


def generate_seats_for_trip(trip):
    """
    Generate seat layout for a trip based on bus configuration.
    
    Args:
        trip: Trip instance
        
    Returns:
        QuerySet of created Seat objects
        
    Example:
        Standard (3x2): 40 seats = 8 rows
        Row 1: [1A] [1B] [1C]  ||  [1D] [1E]
        Row 2: [2A] [2B] [2C]  ||  [2D] [2E]
    """
    
    # Get layout configuration
    config = SeatLayoutConfig.get_config(trip.seat_layout)
    
    seats_per_row = config['seats_per_row']
    positions = config['positions']
    columns = config['columns']
    total_seats = trip.total_seats
    
    # Calculate rows needed
    total_rows = (total_seats + seats_per_row - 1) // seats_per_row
    
    seats_to_create = []
    seat_count = 0
    
    for row in range(1, total_rows + 1):
        for idx, (position, column) in enumerate(zip(positions, columns)):
            if seat_count >= total_seats:
                break
            
            seat_number = f"{row}{column}"
            
            seats_to_create.append(
                Seat(
                    trip=trip,
                    seat_number=seat_number,
                    row=row,
                    position=position,
                    is_available=True
                )
            )
            
            seat_count += 1
    
    # Bulk create for performance
    with transaction.atomic():
        # Clear existing seats first
        Seat.objects.filter(trip=trip).delete()
        
        # Create all seats in one query
        created_seats = Seat.objects.bulk_create(seats_to_create)
    
    return created_seats


def release_expired_reservations():
    """
    Release seats with expired temporary reservations.
    Should be called periodically (e.g., via cron job or before seat map requests).
    
    Returns:
        int: Number of seats released
    """
    from django.utils import timezone
    
    expired_seats = Seat.objects.filter(
        reserved_until__lt=timezone.now(),
        booking__isnull=True,
        is_available=False
    )
    
    count = expired_seats.update(
        is_available=True,
        reserved_until=None,
        passenger_name=None
    )
    
    return count


def get_seat_availability_summary(trip):
    """
    Get seat availability summary for a trip.
    
    Args:
        trip: Trip instance
        
    Returns:
        dict: Summary with total, available, booked, and reserved counts
    """
    
    seats = Seat.objects.filter(trip=trip)
    
    total = seats.count()
    available = seats.filter(is_available=True).count()
    booked = seats.filter(booking__isnull=False).count()
    
    # Reserved = not available but no booking yet
    reserved = seats.filter(is_available=False, booking__isnull=True).count()
    
    return {
        'total': total,
        'available': available,
        'booked': booked,
        'reserved': reserved,
        'occupancy_rate': round((booked / total * 100), 2) if total > 0 else 0
    }