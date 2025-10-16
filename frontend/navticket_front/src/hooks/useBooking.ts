import { useState, useCallback } from 'react';
import bookingService from '../services/bookingService';
import seatService from '../services/seatService';
import type { 
  Trip, 
  PassengerFormData, 
  PassengerCreateData,
  BookingState,
  CreateBookingRequest,
  parseDecimal
} from '../types/booking.types';
import { toast } from 'react-hot-toast';

interface UseBookingProps {
  trip: Trip;
  onSuccess?: (bookingReference: string) => void;
}

export const useBooking = ({ trip, onSuccess }: UseBookingProps) => {
  const [bookingState, setBookingState] = useState<BookingState>({
    trip,
    selectedSeats: [],
    passengerInfo: null,
    pricing: bookingService.calculatePricing(trip.price, 0),
    currentStep: 'seats',
    isProcessing: false,
  });

  // Update selected seats and recalculate pricing
  const updateSelectedSeats = useCallback((seats: string[]) => {
    setBookingState(prev => ({
      ...prev,
      selectedSeats: seats,
      pricing: bookingService.calculatePricing(trip.price, seats.length),
    }));
  }, [trip.price]);

  // Update passenger info
  const updatePassengerInfo = useCallback((info: PassengerFormData) => {
    setBookingState(prev => ({
      ...prev,
      passengerInfo: info,
    }));
  }, []);

  // Move to payment step
  const goToPayment = useCallback(async () => {
    if (bookingState.selectedSeats.length === 0) {
      toast.error('Veuillez sélectionner au moins un siège');
      return false;
    }

    if (!bookingState.passengerInfo) {
      toast.error('Veuillez remplir les informations du passager');
      return false;
    }

    // Validate passenger data
    const validation = bookingService.validatePassengerData(bookingState.passengerInfo);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return false;
    }

    // Reserve seats on backend
    try {
      setBookingState(prev => ({ ...prev, isProcessing: true }));

      await seatService.reserveSeats({
        trip_id: trip.id,
        seat_numbers: bookingState.selectedSeats,
      });

      setBookingState(prev => ({
        ...prev,
        currentStep: 'payment',
        isProcessing: false,
      }));

      toast.success('Sièges réservés! Procédez au paiement.');
      return true;
    } catch (error: any) {
      setBookingState(prev => ({ ...prev, isProcessing: false }));
      
      const errorMsg = error.response?.data?.error || 'Erreur lors de la réservation des sièges';
      toast.error(errorMsg);
      
      return false;
    }
  }, [bookingState.selectedSeats, bookingState.passengerInfo, trip.id]);

  // Go back to seat selection
  const goBackToSeats = useCallback(async () => {
    // Release reserved seats
    if (bookingState.selectedSeats.length > 0) {
      try {
        await seatService.releaseSeats(trip.id, bookingState.selectedSeats);
        toast.success('Sièges libérés');
      } catch (error) {
        console.error('Failed to release seats:', error);
      }
    }

    setBookingState(prev => ({
      ...prev,
      currentStep: 'seats',
    }));
  }, [bookingState.selectedSeats, trip.id]);

  // Process payment and create booking
  const processPayment = useCallback(async (paymentMethod: string) => {
    if (!bookingState.passengerInfo) {
      toast.error('Informations du passager manquantes');
      return;
    }

    setBookingState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Build passengers array - one passenger per seat with seat assignment
      const passengers: PassengerCreateData[] = bookingState.selectedSeats.map(seatNumber => ({
        first_name: bookingState.passengerInfo!.first_name.trim(),
        last_name: bookingState.passengerInfo!.last_name.trim(),
        email: bookingState.passengerInfo!.email.trim().toLowerCase(),
        phone: bookingState.passengerInfo!.phone.trim(),
        id_type: bookingState.passengerInfo!.id_type,
        id_number: bookingState.passengerInfo!.id_number?.trim(),
        seat_number: seatNumber,
      }));

      // Create booking request matching backend expectations
      const bookingRequest: CreateBookingRequest = {
        trip_id: trip.id,
        passengers,
        contact_email: bookingState.passengerInfo.email.trim().toLowerCase(),
        contact_phone: bookingState.passengerInfo.phone.trim(),
        payment_method: paymentMethod as any,
      };

      // Call backend API
      const response = await bookingService.createBooking(bookingRequest);

      toast.success('Réservation confirmée!');
      
      setBookingState(prev => ({ ...prev, isProcessing: false }));

      // Call success callback with booking reference
      onSuccess?.(response.booking_reference);

      return response;
    } catch (error: any) {
      setBookingState(prev => ({ ...prev, isProcessing: false }));
      
      // Handle backend validation errors
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for field-specific errors
        if (typeof errorData === 'object') {
          const firstError = Object.values(errorData)[0];
          const errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
          toast.error(errorMsg as string || 'Erreur lors de la création de la réservation');
        } else {
          toast.error(errorData.message || errorData.error || 'Erreur lors de la création de la réservation');
        }
      } else {
        toast.error('Erreur lors de la création de la réservation');
      }
      
      throw error;
    }
  }, [bookingState.passengerInfo, bookingState.selectedSeats, trip.id, onSuccess]);

  // Cancel booking process
  const cancelBooking = useCallback(async () => {
    // Release seats if any are selected
    if (bookingState.selectedSeats.length > 0) {
      try {
        await seatService.releaseSeats(trip.id, bookingState.selectedSeats);
      } catch (error) {
        console.error('Failed to release seats:', error);
      }
    }

    // Reset state
    setBookingState({
      trip,
      selectedSeats: [],
      passengerInfo: null,
      pricing: bookingService.calculatePricing(trip.price, 0),
      currentStep: 'seats',
      isProcessing: false,
    });
  }, [bookingState.selectedSeats, trip]);

  return {
    bookingState,
    updateSelectedSeats,
    updatePassengerInfo,
    goToPayment,
    goBackToSeats,
    processPayment,
    cancelBooking,
  };
};