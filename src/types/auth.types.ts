export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  avatar?: string;
  phone?: string;
  date_of_birth?: string;
  currency: string;
  timezone: string;
  language: string;
  preferences?: Record<string, any>;
  last_login_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  login: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  currency?: string;
  timezone?: string;
  language?: string;
  preferences?: Record<string, any>;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    token_type: string;
  };
}
