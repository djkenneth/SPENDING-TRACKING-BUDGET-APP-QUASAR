import { type QueryParams } from 'src/types/api-client.types';

export interface Transaction {
  id: number;
  user_id: number;
  account_id: number;
  category_id: number;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  date: string;
  description?: string;
  notes?: string;
  tags?: string[];
  is_recurring: boolean;
  recurring_id?: number;
  location?: string;
  receipt_url?: string;
  is_cleared: boolean;
  is_reconciled: boolean;
  created_at: string;
  updated_at: string;
  account?: {
    id: number;
    name: string;
    type: string;
  };
  category?: {
    id: number;
    name: string;
    icon: string;
    color: string;
    type: string;
  };
}

export interface CreateTransactionDto {
  account_id: number;
  category_id: number;
  amount: number;
  type: Transaction['type'];
  date: string;
  description?: string;
  notes?: string;
  tags?: string[];
  is_recurring?: boolean;
  location?: string;
  is_cleared?: boolean;
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {
  is_reconciled?: boolean;
}

export interface TransactionFilters extends QueryParams {
  // Account and Category
  account_id?: number;
  category_id?: number;

  // Transaction Type
  type?: 'income' | 'expense' | 'transfer';

  // Date Range - ALIGNED WITH BACKEND
  start_date?: string;
  end_date?: string;

  // Amount Range
  min_amount?: number;
  max_amount?: number;

  // Boolean Filters
  is_recurring?: boolean;
  is_cleared?: boolean;

  // Search
  search?: string;

  // Tags
  tags?: string[];

  // Sorting
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';

  // Pagination
  page?: number;
  per_page?: number;
}

export interface TransactionStatistics {
  total_income: number;
  total_expenses: number;
  net_amount: number;
  transaction_count: number;
  average_transaction: number;
  largest_expense: Transaction | null;
  largest_income: Transaction | null;
  expenses_by_category: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  daily_average: number;
  monthly_trend: Array<{
    month: string;
    income: number;
    expenses: number;
    net: number;
  }>;
}

export interface BulkTransactionDto {
  transactions: CreateTransactionDto[];
}

export interface ImportTransactionResult {
  success_count: number;
  error_count: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
  imported_transactions: Transaction[];
}
