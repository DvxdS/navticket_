// Frontend/src/pages/PaymentCancelPage.tsx

import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

export const PaymentCancelPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingRef = searchParams.get('booking_ref');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-orange-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Paiement annulé
        </h1>
        <p className="text-gray-600 mb-6">
          Votre paiement a été annulé. Aucun montant n'a été débité.
        </p>

        {bookingRef && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Référence de réservation</p>
            <p className="text-lg font-semibold text-gray-900">{bookingRef}</p>
            <p className="text-sm text-gray-500 mt-2">
              Votre réservation est en attente de paiement
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            to="/bookings"
            className="w-full inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Mes réservations
          </Link>

          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};