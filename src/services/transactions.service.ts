import {
  ApiClient,
  type ApiResponse,
  type PaginatedResponse,
  type QueryParams,
} from './api-client';

// Types
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
  account_id?: number;
  category_id?: number;
  type?: Transaction['type'];
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  is_recurring?: boolean;
  is_cleared?: boolean;
  is_reconciled?: boolean;
  tags?: string[];
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

class TransactionsService extends ApiClient {
  constructor() {
    super('/transactions');
  }

  // Get all transactions
  async getTransactions(filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    return this.getPaginated('', filters);
  }

  // Get single transaction
  async getTransaction(id: number): Promise<ApiResponse<Transaction>> {
    return this.get(`/${id}`);
  }

  // Create transaction
  async createTransaction(data: CreateTransactionDto): Promise<ApiResponse<Transaction>> {
    return this.post('', data);
  }

  // Update transaction
  async updateTransaction(
    id: number,
    data: UpdateTransactionDto,
  ): Promise<ApiResponse<Transaction>> {
    return this.put(`/${id}`, data);
  }

  // Delete transaction
  async deleteTransaction(id: number): Promise<ApiResponse<void>> {
    return this.delete(`/${id}`);
  }

  // Bulk create transactions
  async bulkCreateTransactions(data: BulkTransactionDto): Promise<ApiResponse<Transaction[]>> {
    return this.post('/bulk', data);
  }

  // Bulk delete transactions
  async bulkDeleteTransactions(ids: number[]): Promise<ApiResponse<void>> {
    return this.delete('/bulk', { data: { ids } });
  }

  // Search transactions
  async searchTransactions(
    query: string,
    filters?: TransactionFilters,
  ): Promise<PaginatedResponse<Transaction>> {
    return this.getPaginated('/search', { ...filters, search: query });
  }

  // Import transactions from CSV
  async importTransactions(file: File): Promise<ApiResponse<ImportTransactionResult>> {
    return this.upload('/import', file);
  }

  // Export transactions to CSV
  async exportTransactions(filters?: TransactionFilters): Promise<Blob> {
    const response = await this.get('/export', filters, {
      responseType: 'blob',
    });
    return response as unknown as Blob;
  }

  // Get transaction statistics
  async getStatistics(filters?: TransactionFilters): Promise<ApiResponse<TransactionStatistics>> {
    return this.get('/statistics/summary', filters);
  }

  // Get spending by category
  async getSpendingByCategory(
    filters?: TransactionFilters,
  ): Promise<ApiResponse<Array<{ category: string; amount: number; percentage: number }>>> {
    return this.get('/analytics/spending-by-category', filters);
  }

  // Get income vs expenses
  async getIncomeVsExpenses(filters?: TransactionFilters): Promise<
    ApiResponse<
      Array<{
        date: string;
        income: number;
        expenses: number;
        net: number;
      }>
    >
  > {
    return this.get('/analytics/income-vs-expenses', filters);
  }

  // Get recent transactions
  async getRecentTransactions(limit: number = 10): Promise<ApiResponse<Transaction[]>> {
    return this.get('/recent/list', { limit });
  }

  // Get transaction statistics (additional method for summary)
  async getTransactionStatistics(
    filters?: TransactionFilters,
  ): Promise<ApiResponse<TransactionStatistics>> {
    return this.get('/statistics/summary', filters);
  }

  // Duplicate transaction
  // async duplicateTransaction(id: number): Promise<ApiResponse<Transaction>> {
  //   return this.post(`/${id}/duplicate`);
  // }

  // Split transaction
  async splitTransaction(
    id: number,
    splits: Array<{
      amount: number;
      category_id: number;
      description?: string;
    }>,
  ): Promise<ApiResponse<Transaction[]>> {
    return this.post(`/${id}/split`, { splits });
  }

  // Upload receipt
  async uploadReceipt(id: number, file: File): Promise<ApiResponse<Transaction>> {
    return this.upload(`/${id}/receipt`, file);
  }

  // Delete receipt
  async deleteReceipt(id: number): Promise<ApiResponse<Transaction>> {
    return this.delete(`/${id}/receipt`);
  }
}

export const transactionsService = new TransactionsService();
