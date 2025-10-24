// Frontend/src/services/dashboard.ts

import api from './api';
import type {
  DashboardOverview,
  RevenueAnalytics,
  PopularRoute,
  TripManagement,
  RouteManagement,
  BookingManagement,
  PaginatedResponse,
  ApiResponse,
} from '../types/dashboard.types';

class DashboardService {
  private readonly BASE_URL = '/dashboard';

  // ============ Overview ============
  async getOverview(): Promise<DashboardOverview> {
    const response = await api.get<ApiResponse<DashboardOverview>>(
      `${this.BASE_URL}/overview/`
    );
    return response.data.data;
  }

  // ============ Analytics ============
  async getRevenueAnalytics(days: number = 30): Promise<RevenueAnalytics> {
    const response = await api.get<ApiResponse<RevenueAnalytics>>(
      `${this.BASE_URL}/analytics/revenue/`,
      { params: { days } }
    );
    return response.data.data;
  }

  async getPopularRoutes(): Promise<PopularRoute[]> {
    const response = await api.get<ApiResponse<PopularRoute[]>>(
      `${this.BASE_URL}/analytics/popular-routes/`
    );
    return response.data.data;
  }

  // ============ Trip Management ============
  async getTrips(params?: {
    status?: string;
    date?: string;
    route?: string;
    page?: number;
  }): Promise<PaginatedResponse<TripManagement>> {
    const response = await api.get<PaginatedResponse<TripManagement>>(
      `${this.BASE_URL}/trips/`,
      { params }
    );
    return response.data;
  }

  async toggleTripStatus(tripId: number): Promise<{ id: number; status: string }> {
    const response = await api.post<ApiResponse<{ id: number; status: string }>>(
      `${this.BASE_URL}/trips/${tripId}/toggle-status/`
    );
    return response.data.data;
  }

  // ============ Route Management ============
  async getRoutes(): Promise<RouteManagement[]> {
    const response = await api.get<ApiResponse<RouteManagement[]>>(
      `${this.BASE_URL}/routes/`
    );
    return response.data.data;
  }

  async toggleRouteStatus(routeId: number): Promise<{ id: number; is_active: boolean }> {
    const response = await api.post<ApiResponse<{ id: number; is_active: boolean }>>(
      `${this.BASE_URL}/routes/${routeId}/toggle-status/`
    );
    return response.data.data;
  }

  // ============ Booking Management ============
  async getBookings(params?: {
    status?: string;
    payment_status?: string;
    search?: string;
    page?: number;
  }): Promise<PaginatedResponse<BookingManagement>> {
    const response = await api.get<PaginatedResponse<BookingManagement>>(
      `${this.BASE_URL}/bookings/`,
      { params }
    );
    return response.data;
  }
}

export default new DashboardService();