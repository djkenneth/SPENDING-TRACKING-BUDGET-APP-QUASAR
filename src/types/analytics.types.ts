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
