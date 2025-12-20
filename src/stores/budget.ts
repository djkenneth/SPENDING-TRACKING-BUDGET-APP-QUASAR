// src/stores/budget.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { categoriesService, type Category } from 'src/services/categories.service';
import { transactionsService } from 'src/services/transactions.service';
import { useQuasar } from 'quasar';

export interface BudgetCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  limit: number;
  spent: number;
  category_id: number;
  type: 'income' | 'expense' | 'both';
}

export interface Subscription {
  id: number;
  name: string;
  amount: number;
  frequency: 'Monthly' | 'Yearly' | 'Weekly';
  nextPayment: Date;
  logo: string;
}

export const useBudgetStore = defineStore('budget', () => {
  const $q = useQuasar();

  // State
  const budgetCategories = ref<BudgetCategory[]>([]);
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const subscriptions = ref<Subscription[]>([
    {
      id: 1,
      name: 'Netflix',
      amount: 549.0,
      frequency: 'Monthly',
      nextPayment: new Date('2025-07-26'),
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0UwMDkxNCIvPgo8L3N2Zz4=',
    },
    {
      id: 2,
      name: 'Spotify',
      amount: 149.0,
      frequency: 'Monthly',
      nextPayment: new Date('2025-07-15'),
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzFEQjk1NCIvPgo8L3N2Zz4=',
    },
    {
      id: 3,
      name: 'Adobe Creative Cloud',
      amount: 2680.0,
      frequency: 'Monthly',
      nextPayment: new Date('2025-07-10'),
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0ZGMDAwMCIvPgo8L3N2Zz4=',
    },
  ]);

  // Getters
  const totalBudgetLimit = computed(() => {
    return budgetCategories.value.reduce((total, category) => total + category.limit, 0);
  });

  const totalBudgetSpent = computed(() => {
    return budgetCategories.value.reduce((total, category) => total + category.spent, 0);
  });

  const budgetLeft = computed(() => {
    return totalBudgetLimit.value - totalBudgetSpent.value;
  });

  const budgetUtilization = computed(() => {
    if (totalBudgetLimit.value === 0) return 0;
    return (totalBudgetSpent.value / totalBudgetLimit.value) * 100;
  });

  const overBudgetCategories = computed(() => {
    return budgetCategories.value.filter((category) => category.spent > category.limit);
  });

  const nearBudgetCategories = computed(() => {
    return budgetCategories.value.filter((category) => {
      const utilization = (category.spent / category.limit) * 100;
      return utilization >= 80 && utilization <= 100;
    });
  });

  const totalMonthlySubscriptions = computed(() => {
    return subscriptions.value
      .filter((sub) => sub.frequency === 'Monthly')
      .reduce((total, sub) => total + sub.amount, 0);
  });

  const upcomingSubscriptions = computed(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return subscriptions.value.filter((sub) => {
      const paymentDate = new Date(sub.nextPayment);
      return paymentDate >= now && paymentDate <= nextWeek;
    });
  });

  const getBudgetByCategory = computed(() => {
    return (categoryName: string) => {
      return budgetCategories.value.find((budget) => budget.name === categoryName);
    };
  });

  // Actions - Fetch Categories
  const fetchCategories = async (params?: { type?: 'expense' | 'income' | 'both' }) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await categoriesService.getCategories(params);

      if (response.success && response.data) {
        categories.value = response.data;

        budgetCategories.value = response.data.map((cat) => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          limit: cat.budget_amount || 0,
          spent: cat.total_spent || 0,
          category_id: cat.id,
          type: cat.type,
        }));

        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch categories');
      }
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

  // Fetch category with spending data
  // const fetchCategoryWithSpending = async (categoryId: number, params?: { date_from?: string; date_to?: number }) => {
  //   try {
  //     const response = await categoriesService.getCategoryStatistics(categoryId, params);

  //     if (response.success && response.data) {
  //       // Update the spent amount for the category
  //       const budgetIndex = budgetCategories.value.findIndex(b => b.category_id === categoryId);
  //       if (budgetIndex !== -1) {
  //         budgetCategories.value[budgetIndex].spent = response.data.total_amount || 0;
  //       }

  //       return response.data;
  //     }
  //   } catch (err: any) {
  //     console.error('Failed to fetch category spending:', err);
  //   }
  // };

  // Refresh all budget spending data
  // const refreshBudgetSpending = async (params?: { month?: string; year?: number }) => {
  //   loading.value = true;

  //   try {
  //     const promises = budgetCategories.value.map(budget =>
  //       fetchCategoryWithSpending(budget.category_id, params)
  //     );

  //     await Promise.all(promises);

  //     $q.notify({
  //       type: 'positive',
  //       message: 'Budget spending data refreshed',
  //       position: 'top',
  //     });
  //   } catch (err: any) {
  //     $q.notify({
  //       type: 'negative',
  //       message: 'Failed to refresh budget data',
  //       position: 'top',
  //     });
  //   } finally {
  //     loading.value = false;
  //   }
  // };

  // Actions - Budget Category Management
  const addBudgetCategory = async (
    category: Omit<BudgetCategory, 'id' | 'spent' | 'category_id'>,
  ) => {
    loading.value = true;

    try {
      // Create category with budget amount
      const response = await categoriesService.createCategory({
        name: category.name,
        type: category.type || 'expense',
        icon: category.icon,
        color: category.color,
        budget_amount: category.limit,
      });

      if (response.success && response.data) {
        const newBudgetCategory: BudgetCategory = {
          id: response.data.id,
          name: response.data.name,
          icon: response.data.icon,
          color: response.data.color,
          limit: response.data.budget_amount || 0,
          spent: 0,
          category_id: response.data.id,
          type: response.data.type,
        };

        budgetCategories.value.push(newBudgetCategory);
        categories.value.push(response.data);

        $q.notify({
          type: 'positive',
          message: 'Budget category created successfully',
          position: 'top',
        });

        return newBudgetCategory;
      } else {
        throw new Error(response.message || 'Failed to create category');
      }
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.message || 'Failed to create budget category',
        position: 'top',
      });
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateBudgetCategory = async (id: number, updates: Partial<BudgetCategory>) => {
    loading.value = true;

    try {
      const response = await categoriesService.updateCategory(id, {
        name: updates.name,
        icon: updates.icon,
        color: updates.color,
        budget_amount: updates.limit,
      });

      if (response.success && response.data) {
        const index = budgetCategories.value.findIndex((category) => category.category_id === id);
        if (index !== -1) {
          budgetCategories.value[index] = {
            ...budgetCategories.value[index],
            name: response.data.name,
            icon: response.data.icon,
            color: response.data.color,
            limit: response.data.budget_amount || 0,
          };

          $q.notify({
            type: 'positive',
            message: 'Budget category updated successfully',
            position: 'top',
          });

          return budgetCategories.value[index];
        }
      } else {
        throw new Error(response.message || 'Failed to update category');
      }
      return null;
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.message || 'Failed to update budget category',
        position: 'top',
      });
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteBudgetCategory = async (categoryId: number) => {
    loading.value = true;

    try {
      const response = await categoriesService.deleteCategory(categoryId);

      if (response.success) {
        const index = budgetCategories.value.findIndex(
          (category) => category.category_id === categoryId,
        );
        if (index !== -1) {
          budgetCategories.value.splice(index, 1);

          $q.notify({
            type: 'positive',
            message: 'Budget category deleted successfully',
            position: 'top',
          });

          return true;
        }
      } else {
        throw new Error(response.message || 'Failed to delete category');
      }
      return false;
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.message || 'Failed to delete budget category',
        position: 'top',
      });
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateBudgetSpent = (categoryName: string, amount: number) => {
    const category = budgetCategories.value.find((cat) => cat.name === categoryName);
    if (category) {
      category.spent += amount;
    }
  };

  const resetBudgetSpent = (categoryName?: string) => {
    if (categoryName) {
      const category = budgetCategories.value.find((cat) => cat.name === categoryName);
      if (category) {
        category.spent = 0;
      }
    } else {
      budgetCategories.value.forEach((category) => {
        category.spent = 0;
      });
    }
  };

  // Actions - Subscription Management
  const addSubscription = (subscription: Omit<Subscription, 'id'>) => {
    const newSubscription: Subscription = {
      ...subscription,
      id: Date.now(),
    };
    subscriptions.value.push(newSubscription);
    return newSubscription;
  };

  const updateSubscription = (id: number, updates: Partial<Subscription>) => {
    const index = subscriptions.value.findIndex((sub) => sub.id === id);
    if (index !== -1) {
      subscriptions.value[index] = { ...subscriptions.value[index], ...updates };
      return subscriptions.value[index];
    }
    return null;
  };

  const deleteSubscription = (id: number) => {
    const index = subscriptions.value.findIndex((sub) => sub.id === id);
    if (index !== -1) {
      subscriptions.value.splice(index, 1);
      return true;
    }
    return false;
  };

  // Utility functions
  const calculateBudgetProgress = (categoryName: string) => {
    const category = budgetCategories.value.find((cat) => cat.name === categoryName);
    if (!category) return 0;
    return Math.min((category.spent / category.limit) * 100, 100);
  };

  const formatBudgetAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const getBudgetStatus = (spent: number, limit: number): string => {
    const progress = (spent / limit) * 100;
    if (progress >= 100) return 'text-negative';
    if (progress >= 80) return 'text-warning';
    return 'text-positive';
  };

  const getBudgetStatusColor = (spent: number, limit: number): string => {
    const progress = (spent / limit) * 100;
    if (progress >= 100) return 'negative';
    if (progress >= 80) return 'warning';
    return 'positive';
  };

  return {
    // State
    budgetCategories,
    categories,
    subscriptions,
    loading,
    error,

    // Getters
    totalBudgetLimit,
    totalBudgetSpent,
    budgetLeft,
    budgetUtilization,
    overBudgetCategories,
    nearBudgetCategories,
    totalMonthlySubscriptions,
    upcomingSubscriptions,
    getBudgetByCategory,

    // Actions - Data Fetching
    fetchCategories,
    // fetchCategoryWithSpending,
    // refreshBudgetSpending,

    // Actions - Budget Management
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
    updateBudgetSpent,
    resetBudgetSpent,

    // Actions - Subscription Management
    addSubscription,
    updateSubscription,
    deleteSubscription,

    // Utilities
    calculateBudgetProgress,
    formatBudgetAmount,
    getBudgetStatus,
    getBudgetStatusColor,
  };
});
