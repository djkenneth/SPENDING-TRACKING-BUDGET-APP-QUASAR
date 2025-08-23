import { ApiClient, type ApiResponse } from './api-client';

// Types
export interface DashboardData {
  current_balance: number;
  monthly_income: number;
  monthly_expenses: number;
  net_income: number;
  savings_rate: number;
  recent_transactions: Array<{
    id: number;
    amount: number;
    type: string;
    description: string;
    date: string;
    category: string;
  }>;
  budget_status: {
    total_budget: number;
    total_spent: number;
    percentage: number;
    over_budget_categories: number;
  };
  goals_summary: {
    active_goals: number;
    total_target: number;
    total_saved: number;
    percentage: number;
  };
  upcoming_bills: Array<{
    id: number;
    name: string;
    amount: number;
    due_date: string;
  }>;
  accounts_summary: Array<{
    id: number;
    name: string;
    type: string;
    balance: number;
  }>;
}

export interface IncomeVsExpensesData {
  period: string;
  data: Array<{
    date: string;
    income: number;
    expenses: number;
    net: number;
    cumulative_net: number;
  }>;
  summary: {
    total_income: number;
    total_expenses: number;
    net_income: number;
    average_daily_income: number;
    average_daily_expenses: number;
  };
}

export interface SpendingTrendsData {
  trends: Array<{
    category: string;
    data: Array<{
      date: string;
      amount: number;
    }>;
    total: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
    change_percentage: number;
  }>;
  top_categories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export interface CategoryBreakdownData {
  categories: Array<{
    id: number;
    name: string;
    amount: number;
    percentage: number;
    transaction_count: number;
    average_transaction: number;
    budget?: number;
    budget_percentage?: number;
  }>;
  total_amount: number;
  uncategorized_amount: number;
}

export interface MonthlySummaryData {
  month: string;
  income: {
    total: number;
    by_category: Array<{ category: string; amount: number }>;
    by_account: Array<{ account: string; amount: number }>;
  };
  expenses: {
    total: number;
    by_category: Array<{ category: string; amount: number }>;
    by_account: Array<{ account: string; amount: number }>;
    fixed: number;
    variable: number;
  };
  net_income: number;
  savings_rate: number;
  comparison: {
    previous_month: {
      income_change: number;
      expense_change: number;
      net_change: number;
    };
    year_over_year: {
      income_change: number;
      expense_change: number;
      net_change: number;
    };
  };
}

export interface NetWorthData {
  current_net_worth: number;
  assets: {
    total: number;
    liquid: number;
    investments: number;
    property: number;
    other: number;
  };
  liabilities: {
    total: number;
    credit_cards: number;
    loans: number;
    mortgage: number;
    other: number;
  };
  history: Array<{
    date: string;
    assets: number;
    liabilities: number;
    net_worth: number;
  }>;
  change: {
    month: number;
    quarter: number;
    year: number;
  };
}

export interface CashFlowData {
  period: string;
  inflows: Array<{
    source: string;
    amount: number;
    percentage: number;
  }>;
  outflows: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  net_flow: number;
  operating_cash_flow: number;
  free_cash_flow: number;
  forecast: Array<{
    date: string;
    projected_inflow: number;
    projected_outflow: number;
    projected_balance: number;
  }>;
}

class AnalyticsService extends ApiClient {
  constructor() {
    super('/analytics');
  }

  // Get dashboard data
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return this.get('/dashboard');
  }

  // Get income vs expenses
  async getIncomeVsExpenses(params?: {
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<IncomeVsExpensesData>> {
    return this.get('/income-vs-expenses', params);
  }

  // Get spending trends
  async getSpendingTrends(params?: {
    period?: 'weekly' | 'monthly' | 'quarterly';
    categories?: number[];
    limit?: number;
  }): Promise<ApiResponse<SpendingTrendsData>> {
    return this.get('/spending-trends', params);
  }

  // Get category breakdown
  async getCategoryBreakdown(params?: {
    date_from?: string;
    date_to?: string;
    type?: 'income' | 'expense';
  }): Promise<ApiResponse<CategoryBreakdownData>> {
    return this.get('/category-breakdown', params);
  }

  // Get monthly summary
  async getMonthlySummary(params?: {
    month?: number;
    year?: number;
  }): Promise<ApiResponse<MonthlySummaryData>> {
    return this.get('/monthly-summary', params);
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
    return this.get('/yearly-summary', { year });
  }

  // Get net worth
  async getNetWorth(): Promise<ApiResponse<NetWorthData>> {
    return this.get('/net-worth');
  }

  // Get cash flow analysis
  async getCashFlow(params?: {
    period?: 'monthly' | 'quarterly' | 'yearly';
    include_forecast?: boolean;
  }): Promise<ApiResponse<CashFlowData>> {
    return this.get('/cash-flow', params);
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
    return this.get('/budget-performance', params);
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
    return this.get('/goal-progress');
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
    return this.post('/generate-report', params);
  }
}

export const analyticsService = new AnalyticsService();
