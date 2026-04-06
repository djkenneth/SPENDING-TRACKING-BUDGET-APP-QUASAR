import { api } from 'src/boot/axios';
import {
  type ApiResponse,
  type LaravelPaginatedResponse,
  type PaginatedResponse,
} from 'src/types/api-client.types';
import {
  Transaction,
  CreateTransactionDto,
  CreateFavoriteTransactionDto,
  FavoriteTransaction,
  UpdateTransactionDto,
  TransactionFilters,
  BulkTransactionDto,
  ImportTransactionResult,
  TransactionStatistics,
} from 'src/types/transaction.types';

const BASE = '/transactions';

export const transactionsService = {
  async getTransactions(filters?: TransactionFilters): Promise<LaravelPaginatedResponse<Transaction>> {
    const r = await api.get(BASE, { params: filters });
    return r.data;
  },

  async getTransaction(id: number): Promise<ApiResponse<Transaction>> {
    const r = await api.get(`${BASE}/${id}`);
    return r.data;
  },

  async createTransaction(data: CreateTransactionDto): Promise<ApiResponse<Transaction>> {
    const r = await api.post(BASE, data);
    return r.data;
  },

  async updateTransaction(id: number, data: UpdateTransactionDto): Promise<ApiResponse<Transaction>> {
    const r = await api.put(`${BASE}/${id}`, data);
    return r.data;
  },

  async deleteTransaction(id: number): Promise<ApiResponse<void>> {
    const r = await api.delete(`${BASE}/${id}`);
    return r.data;
  },

  async bulkCreateTransactions(data: BulkTransactionDto): Promise<ApiResponse<Transaction[]>> {
    const r = await api.post(`${BASE}/bulk`, data);
    return r.data;
  },

  async bulkDeleteTransactions(ids: number[]): Promise<ApiResponse<void>> {
    const r = await api.delete(`${BASE}/bulk`, { data: { ids } });
    return r.data;
  },

  async searchTransactions(query: string, filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const r = await api.get(`${BASE}/search`, { params: { ...filters, search: query } });
    const d = r.data;
    if (d.success !== undefined) {
      return { data: d.data, meta: { ...d.meta, links: [], path: '' }, links: { first: '', last: '', prev: null, next: null } };
    }
    return d;
  },

  async importTransactions(file: File): Promise<ApiResponse<ImportTransactionResult>> {
    const formData = new FormData();
    formData.append('file', file);
    const r = await api.post(`${BASE}/import`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return r.data;
  },

  async exportTransactions(filters?: TransactionFilters): Promise<Blob> {
    const r = await api.get(`${BASE}/export`, { params: filters, responseType: 'blob' });
    return r.data;
  },

  async getStatistics(filters?: TransactionFilters): Promise<ApiResponse<TransactionStatistics>> {
    const r = await api.get(`${BASE}/statistics/summary`, { params: filters });
    return r.data;
  },

  async getSpendingByCategory(filters?: TransactionFilters): Promise<ApiResponse<Array<{ category: string; amount: number; percentage: number }>>> {
    const r = await api.get(`${BASE}/analytics/spending-by-category`, { params: filters });
    return r.data;
  },

  async getIncomeVsExpenses(filters?: TransactionFilters): Promise<ApiResponse<Array<{ date: string; income: number; expenses: number; net: number }>>> {
    const r = await api.get(`${BASE}/analytics/income-vs-expenses`, { params: filters });
    return r.data;
  },

  async getRecentTransactions(limit = 10): Promise<ApiResponse<Transaction[]>> {
    const r = await api.get(`${BASE}/recent/list`, { params: { limit } });
    return r.data;
  },

  async getTransactionStatistics(filters?: TransactionFilters): Promise<ApiResponse<TransactionStatistics>> {
    const r = await api.get(`${BASE}/statistics/summary`, { params: filters });
    return r.data;
  },

  async splitTransaction(
    id: number,
    splits: Array<{ amount: number; category_id: number; description?: string }>,
  ): Promise<ApiResponse<Transaction[]>> {
    const r = await api.post(`${BASE}/${id}/split`, { splits });
    return r.data;
  },

  async uploadReceipt(id: number, file: File): Promise<ApiResponse<Transaction>> {
    const formData = new FormData();
    formData.append('file', file);
    const r = await api.post(`${BASE}/${id}/receipt`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return r.data;
  },

  async deleteReceipt(id: number): Promise<ApiResponse<Transaction>> {
    const r = await api.delete(`${BASE}/${id}/receipt`);
    return r.data;
  },

  async getFavorites(): Promise<ApiResponse<FavoriteTransaction[]>> {
    const r = await api.get(`${BASE}/favorites`);
    return r.data;
  },

  async saveFavorite(data: CreateFavoriteTransactionDto): Promise<ApiResponse<FavoriteTransaction>> {
    const r = await api.post(`${BASE}/favorites`, data);
    return r.data;
  },

  async deleteFavorite(id: number): Promise<ApiResponse<void>> {
    const r = await api.delete(`${BASE}/favorites/${id}`);
    return r.data;
  },
};
