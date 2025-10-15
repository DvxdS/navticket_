import api from './api'; // Your existing axios instance

export interface Seat {
  id: number;
  seat_number: string;
  row: number;
  position: string;
  is_available: boolean;
  passenger_name?: string;
  reserved_until?: string;
}

export interface SeatMap {
  trip_id: number;
  seat_layout: string;
  total_seats: number;
  available_seats: number;
  booked_seats: number;
  reserved_seats: number;
  occupancy_rate: number;
  seats: Seat[];
}

export interface ReserveSeatsRequest {
  trip_id: number;
  seat_numbers: string[];
}

export interface ReserveSeatsResponse {
  message: string;
  reserved_seats: string[];
  reserved_until: string;
  expires_in_seconds: number;
}

class SeatService {
  /**
   * Get seat map for a trip
   */
  async getSeatMap(tripId: number): Promise<SeatMap> {
    const response = await api.get(`/bookings/trips/${tripId}/seats/`);
    return response.data;
  }

  /**
   * Reserve seats temporarily (5 minutes)
   */
  async reserveSeats(data: ReserveSeatsRequest): Promise<ReserveSeatsResponse> {
    const response = await api.post('/bookings/seats/reserve/', data);
    return response.data;
  }

  /**
   * Release reserved seats
   */
  async releaseSeats(tripId: number, seatNumbers: string[]): Promise<void> {
    await api.post('/bookings/seats/release/', {
      trip_id: tripId,
      seat_numbers: seatNumbers
    });
  }

  /**
   * Regenerate seats for a trip (admin)
   */
  async regenerateSeats(tripId: number): Promise<void> {
    await api.post(`/bookings/trips/${tripId}/seats/regenerate/`);
  }
}

export default new SeatService();