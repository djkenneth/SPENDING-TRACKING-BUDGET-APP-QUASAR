import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import budgetsService from 'src/services/budgets.service';
import {
  AlertConfig,
  Budget,
  BudgetComparison,
  BudgetFilters,
  CategoryBreakdown,
  CreateBudgetDto,
  CurrentBudgetsResponse,
  SpendingVelocity,
  UpdateBudgetDto,
} from 'src/types/budget.types';

export const useBudgetsStore = defineStore('budgets', () => {
  const $q = useQuasar();

  // State
  const budgets = ref<Budget[]>([]);
  const currentBudgets = ref<CurrentBudgetsResponse | null>(null);
  const categoryBreakdown = ref<CategoryBreakdown[]>([]);
  const spendingVelocity = ref<SpendingVelocity | null>(null);
  const alertConfig = ref<AlertConfig | null>(null);
  const comparison = ref<BudgetComparison[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const monthlyBudget = computed(() => currentBudgets.value?.monthly || null);
  const quarterlyBudget = computed(() => currentBudgets.value?.quarterly || null);
  const yearlyBudget = computed(() => currentBudgets.value?.yearly || null);

  const totalBudgeted = computed(() => {
    if (!monthlyBudget.value) return 0;
    return monthlyBudget.value.total_budget;
  });

  const totalSpent = computed(() => {
    if (!monthlyBudget.value) return 0;
    return monthlyBudget.value.total_spent;
  });

  const totalRemaining = computed(() => totalBudgeted.value - totalSpent.value);

  const budgetUtilization = computed(() => {
    if (totalBudgeted.value === 0) return 0;
    return (totalSpent.value / totalBudgeted.value) * 100;
  });

  const overBudgetCategories = computed(() => {
    return categoryBreakdown.value.filter((c) => c.status === 'over_budget');
  });

  const nearLimitCategories = computed(() => {
    return categoryBreakdown.value.filter((c) => c.status === 'near_limit');
  });

  const onTrackCategories = computed(() => {
    return categoryBreakdown.value.filter((c) => c.status === 'on_track');
  });

  // Helper functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getBudgetStatusColor = (percentage: number): string => {
    if (percentage >= 100) return 'negative';
    if (percentage >= 90) return 'warning';
    if (percentage >= 75) return 'orange';
    return 'positive';
  };

  const getBudgetStatus = (percentage: number): string => {
    if (percentage >= 100) return 'Over Budget';
    if (percentage >= 90) return 'Near Limit';
    if (percentage >= 75) return 'Caution';
    return 'On Track';
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'red';
    if (percentage >= 90) return 'orange';
    if (percentage >= 75) return 'amber';
    return 'green';
  };

  // Actions
  const fetchBudgets = async (params?: BudgetFilters) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await budgetsService.getBudgets(params);
      if (response.success && response.data) {
        budgets.value = response.data;
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch budgets');
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch budgets';
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

  const fetchCurrentBudgets = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await budgetsService.getCurrentBudgets();
      if (response.success && response.data) {
        currentBudgets.value = response.data;
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch current budgets');
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch current budgets';
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

  const fetchCategoryBreakdown = async (period: 'monthly' | 'quarterly' | 'yearly' = 'monthly') => {
    loading.value = true;
    error.value = null;

    try {
      const response = await budgetsService.getCategoryBreakdown({ period });
      if (response.success && response.data) {
        categoryBreakdown.value = response.data;
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch category breakdown');
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch category breakdown';
      console.error('Failed to fetch category breakdown:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSpendingVelocity = async (period: 'monthly' | 'quarterly' | 'yearly' = 'monthly') => {
    try {
      const response = await budgetsService.getSpendingVelocity({ period });
      if (response.success && response.data) {
        spendingVelocity.value = response.data;
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch spending velocity');
    } catch (err: any) {
      console.error('Failed to fetch spending velocity:', err);
      throw err;
    }
  };

  const fetchComparison = async (
    period: 'monthly' | 'quarterly' | 'yearly' = 'monthly',
    limit = 6,
  ) => {
    try {
      const response = await budgetsService.getComparison({ period, limit });
      if (response.success && response.data) {
        comparison.value = response.data.comparison;
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch budget comparison');
    } catch (err: any) {
      console.error('Failed to fetch budget comparison:', err);
      throw err;
    }
  };

  const fetchAlertConfig = async () => {
    try {
      const response = await budgetsService.getAlertConfig();
      if (response.success && response.data) {
        alertConfig.value = response.data;
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch alert config');
    } catch (err: any) {
      console.error('Failed to fetch alert config:', err);
      throw err;
    }
  };

  const createBudget = async (data: CreateBudgetDto) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await budgetsService.createBudget(data);
      if (response.success && response.data) {
        budgets.value.push(response.data);
        $q.notify({
          type: 'positive',
          message: 'Budget created successfully',
          position: 'top',
        });
        // Refresh data
        await fetchCurrentBudgets();
        await fetchCategoryBreakdown();
        return response.data;
      }
      throw new Error(response.message || 'Failed to create budget');
    } catch (err: any) {
      error.value = err.message || 'Failed to create budget';
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

  const updateBudget = async (id: number, data: UpdateBudgetDto) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await budgetsService.updateBudget(id, data);
      if (response.success && response.data) {
        const index = budgets.value.findIndex((b) => b.id === id);
        if (index !== -1) {
          budgets.value[index] = response.data;
        }
        $q.notify({
          type: 'positive',
          message: 'Budget updated successfully',
          position: 'top',
        });
        // Refresh data
        await fetchCurrentBudgets();
        await fetchCategoryBreakdown();
        return response.data;
      }
      throw new Error(response.message || 'Failed to update budget');
    } catch (err: any) {
      error.value = err.message || 'Failed to update budget';
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

  const deleteBudget = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await budgetsService.deleteBudget(id);
      if (response.success) {
        budgets.value = budgets.value.filter((b) => b.id !== id);
        $q.notify({
          type: 'positive',
          message: 'Budget deleted successfully',
          position: 'top',
        });
        // Refresh data
        await fetchCurrentBudgets();
        await fetchCategoryBreakdown();
        return true;
      }
      throw new Error(response.message || 'Failed to delete budget');
    } catch (err: any) {
      error.value = err.message || 'Failed to delete budget';
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

  const applyQuickAdjustment = async (
    percentage: number,
    period?: 'monthly' | 'quarterly' | 'yearly',
    categoryIds?: number[],
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await budgetsService.quickAdjust({
        percentage,
        period,
        category_ids: categoryIds,
      });
      if (response.success) {
        $q.notify({
          type: 'positive',
          message: `Successfully adjusted ${response.data?.adjusted_count} budgets by ${percentage}%`,
          position: 'top',
        });
        // Refresh data
        await fetchCurrentBudgets();
        await fetchCategoryBreakdown();
        return response.data;
      }
      throw new Error(response.message || 'Failed to apply adjustment');
    } catch (err: any) {
      error.value = err.message || 'Failed to apply adjustment';
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

  const updateAlertConfig = async (config: Partial<AlertConfig>) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await budgetsService.updateAlertConfig(config);
      if (response.success && response.data) {
        alertConfig.value = { ...alertConfig.value, ...response.data } as AlertConfig;
        $q.notify({
          type: 'positive',
          message: 'Alert configuration updated successfully',
          position: 'top',
        });
        return response.data;
      }
      throw new Error(response.message || 'Failed to update alert config');
    } catch (err: any) {
      error.value = err.message || 'Failed to update alert config';
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

  const resetBudget = async (
    id: number,
    data: {
      start_date: string;
      end_date: string;
      carry_over_unused?: boolean;
      reset_spent?: boolean;
    },
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await budgetsService.resetBudget(id, data);
      if (response.success && response.data) {
        const index = budgets.value.findIndex((b) => b.id === id);
        if (index !== -1) {
          budgets.value[index] = response.data;
        }
        $q.notify({
          type: 'positive',
          message: 'Budget reset successfully',
          position: 'top',
        });
        await fetchCurrentBudgets();
        return response.data;
      }
      throw new Error(response.message || 'Failed to reset budget');
    } catch (err: any) {
      error.value = err.message || 'Failed to reset budget';
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

  // const exportBudgets = async () => {
  //   try {
  //     const blob = await budgetsService.exportBudgets();
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = `budgets_export_${new Date().toISOString().split('T')[0]}.csv`;
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     window.URL.revokeObjectURL(url);

  //     $q.notify({
  //       type: 'positive',
  //       message: 'Budgets exported successfully',
  //       position: 'top',
  //     });
  //   } catch (err: any) {
  //     $q.notify({
  //       type: 'negative',
  //       message: 'Failed to export budgets',
  //       position: 'top',
  //     });
  //     throw err;
  //   }
  // };

  // Initialize all budget data
  const initializeBudgetData = async () => {
    loading.value = true;
    try {
      await Promise.all([
        fetchCurrentBudgets(),
        fetchCategoryBreakdown(),
        fetchSpendingVelocity(),
        // fetchAlertConfig(),     // disabled: /budgets/alerts/config not implemented yet
        // fetchComparison(),      // disabled: /budgets/analytics/comparison not implemented yet
      ]);
    } catch (err) {
      console.error('Failed to initialize budget data:', err);
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    budgets,
    currentBudgets,
    categoryBreakdown,
    spendingVelocity,
    alertConfig,
    comparison,
    loading,
    error,

    // Computed
    monthlyBudget,
    quarterlyBudget,
    yearlyBudget,
    totalBudgeted,
    totalSpent,
    totalRemaining,
    budgetUtilization,
    overBudgetCategories,
    nearLimitCategories,
    onTrackCategories,

    // Helpers
    formatCurrency,
    getBudgetStatusColor,
    getBudgetStatus,
    getProgressColor,

    // Actions
    fetchBudgets,
    fetchCurrentBudgets,
    fetchCategoryBreakdown,
    fetchSpendingVelocity,
    fetchComparison,
    fetchAlertConfig,
    createBudget,
    updateBudget,
    deleteBudget,
    applyQuickAdjustment,
    updateAlertConfig,
    resetBudget,
    // exportBudgets,
    initializeBudgetData,
  };
});

export default useBudgetsStore;
