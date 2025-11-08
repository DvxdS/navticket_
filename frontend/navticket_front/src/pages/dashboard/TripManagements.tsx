// Frontend/src/pages/dashboard/TripManagement.tsx

import { useState } from 'react';
import { useTrips } from '@/hooks/useDashboard';
import { Loader2, Plus, Calendar, Users, MapPin } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
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

  
  const safeTrips = Array.isArray(trips) ? trips : [];

 

  
  const calculateOccupancyRate = (trip: any) => {
    if (!trip.total_seats || trip.total_seats === 0) return 0;
    const bookedSeats = trip.total_seats - (trip.available_seats || 0);
    return Math.round((bookedSeats / trip.total_seats) * 100);
  };

  
  const activeTrips = safeTrips.filter(trip => {
    
    if (trip.status) {
      return trip.status !== 'cancelled' && trip.status !== 'completed';
    }
    
    return (trip.available_seats || 0) > 0;
  });

  
  const avgOccupancyRate = safeTrips.length > 0
    ? Math.round(
        safeTrips.reduce((acc, trip) => acc + calculateOccupancyRate(trip), 0) / safeTrips.length
      )
    : 0;

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Trajets actifs"
          value={activeTrips.length}
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title="Taux d'occupation moyen"
          value={`${avgOccupancyRate}%`}
          icon={Users}
          color="green"
        />
        <StatsCard
          title="Total trajets"
          value={pagination.count || safeTrips.length}
          icon={MapPin}
          color="purple"
        />
      </div>

      {/* Trips Table */}
      <TripTable trips={safeTrips} onToggleStatus={toggleTripStatus} />

      {/* Pagination */}
      <Pagination
        currentCount={safeTrips.length}
        totalCount={pagination.count || safeTrips.length}
        hasNext={!!pagination.next}
        hasPrevious={!!pagination.previous}
        onNext={handleNextPage}
        onPrevious={handlePreviousPage}
      />
    </div>
  );
};