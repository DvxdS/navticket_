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
import { ArrowLeft } from 'lucide-react';
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {step === 'seats' ? 'Sélection des sièges' : 'Informations du passager'}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {trip.route.full_name} • Départ: {trip.departure_time} • Prix: {trip.price} FCFA
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {step === 'seats' && (
            <>
              <SeatSelector
                tripId={trip.id}
                onSeatsSelected={handleSeatsSelected}
                maxSeats={4}
              />
              
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleContinueToPassenger}
                  disabled={selectedSeatIds.length === 0}
                  size="lg"
                  className="px-8"
                >
                  Continuer avec {selectedSeatIds.length} siège{selectedSeatIds.length > 1 ? 's' : ''}
                </Button>
              </div>
            </>
          )}

          {step === 'passenger' && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('seats')}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux sièges
              </Button>
              
              <PassengerForm
                onSubmit={handlePassengerSubmit}
                isLoading={isCreating}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};