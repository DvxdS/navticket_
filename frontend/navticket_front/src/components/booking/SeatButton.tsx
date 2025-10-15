import React from 'react';

interface SeatButtonProps {
  seatNumber: string;
  status: 'available' | 'selected' | 'booked';
  position: string;
  onClick: () => void;
}

export const SeatButton: React.FC<SeatButtonProps> = ({
  seatNumber,
  status,
  position,
  onClick
}) => {
  const getStatusStyles = () => {
    const base = 'w-14 h-14 rounded-lg border-2 flex items-center justify-center text-xs font-semibold transition-all duration-200 relative';
    
    switch (status) {
      case 'available':
        return `${base} bg-green-50 hover:bg-green-100 border-green-300 text-green-700 cursor-pointer hover:scale-105`;
      case 'selected':
        return `${base} bg-blue-500 hover:bg-blue-600 border-blue-600 text-white cursor-pointer scale-105 shadow-lg`;
      case 'booked':
        return `${base} bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-60`;
      default:
        return base;
    }
  };

  const getPositionIcon = () => {
    if (position.includes('window')) return '🪟';
    return '';
  };

  return (
    <button
      onClick={onClick}
      disabled={status === 'booked'}
      className={getStatusStyles()}
      title={`Siège ${seatNumber} - ${status === 'available' ? 'Disponible' : status === 'selected' ? 'Sélectionné' : 'Occupé'}`}
      aria-label={`Seat ${seatNumber}`}
    >
      {position.includes('window') && (
        <span className="absolute top-1 left-1 text-xs opacity-50">
          {getPositionIcon()}
        </span>
      )}
      <span className="font-bold">{seatNumber}</span>
    </button>
  );
};