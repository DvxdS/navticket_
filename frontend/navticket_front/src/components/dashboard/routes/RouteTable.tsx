// Frontend/src/components/dashboard/routes/RouteTable.tsx

import { MapPin, Clock, DollarSign, Bus, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import type { RouteManagement } from '@/types/dashboard.types';

interface RouteTableProps {
  routes: RouteManagement[];
  onToggleStatus: (routeId: number) => void;
}

export const RouteTable = ({ routes, onToggleStatus }: RouteTableProps) => {
  if (routes.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <p className="text-slate-500">Aucune route trouvée</p>
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
                Distance
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">
                Durée estimée
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">
                Prix de base
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">
                Trajets
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">
                Réservations
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
            {routes.map((route) => (
              <tr key={route.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {route.origin} → {route.destination}
                      </p>
                      <p className="text-xs text-slate-500">
                        {route.full_name}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-900">
                      {route.distance_km} km
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-900">
                      {route.estimated_duration}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {route.base_price}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Bus className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-900">
                      {route.trip_count}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-slate-900">
                    {route.booking_count}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      route.is_active
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {route.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(route.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        route.is_active
                          ? 'hover:bg-red-50 text-red-600'
                          : 'hover:bg-green-50 text-green-600'
                      }`}
                      title={route.is_active ? 'Désactiver' : 'Activer'}
                    >
                      {route.is_active ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
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