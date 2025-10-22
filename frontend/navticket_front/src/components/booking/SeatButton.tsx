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
    const base = 'w-10 h-11 sm:w-12 sm:h-13 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200 relative';
    
    switch (status) {
      case 'available':
        return `${base} bg-green-50 hover:bg-green-100 border-green-300 text-green-700 cursor-pointer hover:scale-105 active:scale-95`;
      case 'selected':
        return `${base} bg-blue-500 hover:bg-blue-600 border-blue-600 text-white cursor-pointer scale-105 shadow-lg`;
      case 'booked':
        return `${base} bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-60`;
      default:
        return base;
    }
  };

  // Seat icon SVG
  const SeatIcon = () => (
    <svg 
      className="w-5 h-5 sm:w-6 sm:h-6" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Seat backrest */}
      <rect x="6" y="4" width="12" height="8" rx="2" fill="currentColor" opacity="0.7"/>
      {/* Seat base */}
      <rect x="5" y="12" width="14" height="6" rx="2" fill="currentColor"/>
      {/* Armrests */}
      <rect x="4" y="12" width="2" height="8" rx="1" fill="currentColor" opacity="0.5"/>
      <rect x="18" y="12" width="2" height="8" rx="1" fill="currentColor" opacity="0.5"/>
    </svg>
  );

  
  const getSeatEmoji = () => {
    switch (status) {
      case 'available':
        return '💺';
      case 'selected':
        return '💺';
      case 'booked':
        return '🪑';
      default:
        return '💺';
    }
  };

  const getPositionIndicator = () => {
    if (position.includes('window')) {
      return (
        <span className="absolute -top-1 -right-1 text-[10px]" title="Fenêtre">
          🪟
        </span>
      );
    }
    return null;
  };

  return (
    <button
      onClick={onClick}
      disabled={status === 'booked'}
      className={getStatusStyles()}
      title={`Siège ${seatNumber} - ${status === 'available' ? 'Disponible' : status === 'selected' ? 'Sélectionné' : 'Occupé'}`}
      aria-label={`Seat ${seatNumber}`}
    >
      {/* Window indicator */}
      {getPositionIndicator()}
      
      {/* Seat icon */}
      <div className="flex flex-col items-center justify-center gap-0.5">
        <SeatIcon />
        {/* Seat number */}
        <span className="text-[8px] sm:text-[9px] font-bold leading-none">
          {seatNumber}
        </span>
      </div>
    </button>
  );
};