import { api } from 'src/boot/axios';
import { ApiResponse, QueryParams } from 'src/types/api-client.types';
import {
  CreateDebtDto,
  Debt,
  DebtPayment,
  DebtPayoffSchedule,
  DebtSummary,
  UpdateDebtDto,
} from 'src/types/debt.types';

const BASE = '/debts';

export const debtsService = {
  async getDebts(params?: QueryParams): Promise<ApiResponse<Debt[]>> {
    const r = await api.get(BASE, { params });
    return r.data;
  },

  async getDebt(id: number): Promise<ApiResponse<Debt>> {
    const r = await api.get(`${BASE}/${id}`);
    return r.data;
  },

  async createDebt(data: CreateDebtDto): Promise<ApiResponse<Debt>> {
    const r = await api.post(BASE, data);
    return r.data;
  },

  async updateDebt(id: number, data: UpdateDebtDto): Promise<ApiResponse<Debt>> {
    const r = await api.put(`${BASE}/${id}`, data);
    return r.data;
  },

  async deleteDebt(id: number): Promise<ApiResponse<void>> {
    const r = await api.delete(`${BASE}/${id}`);
    return r.data;
  },

  async recordPayment(id: number, data: { amount: number; date?: string; notes?: string }): Promise<ApiResponse<DebtPayment>> {
    const r = await api.post(`${BASE}/${id}/payment`, data);
    return r.data;
  },

  async getPayoffSchedule(id: number, params?: {
    extra_payment?: number;
    payment_frequency?: 'monthly' | 'bi-weekly' | 'weekly';
  }): Promise<ApiResponse<DebtPayoffSchedule>> {
    const r = await api.get(`${BASE}/${id}/payoff-schedule`, { params });
    return r.data;
  },

  async getDebtSummary(): Promise<ApiResponse<DebtSummary>> {
    const r = await api.get(`${BASE}/summary`);
    return r.data;
  },

  async getDebtPayments(id: number, params?: QueryParams): Promise<ApiResponse<DebtPayment[]>> {
    const r = await api.get(`${BASE}/${id}/payments`, { params });
    return r.data;
  },

  async calculatePayoffStrategies(params?: {
    extra_payment?: number;
    strategy?: 'avalanche' | 'snowball';
  }): Promise<ApiResponse<{
    avalanche: { total_interest: number; payoff_date: string; order: Debt[] };
    snowball: { total_interest: number; payoff_date: string; order: Debt[] };
    current: { total_interest: number; payoff_date: string };
  }>> {
    const r = await api.get(`${BASE}/payoff-strategies`, { params });
    return r.data;
  },

  async markAsPaidOff(id: number): Promise<ApiResponse<Debt>> {
    const r = await api.post(`${BASE}/${id}/paid-off`);
    return r.data;
  },
};
