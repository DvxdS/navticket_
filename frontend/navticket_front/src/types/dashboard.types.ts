// Frontend/src/types/dashboard.types.ts

export interface DashboardOverview {
    today: {
      bookings: number;
      revenue: number;
      trips: number;
    };
    overview: {
      total_trips: number;
      upcoming_trips: number;
      total_bookings: number;
      pending_bookings: number;
      confirmed_bookings: number;
      total_revenue: number;
      active_routes: number;
    };
    revenue: {
      today: number;
      week: number;
      month: number;
      total: number;
    };
    recent_bookings: RecentBooking[];
    todays_trips: TodayTrip[];
  }
  
  export interface RecentBooking {
    booking_reference: string;
    passenger_name: string;
    route: string;
    amount: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    payment_status: 'completed' | 'pending' | 'failed';
    created_at: string;
  }
  
  export interface TodayTrip {
    id: number;
    route: string;
    departure_time: string;
    price: string;
    available_seats: number;
    total_seats: number;
    occupancy_rate: number;
    status: 'active' | 'cancelled' | 'completed';
  }
  
  export interface DailyRevenue {
    date: string;
    revenue: number;
  }
  
  export interface RevenueAnalytics {
    daily_revenue: DailyRevenue[];
  }
  
  export interface PopularRoute {
    id: number;
    name: string;
    booking_count: number;
    is_active: boolean;
  }
  
  export interface TripManagement {
    id: number;
    route: {
      origin: string;
      destination: string;
      full_name: string;
    };
    company: string;
    departure_date: string;
    departure_time: string;
    arrival_time: string;
    price: string;
    available_seats: number;
    total_seats: number;
    booked_seats: number;
    occupancy_rate: number;
    status: 'active' | 'cancelled' | 'completed';
    bus_type: string;
  }
  
  export interface RouteManagement {
    id: number;
    origin: string;
    destination: string;
    full_name: string;
    company: string;
    base_price: string;
    distance_km: number;
    estimated_duration: string;
    is_active: boolean;
    trip_count: number;
    booking_count: number;
  }
  
  export interface BookingManagement {
    id: number;
    booking_reference: string;
    passenger: {
      name: string;
      email: string;
      phone: string;
    };
    trip: {
      route: string;
      departure_date: string;
      departure_time: string;
    };
    total_passengers: number;
    total_amount: string;
    booking_status: 'confirmed' | 'pending' | 'cancelled';
    payment_status: 'completed' | 'pending' | 'failed';
    created_at: string;
  }
  
  export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
  }