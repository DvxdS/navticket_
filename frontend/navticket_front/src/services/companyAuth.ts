// Frontend/src/services/companyAuth.ts

import api from './api';
import type {
  CompanyLoginRequest,
  CompanyLoginResponse,
  CompanyRegisterRequest,
  CompanyRegisterResponse,
  CompanyUser,
} from '../types/company.types';

class CompanyAuthService {
  private readonly TOKEN_KEY = 'company_token';
  private readonly REFRESH_KEY = 'company_refresh';
  private readonly USER_KEY = 'company_user';
  private readonly USER_TYPE_KEY = 'user_type';

  async login(data: CompanyLoginRequest): Promise<CompanyLoginResponse> {
    const response = await api.post<CompanyLoginResponse>('/auth/company/login/', data);

    if (response.data.access_token) {
      this.setTokens(
        response.data.access_token,
        response.data.refresh_token,
        response.data.user
      );
    }

    return response.data;
  }

  async register(data: CompanyRegisterRequest): Promise<CompanyRegisterResponse> {
    const response = await api.post<CompanyRegisterResponse>('/auth/company/register/', data);

    if (response.data.access) {
      this.setTokens(
        response.data.access,
        response.data.refresh,
        response.data.user
      );
    }

    return response.data;
  }

  private setTokens(accessToken: string, refreshToken: string, user: CompanyUser): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_KEY, refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.USER_TYPE_KEY, 'company');
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.USER_TYPE_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  getCurrentUser(): CompanyUser | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const userType = localStorage.getItem(this.USER_TYPE_KEY);
    return !!token && userType === 'company';
  }

  isCompanyAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'company_admin';
  }
}

export default new CompanyAuthService();