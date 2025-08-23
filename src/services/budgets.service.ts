import { ApiClient, type ApiResponse, type QueryParams } from './api-client';

// Types
export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly' | 'custom';
  start_date: string;
  end_date: string;
  alert_threshold?: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
    icon: string;
    color: string;
  };
  spent?: number;
  remaining?: number;
  percentage?: number;
  status?: 'under' | 'warning' | 'over';
}

export interface CreateBudgetDto {
  category_id: number;
  amount: number;
  period: Budget['period'];
  start_date: string;
  end_date?: string;
  alert_threshold?: number;
  notes?: string;
}

export interface UpdateBudgetDto extends Partial<CreateBudgetDto> {
  is_active?: boolean;
}

export interface BudgetAnalysis {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  daily_average: number;
  projected_spending: number;
  days_remaining: number;
  status: 'under' | 'warning' | 'over';
  transactions: Array<{
    id: number;
    amount: number;
    date: string;
    description: string;
  }>;
  spending_trend: Array<{
    date: string;
    amount: number;
    cumulative: number;
  }>;
  recommendations: string[];
}

export interface BudgetSummary {
  total_budget: number;
  total_spent: number;
  total_remaining: number;
  overall_percentage: number;
  budgets_count: number;
  over_budget_count: number;
  warning_count: number;
  under_budget_count: number;
  categories_without_budget: number;
}

class BudgetsService extends ApiClient {
  constructor() {
    super('/budgets');
  }

  // Get all budgets
  async getBudgets(params?: QueryParams): Promise<ApiResponse<Budget[]>> {
    return this.get('', params);
  }

  // Get single budget
  async getBudget(id: number): Promise<ApiResponse<Budget>> {
    return this.get(`/${id}`);
  }

  // Create budget
  async createBudget(data: CreateBudgetDto): Promise<ApiResponse<Budget>> {
    return this.post('', data);
  }

  // Update budget
  async updateBudget(id: number, data: UpdateBudgetDto): Promise<ApiResponse<Budget>> {
    return this.put(`/${id}`, data);
  }

  // Delete budget
  async deleteBudget(id: number): Promise<ApiResponse<void>> {
    return this.delete(`/${id}`);
  }

  // Get current month budgets
  async getCurrentBudgets(): Promise<ApiResponse<Budget[]>> {
    return this.get('/current/month');
  }

  // Get budget analysis
  async getBudgetAnalysis(id: number): Promise<ApiResponse<BudgetAnalysis>> {
    return this.get(`/${id}/analysis`);
  }

  // Reset budget for new period
  async resetBudget(
    id: number,
    data?: {
      amount?: number;
      start_date?: string;
      end_date?: string;
    },
  ): Promise<ApiResponse<Budget>> {
    return this.post(`/${id}/reset`, data);
  }

  // Get budget summary
  async getBudgetSummary(params?: {
    month?: number;
    year?: number;
  }): Promise<ApiResponse<BudgetSummary>> {
    return this.get('/summary', params);
  }

  // Create budgets from template
  async createFromTemplate(
    template: 'basic' | 'detailed' | '50-30-20' | 'zero-based',
  ): Promise<ApiResponse<Budget[]>> {
    return this.post('/create-from-template', { template });
  }

  // Copy budgets to next period
  async copyToNextPeriod(params?: {
    source_month?: number;
    source_year?: number;
    target_month?: number;
    target_year?: number;
  }): Promise<ApiResponse<Budget[]>> {
    return this.post('/copy-to-next-period', params);
  }

  // Bulk create/update budgets
  async bulkUpsertBudgets(
    budgets: Array<CreateBudgetDto | (UpdateBudgetDto & { id: number })>,
  ): Promise<ApiResponse<Budget[]>> {
    return this.post('/bulk/upsert', { budgets });
  }

  // Get budget alerts
  async getBudgetAlerts(): Promise<
    ApiResponse<
      Array<{
        budget: Budget;
        message: string;
        severity: 'info' | 'warning' | 'danger';
      }>
    >
  > {
    return this.get('/alerts');
  }

  // Get budget history
  async getBudgetHistory(
    id: number,
    params?: {
      months?: number;
    },
  ): Promise<
    ApiResponse<
      Array<{
        period: string;
        budget_amount: number;
        spent: number;
        percentage: number;
      }>
    >
  > {
    return this.get(`/${id}/history`, params);
  }

  // Get budget recommendations
  async getBudgetRecommendations(params?: { based_on_months?: number }): Promise<
    ApiResponse<
      Array<{
        category_id: number;
        category_name: string;
        current_budget: number | null;
        recommended_budget: number;
        average_spending: number;
        reason: string;
      }>
    >
  > {
    return this.get('/recommendations', params);
  }
}

export const budgetsService = new BudgetsService();
