import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Bus, 
  Users, 
  DollarSign,
  ArrowLeft,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { BookingModal } from '../components/booking/BookingModal';
import { AuthModal } from '../components/auth/AuthModal';
import { useAuth } from '../hooks/useAuth';
import type { Trip,  } from '../types/booking.types';
import { parseDecimal } from '../types/booking.types';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export const TripDetailsPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [numberOfPassengers, setNumberOfPassengers] = useState(1);

  // Fetch trip details
  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!tripId) {
        setError('ID du voyage manquant');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/transport/trips/${tripId}/`);
        setTrip(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching trip:', err);
        setError(err.response?.data?.detail || 'Impossible de charger les détails du voyage');
        toast.error('Erreur lors du chargement du voyage');
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [tripId]);

  // Handle reserve button click
  const handleReserveClick = () => {
    if (!trip) return;

    // Check if seats are available
    if (trip.available_seats < numberOfPassengers) {
      toast.error(`Seulement ${trip.available_seats} siège(s) disponible(s)`);
      return;
    }

    if (!isAuthenticated) {
      // Show auth modal if not logged in
      setIsAuthModalOpen(true);
    } else {
      // Open booking modal directly
      setIsBookingModalOpen(true);
    }
  };

  // Handle successful authentication
  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    setIsBookingModalOpen(true);
  };

  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Calculate duration
  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const diff = endMinutes - startMinutes;
    
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des détails du voyage...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Voyage introuvable
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'Le voyage demandé n\'existe pas ou n\'est plus disponible.'}
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* User Info if authenticated */}
          {isAuthenticated && user && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">
                Connecté en tant que:{' '}
                <strong>
                  {user.first_name} {user.last_name}
                </strong>{' '}
                ({user.email})
              </p>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Trip Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Route Card */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <h1 className="text-3xl font-bold mb-2">
                    {trip.route.origin_city?.name || 'Origine'} → {trip.route.destination_city?.name || 'Destination'}
                  </h1>
                  <p className="text-blue-100 flex items-center gap-2">
                    <Bus className="w-5 h-5" />
                    {trip.company?.name || trip.company_name || 'Compagnie de transport'}
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date de départ</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(trip.departure_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Horaires</p>
                        <p className="font-semibold text-gray-900">
                          {trip.departure_time.slice(0, 5)} - {trip.arrival_time.slice(0, 5)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Durée: {calculateDuration(trip.departure_time, trip.arrival_time)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Seats & Bus Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Sièges disponibles</p>
                        <p className="font-semibold text-gray-900">
                          {trip.available_seats} / {trip.total_seats}
                        </p>
                      </div>
                    </div>

                    {trip.bus_number && (
                      <div className="flex items-center gap-3">
                        <Bus className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Numéro de bus</p>
                          <p className="font-semibold text-gray-900">
                            {trip.bus_number}
                          </p>
                        </div>
                      </div>
                    )}

                    {trip.bus_type && (
                      <div className="flex items-center gap-3">
                        <Info className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Type</p>
                          <p className="font-semibold text-gray-900">
                            {trip.bus_type}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Configuration */}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Configuration des sièges</p>
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                      <span className="font-semibold text-gray-900">
                        {trip.seat_layout === '3x2' ? 'Standard (3+2)' : 'VIP/Luxury (2+2)'}
                      </span>
                      <span className="text-sm text-gray-600">
                        • {trip.seat_layout === '3x2' ? '5' : '4'} sièges par rangée
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Informations importantes
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    Présentez-vous à la gare au moins 30 minutes avant le départ
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    Une pièce d'identité valide est requise pour l'embarquement
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    Les bagages en soute sont limités à 20kg par passager
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    L'annulation est possible jusqu'à 2h avant le départ
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Réserver ce voyage
                </h3>

                {/* Price Display */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Prix par siège</p>
                  <p className="text-3xl font-bold text-blue-600 flex items-center gap-2">
                    <DollarSign className="w-6 h-6" />
                    {parseDecimal(trip.price).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>

                {/* Passenger Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de passagers
                  </label>
                  <select
                    value={numberOfPassengers}
                    onChange={(e) => setNumberOfPassengers(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  >
                    {Array.from({ length: Math.min(6, trip.available_seats) }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} passager{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Total Price */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Prix total</span>
                    <span className="font-semibold text-gray-900">
                      {(typeof trip.price === 'number' 
                        ? trip.price * numberOfPassengers
                        : parseFloat(trip.price) * numberOfPassengers
                      ).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Frais de service (inclus)</span>
                    <span>5%</span>
                  </div>
                </div>

                {/* Reserve Button */}
                <button
                  onClick={handleReserveClick}
                  disabled={trip.available_seats === 0}
                  className={`
                    w-full py-4 rounded-lg font-bold text-lg transition shadow-lg
                    ${trip.available_seats === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
                    }
                  `}
                >
                  {trip.available_seats === 0
                    ? 'Complet'
                    : isAuthenticated
                    ? 'Réserver maintenant'
                    : 'Se connecter pour réserver'
                  }
                </button>

                {trip.available_seats > 0 && trip.available_seats <= 5 && (
                  <p className="text-center text-sm text-orange-600 mt-3 font-medium">
                    ⚠️ Plus que {trip.available_seats} place{trip.available_seats > 1 ? 's' : ''} disponible{trip.available_seats > 1 ? 's' : ''}!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        defaultTab="login"
      />

      {/* Booking Modal */}
      {trip && (
        <BookingModal
          trip={trip}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          maxPassengers={numberOfPassengers}
        />
      )}
    </div>
  );
};