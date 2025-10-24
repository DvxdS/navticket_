// Frontend/src/components/auth/CompanySignupForm.tsx

import React, { useState } from 'react';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building2, MapPin, FileText, Loader2 } from 'lucide-react';

interface CompanySignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const CompanySignupForm: React.FC<CompanySignupFormProps> = ({ 
  onSuccess, 
  onSwitchToLogin 
}) => {
  const { register, isLoading } = useCompanyAuth();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirm: '',
    name: '',
    address: '',
    business_license: '',
    tax_number: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Prénom requis';
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'Le prénom doit contenir au moins 2 caractères';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Nom requis';
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Téléphone requis';
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nom de l\'entreprise requis';
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre';
    }

    if (!formData.password_confirm) {
      newErrors.password_confirm = 'Confirmation requise';
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      await register({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        password_confirm: formData.password_confirm,
        name: formData.name.trim(),
        address: formData.address.trim(),
        business_license: formData.business_license.trim(),
        tax_number: formData.tax_number.trim(),
      });
      
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirm: '',
        name: '',
        address: '',
        business_license: '',
        tax_number: '',
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Company signup failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Company Name */}
      <div>
        <label 
          htmlFor="company-name" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Nom de l'entreprise <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Building2 className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="company-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Transport Express SARL"
            className={`
              block w-full pl-10 pr-3 py-3 border rounded-lg
              focus:outline-none focus:ring-2 transition
              ${errors.name 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
              }
            `}
            disabled={isLoading}
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Admin Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label 
            htmlFor="company-first-name" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Prénom admin <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="company-first-name"
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Jean"
              className={`
                block w-full pl-10 pr-3 py-3 border rounded-lg
                focus:outline-none focus:ring-2 transition
                ${errors.first_name 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
                }
              `}
              disabled={isLoading}
            />
          </div>
          {errors.first_name && (
            <p className="mt-1 text-xs text-red-600">{errors.first_name}</p>
          )}
        </div>

        <div>
          <label 
            htmlFor="company-last-name" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nom admin <span className="text-red-500">*</span>
          </label>
          <input
            id="company-last-name"
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Dupont"
            className={`
              block w-full px-3 py-3 border rounded-lg
              focus:outline-none focus:ring-2 transition
              ${errors.last_name 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
              }
            `}
            disabled={isLoading}
          />
          {errors.last_name && (
            <p className="mt-1 text-xs text-red-600">{errors.last_name}</p>
          )}
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label 
            htmlFor="company-email" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="company-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@entreprise.com"
              className={`
                block w-full pl-10 pr-3 py-3 border rounded-lg
                focus:outline-none focus:ring-2 transition
                ${errors.email 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
                }
              `}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label 
            htmlFor="company-phone" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Téléphone <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="company-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+225 07 XX XX XX XX"
              className={`
                block w-full pl-10 pr-3 py-3 border rounded-lg
                focus:outline-none focus:ring-2 transition
                ${errors.phone 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
                }
              `}
              disabled={isLoading}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <label 
          htmlFor="company-address" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Adresse (optionnel)
        </label>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <textarea
            id="company-address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={2}
            placeholder="123 Rue de la Paix, Abidjan"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Business License & Tax Number */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label 
            htmlFor="business-license" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Licence (optionnel)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="business-license"
              type="text"
              name="business_license"
              value={formData.business_license}
              onChange={handleChange}
              placeholder="BL123456789"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label 
            htmlFor="tax-number" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            N° fiscal (optionnel)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="tax-number"
              type="text"
              name="tax_number"
              value={formData.tax_number}
              onChange={handleChange}
              placeholder="TAX987654321"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label 
            htmlFor="company-password" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Mot de passe <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="company-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`
                block w-full pl-10 pr-12 py-3 border rounded-lg
                focus:outline-none focus:ring-2 transition
                ${errors.password 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
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
            <p className="mt-1 text-xs text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label 
            htmlFor="company-password-confirm" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Confirmer <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="company-password-confirm"
              type={showPasswordConfirm ? 'text' : 'password'}
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              placeholder="••••••••"
              className={`
                block w-full pl-10 pr-12 py-3 border rounded-lg
                focus:outline-none focus:ring-2 transition
                ${errors.password_confirm 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
                }
              `}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              tabIndex={-1}
            >
              {showPasswordConfirm ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password_confirm && (
            <p className="mt-1 text-xs text-red-600">{errors.password_confirm}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
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
            Inscription en cours...
          </>
        ) : (
          'Créer mon compte entreprise'
        )}
      </button>

      {/* Switch to Login */}
      {onSwitchToLogin && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Déjà inscrit?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Se connecter
            </button>
          </p>
        </div>
      )}
    </form>
  );
};