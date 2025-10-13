import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (for adding auth tokens later)
api.interceptors.request.use(
  (config) => {
    // Add auth token if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (for error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // No response received
      console.error('Network Error:', error.message);
    } else {
      // Other errors
      console.error('Error:', error.message);
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
    const response = await api.get('/api/v1/locations/cities/');
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
    const response = await api.get('/api/v1/transport/search/trips/', {
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
    const response = await api.get(`/api/v1/transport/trips/${tripId}/`);
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
    const response = await api.get('/api/v1/transport/routes/popular/');
    return response.data;
  } catch (error) {
    console.error('Error fetching popular routes:', error);
    // Return empty array if endpoint doesn't exist yet
    return [];
  }
};

export default api;