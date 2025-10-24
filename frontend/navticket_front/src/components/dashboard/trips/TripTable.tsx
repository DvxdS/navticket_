// Frontend/src/components/dashboard/trips/TripTable.tsx

import { MapPin, Clock, Eye, Edit, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import type { TripManagement } from '@/types/dashboard.types';

interface TripTableProps {
  trips: TripManagement[];
  onToggleStatus: (tripId: number) => void;
}

export const TripTable = ({ trips, onToggleStatus }: TripTableProps) => {
  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <p className="text-slate-500">Aucun trajet trouvé</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">
                Route
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">
                Date & Heure
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">
                Type de bus
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">
                Sièges
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">
                Prix
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">
                Statut
              </th>
              <th className="text-right py-4 px-6 text-sm font-medium text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trips.map((trip) => (
              <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {trip.route.origin} → {trip.route.destination}
                      </p>
                      <p className="text-xs text-slate-500">
                        {trip.route.full_name}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-900">
                        {format(new Date(trip.departure_date), 'dd MMM yyyy', { locale: fr })}
                      </p>
                      <p className="text-xs text-slate-500">
                        {trip.departure_time} - {trip.arrival_time}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-slate-900">
                    {trip.bus_type}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            trip.occupancy_rate >= 80
                              ? 'bg-red-500'
                              : trip.occupancy_rate >= 50
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${trip.occupancy_rate}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">
                      {trip.booked_seats}/{trip.total_seats} ({trip.occupancy_rate}%)
                    </p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm font-medium text-slate-900">
                    {trip.price}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <StatusBadge status={trip.status} type="trip" />
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Voir détails"
                    >
                      <Eye className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(trip.id)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Plus d'actions"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};