# Backend/apps/locations/management/commands/import_cities.py

from django.core.management.base import BaseCommand
from django.db import transaction
from apps.locations.models import City


class Command(BaseCommand):
    help = 'Import major cities of Côte d\'Ivoire with coordinates'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing cities before import',
        )

    def handle(self, *args, **options):
        """Import Côte d'Ivoire cities with coordinates and regional info"""
        
        if options['clear']:
            self.stdout.write('Clearing existing cities...')
            City.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('✅ Existing cities cleared'))

        # Major cities of Côte d'Ivoire with accurate coordinates
        cities_data = [
            {
                'name': 'Abidjan',
                'state_province': 'Lagunes',
                'latitude': 5.3364,
                'longitude': -4.0267,
                'country': 'Côte d\'Ivoire',
                'timezone': 'Africa/Abidjan'
            },
            {
                'name': 'Yamoussoukro', 
                'state_province': 'Lacs',
                'latitude': 6.8276,
                'longitude': -5.2893,
                'country': 'Côte d\'Ivoire',
                'timezone': 'Africa/Abidjan'
            },
            {
                'name': 'Bouaké',
                'state_province': 'Vallée du Bandama', 
                'latitude': 7.6906,
                'longitude': -5.0300,
                'country': 'Côte d\'Ivoire',
                'timezone': 'Africa/Abidjan'
            },
            {
                'name': 'San-Pédro',
                'state_province': 'Bas-Sassandra',
                'latitude': 4.7467,
                'longitude': -6.6364,
                'country': 'Côte d\'Ivoire', 
                'timezone': 'Africa/Abidjan'
            },
            {
                'name': 'Korhogo',
                'state_province': 'Poro',
                'latitude': 9.4581,
                'longitude': -5.6300,
                'country': 'Côte d\'Ivoire',
                'timezone': 'Africa/Abidjan'
            },
            {
                'name': 'Daloa',
                'state_province': 'Haut-Sassandra',
                'latitude': 6.8778,
                'longitude': -6.4503,
                'country': 'Côte d\'Ivoire',
                'timezone': 'Africa/Abidjan'
            },
            {
                'name': 'Man',
                'state_province': 'Tonkpi',
                'latitude': 7.4125,
                'longitude': -7.5539,
                'country': 'Côte d\'Ivoire',
                'timezone': 'Africa/Abidjan'
            },
            {
                'name': 'Gagnoa',
                'state_province': 'Gôh',
                'latitude': 6.1319,
                'longitude': -5.9506,
                'country': 'Côte d\'Ivoire',
                'timezone': 'Africa/Abidjan'
            },
            {
                'name': 'Divo',
                'state_province': 'Lôh-Djiboua',
                'latitude': 5.8375,
                'longitude': -5.3569,
                'country': 'Côte d\'Ivoire',
                'timezone': 'Africa/Abidjan'
            },
            {
                'name': 'Abengourou',
                'state_province': 'Indénié-Djuablin',
                'latitude': 6.7297,
                'longitude': -3.4928,
                'country': 'Côte d\'Ivoire',
                'timezone': 'Africa/Abidjan'
            }
        ]

        created_count = 0
        updated_count = 0

        self.stdout.write(f'Starting import of {len(cities_data)} cities...')

        with transaction.atomic():
            for city_data in cities_data:
                city, created = City.objects.get_or_create(
                    name=city_data['name'],
                    country=city_data['country'],
                    defaults={
                        'state_province': city_data['state_province'],
                        'latitude': city_data['latitude'],
                        'longitude': city_data['longitude'],
                        'timezone': city_data['timezone'],
                        'is_active': True,
                    }
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(f'✅ Created: {city.display_name}')
                else:
                    # Update existing city with new data
                    city.state_province = city_data['state_province']
                    city.latitude = city_data['latitude']
                    city.longitude = city_data['longitude']
                    city.timezone = city_data['timezone']
                    city.is_active = True
                    city.save()
                    updated_count += 1
                    self.stdout.write(f'🔄 Updated: {city.display_name}')

        # Success message
        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 Import completed successfully!\n'
                f'📊 Results:\n'
                f'   • Created: {created_count} new cities\n'
                f'   • Updated: {updated_count} existing cities\n'
                f'   • Total: {City.objects.filter(is_active=True).count()} active cities'
            )
        )

        # Show some statistics
        self.stdout.write('\n📍 Major cities imported:')
        major_cities = City.objects.filter(
            name__in=['Abidjan', 'Yamoussoukro', 'Bouaké', 'San-Pédro', 'Korhogo']
        ).order_by('name')
        
        for city in major_cities:
            self.stdout.write(f'   • {city.display_name} ({city.latitude}, {city.longitude})')

        self.stdout.write(
            self.style.WARNING(
                '\n💡 Next steps:\n'
                '   • Check Supabase dashboard to see the cities table\n'
                '   • Run: python manage.py shell\n'
                '   • Test: City.objects.all()\n'
                '   • Create routes between these cities\n'
                '   • Data is now live in Supabase PostgreSQL!'
            )
        )