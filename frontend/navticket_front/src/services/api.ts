import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh the token
        const response = await axios.post(`${BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        // Backend returns { access_token: "..." } or { access: "..." }
        // Handle both cases
        const newAccessToken = response.data.access_token || response.data.access;

        // Save new token
        localStorage.setItem('access_token', newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Dispatch custom event for auth context to handle
        window.dispatchEvent(new Event('auth:logout'));
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


// ===================== TYPES =====================

export interface City {
  id: number;
  name: string;
  state_province: string;
  country: string;
  display_name: string;
  timezone: string;
  is_active: boolean;
}

export interface Route {
  id: number;
  origin_city: City;
  destination_city: City;
  route_display: string;
  distance_km: string;
  estimated_duration_minutes: number;
  duration_hours: number;
  base_price: string;
  is_active: boolean;
  created_at: string;
}

export interface Trip {
  id: number;
  route: Route;
  company_name: string;
  departure_date: string;
  departure_time: string;
  arrival_time: string;
  departure_datetime: string;
  arrival_datetime: string;
  total_seats: number;
  available_seats: number;
  occupancy_rate: number;
  is_full: boolean;
  price: string;
  bus_number: string;
  bus_type: 'standard' | 'vip' | 'luxury';
  status: string;
  can_be_booked: boolean;
  created_at: string;
  departure_station?: {
    id: number;
    name: string;
    address: string;
  } | null;
  arrival_station?: {
    id: number;
    name: string;
    address: string;
  } | null;
}

export interface SearchTripsParams {
  origin_city: number;
  destination_city: number;
  departure_date?: string;
  min_price?: number;
  max_price?: number;
  bus_type?: 'standard' | 'vip' | 'luxury';
}

// ===================== API FUNCTIONS =====================

/**
 * Fetch all active cities
 */
export const fetchCities = async (): Promise<City[]> => {
  try {
    const response = await api.get('/locations/cities/');
    return response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

/**
 * Search for trips based on criteria
 */
export const searchTrips = async (params: SearchTripsParams): Promise<Trip[]> => {
  try {
    const response = await api.get('transport/search/trips/', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error searching trips:', error);
    throw error;
  }
};

/**
 * Get trip details by ID
 */
export const getTripDetails = async (tripId: number): Promise<Trip> => {
  try {
    const response = await api.get(`/transport/trips/${tripId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trip details:', error);
    throw error;
  }
};

/**
 * Get popular routes (for landing page)
 */
export const getPopularRoutes = async (): Promise<Route[]> => {
  try {
    const response = await api.get('/transport/routes/popular/');
    return response.data;
  } catch (error) {
    console.error('Error fetching popular routes:', error);
    // Return empty array if endpoint doesn't exist yet
    return [];
  }
};

export default api;