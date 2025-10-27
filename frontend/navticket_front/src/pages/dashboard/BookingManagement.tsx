// Frontend/src/pages/dashboard/BookingManagement.tsx

import { useState } from 'react';
import { useBookings } from '@/hooks/useDashboard';
import { Loader2, Calendar, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { BookingFilters } from '@/components/dashboard/bookings/BookingFilters';
import { BookingTable } from '@/components/dashboard/bookings/BookingTable';
import { Pagination } from '@/components/dashboard/Pagination';

export const BookingManagement = () => {
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
    search: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { bookings, isLoading, pagination, fetchBookings } = useBookings(filters);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (pagination.next) {
      setCurrentPage(prev => prev + 1);
      fetchBookings(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.previous) {
      setCurrentPage(prev => prev - 1);
      fetchBookings(currentPage - 1);
    }
  };

  // ✅ Safety check: Ensure bookings is an array
  const safeBookings = Array.isArray(bookings) ? bookings : [];

  // Calculate stats with safe array
  const confirmedBookings = safeBookings.filter(b => b.booking_status === 'confirmed').length;
  const pendingBookings = safeBookings.filter(b => b.booking_status === 'pending').length;
  const totalRevenue = safeBookings
    .filter(b => b.payment_status === 'completed')
    .reduce((acc, b) => {
      const amount = parseFloat(b.total_amount.replace(/[^\d.-]/g, ''));
      return acc + (isNaN(amount) ? 0 : amount);
    }, 0);

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
            Gestion des réservations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Suivez et gérez toutes vos réservations
          </p>
        </div>
      </div>

      {/* Filters */}
      <BookingFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total réservations"
          value={pagination.count}
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title="Confirmées"
          value={confirmedBookings}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="En attente"
          value={pendingBookings}
          icon={Clock}
          color="orange"
        />
        <StatsCard
          title="Revenus"
          value={`${totalRevenue.toLocaleString()} FCFA`}
          icon={DollarSign}
          color="indigo"
        />
      </div>

      {/* Bookings Table */}
      <BookingTable bookings={safeBookings} />

      {/* Pagination */}
      <Pagination
        currentCount={safeBookings.length}
        totalCount={pagination.count}
        hasNext={!!pagination.next}
        hasPrevious={!!pagination.previous}
        onNext={handleNextPage}
        onPrevious={handlePreviousPage}
      />
    </div>
  );
};