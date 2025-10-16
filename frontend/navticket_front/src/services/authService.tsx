import api from './api';
import type {
  LoginCredentials,
  LoginResponse,
  SignupData,
  SignupResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
} from '../types/auth.types';

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/traveler/login/', credentials);
    
    // Store tokens and user data
    this.storeAuthData(response.data);
    
    return response.data;
  }

  /**
   * Register new traveler
   */
  async signup(data: SignupData): Promise<SignupResponse> {
    const response = await api.post<SignupResponse>('/auth/traveler/register/', data);
    
    // Store tokens and user data
    this.storeAuthData(response.data);
    
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh/', {
      refresh: refreshToken,
    });
    
    // Update access token
    localStorage.setItem('access_token', response.data.access);
    
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await api.post('/accounts/auth/logout/', {
          refresh: refreshToken,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      this.clearAuthData();
    }
  }

  /**
   * Get current user from API
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/accounts/auth/me/');
    return response.data;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Store authentication data
   */
  private storeAuthData(data: LoginResponse | SignupResponse): void {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
}

export default new AuthService();