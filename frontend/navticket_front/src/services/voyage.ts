import api from './api';
import type {
  VoyageTrip,
  TripSeatsResponse,
  CreateBookingData,
  BookingResponse,
} from '../types/voyage.types';

class VoyageService {
  private readonly BASE_URL = '/dashboard/voyage';

  async getTripsByDate(date?: string): Promise<VoyageTrip[]> {
    const params = date ? { date } : {};
    const response = await api.get(`${this.BASE_URL}/trips/`, { params });
    return response.data.data;
  }

  async getTripSeats(tripId: number): Promise<TripSeatsResponse> {
    const response = await api.get(`${this.BASE_URL}/trips/${tripId}/seats/`);
    return response.data.data;
  }

  async createOfflineBooking(data: CreateBookingData): Promise<BookingResponse> {
    const response = await api.post(`${this.BASE_URL}/create-booking/`, data);
    return response.data;
  }
}

export default new VoyageService();