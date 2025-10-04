# Backend/apps/bookings/services/calendar_service.py

from icalendar import Calendar, Event, Alarm
from datetime import timedelta
from django.utils import timezone


class CalendarService:
    """Generate .ics calendar files for bookings"""
    
    @staticmethod
    def generate_calendar_event(booking):
        """
        Generate .ics calendar file for a booking
        
        Args:
            booking: Booking instance
            
        Returns:
            bytes: .ics file content
        """
        cal = Calendar()
        cal.add('prodid', '-//Navticket//Bus Booking//EN')
        cal.add('version', '2.0')
        cal.add('method', 'REQUEST')
        
        # Create event
        event = Event()
        
        # Event details
        trip = booking.trip
        route = trip.route
        
        # ✅ FIXED: Use origin_city and destination_city
        event.add('summary', f'Bus Trip: {route.origin_city.name} → {route.destination_city.name}')
        event.add('dtstart', trip.departure_datetime)
        event.add('dtend', trip.arrival_datetime)
        event.add('dtstamp', timezone.now())
        event.add('uid', f'booking-{booking.booking_reference}@navticket.com')
        
        # ✅ FIXED: Use origin_city
        event.add('location', f'{route.origin_city.name}, Côte d\'Ivoire')
        
        # Get passenger info
        passenger = booking.passengers.first()
        passenger_name = f"{passenger.first_name} {passenger.last_name}" if passenger else "Unknown"
        passenger_seat = passenger.seat_number if passenger else "Not assigned"
        
        # Description with all trip details
        description = f"""
🎫 Booking Reference: {booking.booking_reference}
🚌 Company: {route.bus_company.name}
👤 Passenger: {passenger_name}
💺 Seat: {passenger_seat}
🏙️ From: {route.origin_city.name}
🏙️ To: {route.destination_city.name}
⏰ Departure: {trip.departure_datetime.strftime('%d %B %Y at %H:%M')}
⏰ Arrival: {trip.arrival_datetime.strftime('%d %B %Y at %H:%M')}
💰 Total: {booking.total_amount} XOF

📍 Departure Location: {route.origin_city.name}
📞 Support: support@navticket.com

Please arrive 30 minutes before departure time.
        """.strip()
        
        event.add('description', description)
        
        # Add reminders
        # Reminder 24 hours before
        alarm_24h = Alarm()
        alarm_24h.add('action', 'DISPLAY')
        alarm_24h.add('description', f'Bus trip tomorrow: {route.origin_city.name} → {route.destination_city.name}')
        alarm_24h.add('trigger', timedelta(hours=-24))
        event.add_component(alarm_24h)
        
        # Reminder 2 hours before
        alarm_2h = Alarm()
        alarm_2h.add('action', 'DISPLAY')
        alarm_2h.add('description', f'Bus departing in 2 hours: {route.origin_city.name} → {route.destination_city.name}')
        alarm_2h.add('trigger', timedelta(hours=-2))
        event.add_component(alarm_2h)
        
        # Reminder 30 minutes before
        alarm_30m = Alarm()
        alarm_30m.add('action', 'DISPLAY')
        alarm_30m.add('description', f'Bus departing soon! Please head to {route.origin_city.name}')
        alarm_30m.add('trigger', timedelta(minutes=-30))
        event.add_component(alarm_30m)
        
        # Add event to calendar
        cal.add_component(event)
        
        return cal.to_ical()
    
    @staticmethod
    def get_calendar_filename(booking):
        """Generate filename for calendar file"""
        return f'navticket_booking_{booking.booking_reference}.ics'