export interface AppSettings {
  app_name: string;
  app_version: string;
  maintenance_mode: boolean;
  features: {
    bills: boolean;
    budgets: boolean;
    goals: boolean;
    debts: boolean;
    investments: boolean;
    reports: boolean;
    multi_currency: boolean;
    data_export: boolean;
    api_access: boolean;
  };
  limits: {
    max_accounts: number;
    max_transactions_per_month: number;
    max_categories: number;
    max_goals: number;
    data_retention_days: number;
  };
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  date: string;
}

export interface BackupData {
  id: string;
  created_at: string;
  size: number;
  type: 'manual' | 'automatic';
  status: 'completed' | 'failed' | 'pending';
}
