// Frontend/src/pages/dashboard/DashboardOverview.tsx

import { 
    Bus, 
    Calendar, 
    TrendingUp, 
    Users,
    Loader2,
    DollarSign
  } from 'lucide-react';
  import { useDashboard } from '@/hooks/useDashboard';
  import { StatsCard } from '@/components/dashboard/StatsCard';
  import { RecentBookings } from '@/components/dashboard/RecentBookings';
  import { RevenueChart } from '@/components/dashboard/RevenueChart';
  
  export const DashboardOverview = () => {
    const { overview, isLoading, error, refetch } = useDashboard();
  
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-73px)]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-73px)]">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <button 
              onClick={refetch} 
              className="text-blue-600 hover:underline"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }
  
    return (
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Tableau de bord
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Vue d'ensemble de votre activité
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Nouveau trajet
          </button>
        </div>
  
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Trajets totaux"
            value={overview?.overview.total_trips || 0}
            icon={Bus}
            color="blue"
          />
          <StatsCard
            title="Réservations"
            value={overview?.overview.total_bookings || 0}
            icon={Calendar}
            color="green"
          />
          <StatsCard
            title="Revenus totaux"
            value={`${(overview?.revenue.total || 0).toLocaleString()} FCFA`}
            icon={TrendingUp}
            color="indigo"
          />
          <StatsCard
            title="Routes actives"
            value={overview?.overview.active_routes || 0}
            icon={Users}
            color="purple"
          />
        </div>
  
        {/* Today's Stats & Revenue Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Stats */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Statistiques du jour
            </h3>
            <div className="space-y-4">
              <QuickStat
                label="Trajets aujourd'hui"
                value={overview?.today.trips || 0}
                icon={Bus}
              />
              <QuickStat
                label="Réservations aujourd'hui"
                value={overview?.today.bookings || 0}
                icon={Calendar}
              />
              <QuickStat
                label="Revenus aujourd'hui"
                value={`${parseFloat(overview?.today.revenue.toString() || '0').toLocaleString()} FCFA`}
                icon={DollarSign}
              />
            </div>
          </div>
  
          {/* Revenue Overview */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Aperçu des revenus
            </h3>
            <div className="space-y-4">
              <QuickStat
                label="Aujourd'hui"
                value={`${parseFloat(overview?.revenue.today.toString() || '0').toLocaleString()} FCFA`}
                icon={DollarSign}
              />
              <QuickStat
                label="Cette semaine"
                value={`${parseFloat(overview?.revenue.week.toString() || '0').toLocaleString()} FCFA`}
                icon={TrendingUp}
              />
              <QuickStat
                label="Ce mois"
                value={`${parseFloat(overview?.revenue.month.toString() || '0').toLocaleString()} FCFA`}
                icon={TrendingUp}
              />
            </div>
          </div>
        </div>
  
        {/* Booking Status Overview */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            État des réservations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 mb-1">Confirmées</p>
              <p className="text-2xl font-bold text-green-700">
                {overview?.overview.confirmed_bookings || 0}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-600 mb-1">En attente</p>
              <p className="text-2xl font-bold text-yellow-700">
                {overview?.overview.pending_bookings || 0}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 mb-1">Trajets à venir</p>
              <p className="text-2xl font-bold text-blue-700">
                {overview?.overview.upcoming_trips || 0}
              </p>
            </div>
          </div>
        </div>
  
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Réservations récentes
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Voir tout
            </button>
          </div>
          <RecentBookings 
            bookings={overview?.recent_bookings} 
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  };
  
  // Quick Stat Component
  interface QuickStatProps {
    label: string;
    value: number | string;
    icon: React.ElementType;
  }
  
  const QuickStat = ({ label, value, icon: Icon }: QuickStatProps) => {
    return (
      <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Icon className="w-4 h-4 text-slate-600" />
          </div>
          <span className="text-sm text-slate-600">{label}</span>
        </div>
        <span className="text-lg font-semibold text-slate-900">{value}</span>
      </div>
    );
  };