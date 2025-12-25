// src/stores/goals.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import goalsService, {
  type FinancialGoal,
  type GoalsMeta,
  type CreateGoalData,
  type UpdateGoalData,
  type ContributionData,
  type GoalFilters,
} from 'src/services/goals.service';

export const useGoalStore = defineStore('goals', () => {
  // State
  const goals = ref<FinancialGoal[]>([]);
  const meta = ref<GoalsMeta | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedGoal = ref<FinancialGoal | null>(null);

  // Getters
  const activeGoals = computed(() => goals.value.filter((goal) => goal.status === 'active'));

  const completedGoals = computed(() => goals.value.filter((goal) => goal.status === 'completed'));

  const pausedGoals = computed(() => goals.value.filter((goal) => goal.status === 'paused'));

  const highPriorityGoals = computed(() => goals.value.filter((goal) => goal.priority === 'high'));

  const mediumPriorityGoals = computed(() =>
    goals.value.filter((goal) => goal.priority === 'medium'),
  );

  const lowPriorityGoals = computed(() => goals.value.filter((goal) => goal.priority === 'low'));

  const goalsOnTrack = computed(() => activeGoals.value.filter((goal) => goal.is_on_track));

  const goalsBehind = computed(() => activeGoals.value.filter((goal) => !goal.is_on_track));

  const overdueGoals = computed(() =>
    goals.value.filter((goal) => goal.is_overdue && goal.status === 'active'),
  );

  const totalTargetAmount = computed(() => meta.value?.total_target_amount || 0);
  const totalCurrentAmount = computed(() => meta.value?.total_current_amount || 0);
  const overallProgress = computed(() => meta.value?.overall_progress || 0);
  const currency = computed(() => meta.value?.currency || 'USD');
  const currencySymbol = computed(() => meta.value?.currency_symbol || '$');

  // Actions
  const fetchGoals = async (filters?: GoalFilters) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await goalsService.getGoals(filters);
      goals.value = response.data;
      meta.value = response.meta;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch goals';
      console.error('Error fetching goals:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchGoal = async (goalId: number) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await goalsService.getGoal(goalId);
      selectedGoal.value = response.data;

      // Update goal in the list if it exists
      const index = goals.value.findIndex((g) => g.id === goalId);
      if (index !== -1) {
        goals.value[index] = response.data;
      }

      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch goal';
      console.error('Error fetching goal:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createGoal = async (goalData: CreateGoalData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await goalsService.createGoal(goalData);
      goals.value.push(response.data);

      // Refresh meta data
      await fetchGoals();

      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create goal';
      console.error('Error creating goal:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateGoal = async (goalId: number, goalData: UpdateGoalData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await goalsService.updateGoal(goalId, goalData);

      // Update goal in the list
      const index = goals.value.findIndex((g) => g.id === goalId);
      if (index !== -1) {
        goals.value[index] = response.data;
      }

      // Update selected goal if it's the one being updated
      if (selectedGoal.value?.id === goalId) {
        selectedGoal.value = response.data;
      }

      // Refresh meta data
      await fetchGoals();

      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update goal';
      console.error('Error updating goal:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteGoal = async (goalId: number) => {
    loading.value = true;
    error.value = null;

    try {
      await goalsService.deleteGoal(goalId);

      // Remove goal from the list
      goals.value = goals.value.filter((g) => g.id !== goalId);

      // Clear selected goal if it's the one being deleted
      if (selectedGoal.value?.id === goalId) {
        selectedGoal.value = null;
      }

      // Refresh meta data
      await fetchGoals();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete goal';
      console.error('Error deleting goal:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addContribution = async (goalId: number, contributionData: ContributionData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await goalsService.addContribution(goalId, contributionData);

      // Update goal in the list
      const index = goals.value.findIndex((g) => g.id === goalId);
      if (index !== -1) {
        goals.value[index] = response.data;
      }

      // Update selected goal if it's the one being updated
      if (selectedGoal.value?.id === goalId) {
        selectedGoal.value = response.data;
      }

      // Refresh meta data
      await fetchGoals();

      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to add contribution';
      console.error('Error adding contribution:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const completeGoal = async (goalId: number) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await goalsService.completeGoal(goalId);

      // Update goal in the list
      const index = goals.value.findIndex((g) => g.id === goalId);
      if (index !== -1) {
        goals.value[index] = response.data;
      }

      // Update selected goal if it's the one being updated
      if (selectedGoal.value?.id === goalId) {
        selectedGoal.value = response.data;
      }

      // Refresh meta data
      await fetchGoals();

      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to complete goal';
      console.error('Error completing goal:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const pauseGoal = async (goalId: number) => {
    return await updateGoal(goalId, { status: 'paused' });
  };

  const resumeGoal = async (goalId: number) => {
    return await updateGoal(goalId, { status: 'active' });
  };

  const cancelGoal = async (goalId: number) => {
    return await updateGoal(goalId, { status: 'cancelled' });
  };

  const getGoalProgress = async (
    goalId: number,
    period: 'daily' | 'weekly' | 'monthly' = 'monthly',
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await goalsService.getGoalProgress(goalId, period);
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to get goal progress';
      console.error('Error getting goal progress:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getGoalById = (goalId: number) => {
    return goals.value.find((g) => g.id === goalId) || null;
  };

  const resetStore = () => {
    goals.value = [];
    meta.value = null;
    loading.value = false;
    error.value = null;
    selectedGoal.value = null;
  };

  return {
    // State
    goals,
    meta,
    loading,
    error,
    selectedGoal,

    // Getters
    activeGoals,
    completedGoals,
    pausedGoals,
    highPriorityGoals,
    mediumPriorityGoals,
    lowPriorityGoals,
    goalsOnTrack,
    goalsBehind,
    overdueGoals,
    totalTargetAmount,
    totalCurrentAmount,
    overallProgress,
    currency,
    currencySymbol,

    // Actions
    fetchGoals,
    fetchGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    completeGoal,
    pauseGoal,
    resumeGoal,
    cancelGoal,
    getGoalProgress,
    getGoalById,
    resetStore,
  };
});
