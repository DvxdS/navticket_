// Frontend/src/services/paymentApi.ts

import api from './api';

/**
 * ============================================
 * PAYMENT API TYPES
 * ============================================
 */

/**
 * Payment initialization request payload
 */
export interface InitializePaymentRequest {
  /** Booking reference code (e.g., "NVT-20251022-ABC123") */
  booking_reference: string;
  /** Payment method to use */
  payment_method: 'stripe_card' | 'wave' | 'orange_money' | 'mtn_money';
  /** URL to redirect after successful payment */
  success_url: string;
  /** URL to redirect if payment is cancelled */
  cancel_url: string;
}

/**
 * Payment initialization response from backend
 */
export interface InitializePaymentResponse {
  success: boolean;
  message: string;
  data: {
    /** Internal payment record ID */
    payment_id: number;
    /** Stripe checkout URL to redirect user */
    payment_url: string;
    /** Total amount in string format (e.g., "5000.00") */
    amount: string;
    /** Currency code (e.g., "XOF") */
    currency: string;
  };
}

/**
 * Payment verification request payload
 */
export interface VerifyPaymentRequest {
  /** Booking reference to verify payment for */
  booking_reference: string;
}

/**
 * Payment verification response from backend
 */
export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data: {
    booking_reference: string;
    /** Payment status: 'pending' | 'completed' | 'failed' */
    payment_status: string;
    /** Booking status: 'pending' | 'confirmed' | 'cancelled' */
    booking_status: string;
  };
}

/**
 * Payment statistics response
 */
export interface PaymentStatsResponse {
  success: boolean;
  data: {
    total_payments: number;
    completed: number;
    pending: number;
    failed: number;
    total_spent: number;
  };
}

/**
 * Payment record details
 */
export interface Payment {
  id: number;
  booking_reference: string;
  trip_info: {
    origin: string;
    destination: string;
    departure_date: string;
    departure_time: string;
  };
  payment_method: 'stripe_card' | 'wave' | 'orange_money' | 'mtn_money';
  amount: string;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  payment_url?: string;
  transaction_id?: string;
  created_at: string;
  completed_at?: string;
}

/**
 * ============================================
 * PAYMENT API SERVICE
 * ============================================
 */

class PaymentApiService {
  /**
   * Initialize payment session
   * 
   * Creates a Stripe checkout session for the booking and returns
   * the checkout URL to redirect the user to.
   * 
   * @param data - Payment initialization payload
   * @returns Promise with payment URL and details
   * @throws Error if payment initialization fails
   * 
   * @example
   * ```typescript
   * const result = await paymentApi.initializePayment({
   *   booking_reference: "NVT-20251022-ABC123",
   *   payment_method: "stripe_card",
   *   success_url: "https://app.com/payment/success",
   *   cancel_url: "https://app.com/payment/cancel"
   * });
   * 
   * // Redirect user to Stripe
   * window.location.href = result.data.payment_url;
   * ```
   */
  async initializePayment(
    data: InitializePaymentRequest
  ): Promise<InitializePaymentResponse> {
    try {
      const response = await api.post<InitializePaymentResponse>(
        '/payments/initialize/',
        data
      );

      // Validate response structure
      if (!response.data.success) {
        throw new Error(response.data.message || 'Payment initialization failed');
      }

      if (!response.data.data?.payment_url) {
        throw new Error('Invalid payment response: missing payment URL');
      }

      return response.data;
    } catch (error: any) {
      // Handle API errors
      if (error.response?.data) {
        const errorData = error.response.data;
        throw new Error(errorData.message || errorData.error || 'Payment initialization failed');
      }

      // Re-throw original error if not from API
      throw error;
    }
  }

  /**
   * Verify payment status
   * 
   * Called after user returns from Stripe to verify that the payment
   * was completed successfully. This triggers the backend to:
   * - Check payment status with Stripe
   * - Update booking status to 'confirmed'
   * - Generate QR code
   * - Send confirmation email with e-ticket
   * 
   * @param data - Payment verification payload
   * @returns Promise with verification result
   * @throws Error if verification fails
   * 
   * @example
   * ```typescript
   * const result = await paymentApi.verifyPayment({
   *   booking_reference: "NVT-20251022-ABC123"
   * });
   * 
   * if (result.success) {
   *   console.log("Payment confirmed!");
   *   console.log("Booking status:", result.data.booking_status);
   * }
   * ```
   */
  async verifyPayment(
    data: VerifyPaymentRequest
  ): Promise<VerifyPaymentResponse> {
    try {
      const response = await api.post<VerifyPaymentResponse>(
        '/payments/verify/',
        data
      );

      return response.data;
    } catch (error: any) {
      // Handle API errors
      if (error.response?.data) {
        const errorData = error.response.data;
        throw new Error(errorData.message || errorData.error || 'Payment verification failed');
      }

      // Re-throw original error if not from API
      throw error;
    }
  }

