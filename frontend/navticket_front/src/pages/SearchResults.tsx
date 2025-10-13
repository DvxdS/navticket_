import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { searchTrips } from '@/services/api';
import type { Trip } from '@/services/api';
import TripCard from '@/components/search/TripCard';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const originCityId = searchParams.get('origin_city');
  const destinationCityId = searchParams.get('destination_city');
  const departureDate = searchParams.get('departure_date');
  const passengers = searchParams.get('passengers') || '1';

  useEffect(() => {
    const fetchTrips = async () => {
      if (!originCityId || !destinationCityId) {
        setError('Paramètres de recherche manquants');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const results = await searchTrips({
          origin_city: parseInt(originCityId),
          destination_city: parseInt(destinationCityId),
          departure_date: departureDate || undefined,
        });

        setTrips(results);
      } catch (err) {
        console.error('Search error:', err);
        setError('Erreur lors de la recherche. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [originCityId, destinationCityId, departureDate]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date non spécifiée';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const handleBook = (tripId: number) => {
    navigate(`/booking/${tripId}?passengers=${passengers}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-[#73C8D2]" />
            <p className="mt-4 text-lg text-gray-600">Recherche des trajets disponibles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Oups !</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <Button onClick={() => navigate('/')} className="mt-6 bg-[#73C8D2] hover:bg-[#73C8D2]/90">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Modifier la recherche
          </Button>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {trips.length > 0 && trips[0].route.origin_city.name} 
                {' → '} 
                {trips.length > 0 && trips[0].route.destination_city.name}
              </h1>
              <p className="mt-1 text-gray-600">
                {departureDate ? formatDate(departureDate) : 'Date flexible'} • {passengers} passager{parseInt(passengers) > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{trips.length}</span> trajet{trips.length > 1 ? 's' : ''} trouvé{trips.length > 1 ? 's' : ''}
          </p>
        </div>

        {trips.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Aucun trajet disponible</h3>
            <p className="mt-2 text-gray-600">Essayez de modifier vos critères de recherche ou choisir une autre date.</p>
            <Button onClick={() => navigate('/')} className="mt-6 bg-[#73C8D2] hover:bg-[#73C8D2]/90">
              Nouvelle recherche
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onBook={() => handleBook(trip.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}