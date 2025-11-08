import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PassengerForm } from './PassengerForm';
import { SeatSelector } from './SeatSelector';
import { useCreateBooking } from '@/hooks/useVoyage';
import type { VoyageTrip, PassengerData } from '@/types/voyage.types';

interface QuickBookingModalProps {
  trip: VoyageTrip | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingData: any) => void;
}

export const QuickBookingModal = ({ trip, isOpen, onClose, onSuccess }: QuickBookingModalProps) => {
  const [step, setStep] = useState<'seats' | 'passenger'>('seats');
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const { createBooking, isCreating } = useCreateBooking();

  const handleSeatsSelected = (seatIds: number[]) => {
    setSelectedSeatIds(seatIds);
  };

  const handleContinueToPassenger = () => {
    if (selectedSeatIds.length === 0) {
      return;
    }
    setStep('passenger');
  };

  const handlePassengerSubmit = async (passengerData: PassengerData) => {
    if (!trip) return;

    try {
      const result = await createBooking({
        trip_id: trip.id,
        seat_ids: selectedSeatIds,
        passenger: passengerData,
      });
      
      onSuccess(result.data);
      handleClose();
    } catch (err) {
      console.error('Booking error:', err);
    }
  };

  const handleClose = () => {
    setStep('seats');
    setSelectedSeatIds([]);
    onClose();
  };

  if (!trip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une réservation</DialogTitle>
          <DialogDescription>
            {trip.route.full_name} • {trip.departure_time}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'seats' && (
            <>
              <SeatSelector
                tripId={trip.id}
                onSeatsSelected={handleSeatsSelected}
              />
              <Button
                onClick={handleContinueToPassenger}
                disabled={selectedSeatIds.length === 0}
                className="w-full"
              >
                Continuer ({selectedSeatIds.length} siège{selectedSeatIds.length > 1 ? 's' : ''})
              </Button>
            </>
          )}

          {step === 'passenger' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('seats')}
                >
                  ← Retour aux sièges
                </Button>
              </div>
              <PassengerForm
                onSubmit={handlePassengerSubmit}
                isLoading={isCreating}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};