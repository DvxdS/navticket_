// Frontend/src/pages/dashboard/TripManagement.tsx

import { useState } from 'react';
import { useTrips } from '@/hooks/useDashboard';
import { Loader2, Plus, Calendar, Users, MapPin } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard'; // Use existing one
import { TripFilters } from '@/components/dashboard/trips/TripFilters';
import { TripTable } from '@/components/dashboard/trips/TripTable';
import { Pagination } from '@/components/dashboard/Pagination';

export const TripManagement = () => {
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    route: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { trips, isLoading, pagination, fetchTrips, toggleTripStatus } = useTrips(filters);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (pagination.next) {
      setCurrentPage(prev => prev + 1);
      fetchTrips(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.previous) {
      setCurrentPage(prev => prev - 1);
      fetchTrips(currentPage - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-73px)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestion des trajets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez vos trajets et leurs disponibilités
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" />
          Nouveau trajet
        </button>
      </div>

      {/* Filters */}
      <TripFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Stats Cards - Using existing StatsCard with 'title' prop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Trajets actifs"
          value={trips.filter(t => t.status === 'active').length}
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title="Taux d'occupation moyen"
          value={`${Math.round(trips.reduce((acc, t) => acc + t.occupancy_rate, 0) / trips.length || 0)}%`}
          icon={Users}
          color="green"
        />
        <StatsCard
          title="Total trajets"
          value={pagination.count}
          icon={MapPin}
          color="purple"
        />
      </div>

      {/* Trips Table */}
      <TripTable trips={trips} onToggleStatus={toggleTripStatus} />

      {/* Pagination */}
      <Pagination
        currentCount={trips.length}
        totalCount={pagination.count}
        hasNext={!!pagination.next}
        hasPrevious={!!pagination.previous}
        onNext={handleNextPage}
        onPrevious={handlePreviousPage}
      />
    </div>
  );
};