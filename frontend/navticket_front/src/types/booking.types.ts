// ============================================
// BACKEND-COMPATIBLE TYPE DEFINITIONS
// Matches Django models exactly
// ============================================

// Route from backend
export interface Route {
    id: number;
    origin: string;
    destination: string;
    distance_km?: number;
  }
  
  // Company from backend
  export interface Company {
    id: number;
    name: string;
    logo?: string;
    email?: string;
    phone?: string;
  }
  
  // Trip from backend (matches transport.Trip model)
  export interface Trip {
    id: number;
    route: Route;
    company: Company;
    departure_date: string; // YYYY-MM-DD format
    departure_time: string; // HH:MM:SS format
    arrival_time: string; // HH:MM:SS format
    price: string; // Decimal as string from backend
    available_seats: number;
    total_seats: number;
    seat_layout: '3x2' | '2x2';
    bus_number?: string;
    bus_type?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  // Passenger data for form (before sending to backend)
  export interface PassengerFormData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    id_type?: 'passport' | 'national_id' | 'driver_license' | 'voter_id';
    id_number?: string;
  }
  
  // Passenger as sent to backend (with seat assignment)
  export interface PassengerCreateData extends PassengerFormData {
    seat_number: string;
  }
  
  // Passenger as returned from backend (matches bookings.Passenger model)
  export interface Passenger {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    id_type: 'passport' | 'national_id' | 'driver_license' | 'voter_id';
    id_number?: string;
    seat_number: string;
    date_of_birth?: string;
    age_category?: 'adult' | 'child' | 'infant';
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    created_at: string;
  }
  
  // Booking creation request (what we send to POST /bookings/bookings/)
  export interface CreateBookingRequest {
    trip_id: number;
    passengers: PassengerCreateData[]; // Array of passengers with seat assignments
    contact_email: string;
    contact_phone: string;
    payment_method: 'stripe' | 'orange_money' | 'mtn_money' | 'wave';
  }
  
  // Booking as returned from backend (matches bookings.Booking model)
  export interface Booking {
    id: number;
    booking_reference: string; // e.g., "NVT-20251201-ABC123"
    trip: Trip | number; // Can be nested object or just ID
    user: number; // User ID
    passengers?: Passenger[]; // Array of passenger objects
    selected_seats: string[]; // JSON field: ["1A", "1B"]
    total_passengers: number;
    ticket_price: string; // Decimal as string
    platform_fee: string; // Decimal as string
    total_amount: string; // Decimal as string
    booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
    contact_email: string;
    contact_phone: string;
    qr_code_data?: string;
    qr_code_generated_at?: string;
    ticket_sent_at?: string;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    cancelled_at?: string;
  }
  
  // Booking response from API
  export interface BookingResponse {
    id: number;
    booking_reference: string;
    booking: Booking;
    message: string;
    payment_url?: string; // For Stripe redirect
  }
  
  // Pricing breakdown (calculated on frontend)
  export interface PricingBreakdown {
    basePrice: number; // Converted from string to number for display
    platformFee: number;
    total: number;
  }
  
  // Booking state for frontend
  export interface BookingState {
    trip: Trip | null;
    selectedSeats: string[];
    passengerInfo: PassengerFormData | null;
    pricing: PricingBreakdown;
    currentStep: 'seats' | 'payment';
    isProcessing: boolean;
  }
  
  // Payment method type
  export type PaymentMethod = 'stripe' | 'orange_money' | 'mtn_money' | 'wave';
  
  // Helper function to convert backend decimal strings to numbers
  export const parseDecimal = (value: string | number): number => {
    if (typeof value === 'number') return value;
    return parseFloat(value) || 0;
  };