  /**
   * Get user's payment statistics
   * 
   * Retrieves aggregated payment data for the authenticated user.
   * 
   * @returns Promise with payment statistics
   * @throws Error if request fails
   * 
   * @example
   * ```typescript
   * const stats = await paymentApi.getPaymentStats();
   * console.log(`Total spent: ${stats.data.total_spent} FCFA`);
   * console.log(`Completed payments: ${stats.data.completed}`);
   * ```
   */
  async getPaymentStats(): Promise<PaymentStatsResponse> {
    try {
      const response = await api.get<PaymentStatsResponse>('/payments/stats/');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data;
        throw new Error(errorData.message || errorData.error || 'Failed to fetch payment stats');
      }
      throw error;
    }
  }

  /**
   * Get list of user's payments
   * 
   * Retrieves all payment records for the authenticated user.
   * 
   * @returns Promise with array of payment records
   * @throws Error if request fails
   * 
   * @example
   * ```typescript
   * const payments = await paymentApi.getUserPayments();
   * payments.forEach(payment => {
   *   console.log(`${payment.booking_reference}: ${payment.status}`);
   * });
   * ```
   */
  async getUserPayments(): Promise<Payment[]> {
    try {
      const response = await api.get<Payment[]>('/payments/');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data;
        throw new Error(errorData.message || errorData.error || 'Failed to fetch payments');
      }
      throw error;
    }
  }

  /**
   * Get specific payment details
   * 
   * Retrieves detailed information about a single payment.
   * 
   * @param paymentId - Internal payment record ID
   * @returns Promise with payment details
   * @throws Error if payment not found or request fails
   * 
   * @example
   * ```typescript
   * const payment = await paymentApi.getPaymentDetails(123);
   * console.log(`Status: ${payment.status}`);
   * console.log(`Amount: ${payment.amount} ${payment.currency}`);
   * ```
   */
  async getPaymentDetails(paymentId: number): Promise<Payment> {
    try {
      const response = await api.get<Payment>(`/payments/${paymentId}/`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data;
        throw new Error(errorData.message || errorData.error || 'Failed to fetch payment details');
      }
      throw error;
    }
  }

  /**
   * Build success URL with booking reference
   * 
   * Helper method to construct the success redirect URL with booking reference
   * as a query parameter.
   * 
   * @param baseUrl - Base URL of your application
   * @param bookingReference - Booking reference code
   * @returns Complete success URL
   * 
   * @example
   * ```typescript
   * const successUrl = paymentApi.buildSuccessUrl(
   *   window.location.origin,
   *   "NVT-20251022-ABC123"
   * );
   * // Returns: "https://yourdomain.com/payment/success?booking_ref=NVT-20251022-ABC123"
   * ```
   */
  buildSuccessUrl(baseUrl: string, bookingReference: string): string {
    return `${baseUrl}/payment/success?booking_ref=${encodeURIComponent(bookingReference)}`;
  }

  /**
   * Build cancel URL with booking reference
   * 
   * Helper method to construct the cancel redirect URL with booking reference
   * as a query parameter.
   * 
   * @param baseUrl - Base URL of your application
   * @param bookingReference - Booking reference code
   * @returns Complete cancel URL
   * 
   * @example
   * ```typescript
   * const cancelUrl = paymentApi.buildCancelUrl(
   *   window.location.origin,
   *   "NVT-20251022-ABC123"
   * );
   * // Returns: "https://yourdomain.com/payment/cancel?booking_ref=NVT-20251022-ABC123"
   * ```
   */
  buildCancelUrl(baseUrl: string, bookingReference: string): string {
    return `${baseUrl}/payment/cancel?booking_ref=${encodeURIComponent(bookingReference)}`;
  }
}

// Export singleton instance
export const paymentApi = new PaymentApiService();

// Export as default for backward compatibility
export default paymentApi;