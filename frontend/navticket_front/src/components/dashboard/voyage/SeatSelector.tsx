import { useEffect, useState } from 'react';
import { useTripSeats } from '@/hooks/useVoyage';
import { Loader2, User } from 'lucide-react';
import type { TripSeat } from '@/types/voyage.types';

interface SeatSelectorProps {
  tripId: number;
  onSeatsSelected: (seatIds: number[]) => void;
  maxSeats?: number;
}

export const SeatSelector = ({ tripId, onSeatsSelected, maxSeats = 4 }: SeatSelectorProps) => {
  const { seats, isLoading, fetchSeats } = useTripSeats();
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  useEffect(() => {
    fetchSeats(tripId);
  }, [tripId]);

  const toggleSeat = (seat: TripSeat) => {
    if (!seat.is_available) return;

    setSelectedSeats(prev => {
      let newSelected: number[];
      
      if (prev.includes(seat.id)) {
        newSelected = prev.filter(id => id !== seat.id);
      } else {
        if (prev.length >= maxSeats) {
          return prev;
        }
        newSelected = [...prev, seat.id];
      }
      
      onSeatsSelected(newSelected);
      return newSelected;
    });
  };

  const getSeatButtonClass = (seat: TripSeat) => {
    const baseClass = 'w-14 h-14 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center';
    
    if (!seat.is_available) {
      return `${baseClass} bg-gray-200 text-gray-400 cursor-not-allowed`;
    }
    
    if (selectedSeats.includes(seat.id)) {
      return `${baseClass} bg-blue-600 text-white shadow-lg scale-105 hover:bg-blue-700`;
    }
    
    return `${baseClass} bg-white border-2 border-slate-300 text-slate-700 hover:border-blue-500 hover:shadow-md cursor-pointer`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!seats || seats.seats.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg">
        <p className="text-slate-600">Aucun siège disponible</p>
      </div>
    );
  }

  const groupedSeats = seats.seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<number, TripSeat[]>);

  const sortedRows = Object.keys(groupedSeats).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h3 className="font-semibold text-lg text-slate-900">Sélection des sièges</h3>
          <p className="text-sm text-slate-500">Cliquez sur un siège pour le sélectionner</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">Maximum {maxSeats} sièges</p>
          <p className="text-xl font-bold text-blue-600">
            {selectedSeats.length} / {maxSeats}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white border-2 border-slate-300 rounded-lg"></div>
          <span className="text-slate-600">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
          <span className="text-slate-600">Sélectionné</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <span className="text-slate-600">Occupé</span>
        </div>
      </div>

      {/* Bus Layout */}
      <div className="bg-gradient-to-b from-slate-50 to-white p-6 rounded-xl border-2 border-slate-200">
        {/* Driver indicator */}
        <div className="flex justify-end mb-4 pb-4 border-b-2 border-dashed border-slate-300">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <User className="w-4 h-4" />
            <span>Chauffeur</span>
          </div>
        </div>

        {/* Seats Grid */}
        <div className="space-y-4">
          {sortedRows.map(row => {
            const rowSeats = groupedSeats[row].sort((a, b) => 
              a.seat_number.localeCompare(b.seat_number)
            );
            
            return (
              <div key={row} className="flex items-center gap-3">
                <div className="w-10 text-sm font-medium text-slate-500">
                  R{row}
                </div>
                <div className="flex gap-2 flex-1 justify-center">
                  {rowSeats.map((seat, index) => (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeat(seat)}
                      disabled={!seat.is_available}
                      className={getSeatButtonClass(seat)}
                      title={seat.is_available ? `Siège ${seat.seat_number}` : 'Siège occupé'}
                    >
                      {seat.seat_number}
                      {selectedSeats.includes(seat.id) && (
                        <span className="ml-1">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">Sièges sélectionnés :</p>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map(seatId => {
              const seat = seats.seats.find(s => s.id === seatId);
              return seat ? (
                <span
                  key={seatId}
                  className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium"
                >
                  {seat.seat_number}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};