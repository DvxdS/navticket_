// Frontend/src/hooks/useBooking.ts

import { useState, useCallback } from 'react';
import bookingService from '../services/bookingService';
import seatService from '../services/seatService';
import { usePayment } from './usePayment';
import type { 
  Trip, 
  PassengerFormData, 
  PassengerCreateData,
  BookingState,
  CreateBookingRequest,
} from '../types/booking.types';
import { toast } from 'react-hot-toast';

interface UseBookingProps {
  trip: Trip;
  onSuccess?: (bookingReference: string) => void;
}

export const useBooking = ({ trip, onSuccess }: UseBookingProps) => {
  const { initiatePayment } = usePayment();
  
  const [bookingState, setBookingState] = useState<BookingState>({
    trip,
    selectedSeats: [],
    passengerInfo: null,
    pricing: bookingService.calculatePricing(trip.price, 0),
    currentStep: 'seats',
    isProcessing: false,
  });

  const updateSelectedSeats = useCallback((seats: string[]) => {
    setBookingState(prev => ({
      ...prev,
      selectedSeats: seats,
      pricing: bookingService.calculatePricing(trip.price, seats.length),
    }));
  }, [trip.price]);

  const updatePassengerInfo = useCallback((info: PassengerFormData) => {
    setBookingState(prev => ({
      ...prev,
      passengerInfo: info,
    }));
  }, []);

  const goToPayment = useCallback(async () => {
    if (bookingState.selectedSeats.length === 0) {
      toast.error('Veuillez sélectionner au moins un siège');
      return false;
    }

    if (!bookingState.passengerInfo) {
      toast.error('Veuillez remplir les informations du passager');
      return false;
    }

    const validation = bookingService.validatePassengerData(bookingState.passengerInfo);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return false;
    }

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

  const goBackToSeats = useCallback(async () => {
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

  const processPayment = useCallback(async () => {
    if (!bookingState.passengerInfo) {
      toast.error('Informations du passager manquantes');
      return;
    }

    setBookingState(prev => ({ ...prev, isProcessing: true }));

    try {
      const passengers: PassengerCreateData[] = bookingState.selectedSeats.map(seatNumber => ({
        first_name: bookingState.passengerInfo!.first_name.trim(),
        last_name: bookingState.passengerInfo!.last_name.trim(),
        email: bookingState.passengerInfo!.email.trim().toLowerCase(),
        phone: bookingState.passengerInfo!.phone.trim(),
        id_type: bookingState.passengerInfo!.id_type,
        id_number: bookingState.passengerInfo!.id_number?.trim(),
        seat_number: seatNumber,
      }));

      const bookingRequest: CreateBookingRequest = {
        trip_id: trip.id,
        passengers,
        contact_email: bookingState.passengerInfo.email.trim().toLowerCase(),
        contact_phone: bookingState.passengerInfo.phone.trim(),
      };

      const response = await bookingService.createBooking(bookingRequest);
      const bookingReference = response.booking_reference;

      toast.success('Réservation créée! Redirection vers le paiement...');

      await initiatePayment(bookingReference);

      onSuccess?.(bookingReference);

      return response;
    } catch (error: any) {
      setBookingState(prev => ({ ...prev, isProcessing: false }));
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
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
  }, [bookingState.passengerInfo, bookingState.selectedSeats, trip.id, initiatePayment, onSuccess]);

  const cancelBooking = useCallback(async () => {
    if (bookingState.selectedSeats.length > 0) {
      try {
        await seatService.releaseSeats(trip.id, bookingState.selectedSeats);
      } catch (error) {
        console.error('Failed to release seats:', error);
      }
    }

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