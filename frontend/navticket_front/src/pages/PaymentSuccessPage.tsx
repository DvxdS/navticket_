// Frontend/src/pages/PaymentSuccessPage.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { usePayment } from '../hooks/usePayment';

export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPayment, isProcessing } = usePayment();
  const [isVerified, setIsVerified] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const hasVerified = useRef(false);

  const bookingRef = searchParams.get('booking_ref');

  useEffect(() => {
    if (!bookingRef) {
      navigate('/');
      return;
    }

    if (hasVerified.current) {
      return;
    }

    hasVerified.current = true;

    const verify = async () => {
      try {
        const success = await verifyPayment(bookingRef);
        setIsVerified(success);
        setVerificationAttempted(true);
      } catch (error) {
        setIsVerified(false);
        setVerificationAttempted(true);
      }
    };

    verify();
  }, []);

  if (!bookingRef) {
    return null;
  }

  if (!verificationAttempted || isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Vérification du paiement...
          </h2>
          <p className="text-gray-600">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Échec de la vérification
          </h1>
          <p className="text-gray-600 mb-6">
            Le paiement n'a pas pu être vérifié. Veuillez contacter le support.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Paiement réussi!
        </h1>
        <p className="text-gray-600 mb-6">
          Votre réservation a été confirmée
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Référence de réservation</p>
          <p className="text-xl font-bold text-blue-600">{bookingRef}</p>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-sm text-gray-600">
            Votre e-ticket a été envoyé par email. Vérifiez votre boîte de réception.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/bookings"
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Voir mes réservations
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