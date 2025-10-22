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
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600 mb-2"></div>
        <p className="text-gray-600 text-xs">Chargement...</p>
      </div>
    );
  }

  if (error || !seatMap) {
    return (
      <div className="text-center py-6">
        <div className="text-red-500 text-3xl mb-2">⚠️</div>
        <p className="text-red-600 font-medium text-xs mb-1">Erreur de chargement</p>
        <p className="text-gray-600 text-[10px]">{error || 'Impossible de charger'}</p>
      </div>
    );
  }

  const rows = groupSeatsByRow(seatMap.seats);
  const sortedRows = Object.keys(rows)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="w-full">
      {/* Header with stats - Ultra Compact */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 mb-3">
        <div className="grid grid-cols-4 gap-1 text-center">
          <div>
            <p className="text-sm sm:text-base font-bold text-gray-800">{seatMap.total_seats}</p>
            <p className="text-[8px] sm:text-[10px] text-gray-600">Total</p>
          </div>
          <div>
            <p className="text-sm sm:text-base font-bold text-green-600">{seatMap.available_seats}</p>
            <p className="text-[8px] sm:text-[10px] text-gray-600">Libres</p>
          </div>
          <div>
            <p className="text-sm sm:text-base font-bold text-blue-600">{selectedSeats.length}</p>
            <p className="text-[8px] sm:text-[10px] text-gray-600">Choisis</p>
          </div>
          <div>
            <p className="text-sm sm:text-base font-bold text-gray-600">{seatMap.booked_seats}</p>
            <p className="text-[8px] sm:text-[10px] text-gray-600">Occupés</p>
          </div>
        </div>
      </div>

      {/* Selection info - Only show if seats selected */}
      {selectedSeats.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
          <p className="text-[10px] sm:text-xs text-blue-800">
            <span className="font-semibold">{selectedSeats.length}</span>/{maxSeats}
            <span className="ml-1 text-blue-600 font-medium">
              [{selectedSeats.join(', ')}]
            </span>
          </p>
        </div>
      )}

      {/* Legend - Ultra Compact */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 text-[10px] sm:text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-50 border-2 border-green-300 rounded"></div>
          <span className="text-gray-700">Libre</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-500 border-2 border-blue-600 rounded"></div>
          <span className="text-gray-700">Choisi</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-200 border-2 border-gray-300 rounded"></div>
          <span className="text-gray-700">Occupé</span>
        </div>
      </div>

      {/* BUS CONTAINER - Scalable wrapper for mobile */}
      <div className="relative mx-auto" style={{ maxWidth: '320px' }}>
        {/* Scale wrapper for very small screens */}
        <div className="scale-90 sm:scale-100 origin-top">
          {/* Bus Front - Ultra Compact */}
          <div className="relative">
            <div className="bg-gradient-to-b from-blue-600 to-blue-700 rounded-t-[50px] h-12 border-t-4 border-l-4 border-r-4 border-blue-800 shadow-lg relative overflow-hidden">
              {/* Windshield */}
              <div className="absolute inset-x-0 top-3 h-6 bg-gradient-to-b from-blue-300/30 to-transparent"></div>
              
              {/* Headlights */}
              <div className="absolute bottom-1.5 left-4 w-3 h-3 bg-yellow-300 rounded-full shadow-sm"></div>
              <div className="absolute bottom-1.5 right-4 w-3 h-3 bg-yellow-300 rounded-full shadow-sm"></div>
              
              {/* Driver - Ultra Compact */}
              <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-gray-800/80 px-2 py-0.5 rounded">
                <span className="text-sm">🚌</span>
                <span className="text-white text-[8px] font-semibold">Chauffeur</span>
              </div>
            </div>
          </div>

          {/* Bus Body - Ultra Compact */}
          <div className="bg-gradient-to-b from-gray-100 to-gray-50 border-l-4 border-r-4 border-blue-800 shadow-lg relative">
            {/* Side windows */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-blue-400/20 to-transparent"></div>
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-blue-400/20 to-transparent"></div>
            
            {/* Seats Grid - Ultra Compact */}
            <div className="py-3 px-2 space-y-1.5">
              {sortedRows.map(rowNum => {
                const rowSeats = sortSeatsByPosition(rows[rowNum]);
                const leftSeats = rowSeats.filter(s => s.position.startsWith('left'));
                const rightSeats = rowSeats.filter(s => s.position.startsWith('right'));

                return (
                  <div key={rowNum} className="flex items-center justify-center gap-1.5">
                    {/* Row number (left) */}
                    <div className="w-5 text-center flex-shrink-0">
                      <span className="inline-block w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[8px] font-bold flex items-center justify-center">
                        {rowNum}
                      </span>
                    </div>

                    {/* Left side seats */}
                    <div className="flex gap-1">
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

                    {/* Aisle - Ultra Compact */}
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <div className="w-full border-t border-b border-dashed border-gray-300 h-4 flex items-center justify-center">
                        <span className="text-gray-300 text-sm">⬍</span>
                      </div>
                    </div>

                    {/* Right side seats */}
                    <div className="flex gap-1">
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

                    {/* Row number (right) */}
                    <div className="w-5 text-center flex-shrink-0">
                      <span className="inline-block w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[8px] font-bold flex items-center justify-center">
                        {rowNum}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bus Back - Ultra Compact */}
          <div className="bg-gradient-to-t from-blue-600 to-blue-700 rounded-b-[35px] h-10 border-b-4 border-l-4 border-r-4 border-blue-800 shadow-lg relative">
            {/* Back lights */}
            <div className="absolute top-1.5 left-4 w-5 h-2 bg-red-500 rounded shadow-sm"></div>
            <div className="absolute top-1.5 right-4 w-5 h-2 bg-red-500 rounded shadow-sm"></div>
            
            {/* License plate */}
            <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 bg-white px-2 py-0.5 rounded shadow-sm">
              <span className="text-gray-800 text-[8px] font-mono font-bold">CI-{tripId.toString().padStart(4, '0')}</span>
            </div>
          </div>

          {/* Wheels - Smaller */}
          <div className="absolute -left-2 top-1/4 w-6 h-6 bg-gray-800 rounded-full border-2 border-gray-600 shadow-md">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          </div>
          <div className="absolute -right-2 top-1/4 w-6 h-6 bg-gray-800 rounded-full border-2 border-gray-600 shadow-md">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          </div>
          <div className="absolute -left-2 bottom-12 w-6 h-6 bg-gray-800 rounded-full border-2 border-gray-600 shadow-md">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          </div>
          <div className="absolute -right-2 bottom-12 w-6 h-6 bg-gray-800 rounded-full border-2 border-gray-600 shadow-md">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer note - Compact */}
      <div className="mt-3 text-center">
        <div className="inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
          <span className="text-xs">🪟</span>
          <span className="text-[10px] text-gray-700">Fenêtre</span>
        </div>
      </div>
    </div>
  );
};