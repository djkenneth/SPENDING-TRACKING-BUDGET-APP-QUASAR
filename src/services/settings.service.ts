import { api } from 'src/boot/axios';
import { ApiResponse } from 'src/types/api-client.types';
import { AppSettings, BackupData, Currency, ExchangeRate } from 'src/types/settings.types';

const BASE = '/settings';

export const settingsService = {
  async getSettings(): Promise<ApiResponse<AppSettings>> {
    const r = await api.get(BASE);
    return r.data;
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<ApiResponse<AppSettings>> {
    const r = await api.put(BASE, settings);
    return r.data;
  },

  async getCurrencies(): Promise<ApiResponse<Currency[]>> {
    const r = await api.get(`${BASE}/currencies`);
    return r.data;
  },

  async getExchangeRates(base?: string): Promise<ApiResponse<ExchangeRate[]>> {
    const r = await api.get(`${BASE}/exchange-rates`, { params: { base } });
    return r.data;
  },

  async convertCurrency(data: { amount: number; from: string; to: string }): Promise<ApiResponse<{
    original_amount: number;
    converted_amount: number;
    rate: number;
    from: string;
    to: string;
  }>> {
    const r = await api.post(`${BASE}/currencies/convert`, data);
    return r.data;
  },

  async createBackup(): Promise<ApiResponse<BackupData>> {
    const r = await api.post(`${BASE}/backup`);
    return r.data;
  },

  async getBackups(): Promise<ApiResponse<BackupData[]>> {
    const r = await api.get(`${BASE}/backups`);
    return r.data;
  },

  async restoreBackup(backupId: string): Promise<ApiResponse<void>> {
    const r = await api.post(`${BASE}/restore`, { backup_id: backupId });
    return r.data;
  },

  async exportSettings(): Promise<Blob> {
    const r = await api.get(`${BASE}/export`, { responseType: 'blob' });
    return r.data;
  },

  async importSettings(file: File): Promise<ApiResponse<void>> {
    const formData = new FormData();
    formData.append('file', file);
    const r = await api.post(`${BASE}/import`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return r.data;
  },

  async getSyncStatus(): Promise<ApiResponse<{
    last_sync: string;
    pending_changes: number;
    sync_enabled: boolean;
    sync_frequency: string;
  }>> {
    const r = await api.get(`${BASE}/sync/status`);
    return r.data;
  },

  async syncData(): Promise<ApiResponse<{
    synced_items: number;
    conflicts: number;
    errors: number;
  }>> {
    const r = await api.post(`${BASE}/sync/full`);
    return r.data;
  },
};
