import api from './api';
import type {
  CreateBookingRequest,
  BookingResponse,
  Booking,
  
} from '../types/booking.types';
import { parseDecimal } from '../types/booking.types';

class BookingService {
  /**
   * Create a new booking
   * POST /api/v1/bookings/bookings/
   */
  async createBooking(data: CreateBookingRequest): Promise<BookingResponse> {
    const response = await api.post<BookingResponse>('/bookings/bookings/', data);
    return response.data;
  }

  /**
   * Get booking by ID
   * GET /api/v1/bookings/bookings/{id}/
   */
  async getBooking(bookingId: number): Promise<Booking> {
    const response = await api.get<Booking>(`/bookings/bookings/${bookingId}/`);
    return response.data;
  }

  /**
   * Get booking by reference code
   * GET /api/v1/bookings/bookings/by-reference/{reference}/
   */
  async getBookingByReference(reference: string): Promise<Booking> {
    const response = await api.get<Booking>(`/bookings/bookings/by-reference/${reference}/`);
    return response.data;
  }

  /**
   * Get all user bookings
   * GET /api/v1/bookings/bookings/
   */
  async getUserBookings(): Promise<Booking[]> {
    const response = await api.get<Booking[]>('/bookings/bookings/');
    return response.data;
  }

  /**
   * Cancel a booking
   * POST /api/v1/bookings/bookings/{id}/cancel/
   */
  async cancelBooking(bookingId: number): Promise<{ message: string; success: boolean }> {
    const response = await api.post(`/bookings/bookings/${bookingId}/cancel/`);
    return response.data;
  }

  /**
   * Download ticket PDF
   * GET /api/v1/bookings/bookings/{id}/download-ticket/
   */
  async downloadTicket(bookingId: number): Promise<Blob> {
    const response = await api.get(`/bookings/bookings/${bookingId}/download-ticket/`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Calculate pricing breakdown from backend decimal strings
   * Handles backend Decimal fields returned as strings
   */
  calculatePricing(ticketPrice: string | number, numberOfSeats: number) {
    const pricePerSeat = parseDecimal(ticketPrice);
    const basePrice = pricePerSeat * numberOfSeats;
    const platformFeePercentage = 0.05; // 5% platform fee
    const platformFee = basePrice * platformFeePercentage;
    const total = basePrice + platformFee;

    return {
      basePrice: Math.round(basePrice), // Round to nearest FCFA
      platformFee: Math.round(platformFee),
      total: Math.round(total),
    };
  }

  /**
   * Validate passenger data before sending to backend
   */
  validatePassengerData(data: any): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!data.first_name?.trim()) {
      errors.first_name = 'Prénom requis';
    } else if (data.first_name.trim().length < 2) {
      errors.first_name = 'Le prénom doit contenir au moins 2 caractères';
    }

    if (!data.last_name?.trim()) {
      errors.last_name = 'Nom requis';
    } else if (data.last_name.trim().length < 2) {
      errors.last_name = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!data.email?.trim()) {
      errors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Email invalide';
    }

    if (!data.phone?.trim()) {
      errors.phone = 'Téléphone requis';
    } else if (!/^[\d\s\+\-\(\)]+$/.test(data.phone)) {
      errors.phone = 'Numéro invalide';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

export default new BookingService();