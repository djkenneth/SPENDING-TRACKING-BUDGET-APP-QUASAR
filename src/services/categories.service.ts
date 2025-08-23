import { ApiClient, type ApiResponse, type QueryParams } from './api-client';

// Types
export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon: string;
  color: string;
  parent_id?: number;
  budget_amount?: number;
  is_active: boolean;
  is_system: boolean;
  order?: number;
  description?: string;
  created_at: string;
  updated_at: string;
  children?: Category[];
  parent?: Category;
  transactions_count?: number;
  total_spent?: number;
}

export interface CreateCategoryDto {
  name: string;
  type: Category['type'];
  icon: string;
  color: string;
  parent_id?: number;
  budget_amount?: number;
  description?: string;
  order?: number;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  is_active?: boolean;
}

export interface CategorySpendingAnalysis {
  category: Category;
  current_month: {
    spent: number;
    budget: number;
    percentage: number;
    transaction_count: number;
  };
  last_month: {
    spent: number;
    budget: number;
    percentage: number;
    transaction_count: number;
  };
  average_monthly: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  trend_percentage: number;
}

export interface CategoryTrend {
  category_id: number;
  category_name: string;
  data: Array<{
    date: string;
    amount: number;
    transaction_count: number;
  }>;
}

export interface CategoryIconsColors {
  icons: Array<{
    name: string;
    label: string;
    category: string;
  }>;
  colors: Array<{
    value: string;
    label: string;
  }>;
}

class CategoriesService extends ApiClient {
  constructor() {
    super('/categories');
  }

  // Get all categories
  async getCategories(params?: QueryParams): Promise<ApiResponse<Category[]>> {
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

  // Get category transactions
  async getCategoryTransactions(id: number, params?: QueryParams): Promise<any> {
    return this.getPaginated(`/${id}/transactions`, params);
  }

  // Get spending analysis
  async getSpendingAnalysis(
    params?: QueryParams,
  ): Promise<ApiResponse<CategorySpendingAnalysis[]>> {
    return this.get('/analytics/spending-analysis', params);
  }

  // Get category trends
  async getCategoryTrends(params?: {
    category_ids?: number[];
    date_from?: string;
    date_to?: string;
    interval?: 'daily' | 'weekly' | 'monthly';
  }): Promise<ApiResponse<CategoryTrend[]>> {
    return this.get('/analytics/trends', params);
  }

  // Bulk update categories
  async bulkUpdateCategories(
    categories: Array<{ id: number } & UpdateCategoryDto>,
  ): Promise<ApiResponse<Category[]>> {
    return this.put('/bulk/update', { categories });
  }

  // Reorder categories
  async reorderCategories(
    categories: Array<{ id: number; order: number }>,
  ): Promise<ApiResponse<void>> {
    return this.put('/bulk/reorder', { categories });
  }

  // Merge categories
  async mergeCategories(data: {
    source_category_id: number;
    target_category_id: number;
    delete_source?: boolean;
  }): Promise<ApiResponse<Category>> {
    return this.post('/merge', data);
  }

  // Get icons and colors
  async getIconsAndColors(): Promise<ApiResponse<CategoryIconsColors>> {
    return this.get('/meta/icons-and-colors');
  }

  // Get default categories
  async getDefaultCategories(): Promise<ApiResponse<Category[]>> {
    return this.get('/meta/defaults');
  }

  // Create default categories for user
  async createDefaultCategories(): Promise<ApiResponse<Category[]>> {
    return this.post('/meta/create-defaults');
  }

  // Get category statistics
  async getCategoryStatistics(
    id: number,
    params?: {
      date_from?: string;
      date_to?: string;
    },
  ): Promise<
    ApiResponse<{
      total_transactions: number;
      total_amount: number;
      average_transaction: number;
      largest_transaction: number;
      monthly_average: number;
    }>
  > {
    return this.get(`/${id}/statistics`, params);
  }

  // Get category budget performance
  async getBudgetPerformance(
    id: number,
    params?: {
      month?: string;
      year?: number;
    },
  ): Promise<
    ApiResponse<{
      budget: number;
      spent: number;
      remaining: number;
      percentage: number;
      projected: number;
      status: 'under' | 'on-track' | 'over';
    }>
  > {
    return this.get(`/${id}/budget-performance`, params);
  }
}

export const categoriesService = new CategoriesService();
