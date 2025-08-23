import { ApiClient, type ApiResponse } from './api-client';

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

class SettingsService extends ApiClient {
  constructor() {
    super('/settings');
  }

  async getSettings(): Promise<ApiResponse<AppSettings>> {
    return this.get('');
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<ApiResponse<AppSettings>> {
    return this.put('', settings);
  }

  async getCurrencies(): Promise<ApiResponse<Currency[]>> {
    return this.get('/currencies');
  }

  async getExchangeRates(base?: string): Promise<ApiResponse<ExchangeRate[]>> {
    return this.get('/exchange-rates', { base });
  }

  async convertCurrency(data: { amount: number; from: string; to: string }): Promise<
    ApiResponse<{
      original_amount: number;
      converted_amount: number;
      rate: number;
      from: string;
      to: string;
    }>
  > {
    return this.post('/currencies/convert', data);
  }

  async createBackup(): Promise<ApiResponse<BackupData>> {
    return this.post('/backup');
  }

  async getBackups(): Promise<ApiResponse<BackupData[]>> {
    return this.get('/backups');
  }

  async restoreBackup(backupId: string): Promise<ApiResponse<void>> {
    return this.post('/restore', { backup_id: backupId });
  }

  async exportSettings(): Promise<Blob> {
    const response = await this.get(
      '/export',
      {},
      {
        responseType: 'blob',
      },
    );
    return response as unknown as Blob;
  }

  async importSettings(file: File): Promise<ApiResponse<void>> {
    return this.upload('/import', file);
  }

  async getSyncStatus(): Promise<
    ApiResponse<{
      last_sync: string;
      pending_changes: number;
      sync_enabled: boolean;
      sync_frequency: string;
    }>
  > {
    return this.get('/sync/status');
  }

  async syncData(): Promise<
    ApiResponse<{
      synced_items: number;
      conflicts: number;
      errors: number;
    }>
  > {
    return this.post('/sync/full');
  }
}

export const settingsService = new SettingsService();
