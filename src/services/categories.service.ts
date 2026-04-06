import { api } from 'src/boot/axios';
import { ApiResponse } from 'src/types/api-client.types';
import {
  CategoriesSummaryResponse,
  Category,
  CategoryFilters,
  CategorySpendingAnalysis,
  CategoryTrend,
  CreateCategoryDto,
  DefaultCategory,
  IconsAndColorsResponse,
  UpdateCategoryDto,
} from 'src/types/category.types';

const BASE = '/categories';

export const categoriesService = {
  async getCategories(params?: CategoryFilters): Promise<ApiResponse<Category[]>> {
    const r = await api.get(BASE, { params });
    return r.data;
  },

  async getCategory(id: number): Promise<ApiResponse<Category>> {
    const r = await api.get(`${BASE}/${id}`);
    return r.data;
  },

  async createCategory(data: CreateCategoryDto): Promise<ApiResponse<Category>> {
    const r = await api.post(BASE, data);
    return r.data;
  },

  async updateCategory(id: number, data: UpdateCategoryDto): Promise<ApiResponse<Category>> {
    const r = await api.put(`${BASE}/${id}`, data);
    return r.data;
  },

  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    const r = await api.delete(`${BASE}/${id}`);
    return r.data;
  },

  async getCategoriesSummary(): Promise<ApiResponse<CategoriesSummaryResponse>> {
    const r = await api.get(`${BASE}/analytics/summary`);
    return r.data;
  },

  async getCategoryTransactions(id: number, params?: {
    start_date?: string;
    end_date?: string;
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse<any>> {
    const r = await api.get(`${BASE}/${id}/transactions`, { params });
    return r.data;
  },

  async getSpendingAnalysis(params?: {
    period?: 'week' | 'month' | 'quarter' | 'year';
    start_date?: string;
    end_date?: string;
    type?: 'income' | 'expense';
  }): Promise<ApiResponse<CategorySpendingAnalysis[]>> {
    const r = await api.get(`${BASE}/analytics/spending-analysis`, { params });
    return r.data;
  },

  async getCategoryTrends(params?: {
    category_ids?: number[];
    period?: 'week' | 'month' | 'quarter' | 'year';
    interval?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<CategoryTrend[]>> {
    const r = await api.get(`${BASE}/analytics/trends`, { params });
    return r.data;
  },

  async getIconsAndColors(): Promise<ApiResponse<IconsAndColorsResponse>> {
    const r = await api.get(`${BASE}/meta/icons-and-colors`);
    return r.data;
  },

  async getDefaults(): Promise<ApiResponse<DefaultCategory[]>> {
    const r = await api.get(`${BASE}/meta/defaults`);
    return r.data;
  },

  async createDefaults(): Promise<ApiResponse<Category[]>> {
    const r = await api.post(`${BASE}/meta/create-defaults`);
    return r.data;
  },

  async bulkUpdate(categories: Array<{
    id: number;
    name?: string;
    icon?: string;
    color?: string;
    budget_amount?: number;
    is_active?: boolean;
  }>): Promise<ApiResponse<void>> {
    const r = await api.put(`${BASE}/bulk/update`, { categories });
    return r.data;
  },

  async reorder(order: Array<{ id: number; sort_order: number }>): Promise<ApiResponse<void>> {
    const r = await api.put(`${BASE}/bulk/reorder`, { order });
    return r.data;
  },

  async mergeCategories(sourceId: number, targetId: number): Promise<ApiResponse<void>> {
    const r = await api.post(`${BASE}/merge`, { source_id: sourceId, target_id: targetId });
    return r.data;
  },
};

export default categoriesService;
