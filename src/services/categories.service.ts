import { ApiResponse } from 'src/types/api-client.types';
import { ApiClient } from 'src/services/api-client';
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

class CategoriesService extends ApiClient {
  constructor() {
    super('/categories');
  }

  // Get all categories
  async getCategories(params?: CategoryFilters): Promise<ApiResponse<Category[]>> {
    return this.get('', params);
  }

  // Get single category
  async getCategory(id: number): Promise<ApiResponse<Category>> {
    return this.get(`/${id}`);
  }

  // Create category
  async createCategory(data: CreateCategoryDto): Promise<ApiResponse<Category>> {
    return this.post('', data);
  }

  // Update category
  async updateCategory(id: number, data: UpdateCategoryDto): Promise<ApiResponse<Category>> {
    return this.put(`/${id}`, data);
  }

  // Delete category
  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    return this.delete(`/${id}`);
  }

  // Get categories summary (for categories page header stats)
  async getCategoriesSummary(): Promise<ApiResponse<CategoriesSummaryResponse>> {
    return this.get('/analytics/summary');
  }

  // Get category transactions
  async getCategoryTransactions(
    id: number,
    params?: {
      start_date?: string;
      end_date?: string;
      per_page?: number;
      page?: number;
    },
  ): Promise<ApiResponse<any>> {
    return this.get(`/${id}/transactions`, params);
  }

  // Get spending analysis
  async getSpendingAnalysis(params?: {
    period?: 'week' | 'month' | 'quarter' | 'year';
    start_date?: string;
    end_date?: string;
    type?: 'income' | 'expense';
  }): Promise<ApiResponse<CategorySpendingAnalysis[]>> {
    return this.get('/analytics/spending-analysis', params);
  }

  // Get category trends
  async getCategoryTrends(params?: {
    category_ids?: number[];
    period?: 'week' | 'month' | 'quarter' | 'year';
    interval?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<CategoryTrend[]>> {
    return this.get('/analytics/trends', params);
  }

  // Get available icons and colors
  async getIconsAndColors(): Promise<ApiResponse<IconsAndColorsResponse>> {
    return this.get('/meta/icons-and-colors');
  }

  // Get default categories
  async getDefaults(): Promise<ApiResponse<DefaultCategory[]>> {
    return this.get('/meta/defaults');
  }

  // Create default categories
  async createDefaults(): Promise<ApiResponse<Category[]>> {
    return this.post('/meta/create-defaults');
  }

  // Bulk update categories
  async bulkUpdate(
    categories: Array<{
      id: number;
      name?: string;
      icon?: string;
      color?: string;
      budget_amount?: number;
      is_active?: boolean;
    }>,
  ): Promise<ApiResponse<void>> {
    return this.put('/bulk/update', { categories });
  }

  // Reorder categories
  async reorder(
    order: Array<{
      id: number;
      sort_order: number;
    }>,
  ): Promise<ApiResponse<void>> {
    return this.put('/bulk/reorder', { order });
  }

  // Merge categories
  async mergeCategories(sourceId: number, targetId: number): Promise<ApiResponse<void>> {
    return this.post('/merge', { source_id: sourceId, target_id: targetId });
  }
}

export const categoriesService = new CategoriesService();
export default categoriesService;
