import { ApiClient } from 'src/services/api-client';
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

class AnalyticsService extends ApiClient {
  constructor() {
    super('/analytics');
  }

  // Get dashboard data
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return await this.get('/dashboard');
  }

  // Get income vs expenses
  async getIncomeVsExpenses(params?: {
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<IncomeVsExpensesData>> {
    return await this.get('/income-vs-expenses', params);
  }

  // Get spending trends
  async getSpendingTrends(params?: {
    period?: 'weekly' | 'monthly' | 'quarterly';
    categories?: number[];
    limit?: number;
  }): Promise<ApiResponse<SpendingTrendsData>> {
    return await this.get('/spending-trends', params);
  }

  // Get category breakdown
  async getCategoryBreakdown(params?: {
    date_from?: string;
    date_to?: string;
    type?: 'income' | 'expense';
  }): Promise<ApiResponse<CategoryBreakdownData>> {
    return await this.get('/category-breakdown', params);
  }

  // Get monthly summary
  async getMonthlySummary(params?: {
    month?: number;
    year?: number;
  }): Promise<ApiResponse<MonthlySummaryData>> {
    return await this.get('/monthly-summary', params);
  }

  // Get yearly summary
  async getYearlySummary(year?: number): Promise<
    ApiResponse<{
      year: number;
      total_income: number;
      total_expenses: number;
      net_income: number;
      monthly_data: MonthlySummaryData[];
    }>
  > {
    return await this.get('/yearly-summary', { year });
  }

  // Get net worth
  async getNetWorth(): Promise<ApiResponse<NetWorthData>> {
    return await this.get('/net-worth');
  }

  // Get cash flow analysis
  async getCashFlow(params?: {
    period?: 'monthly' | 'quarterly' | 'yearly';
    include_forecast?: boolean;
  }): Promise<ApiResponse<CashFlowData>> {
    return await this.get('/cash-flow', params);
  }

  // Get budget performance
  async getBudgetPerformance(params?: { month?: number; year?: number }): Promise<
    ApiResponse<{
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
    }>
  > {
    return await this.get('/budget-performance', params);
  }

  // Get goal progress summary
  async getGoalProgress(): Promise<
    ApiResponse<{
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
    }>
  > {
    return await this.get('/goal-progress');
  }

  // Generate custom report
  async generateReport(params: {
    type: 'income' | 'expense' | 'cash-flow' | 'net-worth' | 'budget' | 'comprehensive';
    date_from: string;
    date_to: string;
    format?: 'json' | 'pdf' | 'csv';
    include_charts?: boolean;
  }): Promise<Blob | ApiResponse<any>> {
    if (params.format === 'pdf' || params.format === 'csv') {
      const response = await this.post('/generate-report', params, {
        responseType: 'blob',
      });
      return response as unknown as Blob;
    }
    return await this.post('/generate-report', params);
  }
}

export const analyticsService = new AnalyticsService();
