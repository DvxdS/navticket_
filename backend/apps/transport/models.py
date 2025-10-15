# Backend/apps/transport/models.py

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.conf import settings
from datetime import datetime, time


class Route(models.Model):
    """Fixed paths between cities with base pricing - Company specific routes"""
    bus_company = models.ForeignKey(
        'accounts.BusCompany', 
        on_delete=models.CASCADE,
        related_name='company_routes',
        help_text="Company that operates this route"
    )
    origin_city = models.ForeignKey(
        'locations.City', 
        on_delete=models.CASCADE, 
        related_name='origin_routes',
        help_text="Starting city"
    )
    destination_city = models.ForeignKey(
        'locations.City', 
        on_delete=models.CASCADE, 
        related_name='destination_routes',
        help_text="Ending city"
    )
    
    # Route specifications
    distance_km = models.PositiveIntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(2000)],
        help_text="Distance in kilometers"
    )
    estimated_duration_minutes = models.PositiveIntegerField(
        validators=[MinValueValidator(30), MaxValueValidator(1440)],  # 30 min to 24 hours
        help_text="Estimated travel time in minutes"
    )
    base_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(500), MaxValueValidator(50000)],
        help_text="Base price in CFA francs"
    )
    
    # Operational status
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Whether this route is available for new trips"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        unique_together = ['bus_company', 'origin_city', 'destination_city']  # Company can't duplicate routes
        indexes = [
            models.Index(fields=['bus_company', 'is_active']),
            models.Index(fields=['origin_city', 'destination_city', 'is_active']),
            models.Index(fields=['is_active']),
        ]
        ordering = ['origin_city__name', 'destination_city__name']

    def __str__(self):
        return f"{self.bus_company.name}: {self.origin_city.name} → {self.destination_city.name}"

    def clean(self):
        """Validation to prevent same city as origin and destination"""
        if self.origin_city == self.destination_city:
            raise ValidationError("Origin and destination cannot be the same city")

    @property
    def route_display(self):
        """Formatted route for display - supports both old and new structure"""
        if self.departure_station and self.arrival_station:
            return f"{self.departure_station.display_name} → {self.arrival_station.display_name}"
        elif self.route:
            return self.route.route_display
        return "Itinéraire non défini"
    
    @property
    def duration_hours(self):
        """Get duration in hours as float"""
        return round(self.estimated_duration_minutes / 60, 1)




BUS_TYPE_CHOICES = [
    ('standard', 'Standard'),
    ('vip', 'VIP'),
    ('luxury', 'Luxury'),
    ('express', 'Express'),
    ('sleeper', 'Sleeper'),
]


