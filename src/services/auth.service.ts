import { api } from '../boot/axios';
import type { AxiosResponse } from 'axios';

// Types
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
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
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

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

class AuthService {
  private baseUrl = '/auth';

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await api.post(`${this.baseUrl}/register`, data);
    return response.data;
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    // First, get CSRF cookie
    await api.get(`/sanctum/csrf-cookie`, {
      baseURL: process.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000',
    });

    // Then make login request
    const response: AxiosResponse<AuthResponse> = await api.post(`${this.baseUrl}/login`, data);
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await api.post(`${this.baseUrl}/logout`);
    return response.data;
  }

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await api.post(`${this.baseUrl}/logout-all`);
    return response.data;
  }

  /**
   * Get authenticated user
   */
  async getUser(): Promise<User> {
    const response: AxiosResponse<{ data: User }> = await api.get(`${this.baseUrl}/user`);
    return response.data.data;
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await api.post(`${this.baseUrl}/refresh`);
    return response.data;
  }

  /**
   * Send forgot password email
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await api.post(
      `${this.baseUrl}/forgot-password`,
      data,
    );
    return response.data;
  }

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await api.post(
      `${this.baseUrl}/reset-password`,
      data,
    );
    return response.data;
  }

  /**
   * Change password
   */
  async changePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await api.post(
      `${this.baseUrl}/change-password`,
      data,
    );
    return response.data;
  }

  /**
   * Verify email
   */
  async verifyEmail(data: { token: string }): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await api.post(
      `${this.baseUrl}/verify-email`,
      data,
    );
    return response.data;
  }

  /**
   * Resend verification email
   */
  async resendVerification(): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await api.post(
      `${this.baseUrl}/resend-verification`,
    );
    return response.data;
  }

  /**
   * Set authorization header
   */
  setAuthHeader(token: string): void {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authorization header
   */
  removeAuthHeader(): void {
    delete api.defaults.headers.common['Authorization'];
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Store token
   */
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this.setAuthHeader(token);
  }

  /**
   * Remove token
   */
  removeToken(): void {
    localStorage.removeItem('auth_token');
    this.removeAuthHeader();
  }
}

export const authService = new AuthService();
