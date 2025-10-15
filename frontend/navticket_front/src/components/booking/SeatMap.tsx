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
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Chargement de la carte des sièges...</p>
      </div>
    );
  }

  if (error || !seatMap) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <p className="text-red-600 font-medium mb-2">Erreur de chargement</p>
        <p className="text-gray-600 text-sm">{error || 'Impossible de charger la carte des sièges'}</p>
      </div>
    );
  }

  const rows = groupSeatsByRow(seatMap.seats);
  const sortedRows = Object.keys(rows)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-800">{seatMap.total_seats}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{seatMap.available_seats}</p>
            <p className="text-xs text-gray-600">Disponibles</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{selectedSeats.length}</p>
            <p className="text-xs text-gray-600">Sélectionnés</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600">{seatMap.booked_seats}</p>
            <p className="text-xs text-gray-600">Occupés</p>
          </div>
        </div>
      </div>

      {/* Selection info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">{selectedSeats.length}</span> / {maxSeats} siège(s) sélectionné(s)
          {selectedSeats.length > 0 && (
            <span className="ml-2 text-blue-600 font-medium">
              [{selectedSeats.join(', ')}]
            </span>
          )}
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-50 border-2 border-green-300 rounded"></div>
          <span className="text-gray-700">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 border-2 border-blue-600 rounded shadow-lg"></div>
          <span className="text-gray-700">Sélectionné</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 border-2 border-gray-300 rounded"></div>
          <span className="text-gray-700">Occupé</span>
        </div>
      </div>

      {/* BUS SHAPE CONTAINER */}
      <div className="relative mx-auto" style={{ maxWidth: '500px' }}>
        {/* Bus Front (rounded top) */}
        <div className="relative">
          <div className="bg-gradient-to-b from-blue-600 to-blue-700 rounded-t-[80px] h-24 border-t-8 border-l-8 border-r-8 border-blue-800 shadow-2xl relative overflow-hidden">
            {/* Windshield effect */}
            <div className="absolute inset-x-0 top-8 h-12 bg-gradient-to-b from-blue-300/30 to-transparent"></div>
            
            {/* Headlights */}
            <div className="absolute bottom-4 left-8 w-6 h-6 bg-yellow-300 rounded-full shadow-lg"></div>
            <div className="absolute bottom-4 right-8 w-6 h-6 bg-yellow-300 rounded-full shadow-lg"></div>
            
            {/* Driver section */}
            <div className="absolute bottom-4 right-1/2 transform translate-x-1/2 flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg">
              <span className="text-2xl">🚌</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm">
                  👨‍✈️
                </div>
                <span className="text-white text-xs font-semibold">Chauffeur</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bus Body */}
        <div className="bg-gradient-to-b from-gray-100 to-gray-50 border-l-8 border-r-8 border-blue-800 shadow-2xl relative">
          {/* Side windows effect */}
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-blue-400/20 to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-blue-400/20 to-transparent"></div>
          
          {/* Seats Grid */}
          <div className="py-8 px-6 space-y-3">
            {sortedRows.map(rowNum => {
              const rowSeats = sortSeatsByPosition(rows[rowNum]);
              const leftSeats = rowSeats.filter(s => s.position.startsWith('left'));
              const rightSeats = rowSeats.filter(s => s.position.startsWith('right'));

              return (
                <div key={rowNum} className="flex items-center justify-center gap-3">
                  {/* Row number (left) */}
                  <div className="w-8 text-center">
                    <span className="inline-block w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                      {rowNum}
                    </span>
                  </div>

                  {/* Left side seats */}
                  <div className="flex gap-2">
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

                  {/* Aisle (corridor) */}
                  <div className="w-16 h-14 flex flex-col items-center justify-center">
                    <div className="w-full border-t-2 border-b-2 border-dashed border-gray-300 h-8 flex items-center justify-center">
                      <span className="text-gray-300 text-2xl">⬍⬍</span>
                    </div>
                  </div>

                  {/* Right side seats */}
                  <div className="flex gap-2">
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
                  <div className="w-8 text-center">
                    <span className="inline-block w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                      {rowNum}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bus Back (rounded bottom) */}
        <div className="bg-gradient-to-t from-blue-600 to-blue-700 rounded-b-[60px] h-20 border-b-8 border-l-8 border-r-8 border-blue-800 shadow-2xl relative">
          {/* Back lights */}
          <div className="absolute top-4 left-8 w-8 h-4 bg-red-500 rounded shadow-lg"></div>
          <div className="absolute top-4 right-8 w-8 h-4 bg-red-500 rounded shadow-lg"></div>
          
          {/* License plate area */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded shadow-md">
            <span className="text-gray-800 text-xs font-mono font-bold">CI - {tripId.toString().padStart(4, '0')}</span>
          </div>
          
          {/* Exhaust */}
          <div className="absolute bottom-2 right-12 w-3 h-3 bg-gray-600 rounded-full"></div>
        </div>

        {/* Wheels */}
        <div className="absolute -left-4 top-1/4 w-12 h-12 bg-gray-800 rounded-full border-4 border-gray-600 shadow-xl">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
          </div>
        </div>
        <div className="absolute -right-4 top-1/4 w-12 h-12 bg-gray-800 rounded-full border-4 border-gray-600 shadow-xl">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
          </div>
        </div>
        <div className="absolute -left-4 bottom-24 w-12 h-12 bg-gray-800 rounded-full border-4 border-gray-600 shadow-xl">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
          </div>
        </div>
        <div className="absolute -right-4 bottom-24 w-12 h-12 bg-gray-800 rounded-full border-4 border-gray-600 shadow-xl">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
          <span className="text-xl">🪟</span>
          <span className="text-sm text-gray-700">Siège près de la fenêtre</span>
        </div>
      </div>
    </div>
  );
};