class Trip(models.Model):
    """Scheduled departures with specific timing and capacity"""
    # Trip status choices
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
        ('in_progress', 'In Progress'),
        ('delayed', 'Delayed'),
        ('on_time', 'On Time'),
        ('early', 'Early'),
        ('late', 'Late'),
]
    route = models.ForeignKey(
        Route, 
        on_delete=models.CASCADE,
        related_name='trips',
        help_text="Route for this trip"
    )
    
    # Schedule information
    departure_date = models.DateField(
        db_index=True,
        help_text="Date of departure"
    )
    departure_time = models.TimeField(
        help_text="Time of departure"
    )
    arrival_time = models.TimeField(
        help_text="Expected arrival time"
    )
    
    # Capacity management
    total_seats = models.PositiveIntegerField(
        default=50,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text="Total number of seats in the bus"
    )
    available_seats = models.PositiveIntegerField(
        default=50,
        validators=[MinValueValidator(0)],
        help_text="Number of available seats"
    )
    
    # Pricing and bus details
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(500), MaxValueValidator(50000)],
        help_text="Trip price in CFA francs"
    )
    bus_number = models.CharField(
        max_length=50, 
        blank=True,
        help_text="Bus identification number"
    )
    bus_type = models.CharField(
        max_length=20, 
        choices=BUS_TYPE_CHOICES,
        default='standard',
        help_text="Type of bus service"
    )
    
    # Trip status and management
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='draft',
        db_index=True,
        help_text="Current status of the trip"
    )
    # Link to template (if this trip was auto-generated)
    template = models.ForeignKey(
        'TripTemplate',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='generated_trips',
        help_text="Modèle qui a généré ce trajet (si auto-généré)"
    )
    
    # NEW: Station-based (will replace route eventually)
    departure_station = models.ForeignKey(
        'locations.BusStation',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='departing_trips',
        help_text="Gare de départ"
    )
    
    arrival_station = models.ForeignKey(
        'locations.BusStation',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='arriving_trips',
        help_text="Gare d'arrivée"
    )

    seat_layout = models.CharField(
        max_length=10,
        choices=[
            ('3x2', 'Standard (3+2)'),     # 5 seats per row
            ('2x2', 'VIP/Luxury (2+2)'),   # 4 seats per row
        ],
        default='3x2',
        help_text="Configuration des sièges du bus"
    )
    
    # Metadata
    is_template_generated = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Si ce trajet a été auto-généré depuis un modèle"
    )
    
    # User tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_trips',
        null=True,
        blank=True,
        help_text="User who created this trip"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['route', 'departure_date', 'status']),
            models.Index(fields=['departure_date', 'status']),
            models.Index(fields=['status']),
            models.Index(fields=['departure_date']),
        ]
        ordering = ['-departure_date', '-departure_time']

    def __str__(self):
    # Support both station-based and route-based
        if self.departure_station and self.arrival_station:
            route = f"{self.departure_station.city.name} → {self.arrival_station.city.name}"
        else:
            route = self.route.route_display if self.route else "No route"
        
        return f"{route} - {self.departure_date} {self.departure_time}"

    def clean(self):
        """Custom validation for trip data"""
        # Validate departure date is in future for new trips
        if self.departure_date and self.departure_date < timezone.now().date():
            if self.pk is None:  # New trip
                raise ValidationError("Departure date cannot be in the past")
        
        # Validate available seats don't exceed total seats
        if self.available_seats > self.total_seats:
            raise ValidationError("Available seats cannot exceed total seats")
        
        # Validate arrival time is after departure time (same day trips)
        if self.departure_time and self.arrival_time:
            if self.arrival_time <= self.departure_time:
                raise ValidationError("Arrival time must be after departure time")

    @property
    def departure_datetime(self):
        """Combine date and time for easier comparison"""
        return datetime.combine(self.departure_date, self.departure_time)
    
    @property
    def arrival_datetime(self):
        """Combine date and time for arrival"""
        return datetime.combine(self.departure_date, self.arrival_time)

    @property
    def is_full(self):
        """Check if trip is fully booked"""
        return self.available_seats == 0

    @property
    def occupancy_rate(self):
        """Get occupancy percentage"""
        if self.total_seats > 0:
            occupied = self.total_seats - self.available_seats
            return round((occupied / self.total_seats) * 100, 1)
        return 0

    def get_company(self):
        """Get the bus company for this trip"""
        return self.route.bus_company

    def can_be_booked(self):
        """Check if trip can accept new bookings"""
        from django.utils import timezone
        
        # Make sure comparison uses timezone-aware datetime
        now = timezone.now()
        trip_datetime = timezone.make_aware(
            datetime.combine(self.departure_date, self.departure_time)
        ) if timezone.is_naive(datetime.combine(self.departure_date, self.departure_time)) else datetime.combine(self.departure_date, self.departure_time)
        
        return (
            self.status in ['scheduled', 'on_time'] and
            self.available_seats > 0 and
            trip_datetime > now
        )
      # Add these properties
    @property
    def seats_per_row(self):
        """Get number of seats per row based on layout"""
        layouts = {
            '3x2': 5,  # Standard: 3 + 2
            '2x2': 4,  # VIP/Luxury: 2 + 2
        }
        return layouts.get(self.seat_layout, 5)
    
    @property
    def total_rows(self):
        """Calculate total rows based on total seats"""
        seats_count = self.seats_per_row
        rows = self.total_seats // seats_count
        # Add extra row if there are remaining seats
        if self.total_seats % seats_count:
            rows += 1
        return rows

