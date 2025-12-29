import { ApiResponse } from 'src/types/api-client.types';
import { ApiClient } from 'src/services/api-client';
import { AppSettings, BackupData, Currency, ExchangeRate } from 'src/types/settings.types';

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
