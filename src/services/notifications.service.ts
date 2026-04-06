import { api } from 'src/boot/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from 'src/types/api-client.types';
import type {
  Notification as AppNotification,
  CreateNotificationDto,
  NotificationPreference,
  NotificationSettings,
} from 'src/types/notification.types';

const BASE = '/notifications';

const toPaginated = <T>(d: any): PaginatedResponse<T> => {
  if (d.success !== undefined) {
    return { data: d.data, meta: { ...d.meta, links: [], path: '' }, links: { first: '', last: '', prev: null, next: null } };
  }
  return d;
};

export const notificationsService = {
  async getNotifications(params?: QueryParams): Promise<PaginatedResponse<AppNotification>> {
    const r = await api.get(BASE, { params });
    return toPaginated(r.data);
  },

  async getNotification(id: number): Promise<ApiResponse<AppNotification>> {
    const r = await api.get(`${BASE}/${id}`);
    return r.data;
  },

  async createNotification(data: CreateNotificationDto): Promise<ApiResponse<AppNotification>> {
    const r = await api.post(BASE, data);
    return r.data;
  },

  async markAsRead(id: number): Promise<ApiResponse<AppNotification>> {
    const r = await api.put(`${BASE}/${id}/read`);
    return r.data;
  },

  async deleteNotification(id: number): Promise<ApiResponse<void>> {
    const r = await api.delete(`${BASE}/${id}`);
    return r.data;
  },

  async markAllAsRead(): Promise<ApiResponse<void>> {
    const r = await api.put(`${BASE}/read-all`);
    return r.data;
  },

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    const r = await api.get(`${BASE}/unread-count`);
    return r.data;
  },

  async getSettings(): Promise<ApiResponse<NotificationSettings>> {
    const r = await api.get(`${BASE}/settings`);
    return r.data;
  },

  async updateSettings(settings: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> {
    const r = await api.put(`${BASE}/settings`, settings);
    return r.data;
  },

  async getPreferences(): Promise<ApiResponse<NotificationPreference[]>> {
    const r = await api.get(`${BASE}/preferences`);
    return r.data;
  },

  async updatePreferences(preferences: NotificationPreference[]): Promise<ApiResponse<NotificationPreference[]>> {
    const r = await api.put(`${BASE}/preferences`, { preferences });
    return r.data;
  },

  async clearAll(): Promise<ApiResponse<void>> {
    const r = await api.delete(`${BASE}/clear-all`);
    return r.data;
  },

  async getHistory(params?: {
    date_from?: string;
    date_to?: string;
    category: AppNotification['category'];
    type?: AppNotification['type'];
  } & QueryParams): Promise<PaginatedResponse<AppNotification>> {
    const r = await api.get(`${BASE}/history`, { params });
    return toPaginated(r.data);
  },

  async testNotification(type: 'email' | 'push' | 'sms'): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const r = await api.post(`${BASE}/test`, { type });
    return r.data;
  },

  async subscribePush(subscription: PushSubscription): Promise<ApiResponse<void>> {
    const r = await api.post(`${BASE}/push/subscribe`, subscription);
    return r.data;
  },

  async unsubscribePush(): Promise<ApiResponse<void>> {
    const r = await api.post(`${BASE}/push/unsubscribe`);
    return r.data;
  },
};
