import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import categoriesService from 'src/services/categories.service';
import {
  Category,
  CategoryColor,
  CategoryFilters,
  CategoryIcon,
  CategorySummary,
  CategoryWithSpending,
  CreateCategoryDto,
  UpdateCategoryDto,
} from 'src/types/category.types';

export const useCategoriesStore = defineStore('categories', () => {
  const $q = useQuasar();

  // State
  const categories = ref<Category[]>([]);
  const hierarchicalCategories = ref<CategoryWithSpending[]>([]);
  const summary = ref<CategorySummary | null>(null);
  const icons = ref<CategoryIcon[]>([]);
  const colors = ref<CategoryColor[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const expandedCategories = ref<Set<number>>(new Set());

  // Computed
  const expenseCategories = computed(() => {
    return categories.value.filter((c) => c.type === 'expense' || c.type === 'both');
  });

  const incomeCategories = computed(() => {
    return categories.value.filter((c) => c.type === 'income' || c.type === 'both');
  });

  const activeCategories = computed(() => {
    return categories.value.filter((c) => c.is_active);
  });

  const rootCategories = computed(() => {
    return hierarchicalCategories.value;
  });

  const totalBudget = computed(() => summary.value?.total_budget || 0);
  const totalSpent = computed(() => summary.value?.total_spent || 0);
  const totalTransactions = computed(() => summary.value?.total_transactions || 0);
  const totalCategories = computed(() => summary.value?.total_categories || 0);

  // Helper functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'red';
    if (percentage >= 90) return 'orange';
    if (percentage >= 75) return 'amber';
    return 'green';
  };

  const isExpanded = (categoryId: number): boolean => {
    return expandedCategories.value.has(categoryId);
  };

  const toggleExpand = (categoryId: number) => {
    if (expandedCategories.value.has(categoryId)) {
      expandedCategories.value.delete(categoryId);
    } else {
      expandedCategories.value.add(categoryId);
    }
  };

  const expandAll = () => {
    hierarchicalCategories.value.forEach((cat) => {
      if (cat.has_children) {
        expandedCategories.value.add(cat.id);
      }
    });
  };

  const collapseAll = () => {
    expandedCategories.value.clear();
  };

  // Actions
  const fetchCategories = async (params?: CategoryFilters) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await categoriesService.getCategories(params);
      if (response.success && response.data) {
        categories.value = response.data;
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch categories');
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch categories';
      $q.notify({
        type: 'negative',
        message: error.value,
        position: 'top',
      });
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchCategoriesSummary = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await categoriesService.getCategoriesSummary();
      if (response.success && response.data) {
        summary.value = response.data.summary;
        hierarchicalCategories.value = response.data.categories;
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch categories summary');
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch categories summary';
      $q.notify({
        type: 'negative',
        message: error.value,
        position: 'top',
      });
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchIconsAndColors = async () => {
    try {
      const response = await categoriesService.getIconsAndColors();
      if (response.success && response.data) {
        icons.value = response.data.icons;
        colors.value = response.data.colors;
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch icons and colors');
    } catch (err: any) {
      console.error('Failed to fetch icons and colors:', err);
      throw err;
    }
  };

  const createCategory = async (data: CreateCategoryDto) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await categoriesService.createCategory(data);
      if (response.success && response.data) {
        categories.value.push(response.data);
        $q.notify({
          type: 'positive',
          message: 'Category created successfully',
          position: 'top',
        });
        // Refresh hierarchical data
        await fetchCategoriesSummary();
        return response.data;
      }
      throw new Error(response.message || 'Failed to create category');
    } catch (err: any) {
      error.value = err.message || 'Failed to create category';
      $q.notify({
        type: 'negative',
        message: error.value,
        position: 'top',
      });
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCategory = async (id: number, data: UpdateCategoryDto) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await categoriesService.updateCategory(id, data);
      if (response.success && response.data) {
        const index = categories.value.findIndex((c) => c.id === id);
        if (index !== -1) {
          categories.value[index] = response.data;
        }
        $q.notify({
          type: 'positive',
          message: 'Category updated successfully',
          position: 'top',
        });
        // Refresh hierarchical data
        await fetchCategoriesSummary();
        return response.data;
      }
      throw new Error(response.message || 'Failed to update category');
    } catch (err: any) {
      error.value = err.message || 'Failed to update category';
      $q.notify({
        type: 'negative',
        message: error.value,
        position: 'top',
      });
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCategory = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await categoriesService.deleteCategory(id);
      if (response.success) {
        categories.value = categories.value.filter((c) => c.id !== id);
        $q.notify({
          type: 'positive',
          message: 'Category deleted successfully',
          position: 'top',
        });
        // Refresh hierarchical data
        await fetchCategoriesSummary();
        return true;
      }
      throw new Error(response.message || 'Failed to delete category');
    } catch (err: any) {
      error.value = err.message || 'Failed to delete category';
      $q.notify({
        type: 'negative',
        message: error.value,
        position: 'top',
      });
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkUpdateCategories = async (
    updates: Array<{
      id: number;
      name?: string;
      icon?: string;
      color?: string;
      budget_amount?: number;
      is_active?: boolean;
    }>,
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await categoriesService.bulkUpdate(updates);
      if (response.success) {
        $q.notify({
          type: 'positive',
          message: 'Categories updated successfully',
          position: 'top',
        });
        // Refresh data
        await fetchCategoriesSummary();
        return true;
      }
      throw new Error(response.message || 'Failed to update categories');
    } catch (err: any) {
      error.value = err.message || 'Failed to update categories';
      $q.notify({
        type: 'negative',
        message: error.value,
        position: 'top',
      });
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const reorderCategories = async (order: Array<{ id: number; sort_order: number }>) => {
    try {
      const response = await categoriesService.reorder(order);
      if (response.success) {
        $q.notify({
          type: 'positive',
          message: 'Categories reordered successfully',
          position: 'top',
        });
        await fetchCategoriesSummary();
        return true;
      }
      throw new Error(response.message || 'Failed to reorder categories');
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.message || 'Failed to reorder categories',
        position: 'top',
      });
      throw err;
    }
  };

  const mergeCategories = async (sourceId: number, targetId: number) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await categoriesService.mergeCategories(sourceId, targetId);
      if (response.success) {
        $q.notify({
          type: 'positive',
          message: 'Categories merged successfully',
          position: 'top',
        });
        await fetchCategoriesSummary();
        return true;
      }
      throw new Error(response.message || 'Failed to merge categories');
    } catch (err: any) {
      error.value = err.message || 'Failed to merge categories';
      $q.notify({
        type: 'negative',
        message: error.value,
        position: 'top',
      });
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createDefaultCategories = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await categoriesService.createDefaults();
      if (response.success && response.data) {
        $q.notify({
          type: 'positive',
          message: 'Default categories created successfully',
          position: 'top',
        });
        await fetchCategoriesSummary();
        return response.data;
      }
      throw new Error(response.message || 'Failed to create default categories');
    } catch (err: any) {
      error.value = err.message || 'Failed to create default categories';
      $q.notify({
        type: 'negative',
        message: error.value,
        position: 'top',
      });
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get category by ID
  const getCategoryById = (id: number): Category | undefined => {
    return categories.value.find((c) => c.id === id);
  };

  // Get parent categories for dropdown
  const getParentCategoryOptions = computed(() => {
    return categories.value
      .filter((c) => !c.parent_id && c.is_active)
      .map((c) => ({
        label: c.name,
        value: c.id,
        icon: c.icon,
        color: c.color,
      }));
  });

  // Initialize categories data
  const initializeCategoriesData = async () => {
    loading.value = true;
    try {
      await Promise.all([fetchCategoriesSummary(), fetchIconsAndColors()]);
    } catch (err) {
      console.error('Failed to initialize categories data:', err);
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    categories,
    hierarchicalCategories,
    summary,
    icons,
    colors,
    loading,
    error,
    expandedCategories,

    // Computed
    expenseCategories,
    incomeCategories,
    activeCategories,
    rootCategories,
    totalBudget,
    totalSpent,
    totalTransactions,
    totalCategories,
    getParentCategoryOptions,

    // Helpers
    formatCurrency,
    getProgressColor,
    isExpanded,
    toggleExpand,
    expandAll,
    collapseAll,
    getCategoryById,

    // Actions
    fetchCategories,
    fetchCategoriesSummary,
    fetchIconsAndColors,
    createCategory,
    updateCategory,
    deleteCategory,
    bulkUpdateCategories,
    reorderCategories,
    mergeCategories,
    createDefaultCategories,
    initializeCategoriesData,
  };
});

export default useCategoriesStore;
