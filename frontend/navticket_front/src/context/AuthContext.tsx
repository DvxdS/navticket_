import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import authService from '../services/authService';
import type {  User, AuthState, LoginCredentials, SignupData } from '../types/auth.types';
import { toast } from 'react-hot-toast'; // or your toast library

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      const accessToken = authService.getAccessToken();
      const refreshToken = authService.getRefreshToken();
      const user = authService.getStoredUser();

      if (accessToken && user) {
        setAuthState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    initializeAuth();
  }, []);

  // Listen for logout events (from token refresh failure)
  useEffect(() => {
    const handleLogout = () => {
      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      toast.error('Session expirée. Veuillez vous reconnecter.');
    };

    window.addEventListener('auth:logout', handleLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  /**
   * Login user
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await authService.login(credentials);

      setAuthState({
        user: response.user,
        accessToken: response.access,
        refreshToken: response.refresh,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success(`Bienvenue ${response.user.first_name}!`);
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.message
        || 'Erreur de connexion. Veuillez réessayer.';
      
      toast.error(errorMessage);
      throw error;
    }
  };

  /**
   * Signup new user
   */
  const signup = async (data: SignupData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await authService.signup(data);

      setAuthState({
        user: response.user,
        accessToken: response.access,
        refreshToken: response.refresh,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success('Compte créé avec succès!');
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      // Handle validation errors
      if (error.response?.data) {
        const errors = error.response.data;
        
        // Show first error message
        const firstError = Object.values(errors)[0];
        const errorMessage = Array.isArray(firstError) 
          ? firstError[0] 
          : firstError || 'Erreur lors de l\'inscription';
        
        toast.error(errorMessage as string);
      } else {
        toast.error('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
      
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authService.logout();
      
      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });

      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  /**
   * Refresh current user data
   */
  const refreshUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      
      setAuthState(prev => ({
        ...prev,
        user,
      }));
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};