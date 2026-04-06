import { api } from 'src/boot/axios';
import {
  AlertConfig,
  Budget,
  BudgetAnalysis,
  BudgetComparison,
  BudgetFilters,
  CategoryBreakdown,
  CreateBudgetDto,
  CurrentBudgetsResponse,
  SpendingVelocity,
  UpdateBudgetDto,
} from 'src/types/budget.types';
import { ApiResponse } from 'src/types/api-client.types';

const BASE = '/budgets';

export const budgetsService = {
  async getBudgets(params?: BudgetFilters): Promise<ApiResponse<Budget[]>> {
    const r = await api.get(BASE, { params });
    return r.data;
  },

  async getBudget(id: number): Promise<ApiResponse<Budget>> {
    const r = await api.get(`${BASE}/${id}`);
    return r.data;
  },

  async createBudget(data: CreateBudgetDto): Promise<ApiResponse<Budget>> {
    const r = await api.post(BASE, data);
    return r.data;
  },

  async updateBudget(id: number, data: UpdateBudgetDto): Promise<ApiResponse<Budget>> {
    const r = await api.put(`${BASE}/${id}`, data);
    return r.data;
  },

  async deleteBudget(id: number): Promise<ApiResponse<void>> {
    const r = await api.delete(`${BASE}/${id}`);
    return r.data;
  },

  async getCurrentBudgets(): Promise<ApiResponse<CurrentBudgetsResponse>> {
    const r = await api.get(`${BASE}/current/month`);
    return r.data;
  },

  async getBudgetAnalysis(id: number, params?: {
    period?: 'current' | 'previous' | 'comparison';
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<BudgetAnalysis>> {
    const r = await api.get(`${BASE}/${id}/analysis`, { params });
    return r.data;
  },

  async resetBudget(id: number, data: {
    start_date: string;
    end_date: string;
    carry_over_unused?: boolean;
    reset_spent?: boolean;
  }): Promise<ApiResponse<Budget>> {
    const r = await api.post(`${BASE}/${id}/reset`, data);
    return r.data;
  },

  async getSpendingVelocity(params?: { period?: 'monthly' | 'quarterly' | 'yearly' }): Promise<ApiResponse<SpendingVelocity>> {
    const r = await api.get(`${BASE}/analytics/spending-velocity`, { params });
    return r.data;
  },

  async quickAdjust(data: {
    percentage: number;
    period?: 'monthly' | 'quarterly' | 'yearly';
    category_ids?: number[];
  }): Promise<ApiResponse<{ adjusted_count: number; percentage: number }>> {
    const r = await api.post(`${BASE}/bulk/quick-adjust`, data);
    return r.data;
  },

  async getAlertConfig(): Promise<ApiResponse<AlertConfig>> {
    const r = await api.get(`${BASE}/alerts/config`);
    return r.data;
  },

  async updateAlertConfig(config: Partial<AlertConfig>): Promise<ApiResponse<AlertConfig>> {
    const r = await api.put(`${BASE}/alerts/config`, config);
    return r.data;
  },

  async getComparison(params?: { period?: 'monthly' | 'quarterly' | 'yearly'; limit?: number }): Promise<ApiResponse<{ period: string; comparison: BudgetComparison[] }>> {
    const r = await api.get(`${BASE}/analytics/comparison`, { params });
    return r.data;
  },

  async getCategoryBreakdown(params?: { period?: 'monthly' | 'quarterly' | 'yearly' }): Promise<ApiResponse<CategoryBreakdown[]>> {
    const r = await api.get(`${BASE}/analytics/category-breakdown`, { params });
    return r.data;
  },
};

export default budgetsService;
