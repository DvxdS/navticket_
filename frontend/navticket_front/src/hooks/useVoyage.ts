import { useState, useEffect } from 'react';
import voyageService from '../services/voyage';
import { toast } from 'react-hot-toast';
import type {
  VoyageTrip,
  TripSeatsResponse,
  CreateBookingData,
  BookingResponse,
} from '../types/voyage.types';

export const useVoyage = (initialDate?: string) => {
  const [trips, setTrips] = useState<VoyageTrip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    initialDate || new Date().toISOString().split('T')[0]
  );

  const fetchTrips = async (date?: string) => {
    setIsLoading(true);
    try {
      const data = await voyageService.getTripsByDate(date || selectedDate);
      setTrips(data);
    } catch (err) {
      toast.error('Erreur lors du chargement des trajets');
      setTrips([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [selectedDate]);

  return {
    trips,
    isLoading,
    selectedDate,
    setSelectedDate,
    refetch: fetchTrips,
  };
};

export const useTripSeats = () => {
  const [seats, setSeats] = useState<TripSeatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSeats = async (tripId: number) => {
    setIsLoading(true);
    try {
      const data = await voyageService.getTripSeats(tripId);
      setSeats(data);
    } catch (err) {
      toast.error('Erreur lors du chargement des sièges');
      setSeats(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    seats,
    isLoading,
    fetchSeats,
    clearSeats: () => setSeats(null),
  };
};

export const useCreateBooking = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);

  const createBooking = async (data: CreateBookingData) => {
    setIsCreating(true);
    try {
      const result = await voyageService.createOfflineBooking(data);
      setBookingResult(result);
      toast.success('Réservation créée avec succès!');
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la création';
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createBooking,
    isCreating,
    bookingResult,
    clearResult: () => setBookingResult(null),
  };
};