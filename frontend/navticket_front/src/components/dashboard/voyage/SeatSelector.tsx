import { useState } from 'react';
import { useTripSeats } from '@/hooks/useVoyage';
import { Loader2 } from 'lucide-react';
import type { TripSeat } from '@/types/voyage.types';

interface SeatSelectorProps {
  tripId: number;
  onSeatsSelected: (seatIds: number[]) => void;
  maxSeats?: number;
}

export const SeatSelector = ({ tripId, onSeatsSelected, maxSeats = 4 }: SeatSelectorProps) => {
  const { seats, isLoading, fetchSeats } = useTripSeats();
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  useState(() => {
    fetchSeats(tripId);
  });

  const toggleSeat = (seatId: number) => {
    setSelectedSeats(prev => {
      let newSelected: number[];
      
      if (prev.includes(seatId)) {
        newSelected = prev.filter(id => id !== seatId);
      } else {
        if (prev.length >= maxSeats) {
          return prev;
        }
        newSelected = [...prev, seatId];
      }
      
      onSeatsSelected(newSelected);
      return newSelected;
    });
  };

  const getSeatStyle = (seat: TripSeat) => {
    if (!seat.is_available) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }
    if (selectedSeats.includes(seat.id)) {
      return 'bg-blue-600 text-white hover:bg-blue-700';
    }
    return 'bg-white border-2 border-slate-300 hover:border-blue-500 text-slate-700';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!seats) {
    return <div className="text-center py-8 text-slate-500">Aucun siège disponible</div>;
  }

  const groupedSeats = seats.seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<number, TripSeat[]>);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-slate-600">
          Sélectionnez jusqu'à {maxSeats} sièges
        </div>
        <div className="text-sm font-medium text-blue-600">
          {selectedSeats.length} / {maxSeats} sélectionnés
        </div>
      </div>

      <div className="flex justify-center gap-8 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white border-2 border-slate-300 rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded"></div>
          <span>Sélectionné</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <span>Occupé</span>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-lg max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {Object.keys(groupedSeats).map(row => (
            <div key={row} className="flex items-center gap-2">
              <div className="w-8 text-xs text-slate-500 font-medium">
                R{row}
              </div>
              <div className="flex gap-2 flex-wrap">
                {groupedSeats[parseInt(row)].map(seat => (
                  <button
                    key={seat.id}
                    onClick={() => seat.is_available && toggleSeat(seat.id)}
                    disabled={!seat.is_available}
                    className={`w-12 h-12 rounded-lg font-medium text-sm transition-all ${getSeatStyle(seat)}`}
                  >
                    {seat.seat_number}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-slate-500 text-center">
        Configuration: {seats.seat_layout} • {seats.total_seats} sièges au total
      </div>
    </div>
  );
};