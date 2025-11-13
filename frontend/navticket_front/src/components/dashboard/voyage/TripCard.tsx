import { Plus, Users, Clock, DollarSign, Bus } from 'lucide-react';
import type { VoyageTrip } from '@/types/voyage.types';

interface TripCardProps {
  trip: VoyageTrip;
  onBookClick: (tripId: number) => void;
  onViewPassengers: (tripId: number) => void;
}

export const TripCard = ({ trip, onBookClick, onViewPassengers }: TripCardProps) => {
  const occupancyPercentage = ((trip.total_seats - trip.available_seats) / trip.total_seats) * 100;
  const bookedSeats = trip.total_seats - trip.available_seats;
  const isFullyBooked = trip.available_seats === 0;
  const isAlmostFull = occupancyPercentage >= 80;
  const isHalfFull = occupancyPercentage >= 50;

  // Dynamic colors based on occupancy
  const getOccupancyColor = () => {
    if (isFullyBooked) return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50' };
    if (isAlmostFull) return { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50' };
    if (isHalfFull) return { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-50' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' };
  };

  const colors = getOccupancyColor();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300">
      {/* Header - Route */}
      <div className="mb-5">
        <h3 className="text-xl font-bold text-slate-900 mb-1">
          {trip.route.origin} → {trip.route.destination}
        </h3>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Bus className="w-4 h-4 text-indigo-500" />
          <span>{trip.company}</span>
          <span className="mx-1">•</span>
          <span className="text-slate-400">{trip.bus_type}</span>
        </div>
      </div>

      {/* Info Grid with colored icons */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Time */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Horaires</p>
            <p className="text-sm font-semibold text-slate-900">
              {trip.departure_time}
            </p>
            <p className="text-xs text-slate-400">→ {trip.arrival_time}</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Prix</p>
            <p className="text-sm font-semibold text-slate-900">
              {parseInt(trip.price).toLocaleString('fr-FR')}
            </p>
            <p className="text-xs text-slate-400">FCFA</p>
          </div>
        </div>
      </div>

      {/* Occupancy Section with dynamic colors */}
      <div className={`${colors.light} border border-${colors.text.replace('text-', '')}-200 rounded-lg p-4 mb-5`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 ${colors.text}`} />
            <span className={`text-sm font-medium ${colors.text}`}>
              {isFullyBooked ? 'Complet' : isAlmostFull ? 'Presque plein' : 'Disponible'}
            </span>
          </div>
          <div>
            <span className={`text-2xl font-bold ${colors.text}`}>
              {trip.available_seats}
            </span>
            <span className="text-slate-500 text-sm">/{trip.total_seats}</span>
          </div>
        </div>

        {/* Animated progress bar */}
        <div className="relative h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
          <div
            className={`${colors.bg} h-full rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${occupancyPercentage}%` }}
          />
        </div>

        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>{bookedSeats} réservés</span>
          <span>{Math.round(occupancyPercentage)}%</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => onBookClick(trip.id)}
          disabled={isFullyBooked}
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
            isFullyBooked
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]'
          }`}
        >
          <Plus className="w-5 h-5" />
          {isFullyBooked ? 'Complet' : 'Réserver'}
        </button>

        <button
          onClick={() => onViewPassengers(trip.id)}
          className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <Users className="w-4 h-4" />
          Voir passagers ({bookedSeats})
        </button>
      </div>
    </div>
  );
};