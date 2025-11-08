import { useState } from 'react';
import type { PassengerData } from '@/types/voyage.types';

interface PassengerFormProps {
  onSubmit: (data: PassengerData) => void;
  isLoading?: boolean;
}

export const PassengerForm = ({ onSubmit, isLoading }: PassengerFormProps) => {
  const [formData, setFormData] = useState<PassengerData>({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    id_number: '',
  });

  const [errors, setErrors] = useState<Partial<PassengerData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof PassengerData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<PassengerData> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Prénom requis';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Nom requis';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Téléphone requis';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
              errors.first_name ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Jean"
          />
          {errors.first_name && (
            <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
              errors.last_name ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Kouassi"
          />
          {errors.last_name && (
            <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Téléphone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
            errors.phone ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="+225 07 07 12 34 56"
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
            errors.email ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="jean@example.com"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Numéro de pièce d'identité
        </label>
        <input
          type="text"
          name="id_number"
          value={formData.id_number}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="CI123456"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Création...' : 'Continuer'}
      </button>
    </form>
  );
};