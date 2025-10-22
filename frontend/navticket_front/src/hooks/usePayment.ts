// Frontend/src/hooks/usePayment.ts

import { useState } from 'react';
import paymentApi, { type InitializePaymentRequest } from '../services/paymentApi';
import { toast } from 'react-hot-toast';

interface UsePaymentReturn {
  isProcessing: boolean;
  initiatePayment: (bookingReference: string) => Promise<void>;
  verifyPayment: (bookingReference: string) => Promise<boolean>;
}

export const usePayment = (): UsePaymentReturn => {
  const [isProcessing, setIsProcessing] = useState(false);

  const initiatePayment = async (bookingReference: string): Promise<void> => {
    setIsProcessing(true);

    try {
      const baseUrl = window.location.origin;
      
      const payload: InitializePaymentRequest = {
        booking_reference: bookingReference,
        payment_method: 'stripe_card',
        success_url: paymentApi.buildSuccessUrl(baseUrl, bookingReference),
        cancel_url: paymentApi.buildCancelUrl(baseUrl, bookingReference),
      };

      const response = await paymentApi.initializePayment(payload);

      if (response.success && response.data.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        throw new Error(response.message || 'Payment initialization failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'initialisation du paiement');
      setIsProcessing(false);
      throw error;
    }
  };

  const verifyPayment = async (bookingReference: string): Promise<boolean> => {
    setIsProcessing(true);

    try {
      const response = await paymentApi.verifyPayment({
        booking_reference: bookingReference,
      });

      setIsProcessing(false);

      if (response.success) {
        toast.success('Paiement confirmé avec succès!');
        return true;
      } else {
        toast.error(response.message || 'Le paiement n\'a pas été confirmé');
        return false;
      }
    } catch (error: any) {
      setIsProcessing(false);
      toast.error(error.message || 'Erreur lors de la vérification du paiement');
      return false;
    }
  };

  return {
    isProcessing,
    initiatePayment,
    verifyPayment,
  };
};