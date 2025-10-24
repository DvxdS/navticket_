// Frontend/src/components/dashboard/RecentBookings.tsx

import { Loader2, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { RecentBooking } from '@/types/dashboard.types';

interface RecentBookingsProps {
  bookings?: RecentBooking[];
  isLoading?: boolean;
}

export const RecentBookings = ({ bookings, isLoading }: RecentBookingsProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        Aucune réservation récente
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
              Réf.
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
              Passager
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
              Route
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
              Date
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
              Montant
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
              Statut
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
              Paiement
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => (
            <tr
              key={`${booking.booking_reference}-${index}`}
              className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-slate-900">
                  {booking.booking_reference}
                </span>
              </td>
              <td className="py-3 px-4">
                <p className="text-sm font-medium text-slate-900">
                  {booking.passenger_name}
                </p>
              </td>
              <td className="py-3 px-4">
                <p className="text-sm text-slate-900">
                  {booking.route}
                </p>
              </td>
              <td className="py-3 px-4">
                <p className="text-sm text-slate-900">
                  {format(new Date(booking.created_at), 'dd MMM yyyy', { locale: fr })}
                </p>
                <p className="text-xs text-slate-500">
                  {format(new Date(booking.created_at), 'HH:mm')}
                </p>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-slate-900">
                  {booking.amount}
                </span>
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={booking.status} />
              </td>
              <td className="py-3 px-4">
                <PaymentBadge status={booking.payment_status} />
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                    title="Voir détails"
                  >
                    <Eye className="w-4 h-4 text-slate-600" />
                  </button>
                  {booking.status === 'confirmed' && (
                    <button
                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                      title="Télécharger ticket"
                    >
                      <Download className="w-4 h-4 text-slate-600" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Status Badge Component
interface StatusBadgeProps {
  status: 'confirmed' | 'pending' | 'cancelled';
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    confirmed: {
      label: 'Confirmé',
      className: 'bg-green-50 text-green-700 border-green-200',
    },
    pending: {
      label: 'En attente',
      className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    },
    cancelled: {
      label: 'Annulé',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
  };

  const config = statusConfig[status] || statusConfig.pending; // ✅ Fallback

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
};

// Payment Badge Component
interface PaymentBadgeProps {
  status: 'completed' | 'pending' | 'failed';
}

const PaymentBadge = ({ status }: PaymentBadgeProps) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
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

  // ✅ Add fallback in case status doesn't match
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
};