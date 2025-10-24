// Frontend/src/components/auth/CompanyAuthModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import { CompanyLoginForm } from './CompanyLoginForm';
import { CompanySignupForm } from './CompanySignUpForm';

interface CompanyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultTab?: 'login' | 'signup';
}

type AuthTab = 'login' | 'signup';

export const CompanyAuthModal: React.FC<CompanyAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = 'login'
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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

  const handleAuthSuccess = () => {
    onSuccess?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold mb-1">
                {activeTab === 'login' ? 'Espace Entreprise' : 'Créer un compte entreprise'}
              </h2>
              <p className="text-indigo-100 text-sm">
                {activeTab === 'login' 
                  ? 'Gérez vos trajets et réservations' 
                  : 'Rejoignez NavTicket en quelques minutes'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('login')}
            className={`
              flex-1 py-4 px-6 font-semibold text-sm transition-all
              ${activeTab === 'login'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }
            `}
          >
            Connexion
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`
              flex-1 py-4 px-6 font-semibold text-sm transition-all
              ${activeTab === 'signup'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }
            `}
          >
            Inscription
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'login' ? (
            <CompanyLoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToSignup={() => setActiveTab('signup')}
            />
          ) : (
            <CompanySignupForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            En continuant, vous acceptez nos{' '}
            <button className="text-indigo-600 hover:underline">
              Conditions d'utilisation
            </button>
            {' '}et notre{' '}
            <button className="text-indigo-600 hover:underline">
              Politique de confidentialité
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};