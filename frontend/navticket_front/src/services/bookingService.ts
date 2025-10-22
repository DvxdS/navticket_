// Frontend/src/services/bookingService.ts

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
   * POST /api/v1/bookings/create/
   */
  async createBooking(data: CreateBookingRequest): Promise<BookingResponse> {
    const response = await api.post('/bookings/create/', data);
    
    // Backend returns: { success: true, message: "...", data: {...} }
    if (response.data.success) {
      return {
        id: response.data?.id,
        booking_reference: response.data.data.booking_reference,
        booking: response.data.data,
        message: response.data.message,
      };
    }
    
    throw new Error(response.data.message || 'Booking creation failed');
  }

  /**
   * Get booking by reference
   * GET /api/v1/bookings/<booking_reference>/
   */
  async getBookingByReference(reference: string): Promise<Booking> {
    const response = await api.get(`/bookings/${reference}/`);
    return response.data;
  }

  /**
   * Get user's bookings
   * GET /api/v1/bookings/
   */
  async getUserBookings(): Promise<Booking[]> {
    const response = await api.get('/bookings/');
    return response.data;
  }

  /**
   * Cancel a booking
   * POST /api/v1/bookings/<booking_reference>/cancel/
   */
  async cancelBooking(bookingReference: string, reason?: string): Promise<any> {
    const response = await api.post(`/bookings/${bookingReference}/cancel/`, {
      reason: reason || ''
    });
    return response.data;
  }

  /**
   * Get booking stats
   * GET /api/v1/bookings/stats/
   */
  async getBookingStats(): Promise<any> {
    const response = await api.get('/bookings/stats/');
    return response.data;
  }

  /**
   * Download ticket PDF
   * GET /api/v1/bookings/<booking_reference>/ticket/download/
   */
  async downloadTicket(bookingReference: string): Promise<Blob> {
    const response = await api.get(`/bookings/${bookingReference}/ticket/download/`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Get QR code
   * GET /api/v1/bookings/<booking_reference>/qr-code/
   */
  async getQRCode(bookingReference: string): Promise<any> {
    const response = await api.get(`/bookings/${bookingReference}/qr-code/`);
    return response.data;
  }

  /**
   * Resend ticket email
   * POST /api/v1/bookings/<booking_reference>/ticket/resend/
   */
  async resendTicket(bookingReference: string): Promise<any> {
    const response = await api.post(`/bookings/${bookingReference}/ticket/resend/`);
    return response.data;
  }

  /**
   * Calculate pricing breakdown
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