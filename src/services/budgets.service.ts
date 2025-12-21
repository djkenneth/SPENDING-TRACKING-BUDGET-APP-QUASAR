import { ApiClient, type ApiResponse, type QueryParams } from './api-client';

// Types
export interface Budget {
  id: number;
  user_id: number;
  category_id: number | null;
  name: string;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  is_active: boolean;
  alert_threshold: number;
  alert_enabled: boolean;
  rollover_settings?: {
    enabled: boolean;
    carry_over_unused: boolean;
    reset_on_overspend: boolean;
  };
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
    icon: string;
    color: string;
    type: string;
  };
}

export interface CreateBudgetDto {
  category_id?: number;
  name?: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  is_active?: boolean;
  alert_threshold?: number;
  alert_enabled?: boolean;
  rollover_settings?: {
    enabled: boolean;
    carry_over_unused: boolean;
    reset_on_overspend: boolean;
  };
}

export interface UpdateBudgetDto extends Partial<CreateBudgetDto> {}

export interface BudgetFilters extends QueryParams {
  category_id?: number;
  period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  include_inactive?: boolean;
  sort_by?: 'name' | 'amount' | 'start_date' | 'end_date' | 'spent' | 'created_at';
  sort_direction?: 'asc' | 'desc';
}

export interface PeriodBudget {
  period: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  total_spent: number;
  remaining: number;
  percentage_used: number;
  budgets: Budget[];
}

export interface CurrentBudgetsResponse {
  monthly: PeriodBudget;
  quarterly: PeriodBudget;
  yearly: PeriodBudget;
}

export interface SpendingVelocity {
  current_rate: 'High' | 'Normal' | 'Low';
  rate_value: number;
  daily_average: number;
  expected_daily_spend: number;
  projected_month_end: number;
  days_remaining: number;
  total_budget: number;
  total_spent: number;
  warning: {
    message: string;
    amount: number;
  } | null;
}

export interface AlertConfig {
  budget_warning: {
    enabled: boolean;
    threshold: number;
    email_notification: boolean;
    push_notification: boolean;
  };
  overspending_alert: {
    enabled: boolean;
    threshold: number;
    email_notification: boolean;
    push_notification: boolean;
  };
  budget_exceeded: {
    enabled: boolean;
    threshold: number;
    email_notification: boolean;
    push_notification: boolean;
  };
}

export interface BudgetComparison {
  category: string;
  category_icon?: string;
  category_color?: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface CategoryBreakdown {
  id: number;
  category_id: number;
  name: string;
  icon: string;
  color: string;
  budget_amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage: number;
  transaction_count: number;
  status: 'over_budget' | 'near_limit' | 'on_track';
}

export interface BudgetAnalysis {
  current_spent: number;
  remaining: number;
  percentage_used: number;
  status: string;
  trend: any;
  projection: any;
  days_remaining: number;
  daily_average: number;
  recommended_daily_spend: number;
  transactions?: any[];
  daily_spending?: any[];
  weekly_spending?: any[];
  top_transactions?: any[];
  spending_patterns?: any;
}

class BudgetsService extends ApiClient {
  constructor() {
    super('/budgets');
  }

  // Get all budgets
  async getBudgets(params?: BudgetFilters): Promise<ApiResponse<Budget[]>> {
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

  // Get current period budgets (monthly, quarterly, yearly)
  async getCurrentBudgets(): Promise<ApiResponse<CurrentBudgetsResponse>> {
    return this.get('/current/month');
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
    return this.get(`/${id}/analysis`, params);
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
    return this.post(`/${id}/reset`, data);
  }

  // Get spending velocity
  async getSpendingVelocity(params?: {
    period?: 'monthly' | 'quarterly' | 'yearly';
  }): Promise<ApiResponse<SpendingVelocity>> {
    return this.get('/analytics/spending-velocity', params);
  }

  // Apply quick budget adjustment
  async quickAdjust(data: {
    percentage: number;
    period?: 'monthly' | 'quarterly' | 'yearly';
    category_ids?: number[];
  }): Promise<ApiResponse<{ adjusted_count: number; percentage: number }>> {
    return this.post('/bulk/quick-adjust', data);
  }

  // Get alert configuration
  async getAlertConfig(): Promise<ApiResponse<AlertConfig>> {
    return this.get('/alerts/config');
  }

  // Update alert configuration
  async updateAlertConfig(config: Partial<AlertConfig>): Promise<ApiResponse<AlertConfig>> {
    return this.put('/alerts/config', config);
  }

  // Get budget vs actual comparison
  async getComparison(params?: {
    period?: 'monthly' | 'quarterly' | 'yearly';
    limit?: number;
  }): Promise<ApiResponse<{ period: any; comparison: BudgetComparison[] }>> {
    return this.get('/analytics/comparison', params);
  }

  // Get category breakdown
  async getCategoryBreakdown(params?: {
    period?: 'monthly' | 'quarterly' | 'yearly';
  }): Promise<ApiResponse<CategoryBreakdown[]>> {
    return this.get('/analytics/category-breakdown', params);
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
