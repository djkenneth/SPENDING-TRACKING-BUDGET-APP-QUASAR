import type { User } from 'src/services/auth.service';

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
