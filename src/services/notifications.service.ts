import { ApiClient } from 'src/services/api-client';
import { ApiResponse, PaginatedResponse, QueryParams } from 'src/types/api-client.types';
import {
  CreateNotificationDto,
  NotificationPreference,
  NotificationSettings,
} from 'src/types/notification.types';

class NotificationsService extends ApiClient {
  constructor() {
    super('/notifications');
  }

  // Get all notifications
  async getNotifications(params?: QueryParams): Promise<PaginatedResponse<Notification>> {
    return this.getPaginated('', params);
  }

  // Get single notification
  async getNotification(id: number): Promise<ApiResponse<Notification>> {
    return this.get(`/${id}`);
  }

  // Create notification (admin only)
  async createNotification(data: CreateNotificationDto): Promise<ApiResponse<Notification>> {
    return this.post('', data);
  }

  // Mark notification as read
  async markAsRead(id: number): Promise<ApiResponse<Notification>> {
    return this.put(`/${id}/read`);
  }

  // Delete notification
  async deleteNotification(id: number): Promise<ApiResponse<void>> {
    return this.delete(`/${id}`);
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<ApiResponse<void>> {
    return this.put('/read-all');
  }

  // Get unread count
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return this.get('/unread-count');
  }

  // Get notification settings
  async getSettings(): Promise<ApiResponse<NotificationSettings>> {
    return this.get('/settings');
  }

  // Update notification settings
  async updateSettings(
    settings: Partial<NotificationSettings>,
  ): Promise<ApiResponse<NotificationSettings>> {
    return this.put('/settings', settings);
  }

  // Get notification preferences
  async getPreferences(): Promise<ApiResponse<NotificationPreference[]>> {
    return this.get('/preferences');
  }

  // Update notification preferences
  async updatePreferences(
    preferences: NotificationPreference[],
  ): Promise<ApiResponse<NotificationPreference[]>> {
    return this.put('/preferences', { preferences });
  }

  // Clear all notifications
  async clearAll(): Promise<ApiResponse<void>> {
    return this.delete('/clear-all');
  }

  // Get notification history
  async getHistory(
    params?: {
      date_from?: string;
      date_to?: string;
      category: Notification['category'];
      type?: Notification['type'];
    } & QueryParams,
  ): Promise<PaginatedResponse<Notification>> {
    return this.getPaginated('/history', params);
  }

  // Test notification
  async testNotification(
    type: 'email' | 'push' | 'sms',
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.post('/test', { type });
  }

  // Subscribe to push notifications
  async subscribePush(subscription: PushSubscription): Promise<ApiResponse<void>> {
    return this.post('/push/subscribe', subscription);
  }

  // Unsubscribe from push notifications
  async unsubscribePush(): Promise<ApiResponse<void>> {
    return this.post('/push/unsubscribe');
  }
}

export const notificationsService = new NotificationsService();
