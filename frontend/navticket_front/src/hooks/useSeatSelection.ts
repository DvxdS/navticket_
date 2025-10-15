import { useState, useEffect, useCallback, useRef } from 'react';
import seatService, { type Seat, type SeatMap } from '../services/seatService';
import { toast } from 'react-hot-toast'; // or your toast library

interface UseSeatSelectionProps {
  tripId: number;
  maxSeats?: number;
  onSeatsChange?: (seats: string[]) => void;
}

export const useSeatSelection = ({
  tripId,
  maxSeats = 1,
  onSeatsChange
}: UseSeatSelectionProps) => {
  const [seatMap, setSeatMap] = useState<SeatMap | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservationExpiry, setReservationExpiry] = useState<Date | null>(null);
  
  const reservationTimerRef = useRef<number | null>(null);

  // Fetch seat map
  const fetchSeatMap = useCallback(async () => {
    try {
      setLoading(true);
      const data = await seatService.getSeatMap(tripId);
      setSeatMap(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load seats');
      toast.error('Failed to load seat map');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  // Initial load
  useEffect(() => {
    fetchSeatMap();
  }, [fetchSeatMap]);

  // Notify parent of seat changes
  useEffect(() => {
    onSeatsChange?.(selectedSeats);
  }, [selectedSeats, onSeatsChange]);

  // Handle seat selection/deselection
  const toggleSeat = useCallback((seatNumber: string, isAvailable: boolean) => {
    if (!isAvailable) {
      toast.error('Ce siège n\'est pas disponible');
      return;
    }

    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        // Deselect
        return prev.filter(s => s !== seatNumber);
      } else {
        // Check max limit
        if (prev.length >= maxSeats) {
          toast.error(`Vous ne pouvez sélectionner que ${maxSeats} siège(s)`);
          return prev;
        }
        // Select
        return [...prev, seatNumber];
      }
    });
  }, [maxSeats]);

  // Reserve selected seats on backend
  const reserveSeats = useCallback(async () => {
    if (selectedSeats.length === 0) {
      toast.error('Veuillez sélectionner au moins un siège');
      return false;
    }

    try {
      const response = await seatService.reserveSeats({
        trip_id: tripId,
        seat_numbers: selectedSeats
      });

      setReservationExpiry(new Date(response.reserved_until));
      toast.success('Sièges réservés avec succès!');
      
      // Refresh seat map to show updated availability
      await fetchSeatMap();
      
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to reserve seats';
      toast.error(errorMsg);
      
      // If seats became unavailable, refresh map and clear selection
      if (err.response?.data?.unavailable_seats) {
        await fetchSeatMap();
        setSelectedSeats([]);
      }
      
      return false;
    }
  }, [tripId, selectedSeats, fetchSeatMap]);

  // Release reserved seats
  const releaseSeats = useCallback(async () => {
    if (selectedSeats.length === 0) return;

    try {
      await seatService.releaseSeats(tripId, selectedSeats);
      setSelectedSeats([]);
      setReservationExpiry(null);
      await fetchSeatMap();
    } catch (err) {
      console.error('Failed to release seats:', err);
    }
  }, [tripId, selectedSeats, fetchSeatMap]);

  // Auto-release on unmount
  useEffect(() => {
    return () => {
      if (selectedSeats.length > 0) {
        seatService.releaseSeats(tripId, selectedSeats).catch(console.error);
      }
      if (reservationTimerRef.current) {
        clearTimeout(reservationTimerRef.current);
      }
    };
  }, [tripId, selectedSeats]);

  // Get seat status
  const getSeatStatus = useCallback((seat: Seat): 'available' | 'selected' | 'booked' => {
    if (selectedSeats.includes(seat.seat_number)) return 'selected';
    if (!seat.is_available) return 'booked';
    return 'available';
  }, [selectedSeats]);

  return {
    seatMap,
    selectedSeats,
    loading,
    error,
    reservationExpiry,
    toggleSeat,
    reserveSeats,
    releaseSeats,
    getSeatStatus,
    refreshSeatMap: fetchSeatMap
  };
};