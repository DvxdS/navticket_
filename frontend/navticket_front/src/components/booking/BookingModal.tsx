import React, { useState, useEffect } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { SeatMap } from './SeatMap';
import { PassengerInfoForm } from './PassengerInfoForm';
import { BookingSummary } from './BookingSummary';
import { PaymentSection } from './PaymentSection';
import { BookingConfirmation } from './BookingConfirmation';
import { useBooking } from '../../hooks/useBooking';
import type { Trip } from '../../types/booking.types';

interface BookingModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  maxPassengers?: number;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  trip,
  isOpen,
  onClose,
  maxPassengers = 1,
}) => {
  const [bookingReference, setBookingReference] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    bookingState,
    updateSelectedSeats,
    updatePassengerInfo,
    goToPayment,
    goBackToSeats,
    processPayment,
    cancelBooking,
  } = useBooking({
    trip,
    onSuccess: (reference) => {
      setBookingReference(reference);
      setShowConfirmation(true);
    },
  });

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle modal close
  const handleClose = async () => {
    if (showConfirmation) {
      // Just close if showing confirmation
      setShowConfirmation(false);
      onClose();
    } else {
      // Cancel booking and release seats
      await cancelBooking();
      onClose();
    }
  };

  // Handle continue to payment
  const handleContinueToPayment = async () => {
    const success = await goToPayment();
    if (!success) {
      // Error already shown by toast in useBooking
      return;
    }
  };

  // Handle payment submission
  const handlePaymentSubmit = async (paymentMethod: string) => {
    await processPayment(paymentMethod);
  };

  if (!isOpen) return null;

  // Show confirmation screen
  if (showConfirmation) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={handleClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Réservation confirmée</h2>
              <p className="text-green-100 text-sm">Votre voyage est confirmé!</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Confirmation Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(95vh-100px)]">
            <BookingConfirmation
              bookingReference={bookingReference}
              email={bookingState.passengerInfo?.email || ''}
              selectedSeats={bookingState.selectedSeats}
              onClose={handleClose}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] h-[98vh] overflow-hidden flex flex-col animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Compact */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold mb-0.5 truncate">Réservation de ticket</h2>
            <p className="text-blue-100 text-xs sm:text-sm truncate">
              {trip.route.origin} → {trip.route.destination}
            </p>
            <p className="text-blue-200 text-[10px] sm:text-xs mt-0.5 truncate">
              {trip.company?.name} • {trip.departure_date} à {trip.departure_time}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition flex-shrink-0 ml-2"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Progress Indicator - Compact */}
        <div className="bg-gray-50 px-4 sm:px-6 py-3 border-b flex-shrink-0">
          <div className="flex items-center justify-center max-w-md mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition ${
                  bookingState.currentStep === 'seats'
                    ? 'bg-blue-600 text-white'
                    : 'bg-green-500 text-white'
                }`}
              >
                {bookingState.currentStep === 'payment' ? '✓' : '1'}
              </div>
              <span
                className={`text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium ${
                  bookingState.currentStep === 'seats'
                    ? 'text-blue-600'
                    : 'text-green-600'
                }`}
              >
                Sièges & Info
              </span>
            </div>

            {/* Connector */}
            <div
              className={`flex-1 h-1 mx-2 sm:mx-4 rounded transition ${
                bookingState.currentStep === 'payment'
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            ></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition ${
                  bookingState.currentStep === 'payment'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                2
              </div>
              <span
                className={`text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium ${
                  bookingState.currentStep === 'payment'
                    ? 'text-blue-600'
                    : 'text-gray-500'
                }`}
              >
                Paiement
              </span>
            </div>
          </div>
        </div>

        {/* Content Area - No scroll, flex layout */}
        <div className="flex-1 min-h-0">
          {bookingState.currentStep === 'seats' ? (
            <div className="h-full p-3 sm:p-4 lg:p-6">
              <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Left Side - Seat Map */}
                <div className="flex flex-col min-h-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 flex-shrink-0">
                    Sélectionnez vos sièges
                  </h3>
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <SeatMap
                      tripId={trip.id}
                      maxSeats={maxPassengers}
                      onSeatsSelected={updateSelectedSeats}
                    />
                  </div>
                </div>

                {/* Right Side - Passenger Form */}
                <div className="flex flex-col min-h-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 flex-shrink-0">
                    Informations du voyageur
                  </h3>
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <PassengerInfoForm
                      selectedSeats={bookingState.selectedSeats}
                      onDataChange={updatePassengerInfo}
                      initialData={bookingState.passengerInfo}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full p-3 sm:p-4 lg:p-6 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-6xl mx-auto">
                {/* Booking Summary - Left Side */}
                <div>
                  <BookingSummary
                    trip={trip}
                    selectedSeats={bookingState.selectedSeats}
                    pricing={bookingState.pricing}
                    passengerName={
                      bookingState.passengerInfo
                        ? `${bookingState.passengerInfo.first_name} ${bookingState.passengerInfo.last_name}`
                        : undefined
                    }
                  />
                </div>

                {/* Payment Section - Right Side */}
                <div>
                  <PaymentSection
                    onPaymentSubmit={handlePaymentSubmit}
                    isProcessing={bookingState.isProcessing}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Compact */}
        <div className="bg-gray-50 px-3 sm:px-4 lg:px-6 py-3 border-t flex items-center justify-between gap-3 flex-shrink-0">
          <div className="min-w-0 flex-1">
            {bookingState.selectedSeats.length > 0 && (
              <div className="text-xs sm:text-sm">
                <p className="text-gray-600 truncate">
                  Sièges:{' '}
                  <span className="font-semibold text-gray-800">
                    {bookingState.selectedSeats.join(', ')}
                  </span>
                </p>
                <p className="text-base sm:text-lg font-bold text-blue-600 mt-0.5">
                  Total: {bookingState.pricing.total.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {bookingState.currentStep === 'payment' && (
              <button
                onClick={goBackToSeats}
                disabled={bookingState.isProcessing}
                className="px-3 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition flex items-center gap-1 sm:gap-2 font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Retour</span>
              </button>
            )}

            {bookingState.currentStep === 'seats' && (
              <button
                onClick={handleContinueToPayment}
                disabled={
                  bookingState.selectedSeats.length === 0 ||
                  !bookingState.passengerInfo ||
                  bookingState.isProcessing
                }
                className={`
                  px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition text-white text-sm sm:text-base whitespace-nowrap
                  ${
                    bookingState.selectedSeats.length === 0 ||
                    !bookingState.passengerInfo ||
                    bookingState.isProcessing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                  }
                `}
              >
                <span className="hidden sm:inline">Continuer au paiement →</span>
                <span className="sm:hidden">Payer →</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};