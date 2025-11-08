export interface VoyageTrip {
    id: number;
    route: {
      origin: string;
      destination: string;
      full_name: string;
    };
    company: string;
    departure_time: string;
    arrival_time: string;
    price: string;
    available_seats: number;
    total_seats: number;
    booked_seats: number;
    status: string;
    bus_type: string;
  }
  
  export interface TripSeat {
    id: number;
    seat_number: string;
    row: number;
    position: string;
    is_available: boolean;
  }
  
  export interface TripSeatsResponse {
    trip_id: number;
    total_seats: number;
    available_seats: number;
    seat_layout: string;
    seats: TripSeat[];
  }
  
  export interface PassengerData {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    id_number: string;
  }
  
  export interface CreateBookingData {
    trip_id: number;
    seat_ids: number[];
    passenger: PassengerData;
  }
  
  export interface BookingResponse {
    success: boolean;
    message: string;
    data: {
      booking_reference: string;
      booking_id: number;
      total_amount: string;
      qr_code_data: string;
    };
  }