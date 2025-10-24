// Frontend/src/components/dashboard/bookings/BookingFilters.tsx

import { Search } from 'lucide-react';

interface BookingFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: {
    status: string;
    payment_status: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export const BookingFilters = ({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
}: BookingFiltersProps) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par référence, nom du passager..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Booking Status Filter */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="confirmed">Confirmé</option>
            <option value="pending">En attente</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>

        {/* Payment Status Filter */}
        <div>
          <select
            value={filters.payment_status}
            onChange={(e) => onFilterChange('payment_status', e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Statut paiement</option>
            <option value="completed">Payé</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoué</option>
          </select>
        </div>
      </div>
    </div>
  );
};