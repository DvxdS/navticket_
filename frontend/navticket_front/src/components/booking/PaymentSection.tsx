import React, { useState } from 'react';
import { CreditCard, Smartphone, Wallet, Loader2, CheckCircle } from 'lucide-react';

interface PaymentSectionProps {
  onPaymentSubmit: (paymentMethod: string) => Promise<void>;
  isProcessing: boolean;
}

type PaymentMethod = 'stripe' | 'orange_money' | 'mtn_money' | 'wave';

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  onPaymentSubmit,
  isProcessing
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('orange_money');

  const paymentOptions: PaymentOption[] = [
    {
      id: 'orange_money',
      name: 'Orange Money',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Paiement mobile rapide et sécurisé',
      badge: 'Populaire'
    },
    {
      id: 'mtn_money',
      name: 'MTN Mobile Money',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Paiement via MTN Money',
    },
    {
      id: 'wave',
      name: 'Wave',
      icon: <Wallet className="w-6 h-6" />,
      description: 'Paiement instantané avec Wave',
    },
    {
      id: 'stripe',
      name: 'Carte Bancaire',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Visa, Mastercard, American Express',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onPaymentSubmit(selectedMethod);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Choisissez votre mode de paiement
        </h3>
        <p className="text-gray-600">
          Sélectionnez la méthode qui vous convient
        </p>
      </div>

      {/* Payment Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setSelectedMethod(option.id)}
            disabled={isProcessing}
            className={`
              relative p-5 rounded-xl border-2 transition-all duration-200
              ${selectedMethod === option.id
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Badge */}
            {option.badge && (
              <span className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                {option.badge}
              </span>
            )}

            {/* Icon & Content */}
            <div className="flex items-start gap-4">
              <div className={`
                p-3 rounded-lg transition-colors
                ${selectedMethod === option.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
                }
              `}>
                {option.icon}
              </div>

              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  {option.name}
                  {selectedMethod === option.id && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </h4>
                <p className="text-sm text-gray-600">
                  {option.description}
                </p>
              </div>
            </div>

            {/* Selected Indicator */}
            {selectedMethod === option.id && (
              <div className="absolute inset-0 rounded-xl ring-2 ring-blue-500 pointer-events-none"></div>
            )}
          </button>
        ))}
      </div>

      {/* Payment Instructions Based on Selection */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h4 className="font-semibold text-gray-800 mb-3">
          Comment ça marche?
        </h4>
        
        {selectedMethod === 'orange_money' && (
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="font-semibold text-orange-600">1.</span>
              Cliquez sur "Payer maintenant"
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-orange-600">2.</span>
              Vous recevrez un message USSD sur votre téléphone
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-orange-600">3.</span>
              Composez #144# et suivez les instructions
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-orange-600">4.</span>
              Confirmez le paiement avec votre code PIN
            </li>
          </ol>
        )}

        {selectedMethod === 'mtn_money' && (
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="font-semibold text-yellow-600">1.</span>
              Cliquez sur "Payer maintenant"
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-yellow-600">2.</span>
              Vous recevrez une notification push
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-yellow-600">3.</span>
              Ouvrez l'app MTN MoMo et validez
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-yellow-600">4.</span>
              Confirmez avec votre code secret
            </li>
          </ol>
        )}

        {selectedMethod === 'wave' && (
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600">1.</span>
              Cliquez sur "Payer maintenant"
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600">2.</span>
              Scannez le QR code avec Wave
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600">3.</span>
              Confirmez le montant dans l'application
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600">4.</span>
              Validez avec votre code PIN
            </li>
          </ol>
        )}

        {selectedMethod === 'stripe' && (
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="font-semibold text-purple-600">1.</span>
              Cliquez sur "Payer maintenant"
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-purple-600">2.</span>
              Vous serez redirigé vers la page de paiement sécurisée
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-purple-600">3.</span>
              Entrez les informations de votre carte
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-purple-600">4.</span>
              Validez le paiement
            </li>
          </ol>
        )}
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg p-3">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span>Paiement 100% sécurisé et crypté</span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing}
        className={`
          w-full flex items-center justify-center gap-3
          py-4 px-6 rounded-xl font-bold text-lg text-white
          transition-all duration-200
          ${isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl active:scale-95'
          }
        `}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <CreditCard className="w-6 h-6" />
            Payer maintenant
          </>
        )}
      </button>

      {/* Terms */}
      <p className="text-xs text-center text-gray-500">
        En cliquant sur "Payer maintenant", vous acceptez nos{' '}
        <button type="button" className="text-blue-600 hover:underline">
          conditions générales
        </button>
      </p>
    </form>
  );
};