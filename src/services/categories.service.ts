import { ApiClient, type ApiResponse, type QueryParams } from './api-client';

// Types
export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon: string;
  color: string;
  parent_id: number | null;
  budget_amount: number;
  is_active: boolean;
  is_system: boolean;
  sort_order: number;
  description?: string;
  created_at: string;
  updated_at: string;
  children?: Category[];
  parent?: Category;
  // Computed fields from API
  total_spent?: number;
  own_spent?: number;
  transaction_count?: number;
  own_transaction_count?: number;
  remaining?: number;
  percentage?: number;
  has_children?: boolean;
}

export interface CreateCategoryDto {
  name: string;
  type: Category['type'];
  icon: string;
  color: string;
  parent_id?: number;
  budget_amount?: number;
  description?: string;
  sort_order?: number;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  is_active?: boolean;
}

export interface CategoryFilters extends QueryParams {
  type?: 'income' | 'expense' | 'both';
  parent_id?: number;
  is_active?: boolean;
  with_budget?: boolean;
  with_spending?: boolean;
  hierarchical?: boolean;
}

export interface CategorySummary {
  total_categories: number;
  total_budget: number;
  total_spent: number;
  total_transactions: number;
  remaining: number;
  percentage_used: number;
}

export interface CategoryWithSpending extends Category {
  total_spent: number;
  own_spent: number;
  percentage: number;
  transaction_count: number;
  own_transaction_count: number;
  remaining: number;
  children: CategoryWithSpending[];
}

export interface CategoriesSummaryResponse {
  summary: CategorySummary;
  categories: CategoryWithSpending[];
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

export interface CategoryIcon {
  name: string;
  label: string;
  category: string;
}

export interface CategoryColor {
  value: string;
  label: string;
}

export interface IconsAndColorsResponse {
  icons: CategoryIcon[];
  colors: CategoryColor[];
}

export interface DefaultCategory {
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  parent?: string;
}

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