class TripTemplate(models.Model):
    """
    Modèle de trajet récurrent (horaire fixe).
    Génère automatiquement des instances Trip pour les jours à venir.
    
    Exemple:
    - Abidjan (Gare d'Adjamé) → San Pedro (Gare Routière)
    - Départ: 09:00 quotidiennement
    - Bus: Standard, 50 places, 7500 FCFA
    - Fonctionne: Lundi-Dimanche
    
    Le système génère automatiquement des Trips pour les 30 prochains jours.
    """
    
    DAYS_OF_WEEK = [
        (1, 'Lundi'),
        (2, 'Mardi'),
        (3, 'Mercredi'),
        (4, 'Jeudi'),
        (5, 'Vendredi'),
        (6, 'Samedi'),
        (7, 'Dimanche'),
    ]
    
    bus_company = models.ForeignKey(
        'accounts.BusCompany',
        on_delete=models.CASCADE,
        related_name='trip_templates',
        help_text="Compagnie qui opère cet horaire récurrent"
    )
    
    # Stations (départ et arrivée)
    departure_station = models.ForeignKey(
        'locations.BusStation',
        on_delete=models.PROTECT,
        related_name='departure_templates',
        help_text="Gare de départ"
    )
    
    arrival_station = models.ForeignKey(
        'locations.BusStation',
        on_delete=models.PROTECT,
        related_name='arrival_templates',
        help_text="Gare d'arrivée"
    )
    
    # Horaire (se répète quotidiennement, pas de date spécifique)
    departure_time = models.TimeField(
        help_text="Heure de départ quotidienne (ex: 09:00:00)"
    )
    
    duration_minutes = models.PositiveIntegerField(
        validators=[MinValueValidator(30), MaxValueValidator(1440)],
        help_text="Durée du trajet en minutes (ex: 240 pour 4 heures)"
    )
    
    # Jours d'opération
    operates_on_days = models.JSONField(
        default=list,
        help_text="Liste des jours [1-7] où 1=Lundi, 7=Dimanche. Ex: [1,2,3,4,5] = Lun-Ven"
    )
    
    # Détails du bus
    bus_type = models.CharField(
        max_length=20,
        choices=BUS_TYPE_CHOICES,
        default='standard',
        help_text="Type de bus pour cet horaire"
    )
    
    bus_number = models.CharField(
        max_length=50,
        help_text="Numéro d'identification du bus (ex: 'AB-001')"
    )
    
    total_seats = models.PositiveIntegerField(
        default=50,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text="Nombre total de places disponibles"
    )
    
    # Prix
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(500), MaxValueValidator(50000)],
        help_text="Prix par place en FCFA"
    )
    
    # Validité de l'horaire
    valid_from = models.DateField(
        help_text="Date à partir de laquelle ce modèle commence à générer des trajets"
    )
    
    valid_until = models.DateField(
        null=True,
        blank=True,
        help_text="Date de fin optionnelle pour ce modèle"
    )
    
    # Statut
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Si ce modèle génère actuellement des trajets"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['departure_station__city__name', 'departure_time']
        verbose_name = "Modèle de Trajet"
        verbose_name_plural = "Modèles de Trajets"
        indexes = [
            models.Index(fields=['bus_company', 'is_active']),
            models.Index(fields=['departure_station', 'arrival_station']),
            models.Index(fields=['valid_from', 'valid_until']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return (
            f"{self.departure_station.city.name} → {self.arrival_station.city.name} "
            f"à {self.departure_time.strftime('%H:%M')} "
            f"({self.get_bus_type_display()}) - {self.bus_company.name}"
        )
    
    @property
    def route_display(self):
        """Affichage lisible de l'itinéraire"""
        return f"{self.departure_station.display_name} → {self.arrival_station.display_name}"
    
    @property
    def duration_hours(self):
        """Durée en heures (décimal)"""
        return round(self.duration_minutes / 60, 2)
    
    @property
    def operates_on_display(self):
        """Affichage lisible des jours d'opération"""
        if not self.operates_on_days:
            return "Aucun jour sélectionné"
        
        day_names = dict(self.DAYS_OF_WEEK)
        days = [day_names[day] for day in sorted(self.operates_on_days) if day in day_names]
        
        # Formatage intelligent
        if len(days) == 7:
            return "Tous les jours"
        elif len(days) == 5 and set(self.operates_on_days) == {1, 2, 3, 4, 5}:
            return "Jours ouvrables (Lun-Ven)"
        elif len(days) == 2 and set(self.operates_on_days) == {6, 7}:
            return "Week-end (Sam-Dim)"
        else:
            return ", ".join(days)
    
    def clean(self):
        """Validation avant sauvegarde"""
        errors = {}
        
        # Valider les gares
        if self.departure_station_id == self.arrival_station_id:
            errors['arrival_station'] = "La gare d'arrivée doit être différente de la gare de départ"
        
        # Valider que les gares appartiennent à la même compagnie
        if self.departure_station and self.departure_station.company_id != self.bus_company_id:
            errors['departure_station'] = "La gare de départ doit appartenir à cette compagnie"
        
        if self.arrival_station and self.arrival_station.company_id != self.bus_company_id:
            errors['arrival_station'] = "La gare d'arrivée doit appartenir à cette compagnie"
        
        # Valider operates_on_days
        if not self.operates_on_days or not isinstance(self.operates_on_days, list):
            errors['operates_on_days'] = "Doit spécifier au moins un jour d'opération"
        else:
            # Vérifier les jours valides (1-7)
            invalid_days = [day for day in self.operates_on_days if day not in range(1, 8)]
            if invalid_days:
                errors['operates_on_days'] = f"Jours invalides: {invalid_days}. Doit être entre 1-7"
        
        # Valider la plage de dates
        if self.valid_until and self.valid_from and self.valid_until < self.valid_from:
            errors['valid_until'] = "La date de fin doit être après la date de début"
        
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def operates_on_day(self, date):
        """Vérifier si le modèle fonctionne un jour spécifique"""
        # date.isoweekday() retourne 1-7 (Lundi-Dimanche)
        return date.isoweekday() in self.operates_on_days
    
    def is_valid_on_date(self, date):
        """Vérifier si le modèle est valide à une date spécifique"""
        if not self.is_active:
            return False
        
        if date < self.valid_from:
            return False
        
        if self.valid_until and date > self.valid_until:
            return False
        
        return self.operates_on_day(date)