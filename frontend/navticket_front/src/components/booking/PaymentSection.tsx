import React, { useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';

interface PaymentSectionProps {
  onPaymentSubmit: (paymentMethod: string) => Promise<void>;
  isProcessing: boolean;
}

type PaymentMethod = 'stripe' | 'orange_money' | 'mtn_money' | 'wave';

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  logo: string;
  description: string;
  badge?: string;
  color: string; // Brand color for selected state
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
      logo: '/assets/orange money.png',
      description: 'Paiement mobile rapide et sécurisé',
      
      color: 'orange'
    },
    {
      id: 'mtn_money',
      name: 'MTN Mobile Money',
      logo: '/assets/mtn.jpg',
      description: 'Paiement via MTN Money',
      color: 'yellow'
    },
    {
      id: 'wave',
      name: 'Wave',
      logo: '/assets/wave.png',
      description: 'Paiement instantané avec Wave',
      color: 'blue',
      badge: 'Populaire',
    },
    {
      id: 'stripe',
      name: 'Carte Bancaire',
      logo: '/assets/card.png',
      description: 'Visa, Mastercard, American Express',
      color: 'purple'
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onPaymentSubmit(selectedMethod);
  };

  const getBorderColor = (color: string, isSelected: boolean) => {
    if (!isSelected) return 'border-gray-200';
    
    const colors: Record<string, string> = {
      orange: 'border-orange-500',
      yellow: 'border-yellow-500',
      blue: 'border-blue-500',
      purple: 'border-purple-500',
    };
    return colors[color] || 'border-blue-500';
  };

  const getBgColor = (color: string, isSelected: boolean) => {
    if (!isSelected) return 'bg-white';
    
    const colors: Record<string, string> = {
      orange: 'bg-orange-50',
      yellow: 'bg-yellow-50',
      blue: 'bg-blue-50',
      purple: 'bg-purple-50',
    };
    return colors[color] || 'bg-blue-50';
  };

  const getRingColor = (color: string) => {
    const colors: Record<string, string> = {
      orange: 'ring-orange-500',
      yellow: 'ring-yellow-500',
      blue: 'ring-blue-500',
      purple: 'ring-purple-500',
    };
    return colors[color] || 'ring-blue-500';
  };

  const getCheckColor = (color: string) => {
    const colors: Record<string, string> = {
      orange: 'text-orange-600',
      yellow: 'text-yellow-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
    };
    return colors[color] || 'text-blue-600';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Choisissez votre mode de paiement
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          Sélectionnez la méthode qui vous convient
        </p>
      </div>

      {/* Payment Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {paymentOptions.map((option) => {
          const isSelected = selectedMethod === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedMethod(option.id)}
              disabled={isProcessing}
              className={`
                relative p-4 sm:p-5 rounded-xl border-2 transition-all duration-200
                ${getBorderColor(option.color, isSelected)}
                ${getBgColor(option.color, isSelected)}
                ${isSelected ? 'shadow-lg scale-105' : 'hover:border-gray-300 hover:shadow-md'}
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Badge */}
              {option.badge && (
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-[10px] sm:text-xs font-semibold rounded-full">
                  {option.badge}
                </span>
              )}

              {/* Logo & Content */}
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Logo Container */}
                <div className={`
                  flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center overflow-hidden
                  ${isSelected ? 'bg-white' : 'bg-gray-50'}
                  transition-colors
                `}>
                  <img 
                    src={option.logo} 
                    alt={option.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"%3E%3Crect x="3" y="6" width="18" height="12" rx="2" /%3E%3Cpath d="M3 10h18" /%3E%3C/svg%3E';
                    }}
                  />
                </div>

                {/* Text Content */}
                <div className="flex-1 text-left min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-800 mb-0.5 sm:mb-1 flex items-center gap-2">
                    <span className="truncate">{option.name}</span>
                    {isSelected && (
                      <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${getCheckColor(option.color)}`} />
                    )}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    {option.description}
                  </p>
                </div>
              </div>

              {/* Selected Ring Indicator */}
              {isSelected && (
                <div className={`absolute inset-0 rounded-xl ring-2 ${getRingColor(option.color)} pointer-events-none`}></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Payment Instructions Based on Selection */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5">
        <h4 className="font-semibold text-sm sm:text-base text-gray-800 mb-3">
          Comment ça marche?
        </h4>
        
        {selectedMethod === 'orange_money' && (
          <ol className="space-y-2 text-xs sm:text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="font-semibold text-orange-600 flex-shrink-0">1.</span>
              <span>Cliquez sur "Payer maintenant"</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-orange-600 flex-shrink-0">2.</span>
              <span>Vous recevrez un message USSD sur votre téléphone</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-orange-600 flex-shrink-0">3.</span>
              <span>Composez #144# et suivez les instructions</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-orange-600 flex-shrink-0">4.</span>
              <span>Confirmez le paiement avec votre code PIN</span>
            </li>
          </ol>
        )}

        {selectedMethod === 'mtn_money' && (
          <ol className="space-y-2 text-xs sm:text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="font-semibold text-yellow-600 flex-shrink-0">1.</span>
              <span>Cliquez sur "Payer maintenant"</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-yellow-600 flex-shrink-0">2.</span>
              <span>Vous recevrez une notification push</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-yellow-600 flex-shrink-0">3.</span>
              <span>Ouvrez l'app MTN MoMo et validez</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-yellow-600 flex-shrink-0">4.</span>
              <span>Confirmez avec votre code secret</span>
            </li>
          </ol>
        )}

        {selectedMethod === 'wave' && (
          <ol className="space-y-2 text-xs sm:text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">1.</span>
              <span>Cliquez sur "Payer maintenant"</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">2.</span>
              <span>Scannez le QR code avec Wave</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">3.</span>
              <span>Confirmez le montant dans l'application</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">4.</span>
              <span>Validez avec votre code PIN</span>
            </li>
          </ol>
        )}

        {selectedMethod === 'stripe' && (
          <ol className="space-y-2 text-xs sm:text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="font-semibold text-purple-600 flex-shrink-0">1.</span>
              <span>Cliquez sur "Payer maintenant"</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-purple-600 flex-shrink-0">2.</span>
              <span>Vous serez redirigé vers la page de paiement sécurisée</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-purple-600 flex-shrink-0">3.</span>
              <span>Entrez les informations de votre carte</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-purple-600 flex-shrink-0">4.</span>
              <span>Validez le paiement</span>
            </li>
          </ol>
        )}
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
        <span>Paiement 100% sécurisé et crypté</span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing}
        className={`
          w-full flex items-center justify-center gap-2 sm:gap-3
          py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg text-white
          transition-all duration-200
          ${isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl active:scale-95'
          }
        `}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            <span>Traitement en cours...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Payer maintenant</span>
          </>
        )}
      </button>

      {/* Terms */}
      <p className="text-[10px] sm:text-xs text-center text-gray-500">
        En cliquant sur "Payer maintenant", vous acceptez nos{' '}
        <button type="button" className="text-blue-600 hover:underline">
          conditions générales
        </button>
      </p>
    </form>
  );
};