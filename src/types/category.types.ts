import { QueryParams } from './api-client.types';

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
