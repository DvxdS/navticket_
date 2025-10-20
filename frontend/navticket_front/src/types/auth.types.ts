// User data structure
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: 'traveler' | 'company' | 'admin';
    is_verified: boolean;
    created_at: string;
  }
  
  // Login request/response
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    user: User;
  }
  
  // Signup request/response
  export interface SignupData {
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    phone: string;
  }
  
  export interface SignupResponse {
    access_token: string;
    refresh_token: string;
    user: User;
    message: string;
  }
  
  // Token refresh
  export interface RefreshTokenRequest {
    refresh: string;
  }
  
  export interface RefreshTokenResponse {
    access: string;
  }
  
  // Auth state
  export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }
  
  // Auth errors
  export interface AuthError {
    message: string;
    field?: string;
    code?: string;
  }