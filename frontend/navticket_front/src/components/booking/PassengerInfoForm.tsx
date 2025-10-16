import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, CreditCard } from 'lucide-react';
import type { PassengerFormData } from '../../types/booking.types';
import { useAuth } from '../../hooks/useAuth';

interface PassengerInfoFormProps {
  selectedSeats: string[];
  onDataChange: (data: PassengerFormData) => void;
  initialData?: PassengerFormData | null;
}

export const PassengerInfoForm: React.FC<PassengerInfoFormProps> = ({
  selectedSeats,
  onDataChange,
  initialData
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState<PassengerFormData>({
    first_name: initialData?.first_name || user?.first_name || '',
    last_name: initialData?.last_name || user?.last_name || '',
    email: initialData?.email || user?.email || '',
    phone: initialData?.phone || user?.phone || '',
    id_type: initialData?.id_type || 'national_id',
    id_number: initialData?.id_number || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prefill with user data on mount
  useEffect(() => {
    if (user && !initialData) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || prev.first_name,
        last_name: user.last_name || prev.last_name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user, initialData]);

  // Notify parent of data changes
  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-2">
          Informations du passager
        </h3>
        <p className="text-sm text-gray-600">
          Ces informations seront utilisées pour tous les sièges sélectionnés:{' '}
          <span className="font-semibold text-blue-600">
            {selectedSeats.join(', ')}
          </span>
        </p>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label 
            htmlFor="passenger-first-name" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Prénom <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="passenger-first-name"
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
            />
          </div>
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label 
            htmlFor="passenger-last-name" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nom <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="passenger-last-name"
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Kouassi"
              className={`
                block w-full pl-10 pr-3 py-3 border rounded-lg
                focus:outline-none focus:ring-2 transition
                ${errors.last_name 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
                }
              `}
            />
          </div>
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label 
            htmlFor="passenger-email" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="passenger-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jean.kouassi@email.com"
              className={`
                block w-full pl-10 pr-3 py-3 border rounded-lg
                focus:outline-none focus:ring-2 transition
                ${errors.email 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
                }
              `}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Votre billet électronique sera envoyé à cette adresse
          </p>
        </div>

        {/* Phone */}
        <div>
          <label 
            htmlFor="passenger-phone" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Téléphone <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="passenger-phone"
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
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* ID Type */}
        <div>
          <label 
            htmlFor="passenger-id-type" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Type de pièce d'identité
          </label>
          <select
            id="passenger-id-type"
            name="id_type"
            value={formData.id_type}
            onChange={handleChange}
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="national_id">Carte d'identité nationale (CNI)</option>
            <option value="passport">Passeport</option>
            <option value="driver_license">Permis de conduire</option>
            <option value="voter_id">Carte d'électeur</option>
          </select>
        </div>

        {/* ID Number */}
        <div>
          <label 
            htmlFor="passenger-id-number" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Numéro de pièce
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CreditCard className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="passenger-id-number"
              type="text"
              name="id_number"
              value={formData.id_number}
              onChange={handleChange}
              placeholder="CI123456789"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Optionnel - Pour vérification à la gare
          </p>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Note:</span> Assurez-vous que les informations saisies correspondent à votre pièce d'identité. Elles seront vérifiées lors de l'embarquement.
        </p>
      </div>
    </div>
  );
};