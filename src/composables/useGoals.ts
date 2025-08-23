// src/composables/useGoals.ts
import { computed, ref } from 'vue';
import { useGoalsStore } from 'src/stores/goals';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency, formatDate } from 'src/utils';
import { useQuasar } from 'quasar';

export const useGoals = () => {
  const goalsStore = useGoalsStore();
  const settingsStore = useSettingsStore();
  const $q = useQuasar();

  // State
  const loading = ref(false);
  const selectedGoal = ref(null);
  const showGoalDialog = ref(false);
  const showContributionDialog = ref(false);
  const showMilestoneDialog = ref(false);

  const goalForm = ref({
    title: '',
    description: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: '',
    category: 'savings',
    priority: 'medium',
    color: 'primary',
    icon: 'flag',
    isRecurring: false,
    recurringPeriod: 'monthly',
  });

  const contributionForm = ref({
    goalId: null,
    amount: 0,
    description: '',
  });

  const milestoneForm = ref({
    goalId: null,
    title: '',
    amount: 0,
    date: '',
  });

  // Computed properties
  const goals = computed(() => goalsStore.goals);
  const activeGoals = computed(() => goalsStore.activeGoals);
  const completedGoals = computed(() => goalsStore.completedGoals);
  const goalStatistics = computed(() => goalsStore.goalStatistics);
  const totalCurrentAmount = computed(() => goalsStore.totalCurrentAmount);
  const totalTargetAmount = computed(() => goalsStore.totalTargetAmount);
  const overallProgress = computed(() => goalsStore.overallProgress);
  const goalsNearDeadline = computed(() => goalsStore.goalsNearDeadline);
  const overdueGoals = computed(() => goalsStore.overdueGoals);

  const categoryOptions = computed(() => [
    { label: 'Savings', value: 'savings', icon: 'savings', color: 'green' },
    { label: 'Investment', value: 'investment', icon: 'trending_up', color: 'blue' },
    { label: 'Debt Payment', value: 'debt', icon: 'payment', color: 'red' },
    { label: 'Purchase', value: 'purchase', icon: 'shopping_cart', color: 'purple' },
    { label: 'Emergency Fund', value: 'emergency', icon: 'security', color: 'orange' },
  ]);

  const priorityOptions = computed(() => [
    { label: 'High', value: 'high', color: 'red' },
    { label: 'Medium', value: 'medium', color: 'orange' },
    { label: 'Low', value: 'low', color: 'green' },
  ]);

  const colorOptions = computed(() => [
    { label: 'Primary', value: 'primary' },
    { label: 'Secondary', value: 'secondary' },
    { label: 'Positive', value: 'positive' },
    { label: 'Negative', value: 'negative' },
    { label: 'Info', value: 'info' },
    { label: 'Warning', value: 'warning' },
  ]);

  const iconOptions = computed(() => [
    { label: 'Flag', value: 'flag' },
    { label: 'Target', value: 'gps_fixed' },
    { label: 'Savings', value: 'savings' },
    { label: 'Investment', value: 'trending_up' },
    { label: 'Emergency', value: 'security' },
    { label: 'Home', value: 'home' },
    { label: 'Car', value: 'directions_car' },
    { label: 'Education', value: 'school' },
    { label: 'Travel', value: 'flight' },
    { label: 'Health', value: 'health_and_safety' },
  ]);

  // Methods
  const formatGoalAmount = (amount: number) => {
    if (!settingsStore.settings.showBalances) {
      return `${settingsStore.settings.currencySymbol}****`;
    }
    return formatCurrency(amount, settingsStore.settings.currency);
  };

  const formatGoalDate = (date: Date) => {
    return formatDate(date, settingsStore.settings.dateFormat);
  };

  const getGoalProgress = (goalId: number) => {
    return goalsStore.getGoalProgress(goalId);
  };

  const getTimeProgress = (goal: any) => {
    return goalsStore.getTimeProgress(goal);
  };

  const getGoalProjection = (goalId: number) => {
    return goalsStore.getGoalProjection(goalId);
  };

  const isGoalOnTrack = (goal: any) => {
    const projection = getGoalProjection(goal.id);
    return projection?.isOnTrack || false;
  };

  const getDaysToTarget = (targetDate: Date) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getGoalStatus = (goal: any) => {
    if (goal.status === 'completed') return 'completed';

    const progress = getGoalProgress(goal.id);
    const daysToTarget = getDaysToTarget(goal.targetDate);

    if (progress >= 100) return 'completed';
    if (daysToTarget < 0) return 'overdue';
    if (daysToTarget <= 30) return 'near-deadline';
    if (progress >= 75) return 'on-track-good';
    if (progress >= 50) return 'on-track';
    return 'behind';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'positive';
      case 'overdue':
        return 'negative';
      case 'near-deadline':
        return 'warning';
      case 'on-track-good':
        return 'positive';
      case 'on-track':
        return 'info';
      case 'behind':
        return 'orange';
      default:
        return 'grey';
    }
  };

  const openGoalDialog = (goal: any = null) => {
    if (goal) {
      selectedGoal.value = goal;
      goalForm.value = {
        title: goal.title,
        description: goal.description,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
        category: goal.category,
        priority: goal.priority,
        color: goal.color,
        icon: goal.icon,
        isRecurring: goal.isRecurring,
        recurringPeriod: goal.recurringPeriod || 'monthly',
      };
    } else {
      selectedGoal.value = null;
      resetGoalForm();
    }
    showGoalDialog.value = true;
  };

  const closeGoalDialog = () => {
    showGoalDialog.value = false;
    selectedGoal.value = null;
    resetGoalForm();
  };

  const resetGoalForm = () => {
    goalForm.value = {
      title: '',
      description: '',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: '',
      category: 'savings',
      priority: 'medium',
      color: 'primary',
      icon: 'flag',
      isRecurring: false,
      recurringPeriod: 'monthly',
    };
  };

  const validateGoalForm = () => {
    const errors = [];

    if (!goalForm.value.title.trim()) {
      errors.push('Goal title is required');
    }

    if (goalForm.value.targetAmount <= 0) {
      errors.push('Target amount must be greater than 0');
    }

    if (!goalForm.value.targetDate) {
      errors.push('Target date is required');
    } else {
      const targetDate = new Date(goalForm.value.targetDate);
      if (targetDate <= new Date()) {
        errors.push('Target date must be in the future');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const saveGoal = async () => {
    loading.value = true;

    try {
      const validation = validateGoalForm();
      if (!validation.isValid) {
        $q.notify({
          type: 'negative',
          message: validation.errors.join(', '),
        });
        return;
      }

      const goalData = {
        ...goalForm.value,
        targetDate: new Date(goalForm.value.targetDate),
        status: 'active' as const,
      };

      if (selectedGoal.value) {
        goalsStore.updateGoal(selectedGoal.value.id, goalData);
        $q.notify({
          type: 'positive',
          message: 'Goal updated successfully',
        });
      } else {
        goalsStore.addGoal(goalData);
        $q.notify({
          type: 'positive',
          message: 'Goal created successfully',
        });
      }

      closeGoalDialog();
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to save goal',
      });
    } finally {
      loading.value = false;
    }
  };

  const openContributionDialog = (goal: any = null) => {
    if (goal) {
      contributionForm.value.goalId = goal.id;
    }
    showContributionDialog.value = true;
  };

  const closeContributionDialog = () => {
    showContributionDialog.value = false;
    contributionForm.value = {
      goalId: null,
      amount: 0,
      description: '',
    };
  };

  const addContribution = async () => {
    loading.value = true;

    try {
      if (!contributionForm.value.goalId || contributionForm.value.amount <= 0) {
        $q.notify({
          type: 'negative',
          message: 'Please select a goal and enter a valid amount',
        });
        return;
      }

      goalsStore.addContribution(
        contributionForm.value.goalId,
        contributionForm.value.amount,
        contributionForm.value.description,
      );

      $q.notify({
        type: 'positive',
        message: 'Contribution added successfully',
      });

      closeContributionDialog();
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to add contribution',
      });
    } finally {
      loading.value = false;
    }
  };

  const openMilestoneDialog = (goal: any = null) => {
    if (goal) {
      milestoneForm.value.goalId = goal.id;
    }
    showMilestoneDialog.value = true;
  };

  const closeMilestoneDialog = () => {
    showMilestoneDialog.value = false;
    milestoneForm.value = {
      goalId: null,
      title: '',
      amount: 0,
      date: '',
    };
  };

  const addMilestone = async () => {
    loading.value = true;

    try {
      if (!milestoneForm.value.goalId || !milestoneForm.value.title.trim()) {
        $q.notify({
          type: 'negative',
          message: 'Please select a goal and enter a milestone title',
        });
        return;
      }

      goalsStore.addMilestone(milestoneForm.value.goalId, {
        title: milestoneForm.value.title,
        amount: milestoneForm.value.amount,
        date: new Date(milestoneForm.value.date),
        isCompleted: false,
      });

      $q.notify({
        type: 'positive',
        message: 'Milestone added successfully',
      });

      closeMilestoneDialog();
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to add milestone',
      });
    } finally {
      loading.value = false;
    }
  };

  const toggleMilestone = (goalId: number, milestoneId: number) => {
    goalsStore.completeMilestone(goalId, milestoneId);
  };

  const deleteGoal = async (goalId: number) => {
    try {
      const success = goalsStore.deleteGoal(goalId);
      if (success) {
        $q.notify({
          type: 'positive',
          message: 'Goal deleted successfully',
        });
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to delete goal',
      });
    }
  };

  const confirmDeleteGoal = (goal: any) => {
    $q.dialog({
      title: 'Delete Goal',
      message: `Are you sure you want to delete "${goal.title}"? This action cannot be undone.`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      deleteGoal(goal.id);
    });
  };

  const pauseGoal = (goalId: number) => {
    goalsStore.updateGoal(goalId, { status: 'paused' });
    $q.notify({
      type: 'info',
      message: 'Goal paused',
    });
  };

  const resumeGoal = (goalId: number) => {
    goalsStore.updateGoal(goalId, { status: 'active' });
    $q.notify({
      type: 'positive',
      message: 'Goal resumed',
    });
  };

  const completeGoal = (goalId: number) => {
    goalsStore.updateGoal(goalId, { status: 'completed' });
    $q.notify({
      type: 'positive',
      message: 'Goal completed! 🎉',
    });
  };

  const searchGoals = (query: string) => {
    return goalsStore.searchGoals(query);
  };

  const getGoalsByCategory = (category: string) => {
    return goalsStore.getGoalsByCategory(category);
  };

  const calculateMonthlyTarget = (goal: any) => {
    const now = new Date();
    const target = new Date(goal.targetDate);
    const monthsRemaining = Math.max(
      1,
      (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()),
    );

    const remaining = goal.targetAmount - goal.currentAmount;
    return remaining / monthsRemaining;
  };

  const getRecommendedContribution = (goal: any) => {
    const monthlyTarget = calculateMonthlyTarget(goal);
    const projection = getGoalProjection(goal.id);

    if (projection && projection.avgMonthlyContribution > 0) {
      const current = projection.avgMonthlyContribution;
      const needed = monthlyTarget;

      if (needed > current) {
        return {
          amount: needed - current,
          reason: 'Increase contribution to stay on track',
        };
      }
    }

    return {
      amount: monthlyTarget,
      reason: 'Recommended monthly contribution',
    };
  };

  return {
    // State
    loading,
    selectedGoal,
    showGoalDialog,
    showContributionDialog,
    showMilestoneDialog,
    goalForm,
    contributionForm,
    milestoneForm,

    // Computed
    goals,
    activeGoals,
    completedGoals,
    goalStatistics,
    totalCurrentAmount,
    totalTargetAmount,
    overallProgress,
    goalsNearDeadline,
    overdueGoals,
    categoryOptions,
    priorityOptions,
    colorOptions,
    iconOptions,

    // Methods
    formatGoalAmount,
    formatGoalDate,
    getGoalProgress,
    getTimeProgress,
    getGoalProjection,
    isGoalOnTrack,
    getDaysToTarget,
    getGoalStatus,
    getStatusColor,
    openGoalDialog,
    closeGoalDialog,
    resetGoalForm,
    validateGoalForm,
    saveGoal,
    openContributionDialog,
    closeContributionDialog,
    addContribution,
    openMilestoneDialog,
    closeMilestoneDialog,
    addMilestone,
    toggleMilestone,
    deleteGoal,
    confirmDeleteGoal,
    pauseGoal,
    resumeGoal,
    completeGoal,
    searchGoals,
    getGoalsByCategory,
    calculateMonthlyTarget,
    getRecommendedContribution,
  };
};
