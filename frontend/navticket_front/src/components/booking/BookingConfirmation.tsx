import React from 'react';
import { CheckCircle, Download, Mail, Calendar, Printer } from 'lucide-react';

interface BookingConfirmationProps {
  bookingReference: string;
  email: string;
  selectedSeats: string[];
  onDownloadTicket?: () => void;
  onClose?: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  bookingReference,
  email,
  selectedSeats,
  onDownloadTicket,
  onClose
}) => {
  return (
    <div className="max-w-2xl mx-auto text-center py-8 px-4">
      {/* Success Icon with Animation */}
      <div className="mb-6 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-green-100 rounded-full animate-ping opacity-20"></div>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
            <CheckCircle className="w-20 h-20 text-white" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Success Message */}
      <h2 className="text-3xl font-bold text-gray-900 mb-3">
        Réservation confirmée !
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Votre billet a été réservé avec succès
      </p>

      {/* Booking Reference Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 mb-6">
        <p className="text-sm text-gray-600 mb-2">Référence de réservation</p>
        <p className="text-3xl font-bold text-blue-600 tracking-wider mb-4 font-mono">
          {bookingReference}
        </p>
        
        <div className="pt-4 border-t border-blue-200">
          <p className="text-sm text-gray-700 mb-2">
            Sièges réservés:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {selectedSeats.map(seat => (
              <span
                key={seat}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-bold rounded-lg"
              >
                {seat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Email Confirmation Notice */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-5 mb-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-semibold text-gray-800 mb-1">
              Confirmation envoyée par email
            </h4>
            <p className="text-sm text-gray-600">
              Un email de confirmation avec votre e-ticket a été envoyé à:
            </p>
            <p className="text-sm font-semibold text-blue-600 mt-1">
              {email}
            </p>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 text-left">
          Si vous ne recevez pas l'email dans quelques minutes, vérifiez votre dossier spam.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {onDownloadTicket && (
          <button
            onClick={onDownloadTicket}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
          >
            <Download className="w-5 h-5" />
            Télécharger
          </button>
        )}
        
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition shadow-md hover:shadow-lg"
        >
          <Printer className="w-5 h-5" />
          Imprimer
        </button>
        
        <button
          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-md hover:shadow-lg"
        >
          <Calendar className="w-5 h-5" />
          Calendrier
        </button>
      </div>

      {/* Important Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6 text-left">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">⚠️</span>
          Informations importantes
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="text-yellow-600 font-bold">•</span>
            Présentez-vous à la gare au moins 30 minutes avant le départ
          </li>
          <li className="flex gap-2">
            <span className="text-yellow-600 font-bold">•</span>
            Munissez-vous d'une pièce d'identité valide
          </li>
          <li className="flex gap-2">
            <span className="text-yellow-600 font-bold">•</span>
            Votre billet peut être sur papier ou sur votre téléphone
          </li>
          <li className="flex gap-2">
            <span className="text-yellow-600 font-bold">•</span>
            Le QR code sera scanné lors de l'embarquement
          </li>
        </ul>
      </div>

      {/* Close/Continue Button */}
      <button
        onClick={onClose}
        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl"
      >
        Terminer
      </button>

      {/* Support Link */}
      <p className="text-sm text-gray-500 mt-6">
        Besoin d'aide?{' '}
        <button className="text-blue-600 hover:underline font-semibold">
          Contactez le support
        </button>
      </p>
    </div>
  );
};