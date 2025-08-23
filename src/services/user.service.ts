import { ApiClient, type ApiResponse } from './api-client';
import type { User } from './auth.service';

export interface UserProfile extends User {
  stats?: {
    total_transactions: number;
    total_accounts: number;
    member_since_days: number;
    current_streak: number;
  };
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  date_of_birth?: string;
  currency?: string;
  timezone?: string;
  language?: string;
}

export interface UserPreferences {
  dashboard_widgets: string[];
  default_account_id?: number;
  default_currency: string;
  date_format: string;
  number_format: string;
  start_of_week: 'monday' | 'sunday';
  fiscal_year_start: number;
  theme: 'light' | 'dark' | 'auto';
  compact_mode: boolean;
  show_cents: boolean;
}

export interface UserDashboardStats {
  net_worth: number;
  total_income_mtd: number;
  total_expenses_mtd: number;
  savings_rate: number;
  budget_utilization: number;
  goals_progress: number;
  pending_bills: number;
  recent_activity: Array<{
    type: string;
    description: string;
    amount: number;
    date: string;
  }>;
}

class UserService extends ApiClient {
  constructor() {
    super('/user');
  }

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.get('/profile');
  }

  async updateProfile(data: UpdateProfileDto): Promise<ApiResponse<UserProfile>> {
    return this.put('/profile', data);
  }

  async updatePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<ApiResponse<void>> {
    return this.put('/password', data);
  }

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatar_url: string }>> {
    return this.upload('/avatar', file);
  }

  async deleteAvatar(): Promise<ApiResponse<void>> {
    return this.delete('/avatar');
  }

  async getPreferences(): Promise<ApiResponse<UserPreferences>> {
    return this.get('/preferences');
  }

  async updatePreferences(
    preferences: Partial<UserPreferences>,
  ): Promise<ApiResponse<UserPreferences>> {
    return this.put('/preferences', preferences);
  }

  async getDashboardStats(): Promise<ApiResponse<UserDashboardStats>> {
    return this.get('/dashboard-stats');
  }

  async exportData(format: 'json' | 'csv'): Promise<Blob> {
    const response = await this.get(
      '/export-data',
      { format },
      {
        responseType: 'blob',
      },
    );
    return response as unknown as Blob;
  }

  async deleteAccount(data: { password: string; reason?: string }): Promise<ApiResponse<void>> {
    return this.delete('/delete-account', { data });
  }
}

export const userService = new UserService();
