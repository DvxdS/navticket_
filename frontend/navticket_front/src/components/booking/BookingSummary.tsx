import React from 'react';
import { MapPin, Calendar, Clock, Bus, Users, CreditCard } from 'lucide-react';
import type { Trip, PricingBreakdown } from '../../types/booking.types';

interface BookingSummaryProps {
  trip: Trip;
  selectedSeats: string[];
  pricing: PricingBreakdown;
  passengerName?: string;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  trip,
  selectedSeats,
  pricing,
  passengerName
}) => {
  return (
    <div className="space-y-6">
      {/* Trip Information Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Bus className="w-5 h-5 text-blue-600" />
          Détails du voyage
        </h3>

        {/* Route */}
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">Trajet</p>
            <p className="font-semibold text-gray-900">
            {trip.route.origin_city?.name || 'Origine'} → {trip.route.destination_city?.name || 'Destination'}
            </p>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(trip.departure_date).toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Horaire</p>
              <p className="font-semibold text-gray-900">
                {trip.departure_time} - {trip.arrival_time}
              </p>
            </div>
          </div>
        </div>

        {/* Company & Bus */}
        <div className="flex items-center justify-between pt-4 border-t border-blue-200">
          <div>
            <p className="text-sm text-gray-600">Compagnie</p>
            <p className="font-semibold text-gray-900"> { trip.company_name || 'Compagnie de transport'}</p>
          </div>
          {trip.bus_number && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Bus</p>
              <p className="font-semibold text-gray-900">{trip.bus_number}</p>
            </div>
          )}
        </div>
      </div>

      {/* Passenger & Seats Card */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          Passager & Sièges
        </h3>

        {passengerName && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">Nom du passager</p>
            <p className="font-semibold text-gray-900">{passengerName}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-600 mb-2">Sièges sélectionnés</p>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map(seat => (
              <span
                key={seat}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg text-sm"
              >
                {seat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Breakdown Card */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-gray-600" />
          Détails du paiement
        </h3>

        <div className="space-y-3">
          {/* Base Price */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              Prix du billet × {selectedSeats.length}
            </span>
            <span className="font-semibold text-gray-900">
              {pricing.basePrice.toLocaleString('fr-FR')} FCFA
            </span>
          </div>

          {/* Platform Fee */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">
              Frais de service (5%)
            </span>
            <span className="text-gray-700">
              {pricing.platformFee.toLocaleString('fr-FR')} FCFA
            </span>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-gray-200 my-3"></div>

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">
              Total à payer
            </span>
            <span className="text-2xl font-bold text-blue-600">
              {pricing.total.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <span className="font-semibold">Important:</span> Présentez-vous à la gare au moins 30 minutes avant le départ avec une pièce d'identité valide.
        </p>
      </div>
    </div>
  );
};