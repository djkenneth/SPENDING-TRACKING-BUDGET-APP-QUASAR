export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'reminder' | 'alert';
  category: 'bill' | 'budget' | 'goal' | 'transaction' | 'account' | 'system';
  is_read: boolean;
  data?: Record<string, any>;
  action_url?: string;
  created_at: string;
  read_at?: string;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: Notification['type'];
  category: Notification['category'];
  data?: Record<string, any>;
  action_url?: string;
}

export interface NotificationSettings {
  bill_reminders: boolean;
  bill_reminder_days: number;
  budget_alerts: boolean;
  budget_alert_threshold: number;
  goal_milestones: boolean;
  low_balance_alerts: boolean;
  low_balance_threshold: number;
  unusual_spending: boolean;
  weekly_summary: boolean;
  monthly_summary: boolean;
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
}

export interface NotificationPreference {
  category: Notification['category'];
  email: boolean;
  push: boolean;
  sms: boolean;
  in_app: boolean;
}
