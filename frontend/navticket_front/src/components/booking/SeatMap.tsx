import React from 'react';
import { SeatButton } from './SeatButton';
import { useSeatSelection } from '../../hooks/useSeatSelection';
import { type Seat } from '../../services/seatService';

interface SeatMapProps {
  tripId: number;
  maxSeats?: number;
  onSeatsSelected: (seatNumbers: string[]) => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  tripId,
  maxSeats = 1,
  onSeatsSelected
}) => {
  const {
    seatMap,
    selectedSeats,
    loading,
    error,
    toggleSeat,
    getSeatStatus
  } = useSeatSelection({
    tripId,
    maxSeats,
    onSeatsChange: onSeatsSelected
  });

  // Group seats by row
  const groupSeatsByRow = (seats: Seat[]) => {
    const rows: Record<number, Seat[]> = {};
    
    seats.forEach(seat => {
      if (!rows[seat.row]) {
        rows[seat.row] = [];
      }
      rows[seat.row].push(seat);
    });
    
    return rows;
  };

  // Sort seats within a row by position
  const sortSeatsByPosition = (seats: Seat[]) => {
    const positionOrder = [
      'left_window',
      'left_middle',
      'left_aisle',
      'right_aisle',
      'right_window'
    ];
    
    return seats.sort((a, b) => {
      return positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position);
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-3"></div>
        <p className="text-gray-600 text-sm">Chargement...</p>
      </div>
    );
  }

  if (error || !seatMap) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-4xl mb-3">⚠️</div>
        <p className="text-red-600 font-medium text-sm mb-1">Erreur de chargement</p>
        <p className="text-gray-600 text-xs">{error || 'Impossible de charger la carte'}</p>
      </div>
    );
  }

  const rows = groupSeatsByRow(seatMap.seats);
  const sortedRows = Object.keys(rows)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="w-full">
      {/* Header with stats - Compact */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-4">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-gray-800">{seatMap.total_seats}</p>
            <p className="text-[10px] text-gray-600">Total</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">{seatMap.available_seats}</p>
            <p className="text-[10px] text-gray-600">Disponibles</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-600">{selectedSeats.length}</p>
            <p className="text-[10px] text-gray-600">Sélectionnés</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-600">{seatMap.booked_seats}</p>
            <p className="text-[10px] text-gray-600">Occupés</p>
          </div>
        </div>
      </div>

      {/* Selection info - Compact */}
      {selectedSeats.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4">
          <p className="text-xs text-blue-800">
            <span className="font-semibold">{selectedSeats.length}</span> / {maxSeats} siège(s)
            <span className="ml-2 text-blue-600 font-medium">
              [{selectedSeats.join(', ')}]
            </span>
          </p>
        </div>
      )}

      {/* Legend - Compact */}
      <div className="flex items-center justify-center gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 bg-green-50 border-2 border-green-300 rounded"></div>
          <span className="text-gray-700">Libre</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 bg-blue-500 border-2 border-blue-600 rounded"></div>
          <span className="text-gray-700">Choisi</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 bg-gray-200 border-2 border-gray-300 rounded"></div>
          <span className="text-gray-700">Occupé</span>
        </div>
      </div>

      {/* BUS SHAPE CONTAINER - Compact & Responsive */}
      <div className="relative mx-auto max-w-[380px]">
        {/* Bus Front (rounded top) - Compact */}
        <div className="relative">
          <div className="bg-gradient-to-b from-blue-600 to-blue-700 rounded-t-[60px] h-16 border-t-4 border-l-4 border-r-4 border-blue-800 shadow-xl relative overflow-hidden">
            {/* Windshield effect */}
            <div className="absolute inset-x-0 top-4 h-8 bg-gradient-to-b from-blue-300/30 to-transparent"></div>
            
            {/* Headlights */}
            <div className="absolute bottom-2 left-6 w-4 h-4 bg-yellow-300 rounded-full shadow-md"></div>
            <div className="absolute bottom-2 right-6 w-4 h-4 bg-yellow-300 rounded-full shadow-md"></div>
            
            {/* Driver section - Compact */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-md">
              <span className="text-lg">🚌</span>
              <span className="text-white text-[10px] font-semibold">Chauffeur</span>
            </div>
          </div>
        </div>

        {/* Bus Body - Compact */}
        <div className="bg-gradient-to-b from-gray-100 to-gray-50 border-l-4 border-r-4 border-blue-800 shadow-xl relative">
          {/* Side windows effect */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-blue-400/20 to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-blue-400/20 to-transparent"></div>
          
          {/* Seats Grid - Compact */}
          <div className="py-4 px-3 space-y-2">
            {sortedRows.map(rowNum => {
              const rowSeats = sortSeatsByPosition(rows[rowNum]);
              const leftSeats = rowSeats.filter(s => s.position.startsWith('left'));
              const rightSeats = rowSeats.filter(s => s.position.startsWith('right'));

              return (
                <div key={rowNum} className="flex items-center justify-center gap-2">
                  {/* Row number (left) - Compact */}
                  <div className="w-6 text-center flex-shrink-0">
                    <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                      {rowNum}
                    </span>
                  </div>

                  {/* Left side seats */}
                  <div className="flex gap-1.5">
                    {leftSeats.map(seat => (
                      <SeatButton
                        key={seat.seat_number}
                        seatNumber={seat.seat_number}
                        status={getSeatStatus(seat)}
                        position={seat.position}
                        onClick={() => toggleSeat(seat.seat_number, seat.is_available)}
                      />
                    ))}
                  </div>

                  {/* Aisle (corridor) - Compact */}
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <div className="w-full border-t border-b border-dashed border-gray-300 h-6 flex items-center justify-center">
                      <span className="text-gray-300 text-lg">⬍</span>
                    </div>
                  </div>

                  {/* Right side seats */}
                  <div className="flex gap-1.5">
                    {rightSeats.map(seat => (
                      <SeatButton
                        key={seat.seat_number}
                        seatNumber={seat.seat_number}
                        status={getSeatStatus(seat)}
                        position={seat.position}
                        onClick={() => toggleSeat(seat.seat_number, seat.is_available)}
                      />
                    ))}
                  </div>

                  {/* Row number (right) - Compact */}
                  <div className="w-6 text-center flex-shrink-0">
                    <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                      {rowNum}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bus Back (rounded bottom) - Compact */}
        <div className="bg-gradient-to-t from-blue-600 to-blue-700 rounded-b-[40px] h-12 border-b-4 border-l-4 border-r-4 border-blue-800 shadow-xl relative">
          {/* Back lights */}
          <div className="absolute top-2 left-6 w-6 h-3 bg-red-500 rounded shadow-md"></div>
          <div className="absolute top-2 right-6 w-6 h-3 bg-red-500 rounded shadow-md"></div>
          
          {/* License plate area */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-0.5 rounded shadow-sm">
            <span className="text-gray-800 text-[10px] font-mono font-bold">CI-{tripId.toString().padStart(4, '0')}</span>
          </div>
        </div>

        {/* Wheels - Smaller */}
        <div className="absolute -left-3 top-1/4 w-8 h-8 bg-gray-800 rounded-full border-2 border-gray-600 shadow-lg">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          </div>
        </div>
        <div className="absolute -right-3 top-1/4 w-8 h-8 bg-gray-800 rounded-full border-2 border-gray-600 shadow-lg">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          </div>
        </div>
        <div className="absolute -left-3 bottom-16 w-8 h-8 bg-gray-800 rounded-full border-2 border-gray-600 shadow-lg">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          </div>
        </div>
        <div className="absolute -right-3 bottom-16 w-8 h-8 bg-gray-800 rounded-full border-2 border-gray-600 shadow-lg">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Footer note - Compact */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-md">
          <span className="text-sm">🪟</span>
          <span className="text-xs text-gray-700">Siège fenêtre</span>
        </div>
      </div>
    </div>
  );
};