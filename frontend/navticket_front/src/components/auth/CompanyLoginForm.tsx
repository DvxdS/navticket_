// Frontend/src/components/auth/CompanyLoginForm.tsx

import React, { useState } from 'react';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';

interface CompanyLoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

export const CompanyLoginForm: React.FC<CompanyLoginFormProps> = ({ 
  onSuccess, 
  onSwitchToSignup 
}) => {
  const { login, isLoading } = useCompanyAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      
      setFormData({ email: '', password: '' });
      onSuccess?.();
    } catch (error) {
      console.error('Company login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label 
          htmlFor="company-login-email" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email de l'entreprise
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="company-login-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            placeholder="admin@entreprise.com"
            className={`
              block w-full pl-10 pr-3 py-3 border rounded-lg
              focus:outline-none focus:ring-2 transition
              ${errors.email 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }
            `}
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label 
          htmlFor="company-login-password" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="company-login-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            placeholder="••••••••"
            className={`
              block w-full pl-10 pr-12 py-3 border rounded-lg
              focus:outline-none focus:ring-2 transition
              ${errors.password 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }
            `}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Mot de passe oublié?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full flex items-center justify-center gap-2
          py-3 px-4 rounded-lg font-semibold text-white
          transition-all duration-200
          ${isLoading
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Connexion en cours...
          </>
        ) : (
          'Se connecter'
        )}
      </button>

      {onSwitchToSignup && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Pas encore inscrit?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Créer un compte entreprise
            </button>
          </p>
        </div>
      )}
    </form>
  );
};