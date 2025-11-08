// Frontend/src/hooks/useDashboard.ts

import { useState, useEffect } from 'react';
import dashboardService from '../services/dashboard';
import { toast } from 'react-hot-toast';
import type {
  DashboardOverview,
  RevenueAnalytics,
  PopularRoute,
  TripManagement,
  RouteManagement,
  BookingManagement,
} from '../types/dashboard.types';

export const useDashboard = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await dashboardService.getOverview();
      setOverview(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du chargement';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return {
    overview,
    isLoading,
    error,
    refetch: fetchOverview,
  };
};

export const useRevenueAnalytics = (days: number = 30) => {
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const data = await dashboardService.getRevenueAnalytics(days);
        setAnalytics(data);
      } catch (err) {
        toast.error('Erreur lors du chargement des statistiques');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [days]);

  return { analytics, isLoading };
};

export const usePopularRoutes = () => {
  const [routes, setRoutes] = useState<PopularRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRoutes = async () => {
      setIsLoading(true);
      try {
        const data = await dashboardService.getPopularRoutes();
        setRoutes(data);
      } catch (err) {
        toast.error('Erreur lors du chargement des routes populaires');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  return { routes, isLoading };
};

export const useTrips = (params?: {
  status?: string;
  date?: string;
  route?: string;
}) => {
  const [trips, setTrips] = useState<TripManagement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });

  const fetchTrips = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getTrips({ ...params, page });
      
      setTrips(data.results);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
      });
    } catch (err) {
      toast.error('Erreur lors du chargement des trajets');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTripStatus = async (tripId: number) => {
    try {
      await dashboardService.toggleTripStatus(tripId);
      toast.success('Statut du trajet mis à jour');
      fetchTrips();
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [params?.status, params?.date, params?.route]);

  return {
    trips,
    isLoading,
    pagination,
    fetchTrips,
    toggleTripStatus,
  };
};

export const useRoutes = () => {
  const [routes, setRoutes] = useState<RouteManagement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRoutes = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getRoutes();
      setRoutes(data);
    } catch (err) {
      toast.error('Erreur lors du chargement des routes');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRouteStatus = async (routeId: number) => {
    try {
      await dashboardService.toggleRouteStatus(routeId);
      toast.success('Statut de la route mis à jour');
      fetchRoutes();
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  return {
    routes,
    isLoading,
    fetchRoutes,
    toggleRouteStatus,
  };
};

export const useBookings = (params?: {
  status?: string;
  payment_status?: string;
  search?: string;
}) => {
  const [bookings, setBookings] = useState<BookingManagement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });

  const fetchBookings = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getBookings({ ...params, page });
      setBookings(data.results);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
      });
    } catch (err) {
      toast.error('Erreur lors du chargement des réservations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [params?.status, params?.payment_status, params?.search]);

  return {
    bookings,
    isLoading,
    pagination,
    fetchBookings,
  };
};