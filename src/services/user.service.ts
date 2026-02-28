import { ApiClient } from 'src/services/api-client';
import { ApiResponse } from 'src/types/api-client.types';
import {
  UpdateProfileDto,
  UserDashboardStats,
  UserPreferences,
  UserProfile,
} from 'src/types/user.types';

class UserService extends ApiClient {
  constructor() {
    super('/user');
  }

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return await this.get('/profile');
  }

  async updateProfile(data: UpdateProfileDto): Promise<ApiResponse<UserProfile>> {
    return await this.put('/profile', data);
  }

  async updatePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<ApiResponse<void>> {
    return await this.put('/password', data);
  }

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatar_url: string }>> {
    return await this.upload('/avatar', file);
  }

  async deleteAvatar(): Promise<ApiResponse<void>> {
    return await this.delete('/avatar');
  }

  async getPreferences(): Promise<ApiResponse<UserPreferences>> {
    return await this.get('/preferences');
  }

  async updatePreferences(
    preferences: Partial<UserPreferences>,
  ): Promise<ApiResponse<UserPreferences>> {
    return await this.put('/preferences', preferences);
  }

  async getDashboardStats(): Promise<ApiResponse<UserDashboardStats>> {
    return await this.get('/dashboard-stats');
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
    return await this.delete('/delete-account', { data });
  }
}

export const userService = new UserService();
