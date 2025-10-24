// Frontend/src/types/company.types.ts

export interface CompanyUser {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'company_admin' | 'company_staff';
    phone?: string;
  }
  
  export interface Company {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    business_license?: string;
    tax_number?: string;
    verification_status: 'pending' | 'verified' | 'rejected';
    is_active: boolean;
  }
  
  export interface CompanyLoginRequest {
    email: string;
    password: string;
  }
  
  export interface CompanyLoginResponse {
    access_token: string;
    refresh_token: string;
    user: CompanyUser;
  }
  
  export interface CompanyRegisterRequest {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    password: string;
    password_confirm: string;
    name: string;
    address?: string;
    business_license?: string;
    tax_number?: string;
  }
  
  export interface CompanyRegisterResponse {
    message: string;
    company: Company;
    user: CompanyUser;
    access: string;
    refresh: string;
  }