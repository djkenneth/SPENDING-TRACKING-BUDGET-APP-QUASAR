import { api } from 'src/boot/axios';
import { ApiResponse } from 'src/types/api-client.types';
import {
  UpdateProfileDto,
  UserDashboardStats,
  UserPreferences,
  UserProfile,
} from 'src/types/user.types';

const BASE = '/user';

export const userService = {
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    const r = await api.get(`${BASE}/profile`);
    return r.data;
  },

  async updateProfile(data: UpdateProfileDto): Promise<ApiResponse<UserProfile>> {
    const r = await api.put(`${BASE}/profile`, data);
    return r.data;
  },

  async updatePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<ApiResponse<void>> {
    const r = await api.put(`${BASE}/password`, data);
    return r.data;
  },

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatar_url: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    const r = await api.post(`${BASE}/avatar`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return r.data;
  },

  async deleteAvatar(): Promise<ApiResponse<void>> {
    const r = await api.delete(`${BASE}/avatar`);
    return r.data;
  },

  async getPreferences(): Promise<ApiResponse<UserPreferences>> {
    const r = await api.get(`${BASE}/preferences`);
    return r.data;
  },

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    const r = await api.put(`${BASE}/preferences`, preferences);
    return r.data;
  },

  async getAvatar(): Promise<ApiResponse<{ avatar: string | null; avatar_url: string | null; has_avatar: boolean }>> {
    const r = await api.get(`${BASE}/avatar`);
    return r.data;
  },

  async getDashboardStats(): Promise<ApiResponse<UserDashboardStats>> {
    const r = await api.get(`${BASE}/dashboard-stats`);
    return r.data;
  },

  async exportData(format: 'json' | 'csv'): Promise<Blob> {
    const r = await api.get(`${BASE}/export-data`, { params: { format }, responseType: 'blob' });
    return r.data;
  },

  async deleteAccount(data: { password: string; reason?: string }): Promise<ApiResponse<void>> {
    const r = await api.delete(`${BASE}/delete-account`, { data });
    return r.data;
  },
};
