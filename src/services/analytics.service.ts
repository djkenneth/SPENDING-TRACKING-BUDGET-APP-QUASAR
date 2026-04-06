import { api } from 'src/boot/axios';
import {
  CashFlowData,
  CategoryBreakdownData,
  DashboardData,
  IncomeVsExpensesData,
  MonthlySummaryData,
  NetWorthData,
  SpendingTrendsData,
} from 'src/types/analytics.types';
import { ApiResponse } from 'src/types/api-client.types';

const BASE = '/analytics';

export const analyticsService = {
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    const r = await api.get(`${BASE}/dashboard`);
    return r.data;
  },

  async getIncomeVsExpenses(params?: {
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<IncomeVsExpensesData>> {
    const r = await api.get(`${BASE}/income-vs-expenses`, { params });
    return r.data;
  },

  async getSpendingTrends(params?: {
    period?: 'weekly' | 'monthly' | 'quarterly';
    categories?: number[];
    limit?: number;
  }): Promise<ApiResponse<SpendingTrendsData>> {
    const r = await api.get(`${BASE}/spending-trends`, { params });
    return r.data;
  },

  async getCategoryBreakdown(params?: {
    date_from?: string;
    date_to?: string;
    type?: 'income' | 'expense';
  }): Promise<ApiResponse<CategoryBreakdownData>> {
    const r = await api.get(`${BASE}/category-breakdown`, { params });
    return r.data;
  },

  async getMonthlySummary(params?: { month?: number; year?: number }): Promise<ApiResponse<MonthlySummaryData>> {
    const r = await api.get(`${BASE}/monthly-summary`, { params });
    return r.data;
  },

  async getYearlySummary(year?: number): Promise<ApiResponse<{
    year: number;
    total_income: number;
    total_expenses: number;
    net_income: number;
    monthly_data: MonthlySummaryData[];
  }>> {
    const r = await api.get(`${BASE}/yearly-summary`, { params: { year } });
    return r.data;
  },

  async getNetWorth(): Promise<ApiResponse<NetWorthData>> {
    const r = await api.get(`${BASE}/net-worth`);
    return r.data;
  },

  async getCashFlow(params?: {
    period?: 'monthly' | 'quarterly' | 'yearly';
    include_forecast?: boolean;
  }): Promise<ApiResponse<CashFlowData>> {
    const r = await api.get(`${BASE}/cash-flow`, { params });
    return r.data;
  },

  async getBudgetPerformance(params?: { month?: number; year?: number }): Promise<ApiResponse<{
    overall_performance: number;
    categories: Array<{
      category: string;
      budget: number;
      spent: number;
      remaining: number;
      percentage: number;
      status: 'under' | 'on-track' | 'over';
    }>;
    recommendations: string[];
  }>> {
    const r = await api.get(`${BASE}/budget-performance`, { params });
    return r.data;
  },

  async getGoalProgress(): Promise<ApiResponse<{
    total_goals: number;
    completed_goals: number;
    active_goals: number;
    overall_progress: number;
    goals: Array<{
      id: number;
      name: string;
      progress: number;
      target_amount: number;
      current_amount: number;
      target_date: string;
      is_on_track: boolean;
    }>;
  }>> {
    const r = await api.get(`${BASE}/goal-progress`);
    return r.data;
  },

  async generateReport(params: {
    type: 'income' | 'expense' | 'cash-flow' | 'net-worth' | 'budget' | 'comprehensive';
    date_from: string;
    date_to: string;
    format?: 'json' | 'pdf' | 'csv';
    include_charts?: boolean;
  }): Promise<Blob | ApiResponse<any>> {
    if (params.format === 'pdf' || params.format === 'csv') {
      const r = await api.post(`${BASE}/generate-report`, params, { responseType: 'blob' });
      return r.data;
    }
    const r = await api.post(`${BASE}/generate-report`, params);
    return r.data;
  },
};
