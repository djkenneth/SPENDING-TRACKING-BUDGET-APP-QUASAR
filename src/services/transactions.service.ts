import { ApiClient } from 'src/services/api-client';
import {
  type ApiResponse,
  type LaravelPaginatedResponse,
  type PaginatedResponse,
} from 'src/types/api-client.types';
import {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilters,
  BulkTransactionDto,
  ImportTransactionResult,
  TransactionStatistics,
} from 'src/types/transaction.types';

class TransactionsService extends ApiClient {
  constructor() {
    super('/transactions');
  }

  // Get all transactions
  async getTransactions(
    filters?: TransactionFilters,
  ): Promise<LaravelPaginatedResponse<Transaction>> {
    const response = await this.get('', filters);
    return response;
  }

  // Get single transaction
  async getTransaction(id: number): Promise<ApiResponse<Transaction>> {
    return await this.get(`/${id}`);
  }

  // Create transaction
  async createTransaction(data: CreateTransactionDto): Promise<ApiResponse<Transaction>> {
    return await this.post('', data);
  }

  // Update transaction
  async updateTransaction(
    id: number,
    data: UpdateTransactionDto,
  ): Promise<ApiResponse<Transaction>> {
    return await this.put(`/${id}`, data);
  }

  // Delete transaction
  async deleteTransaction(id: number): Promise<ApiResponse<void>> {
    return await this.delete(`/${id}`);
  }

  // Bulk create transactions
  async bulkCreateTransactions(data: BulkTransactionDto): Promise<ApiResponse<Transaction[]>> {
    return await this.post('/bulk', data);
  }

  // Bulk delete transactions
  async bulkDeleteTransactions(ids: number[]): Promise<ApiResponse<void>> {
    return await this.delete('/bulk', { data: { ids } });
  }

  // Search transactions
  async searchTransactions(
    query: string,
    filters?: TransactionFilters,
  ): Promise<PaginatedResponse<Transaction>> {
    return await this.getPaginated('/search', { ...filters, search: query });
  }

  // Import transactions from CSV
  async importTransactions(file: File): Promise<ApiResponse<ImportTransactionResult>> {
    return await this.upload('/import', file);
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
    return await this.get('/statistics/summary', filters);
  }

  // Get spending by category
  async getSpendingByCategory(
    filters?: TransactionFilters,
  ): Promise<ApiResponse<Array<{ category: string; amount: number; percentage: number }>>> {
    return await this.get('/analytics/spending-by-category', filters);
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
    return await this.get('/analytics/income-vs-expenses', filters);
  }

  // Get recent transactions
  async getRecentTransactions(limit: number = 10): Promise<ApiResponse<Transaction[]>> {
    return await this.get('/recent/list', { limit });
  }

  // Get transaction statistics (additional method for summary)
  async getTransactionStatistics(
    filters?: TransactionFilters,
  ): Promise<ApiResponse<TransactionStatistics>> {
    return await this.get('/statistics/summary', filters);
  }

  // Duplicate transaction
  // async duplicateTransaction(id: number): Promise<ApiResponse<Transaction>> {
  //   return await this.post(`/${id}/duplicate`);
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
    return await this.post(`/${id}/split`, { splits });
  }

  // Upload receipt
  async uploadReceipt(id: number, file: File): Promise<ApiResponse<Transaction>> {
    return await this.upload(`/${id}/receipt`, file);
  }

  // Delete receipt
  async deleteReceipt(id: number): Promise<ApiResponse<Transaction>> {
    return await this.delete(`/${id}/receipt`);
  }
}

export const transactionsService = new TransactionsService();
