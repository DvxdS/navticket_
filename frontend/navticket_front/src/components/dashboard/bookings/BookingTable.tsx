// Frontend/src/components/dashboard/bookings/BookingTable.tsx

import { User, MapPin, Calendar, DollarSign, Eye, Download, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import type { BookingManagement } from '@/types/dashboard.types';

interface BookingTableProps {
  bookings: BookingManagement[];
}

export const BookingTable = ({ bookings }: BookingTableProps) => {
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <p className="text-slate-500">Aucune réservation trouvée</p>
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
                Référence
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">
                Passager
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">
                Trajet
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">
                Date départ
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">
                Passagers
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">
                Montant
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">
                Statut
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">
                Paiement
              </th>
              <th className="text-right py-4 px-6 text-sm font-medium text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6">
                  <span className="text-sm font-medium text-slate-900">
                    {booking.booking_reference}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {booking.passenger.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {booking.passenger.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-900">
                      {booking.trip.route}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-900">
                        {format(new Date(booking.trip.departure_date), 'dd MMM yyyy', { locale: fr })}
                      </p>
                      <p className="text-xs text-slate-500">
                        {booking.trip.departure_time}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-slate-900">
                    {booking.total_passengers}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {booking.total_amount}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <StatusBadge status={booking.booking_status} type="booking" />
                </td>
                <td className="py-4 px-6">
                  <PaymentStatusBadge status={booking.payment_status} />
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Voir détails"
                    >
                      <Eye className="w-4 h-4 text-slate-600" />
                    </button>
                    {booking.booking_status === 'confirmed' && (
                      <button
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Télécharger ticket"
                      >
                        <Download className="w-4 h-4 text-slate-600" />
                      </button>
                    )}
                    {booking.booking_status !== 'cancelled' && (
                      <button
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Annuler réservation"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
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

// Payment Status Badge Component
interface PaymentStatusBadgeProps {
  status: 'completed' | 'pending' | 'failed';
}

const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  const statusConfig = {
    completed: {
      label: 'Payé',
      className: 'bg-green-50 text-green-700 border-green-200',
    },
    pending: {
      label: 'En attente',
      className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    },
    failed: {
      label: 'Échoué',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
};