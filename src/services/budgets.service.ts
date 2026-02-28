import {
  Budget,
  BudgetAnalysis,
  BudgetFilters,
  CategoryBreakdown,
  CreateBudgetDto,
  CurrentBudgetsResponse,
  SpendingVelocity,
  UpdateBudgetDto,
} from 'src/types/budget.types';
import { ApiClient } from 'src/services/api-client';
import { ApiResponse } from 'src/types/api-client.types';

class BudgetsService extends ApiClient {
  constructor() {
    super('/budgets');
  }

  // Get all budgets
  async getBudgets(params?: BudgetFilters): Promise<ApiResponse<Budget[]>> {
    return await this.get('', params);
  }

  // Get single budget
  async getBudget(id: number): Promise<ApiResponse<Budget>> {
    return await this.get(`/${id}`);
  }

  // Create budget
  async createBudget(data: CreateBudgetDto): Promise<ApiResponse<Budget>> {
    return await this.post('', data);
  }

  // Update budget
  async updateBudget(id: number, data: UpdateBudgetDto): Promise<ApiResponse<Budget>> {
    return await this.put(`/${id}`, data);
  }

  // Delete budget
  async deleteBudget(id: number): Promise<ApiResponse<void>> {
    return await this.delete(`/${id}`);
  }

  // Get current period budgets (monthly, quarterly, yearly)
  async getCurrentBudgets(): Promise<ApiResponse<CurrentBudgetsResponse>> {
    return await this.get('/current/month');
  }

  // Get budget analysis
  async getBudgetAnalysis(
    id: number,
    params?: {
      period?: 'current' | 'previous' | 'comparison';
      start_date?: string;
      end_date?: string;
    },
  ): Promise<ApiResponse<BudgetAnalysis>> {
    return await this.get(`/${id}/analysis`, params);
  }

  // Reset budget
  async resetBudget(
    id: number,
    data: {
      start_date: string;
      end_date: string;
      carry_over_unused?: boolean;
      reset_spent?: boolean;
    },
  ): Promise<ApiResponse<Budget>> {
    return await this.post(`/${id}/reset`, data);
  }

  // Get spending velocity
  async getSpendingVelocity(params?: {
    period?: 'monthly' | 'quarterly' | 'yearly';
  }): Promise<ApiResponse<SpendingVelocity>> {
    return await this.get('/analytics/spending-velocity', params);
  }

  // Apply quick budget adjustment
  async quickAdjust(data: {
    percentage: number;
    period?: 'monthly' | 'quarterly' | 'yearly';
    category_ids?: number[];
  }): Promise<ApiResponse<{ adjusted_count: number; percentage: number }>> {
    return await this.post('/bulk/quick-adjust', data);
  }

  // Get alert configuration — disabled: endpoint not implemented yet
  // async getAlertConfig(): Promise<ApiResponse<AlertConfig>> {
  //   return await this.get('/alerts/config');
  // }

  // Update alert configuration — disabled: endpoint not implemented yet
  // async updateAlertConfig(config: Partial<AlertConfig>): Promise<ApiResponse<AlertConfig>> {
  //   return await this.put('/alerts/config', config);
  // }

  // Get budget vs actual comparison — disabled: endpoint not implemented yet
  // async getComparison(params?: {
  //   period?: 'monthly' | 'quarterly' | 'yearly';
  //   limit?: number;
  // }): Promise<ApiResponse<{ period: any; comparison: BudgetComparison[] }>> {
  //   return await this.get('/analytics/comparison', params);
  // }

  // Get category breakdown
  async getCategoryBreakdown(params?: {
    period?: 'monthly' | 'quarterly' | 'yearly';
  }): Promise<ApiResponse<CategoryBreakdown[]>> {
    return await this.get('/analytics/category-breakdown', params);
  }

  // Export budgets to CSV
  // async exportBudgets(): Promise<Blob> {
  //   const response = await fetch(`${this.baseUrl}/export/csv`, {
  //     method: 'GET',
  //     headers: {
  //       Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
  //     },
  //   });
  //   return response.blob();
  // }
}

export const budgetsService = new BudgetsService();
export default budgetsService;
