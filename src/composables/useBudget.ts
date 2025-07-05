// src/composables/useBudget.ts
import { computed, ref } from 'vue';
import { useBudgetStore } from 'src/stores/budget';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency } from 'src/utils/currency';
import { validateBudget } from 'src/utils/validators';
import { useQuasar } from 'quasar';

export const useBudget = () => {
  const budgetStore = useBudgetStore();
  const settingsStore = useSettingsStore();
  const $q = useQuasar();

  // State for budget operations
  const loading = ref(false);
  const selectedBudget = ref(null);
  const selectedSubscription = ref(null);
  const showBudgetDialog = ref(false);
  const showSubscriptionDialog = ref(false);

  const budgetForm = ref({
    name: '',
    limit: null,
    icon: 'category',
    color: 'blue',
  });

  const subscriptionForm = ref({
    name: '',
    amount: null,
    frequency: 'Monthly',
    nextPayment: new Date().toISOString().split('T')[0],
    logo: '',
  });

  // Computed properties
  const budgetCategories = computed(() => budgetStore.budgetCategories);
  const subscriptions = computed(() => budgetStore.subscriptions);
  const totalBudgetLimit = computed(() => budgetStore.totalBudgetLimit);
  const totalBudgetSpent = computed(() => budgetStore.totalBudgetSpent);
  const budgetLeft = computed(() => budgetStore.budgetLeft);
  const budgetUtilization = computed(() => budgetStore.budgetUtilization);
  const overBudgetCategories = computed(() => budgetStore.overBudgetCategories);
  const nearBudgetCategories = computed(() => budgetStore.nearBudgetCategories);
  const totalMonthlySubscriptions = computed(() => budgetStore.totalMonthlySubscriptions);
  const upcomingSubscriptions = computed(() => budgetStore.upcomingSubscriptions);

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

  // Methods
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

  const openBudgetDialog = (budget: any = null) => {
    if (budget) {
      // Edit mode
      budgetForm.value = {
        name: budget.name,
        limit: budget.limit,
        icon: budget.icon,
        color: budget.color,
      };
      selectedBudget.value = budget;
    } else {
      // Add mode
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
    return validateBudget({
      name: budgetForm.value.name,
      limit: budgetForm.value.limit || 0,
      category: budgetForm.value.name,
    });
  };

  const saveBudget = async () => {
    loading.value = true;

    try {
      const validation = validateBudgetForm();
      if (!validation.isValid) {
        $q.notify({
          type: 'negative',
          message: validation.errors.join(', '),
          position: 'top',
        });
        return;
      }

      const budgetData = {
        name: budgetForm.value.name,
        limit: budgetForm.value.limit || 0,
        icon: budgetForm.value.icon,
        color: budgetForm.value.color,
      };

      if (selectedBudget.value) {
        // Update existing budget
        budgetStore.updateBudgetCategory(selectedBudget.value.id, budgetData);
        $q.notify({
          type: 'positive',
          message: 'Budget updated successfully',
          position: 'top',
        });
      } else {
        // Add new budget
        budgetStore.addBudgetCategory(budgetData);
        $q.notify({
          type: 'positive',
          message: 'Budget added successfully',
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
      const success = budgetStore.deleteBudgetCategory(budgetId);
      if (success) {
        $q.notify({
          type: 'positive',
          message: 'Budget deleted successfully',
          position: 'top',
        });
      }
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
    budgetStore.resetBudgetSpent(categoryName);
    $q.notify({
      type: 'positive',
      message: categoryName ? `Reset spending for ${categoryName}` : 'Reset all budget spending',
      position: 'top',
    });
  };

  // Subscription methods
  const openSubscriptionDialog = (subscription: any = null) => {
    if (subscription) {
      // Edit mode
      subscriptionForm.value = {
        name: subscription.name,
        amount: subscription.amount,
        frequency: subscription.frequency,
        nextPayment: new Date(subscription.nextPayment).toISOString().split('T')[0],
        logo: subscription.logo,
      };
      selectedSubscription.value = subscription;
    } else {
      // Add mode
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
      if (!subscriptionForm.value.name || !subscriptionForm.value.amount) {
        $q.notify({
          type: 'negative',
          message: 'Name and amount are required',
          position: 'top',
        });
        return;
      }

      const subscriptionData = {
        name: subscriptionForm.value.name,
        amount: subscriptionForm.value.amount,
        frequency: subscriptionForm.value.frequency,
        nextPayment: new Date(subscriptionForm.value.nextPayment),
        logo: subscriptionForm.value.logo || generateDefaultLogo(),
      };

      if (selectedSubscription.value) {
        // Update existing subscription
        budgetStore.updateSubscription(selectedSubscription.value.id, subscriptionData);
        $q.notify({
          type: 'positive',
          message: 'Subscription updated successfully',
          position: 'top',
        });
      } else {
        // Add new subscription
        budgetStore.addSubscription(subscriptionData);
        $q.notify({
          type: 'positive',
          message: 'Subscription added successfully',
          position: 'top',
        });
      }

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
    try {
      const success = budgetStore.deleteSubscription(subscriptionId);
      if (success) {
        $q.notify({
          type: 'positive',
          message: 'Subscription deleted successfully',
          position: 'top',
        });
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to delete subscription',
        position: 'top',
      });
    }
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

  const generateDefaultLogo = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzJGOTZGMyIvPgo8L3N2Zz4=';
  };

  // Budget alerts
  const checkBudgetAlerts = () => {
    if (!settingsStore.settings.notifications.budgetAlerts) return;

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

  return {
    // State
    loading,
    selectedBudget,
    selectedSubscription,
    showBudgetDialog,
    showSubscriptionDialog,
    budgetForm,
    subscriptionForm,

    // Computed
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
  };
};
