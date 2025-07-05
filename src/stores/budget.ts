// src/stores/budget.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface BudgetCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  limit: number;
  spent: number;
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
  // State
  const budgetCategories = ref<BudgetCategory[]>([
    {
      id: 1,
      name: 'Food & Dining',
      icon: 'restaurant',
      color: 'orange',
      limit: 15000,
      spent: 8750.25,
    },
    {
      id: 2,
      name: 'Transportation',
      icon: 'directions_car',
      color: 'blue',
      limit: 8000,
      spent: 4250.8,
    },
    {
      id: 3,
      name: 'Entertainment',
      icon: 'movie',
      color: 'red',
      limit: 3000,
      spent: 2150.75,
    },
    {
      id: 4,
      name: 'Shopping',
      icon: 'shopping_cart',
      color: 'purple',
      limit: 10000,
      spent: 6420.5,
    },
    {
      id: 5,
      name: 'Bills & Utilities',
      icon: 'receipt',
      color: 'green',
      limit: 12000,
      spent: 8900.25,
    },
  ]);

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

  // Actions
  const addBudgetCategory = (category: Omit<BudgetCategory, 'id' | 'spent'>) => {
    const newCategory: BudgetCategory = {
      ...category,
      id: Date.now(),
      spent: 0,
    };
    budgetCategories.value.push(newCategory);
    return newCategory;
  };

  const updateBudgetCategory = (id: number, updates: Partial<BudgetCategory>) => {
    const index = budgetCategories.value.findIndex((category) => category.id === id);
    if (index !== -1) {
      budgetCategories.value[index] = { ...budgetCategories.value[index], ...updates };
      return budgetCategories.value[index];
    }
    return null;
  };

  const deleteBudgetCategory = (id: number) => {
    const index = budgetCategories.value.findIndex((category) => category.id === id);
    if (index !== -1) {
      budgetCategories.value.splice(index, 1);
      return true;
    }
    return false;
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

  const calculateBudgetProgress = (categoryName: string) => {
    const category = budgetCategories.value.find((cat) => cat.name === categoryName);
    if (!category) return 0;
    return Math.min((category.spent / category.limit) * 100, 100);
  };

  return {
    // State
    budgetCategories,
    subscriptions,
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
    // Actions
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
    updateBudgetSpent,
    resetBudgetSpent,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    calculateBudgetProgress,
  };
});
