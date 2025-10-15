import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ 
  onSuccess, 
  onSwitchToLogin 
}) => {
  const { signup, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirm: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Prénom requis';
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'Le prénom doit contenir au moins 2 caractères';
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Nom requis';
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Le nom doit contenir au moins 2 caractères';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Téléphone requis';
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre';
    }

    // Password confirmation validation
    if (!formData.password_confirm) {
      newErrors.password_confirm = 'Confirmation requise';
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!validate()) return;

    try {
      await signup({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        password_confirm: formData.password_confirm,
      });
      
      // Clear form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirm: '',
      });
      
      // Call success callback
      onSuccess?.();
    } catch (error) {
      // Error handling is done in AuthContext with toast
      console.error('Signup failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label 
            htmlFor="signup-first-name" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Prénom
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="signup-first-name"
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              autoComplete="given-name"
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
            htmlFor="signup-last-name" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nom
          </label>
          <input
            id="signup-last-name"
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            autoComplete="family-name"
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

      {/* Email Field */}
      <div>
        <label 
          htmlFor="signup-email" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="signup-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            placeholder="votre@email.com"
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
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label 
          htmlFor="signup-phone" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Téléphone
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="signup-phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            autoComplete="tel"
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
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label 
          htmlFor="signup-password" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
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

      {/* Password Confirmation Field */}
      <div>
        <label 
          htmlFor="signup-password-confirm" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Confirmer le mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="signup-password-confirm"
            type={showPasswordConfirm ? 'text' : 'password'}
            name="password_confirm"
            value={formData.password_confirm}
            onChange={handleChange}
            autoComplete="new-password"
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
          'S\'inscrire'
        )}
      </button>

      {/* Switch to Login */}
      {onSwitchToLogin && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Déjà un compte?{' '}
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