import { Plus } from 'lucide-react';
import type { VoyageTrip } from '@/types/voyage.types';

interface TripCardProps {
  trip: VoyageTrip;
  onBookClick: (tripId: number) => void;
}

export const TripCard = ({ trip, onBookClick }: TripCardProps) => {
  const occupancyPercentage = ((trip.total_seats - trip.available_seats) / trip.total_seats) * 100;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900">
            {trip.route.full_name}
          </h3>
          <p className="text-sm text-slate-500">{trip.company}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          trip.status === 'active' 
            ? 'bg-green-50 text-green-700'
            : 'bg-gray-50 text-gray-700'
        }`}>
          {trip.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Départ</span>
          <span className="font-medium">{trip.departure_time}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Arrivée</span>
          <span className="font-medium">{trip.arrival_time}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Prix</span>
          <span className="font-medium">{trip.price} FCFA</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Type de bus</span>
          <span className="font-medium">{trip.bus_type}</span>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-blue-900">Places disponibles</span>
          <span className="text-lg font-bold text-blue-600">
            {trip.available_seats}/{trip.total_seats}
          </span>
        </div>
        <div className="mt-2 bg-blue-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all"
            style={{ width: `${occupancyPercentage}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => onBookClick(trip.id)}
        disabled={trip.available_seats === 0}
        className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
          trip.available_seats === 0
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        <Plus className="w-4 h-4" />
        Réserver
      </button>
    </div>
  );
};