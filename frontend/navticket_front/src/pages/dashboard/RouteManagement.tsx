// Frontend/src/pages/dashboard/RouteManagement.tsx

import { useState } from 'react';
import { useRoutes } from '@/hooks/useDashboard';
import { Loader2, Plus, MapPin, TrendingUp, Activity } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RouteFilters } from '@/components/dashboard/routes/RouteFilters';
import { RouteTable } from '@/components/dashboard/routes/RouteTable';

export const RouteManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { routes, isLoading, toggleRouteStatus } = useRoutes();

  // Filter routes based on search and status
  const filteredRoutes = routes.filter((route) => {
    const matchesSearch = 
      searchQuery === '' ||
      route.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === '' ||
      (statusFilter === 'active' && route.is_active) ||
      (statusFilter === 'inactive' && !route.is_active);

    return matchesSearch && matchesStatus;
  });

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
            Gestion des routes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez vos itinéraires et leurs tarifs
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" />
          Nouvelle route
        </button>
      </div>

      {/* Filters */}
      <RouteFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Routes actives"
          value={routes.filter(r => r.is_active).length}
          icon={MapPin}
          color="blue"
        />
        <StatsCard
          title="Total trajets"
          value={routes.reduce((acc, r) => acc + r.trip_count, 0)}
          icon={Activity}
          color="green"
        />
        <StatsCard
          title="Total réservations"
          value={routes.reduce((acc, r) => acc + r.booking_count, 0)}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Routes Table */}
      <RouteTable 
        routes={filteredRoutes} 
        onToggleStatus={toggleRouteStatus} 
      />

      {/* Results Count */}
      {filteredRoutes.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 px-6 py-4">
          <p className="text-sm text-slate-600">
            Affichage de <span className="font-medium">{filteredRoutes.length}</span> sur{' '}
            <span className="font-medium">{routes.length}</span> routes
          </p>
        </div>
      )}
    </div>
  );
};