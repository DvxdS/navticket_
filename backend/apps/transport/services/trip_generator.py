

from datetime import datetime, timedelta, time
from django.utils import timezone
from django.db import transaction
from typing import List, Dict, Optional
from decimal import Decimal

from apps.transport.models import Trip, TripTemplate, Route
from apps.locations.models import City


class TripGeneratorService:
    """
    Service pour générer des trajets depuis les modèles de trajets récurrents
    """
    
    @staticmethod
    def generate_trips_for_template(
        template: TripTemplate,
        days_ahead: int = 30,
        skip_existing: bool = True
    ) -> Dict:
        """
        Génère des trajets pour un modèle spécifique
        
        Args:
            template: Le modèle de trajet source
            days_ahead: Nombre de jours à générer (max 90)
            skip_existing: Si True, saute les dates où un trajet existe déjà
        
        Returns:
            Dict avec les statistiques de génération
        """
        
        # Validation
        if not template.is_active:
            return {
                'success': False,
                'error': 'Le modèle doit être actif pour générer des trajets',
                'trips_generated': 0
            }
        
        if days_ahead < 1 or days_ahead > 90:
            return {
                'success': False,
                'error': 'days_ahead doit être entre 1 et 90',
                'trips_generated': 0
            }
        
        # Calculer les dates à générer
        start_date = max(timezone.now().date(), template.valid_from)
        end_date = start_date + timedelta(days=days_ahead - 1)
        
        # Si valid_until existe, ne pas dépasser cette date
        if template.valid_until:
            end_date = min(end_date, template.valid_until)
        
        # Trouver ou créer la route
        route = TripGeneratorService._get_or_create_route(template)
        
        if not route:
            return {
                'success': False,
                'error': 'Impossible de créer la route',
                'trips_generated': 0
            }
        
        # Générer les trajets
        trips_created = []
        trips_skipped = []
        current_date = start_date
        
        while current_date <= end_date:
            # Vérifier si ce jour est dans operates_on_days
            if template.is_valid_on_date(current_date):
                
                # Vérifier si un trajet existe déjà pour cette date
                if skip_existing:
                    existing_trip = Trip.objects.filter(
                        route=route,
                        departure_date=current_date,
                        departure_time=template.departure_time,
                        template=template
                    ).exists()
                    
                    if existing_trip:
                        trips_skipped.append(current_date)
                        current_date += timedelta(days=1)
                        continue
                
                # Créer le trajet
                try:
                    trip = TripGeneratorService._create_trip_from_template(
                        template=template,
                        route=route,
                        departure_date=current_date
                    )
                    trips_created.append(trip)
                except Exception as e:
                    print(f"Erreur création trajet pour {current_date}: {str(e)}")
            
            current_date += timedelta(days=1)
        
        return {
            'success': True,
            'template_id': template.id,
            'route': template.route_display,
            'trips_generated': len(trips_created),
            'trips_skipped': len(trips_skipped),
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            },
            'trip_ids': [trip.id for trip in trips_created]
        }
    
    @staticmethod
    @transaction.atomic
    def _get_or_create_route(template: TripTemplate) -> Optional[Route]:
        """
        Trouve ou crée la route correspondant au modèle
        
        Args:
            template: Le modèle de trajet
        
        Returns:
            Route object ou None
        """
        # Chercher une route existante
        route = Route.objects.filter(
            bus_company=template.bus_company,
            origin_city=template.departure_station.city,
            destination_city=template.arrival_station.city,
            is_active=True
        ).first()
        
        if route:
            return route
        
        # Créer une nouvelle route
        try:
            route = Route.objects.create(
                bus_company=template.bus_company,
                origin_city=template.departure_station.city,
                destination_city=template.arrival_station.city,
                distance_km=0,  # À calculer ou mettre à jour manuellement
                estimated_duration_minutes=template.duration_minutes,
                base_price=template.price,
                is_active=True
            )
            
            return route
            
        except Exception as e:
            print(f"Erreur création route: {str(e)}")
            return None
    
    @staticmethod
    @transaction.atomic
    def _create_trip_from_template(
        template: TripTemplate,
        route: Route,
        departure_date: datetime.date
    ) -> Trip:
        """
        Crée un trajet unique depuis un modèle
        
        Args:
            template: Le modèle source
            route: La route à utiliser
            departure_date: Date du départ
        
        Returns:
            Trip créé
        """
        # Calculer l'heure d'arrivée
        departure_datetime = datetime.combine(departure_date, template.departure_time)
        arrival_datetime = departure_datetime + timedelta(minutes=template.duration_minutes)
        arrival_time = arrival_datetime.time()
        
        # Créer le trajet
        trip = Trip.objects.create(
            route=route,
            departure_date=departure_date,
            departure_time=template.departure_time,
            arrival_time=arrival_time,
            total_seats=template.total_seats,
            available_seats=template.total_seats,
            price=template.price,
            bus_number=template.bus_number,
            bus_type=template.bus_type,
            status='scheduled',
            template=template,
            is_template_generated=True,
            departure_station=template.departure_station,
            arrival_station=template.arrival_station,
            created_by=template.bus_company.owner if hasattr(template.bus_company, 'owner') else None
        )
        
        return trip
    
    @staticmethod
    def generate_trips_for_all_active_templates(days_ahead: int = 30) -> Dict:
        """
        Génère des trajets pour TOUS les modèles actifs
        Utile pour les tâches planifiées (cron jobs)
        
        Args:
            days_ahead: Nombre de jours à générer
        
        Returns:
            Dict avec statistiques globales
        """
        active_templates = TripTemplate.objects.filter(is_active=True)
        
        results = {
            'total_templates': active_templates.count(),
            'successful': 0,
            'failed': 0,
            'total_trips_generated': 0,
            'details': []
        }
        
        for template in active_templates:
            result = TripGeneratorService.generate_trips_for_template(
                template=template,
                days_ahead=days_ahead,
                skip_existing=True
            )
            
            if result['success']:
                results['successful'] += 1
                results['total_trips_generated'] += result['trips_generated']
            else:
                results['failed'] += 1
            
            results['details'].append({
                'template_id': template.id,
                'route': template.route_display,
                'result': result
            })
        
        return results
    
    @staticmethod
    def cleanup_old_trips(days_before: int = 7) -> Dict:
        """
        Nettoie les vieux trajets générés automatiquement
        Supprime les trajets passés de plus de X jours
        
        Args:
            days_before: Garder les trajets des X derniers jours
        
        Returns:
            Dict avec nombre de trajets supprimés
        """
        cutoff_date = timezone.now().date() - timedelta(days=days_before)
        
        old_trips = Trip.objects.filter(
            is_template_generated=True,
            departure_date__lt=cutoff_date,
            status__in=['completed', 'cancelled']
        )
        
        count = old_trips.count()
        old_trips.delete()
        
        return {
            'trips_deleted': count,
            'cutoff_date': cutoff_date.isoformat()
        }