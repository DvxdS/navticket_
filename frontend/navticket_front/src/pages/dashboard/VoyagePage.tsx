import { useState } from 'react';
import { useVoyage } from '@/hooks/useVoyage';
import { Loader2 } from 'lucide-react';
import { TripCard } from '@/components/dashboard/voyage/TripCard';
import { DateSelector } from '@/components/dashboard/voyage/DateSelector';
import { QuickBookingModal } from '@/components/dashboard/voyage/QuickBookingModal';
import { TicketDisplayModal } from '@/components/dashboard/voyage/TicketDisplayModal';
import type { VoyageTrip } from '@/types/voyage.types';

export const VoyagePage = () => {
  const { trips, isLoading, selectedDate, setSelectedDate, refetch } = useVoyage();
  const [selectedTrip, setSelectedTrip] = useState<VoyageTrip | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  const handleBookClick = (tripId: number) => {
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      setSelectedTrip(trip);
      setIsBookingModalOpen(true);
    }
  };

  const handleBookingSuccess = (data: any) => {
    setBookingResult(data);
    setIsBookingModalOpen(false);
    setIsTicketModalOpen(true);
    refetch();
  };

  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false);
    setBookingResult(null);
    setSelectedTrip(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-73px)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Voyage</h1>
          <p className="text-sm text-slate-500 mt-1">
            Créez des réservations pour les clients en station
          </p>
        </div>
        
        <DateSelector
          selectedDate={selectedDate}
          onChange={setSelectedDate}
        />
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <p className="text-slate-600">Aucun trajet pour cette date</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onBookClick={handleBookClick}
            />
          ))}
        </div>
      )}

      <QuickBookingModal
        trip={selectedTrip}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={handleBookingSuccess}
      />

      <TicketDisplayModal
        isOpen={isTicketModalOpen}
        onClose={handleCloseTicketModal}
        bookingData={bookingResult}
      />
    </div>
  );
};