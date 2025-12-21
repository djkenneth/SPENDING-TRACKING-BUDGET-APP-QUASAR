// src/composables/useBudget.ts
import { computed, ref } from 'vue';
import { useBudgetsStore } from 'src/stores/budget';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency } from 'src/utils/currency';
import { useQuasar } from 'quasar';

export const useBudget = () => {
  const budgetStore = useBudgetsStore();
  const settingsStore = useSettingsStore();
  const $q = useQuasar();

  // State for budget operations
  const loading = ref(false);
  const selectedBudget = ref<any>(null);
  const selectedSubscription = ref<any>(null);
  const showBudgetDialog = ref(false);
  const showSubscriptionDialog = ref(false);

  const budgetForm = ref({
    name: '',
    limit: null as number | null,
    icon: 'category',
    color: 'blue',
  });

  const subscriptionForm = ref({
    name: '',
    amount: null as number | null,
    frequency: 'Monthly',
    nextPayment: new Date().toISOString().split('T')[0],
    logo: '',
  });

  // ============================================================================
  // Computed properties - Map new store structure to legacy property names
  // ============================================================================

  // Budget categories from category breakdown
  const budgetCategories = computed(() => {
    return budgetStore.categoryBreakdown.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      limit: cat.budget_amount,
      spent: cat.spent_amount,
      category_id: cat.category_id,
    }));
  });

  // Subscriptions - placeholder since subscriptions are managed separately
  const subscriptions = computed(() => {
    // TODO: Implement subscriptions from bills service when available
    return [];
  });

  // Total budget limit (from monthly budget)
  const totalBudgetLimit = computed(() => {
    return budgetStore.monthlyBudget?.total_budget || 0;
  });

  // Total budget spent (from monthly budget)
  const totalBudgetSpent = computed(() => {
    return budgetStore.monthlyBudget?.total_spent || 0;
  });

  // Budget left (remaining)
  const budgetLeft = computed(() => {
    return budgetStore.monthlyBudget?.remaining || 0;
  });

  // Budget utilization percentage
  const budgetUtilization = computed(() => {
    return budgetStore.budgetUtilization;
  });

  // Over budget categories
  const overBudgetCategories = computed(() => {
    return budgetCategories.value.filter((cat) => cat.spent > cat.limit);
  });

  // Near budget categories (80-100% utilized)
  const nearBudgetCategories = computed(() => {
    return budgetCategories.value.filter((cat) => {
      const utilization = cat.limit > 0 ? (cat.spent / cat.limit) * 100 : 0;
      return utilization >= 80 && utilization < 100;
    });
  });

  // Total monthly subscriptions - placeholder
  const totalMonthlySubscriptions = computed(() => {
    return subscriptions.value
      .filter((sub: any) => sub.frequency === 'Monthly')
      .reduce((total: number, sub: any) => total + (sub.amount || 0), 0);
  });

  // Upcoming subscriptions - placeholder
  const upcomingSubscriptions = computed(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return subscriptions.value.filter((sub: any) => {
      const paymentDate = new Date(sub.nextPayment);
      return paymentDate >= now && paymentDate <= nextWeek;
    });
  });

  // ============================================================================
  // Formatted computed properties
  // ============================================================================

  const formattedBudgetLeft = computed(() => {
    if (!settingsStore.settings.showBalances) {
      return `${settingsStore.settings.currencySymbol}****`;
    }
    return formatCurrency(budgetLeft.value, settingsStore.settings.currency);
  });

  const formattedTotalBudgetLimit = computed(() => {
    if (!settingsStore.settings.showBalances) {
      return `${settingsStore.settings.currencySymbol}****`;
    }
    return formatCurrency(totalBudgetLimit.value, settingsStore.settings.currency);
  });

  const formattedTotalBudgetSpent = computed(() => {
    if (!settingsStore.settings.showBalances) {
      return `${settingsStore.settings.currencySymbol}****`;
    }
    return formatCurrency(totalBudgetSpent.value, settingsStore.settings.currency);
  });

  const formattedTotalMonthlySubscriptions = computed(() => {
    if (!settingsStore.settings.showBalances) {
      return `${settingsStore.settings.currencySymbol}****`;
    }
    return formatCurrency(totalMonthlySubscriptions.value, settingsStore.settings.currency);
  });

  // ============================================================================
  // Options for forms
  // ============================================================================

  const frequencyOptions = computed(() => [
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Yearly', value: 'Yearly' },
    { label: 'Weekly', value: 'Weekly' },
  ]);

  const iconOptions = computed(() => [
    { label: 'Restaurant', value: 'restaurant' },
    { label: 'Car', value: 'directions_car' },
    { label: 'Movie', value: 'movie' },
    { label: 'Shopping', value: 'shopping_cart' },
    { label: 'Receipt', value: 'receipt' },
    { label: 'Hospital', value: 'local_hospital' },
    { label: 'School', value: 'school' },
    { label: 'Work', value: 'work' },
    { label: 'Trending', value: 'trending_up' },
    { label: 'Home', value: 'home' },
    { label: 'Gas Station', value: 'local_gas_station' },
    { label: 'Cafe', value: 'local_cafe' },
    { label: 'Category', value: 'category' },
  ]);

  const colorOptions = computed(() => [
    { label: 'Blue', value: 'blue' },
    { label: 'Red', value: 'red' },
    { label: 'Green', value: 'green' },
    { label: 'Orange', value: 'orange' },
    { label: 'Purple', value: 'purple' },
    { label: 'Cyan', value: 'cyan' },
    { label: 'Pink', value: 'pink' },
    { label: 'Teal', value: 'teal' },
    { label: 'Indigo', value: 'indigo' },
  ]);

  // ============================================================================
  // Methods
  // ============================================================================

  const formatBudgetAmount = (amount: number) => {
    if (!settingsStore.settings.showBalances) {
      return `${settingsStore.settings.currencySymbol}****`;
    }
    return formatCurrency(amount, settingsStore.settings.currency);
  };

  const calculateBudgetProgress = (spent: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((spent / limit) * 100, 100);
  };

  const getBudgetStatus = (spent: number, limit: number) => {
    const progress = calculateBudgetProgress(spent, limit);
    if (progress >= 100) return 'over-budget';
    if (progress >= 80) return 'near-budget';
    return 'on-track';
  };

  const getBudgetStatusColor = (spent: number, limit: number) => {
    const status = getBudgetStatus(spent, limit);
    switch (status) {
      case 'over-budget':
        return 'red';
      case 'near-budget':
        return 'orange';
      default:
        return 'green';
    }
  };

  // ============================================================================
  // Budget Dialog Methods
  // ============================================================================

  const openBudgetDialog = (budget: any = null) => {
    if (budget) {
      budgetForm.value = {
        name: budget.name,
        limit: budget.limit,
        icon: budget.icon,
        color: budget.color,
      };
      selectedBudget.value = budget;
    } else {
      resetBudgetForm();
      selectedBudget.value = null;
    }
    showBudgetDialog.value = true;
  };

  const closeBudgetDialog = () => {
    showBudgetDialog.value = false;
    selectedBudget.value = null;
    resetBudgetForm();
  };

  const resetBudgetForm = () => {
    budgetForm.value = {
      name: '',
      limit: null,
      icon: 'category',
      color: 'blue',
    };
  };

  const validateBudgetForm = () => {
    if (!budgetForm.value.name || !budgetForm.value.limit) {
      return { isValid: false, errors: ['Name and limit are required'] };
    }
    if (budgetForm.value.limit <= 0) {
      return { isValid: false, errors: ['Limit must be greater than 0'] };
    }
    return { isValid: true, errors: [] };
  };

  const saveBudget = async () => {
    loading.value = true;

    try {
      const validation = validateBudgetForm();
      if (!validation.isValid) {
        $q.notify({
          type: 'negative',
          message: validation.errors[0],
          position: 'top',
        });
        return;
      }

      if (selectedBudget.value) {
        // Update existing budget
        await budgetStore.updateBudget(selectedBudget.value.id, {
          amount: budgetForm.value.limit || 0,
        });
        $q.notify({
          type: 'positive',
          message: 'Budget updated successfully',
          position: 'top',
        });
      } else {
        // Create new budget - would need category_id
        $q.notify({
          type: 'info',
          message: 'Please use the Budgets page to create new budgets with category selection',
          position: 'top',
        });
      }

      closeBudgetDialog();
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to save budget',
        position: 'top',
      });
    } finally {
      loading.value = false;
    }
  };

  const deleteBudget = async (budgetId: number) => {
    try {
      await budgetStore.deleteBudget(budgetId);
      $q.notify({
        type: 'positive',
        message: 'Budget deleted successfully',
        position: 'top',
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to delete budget',
        position: 'top',
      });
    }
  };

  const confirmDeleteBudget = (budget: any) => {
    $q.dialog({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete the budget for "${budget.name}"?`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      deleteBudget(budget.id);
    });
  };

  const resetBudgetSpent = (categoryName?: string) => {
    // This would need to be implemented via the API
    $q.notify({
      type: 'info',
      message: categoryName ? `Reset spending for ${categoryName}` : 'Reset all budget spending',
      position: 'top',
    });
  };

  // ============================================================================
  // Subscription Dialog Methods (Placeholders)
  // ============================================================================

  const openSubscriptionDialog = (subscription: any = null) => {
    if (subscription) {
      subscriptionForm.value = {
        name: subscription.name,
        amount: subscription.amount,
        frequency: subscription.frequency,
        nextPayment: new Date(subscription.nextPayment).toISOString().split('T')[0],
        logo: subscription.logo,
      };
      selectedSubscription.value = subscription;
    } else {
      resetSubscriptionForm();
      selectedSubscription.value = null;
    }
    showSubscriptionDialog.value = true;
  };

  const closeSubscriptionDialog = () => {
    showSubscriptionDialog.value = false;
    selectedSubscription.value = null;
    resetSubscriptionForm();
  };

  const resetSubscriptionForm = () => {
    subscriptionForm.value = {
      name: '',
      amount: null,
      frequency: 'Monthly',
      nextPayment: new Date().toISOString().split('T')[0],
      logo: '',
    };
  };

  const saveSubscription = async () => {
    loading.value = true;
    try {
      // TODO: Implement subscription saving via bills service
      $q.notify({
        type: 'info',
        message: 'Subscriptions will be available in a future update',
        position: 'top',
      });
      closeSubscriptionDialog();
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to save subscription',
        position: 'top',
      });
    } finally {
      loading.value = false;
    }
  };

  const deleteSubscription = async (subscriptionId: number) => {
    // TODO: Implement subscription deletion via bills service
    console.log('Delete subscription:', subscriptionId);
  };

  const confirmDeleteSubscription = (subscription: any) => {
    $q.dialog({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete the subscription for "${subscription.name}"?`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      deleteSubscription(subscription.id);
    });
  };

  // ============================================================================
  // Budget Alerts
  // ============================================================================

  const checkBudgetAlerts = () => {
    if (!settingsStore.settings.notifications?.budgetAlerts) return;

    overBudgetCategories.value.forEach((category) => {
      settingsStore.addNotification({
        title: 'Budget Exceeded',
        message: `You've exceeded your ${category.name} budget by ${formatBudgetAmount(category.spent - category.limit)}`,
        icon: 'warning',
        color: 'red',
        type: 'budget',
      });
    });

    nearBudgetCategories.value.forEach((category) => {
      const remaining = category.limit - category.spent;
      settingsStore.addNotification({
        title: 'Budget Warning',
        message: `You're close to your ${category.name} budget limit. ${formatBudgetAmount(remaining)} remaining.`,
        icon: 'warning',
        color: 'orange',
        type: 'budget',
      });
    });
  };

  // ============================================================================
  // Initialize budget data
  // ============================================================================

  const initializeBudgetData = async () => {
    loading.value = true;
    try {
      await budgetStore.initializeBudgetData();
    } catch (error) {
      console.error('Failed to initialize budget data:', error);
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    loading,
    selectedBudget,
    selectedSubscription,
    showBudgetDialog,
    showSubscriptionDialog,
    budgetForm,
    subscriptionForm,

    // Computed - Legacy property names for backward compatibility
    budgetCategories,
    subscriptions,
    totalBudgetLimit,
    totalBudgetSpent,
    budgetLeft,
    budgetUtilization,
    overBudgetCategories,
    nearBudgetCategories,
    totalMonthlySubscriptions,
    upcomingSubscriptions,
    formattedBudgetLeft,
    formattedTotalBudgetLimit,
    formattedTotalBudgetSpent,
    formattedTotalMonthlySubscriptions,
    frequencyOptions,
    iconOptions,
    colorOptions,

    // Methods
    formatBudgetAmount,
    calculateBudgetProgress,
    getBudgetStatus,
    getBudgetStatusColor,
    openBudgetDialog,
    closeBudgetDialog,
    resetBudgetForm,
    validateBudgetForm,
    saveBudget,
    deleteBudget,
    confirmDeleteBudget,
    resetBudgetSpent,
    openSubscriptionDialog,
    closeSubscriptionDialog,
    resetSubscriptionForm,
    saveSubscription,
    deleteSubscription,
    confirmDeleteSubscription,
    checkBudgetAlerts,
    initializeBudgetData,
  };
};

export default useBudget;
