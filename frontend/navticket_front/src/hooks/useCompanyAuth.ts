// Frontend/src/hooks/useCompanyAuth.ts

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import companyAuth from '../services/companyAuth';
import { toast } from 'react-hot-toast';
import type {
  CompanyLoginRequest,
  CompanyRegisterRequest,
  CompanyUser,
} from '../types/company.types';

interface UseCompanyAuthReturn {
  user: CompanyUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: CompanyLoginRequest) => Promise<void>;
  register: (data: CompanyRegisterRequest) => Promise<void>;
  logout: () => void;
}

export const useCompanyAuth = (): UseCompanyAuthReturn => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<CompanyUser | null>(
    companyAuth.getCurrentUser()
  );

  const login = async (data: CompanyLoginRequest): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await companyAuth.login(data);
      setUser(response.user);
      toast.success('Connexion réussie!');
      navigate('/dashboard');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      'Erreur de connexion';
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: CompanyRegisterRequest): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await companyAuth.register(data);
      setUser(response.user);
      toast.success('Inscription réussie! Bienvenue sur NavTicket.');
      navigate('/dashboard');
    } catch (error: any) {
      let errorMsg = 'Erreur lors de l\'inscription';

      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'object') {
          const firstError = Object.values(errorData)[0];
          errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        } else {
          errorMsg = errorData.error || errorData.message || errorMsg;
        }
      }

      toast.error(errorMsg as string);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    companyAuth.logout();
    setUser(null);
    toast.success('Déconnexion réussie');
    navigate('/');
  };

  return {
    user,
    isAuthenticated: companyAuth.isAuthenticated(),
    isLoading,
    login,
    register,
    logout,
  };
};