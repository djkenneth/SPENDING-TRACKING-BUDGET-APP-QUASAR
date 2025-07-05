// src/stores/goals.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Goal {
  id: number;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: 'savings' | 'investment' | 'debt' | 'purchase' | 'emergency';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  color: string;
  icon: string;
  isRecurring: boolean;
  recurringPeriod?: 'monthly' | 'yearly';
  milestones: GoalMilestone[];
}

export interface GoalMilestone {
  id: number;
  goalId: number;
  title: string;
  amount: number;
  date: Date;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface GoalContribution {
  id: number;
  goalId: number;
  amount: number;
  date: Date;
  description?: string;
  source: 'manual' | 'automatic' | 'transaction';
}

export const useGoalsStore = defineStore('goals', () => {
  // State
  const goals = ref<Goal[]>([
    {
      id: 1,
      title: 'Emergency Fund',
      description: 'Build 6 months of expenses for emergencies',
      targetAmount: 150000,
      currentAmount: 45000,
      targetDate: new Date('2025-12-31'),
      category: 'emergency',
      priority: 'high',
      status: 'active',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-07-01'),
      color: 'red',
      icon: 'emergency',
      isRecurring: false,
      milestones: [
        {
          id: 1,
          goalId: 1,
          title: 'First Month',
          amount: 25000,
          date: new Date('2025-03-31'),
          isCompleted: true,
          completedAt: new Date('2025-03-15'),
        },
        {
          id: 2,
          goalId: 1,
          title: 'Second Month',
          amount: 50000,
          date: new Date('2025-06-30'),
          isCompleted: false,
        },
      ],
    },
    {
      id: 2,
      title: 'New Laptop',
      description: 'MacBook Pro for work',
      targetAmount: 120000,
      currentAmount: 85000,
      targetDate: new Date('2025-09-30'),
      category: 'purchase',
      priority: 'medium',
      status: 'active',
      createdAt: new Date('2025-02-01'),
      updatedAt: new Date('2025-07-01'),
      color: 'blue',
      icon: 'laptop',
      isRecurring: false,
      milestones: [],
    },
    {
      id: 3,
      title: 'Vacation Fund',
      description: 'Japan trip for 2 weeks',
      targetAmount: 80000,
      currentAmount: 25000,
      targetDate: new Date('2026-03-31'),
      category: 'savings',
      priority: 'low',
      status: 'active',
      createdAt: new Date('2025-03-01'),
      updatedAt: new Date('2025-07-01'),
      color: 'purple',
      icon: 'flight',
      isRecurring: false,
      milestones: [],
    },
  ]);

  const contributions = ref<GoalContribution[]>([
    {
      id: 1,
      goalId: 1,
      amount: 25000,
      date: new Date('2025-03-15'),
      description: 'Initial deposit',
      source: 'manual',
    },
    {
      id: 2,
      goalId: 1,
      amount: 20000,
      date: new Date('2025-06-15'),
      description: 'Monthly contribution',
      source: 'automatic',
    },
    {
      id: 3,
      goalId: 2,
      amount: 85000,
      date: new Date('2025-06-01'),
      description: 'Accumulated savings',
      source: 'manual',
    },
  ]);

  // Getters
  const activeGoals = computed(() => {
    return goals.value.filter((goal) => goal.status === 'active');
  });

  const completedGoals = computed(() => {
    return goals.value.filter((goal) => goal.status === 'completed');
  });

  const goalsByPriority = computed(() => {
    return goals.value.reduce(
      (acc, goal) => {
        if (!acc[goal.priority]) {
          acc[goal.priority] = [];
        }
        acc[goal.priority].push(goal);
        return acc;
      },
      {} as Record<string, Goal[]>,
    );
  });

  const totalTargetAmount = computed(() => {
    return activeGoals.value.reduce((sum, goal) => sum + goal.targetAmount, 0);
  });

  const totalCurrentAmount = computed(() => {
    return activeGoals.value.reduce((sum, goal) => sum + goal.currentAmount, 0);
  });

  const overallProgress = computed(() => {
    if (totalTargetAmount.value === 0) return 0;
    return (totalCurrentAmount.value / totalTargetAmount.value) * 100;
  });

  const goalsNearDeadline = computed(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return activeGoals.value.filter((goal) => {
      const targetDate = new Date(goal.targetDate);
      return targetDate <= thirtyDaysFromNow && targetDate >= now;
    });
  });

  const overdueGoals = computed(() => {
    const now = new Date();
    return activeGoals.value.filter((goal) => {
      const targetDate = new Date(goal.targetDate);
      return targetDate < now && goal.status === 'active';
    });
  });

  const goalStatistics = computed(() => {
    const stats = {
      totalGoals: goals.value.length,
      activeGoals: activeGoals.value.length,
      completedGoals: completedGoals.value.length,
      totalSaved: totalCurrentAmount.value,
      totalTarget: totalTargetAmount.value,
      averageProgress:
        activeGoals.value.length > 0
          ? activeGoals.value.reduce(
              (sum, goal) => sum + (goal.currentAmount / goal.targetAmount) * 100,
              0,
            ) / activeGoals.value.length
          : 0,
      goalsOnTrack: activeGoals.value.filter((goal) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const timeProgress = getTimeProgress(goal);
        return progress >= timeProgress * 0.8; // On track if within 80% of expected progress
      }).length,
    };

    return stats;
  });

  // Actions
  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'milestones'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
      milestones: [],
    };
    goals.value.push(newGoal);
    return newGoal;
  };

  const updateGoal = (id: number, updates: Partial<Goal>) => {
    const index = goals.value.findIndex((goal) => goal.id === id);
    if (index !== -1) {
      goals.value[index] = {
        ...goals.value[index],
        ...updates,
        updatedAt: new Date(),
      };
      return goals.value[index];
    }
    return null;
  };

  const deleteGoal = (id: number) => {
    const index = goals.value.findIndex((goal) => goal.id === id);
    if (index !== -1) {
      goals.value.splice(index, 1);
      // Also remove related contributions
      contributions.value = contributions.value.filter((c) => c.goalId !== id);
      return true;
    }
    return false;
  };

  const addContribution = (
    goalId: number,
    amount: number,
    description?: string,
    source: 'manual' | 'automatic' | 'transaction' = 'manual',
  ) => {
    const contribution: GoalContribution = {
      id: Date.now(),
      goalId,
      amount,
      date: new Date(),
      description,
      source,
    };

    contributions.value.push(contribution);

    // Update goal current amount
    const goal = goals.value.find((g) => g.id === goalId);
    if (goal) {
      goal.currentAmount += amount;
      goal.updatedAt = new Date();

      // Check if goal is completed
      if (goal.currentAmount >= goal.targetAmount && goal.status === 'active') {
        goal.status = 'completed';
      }
    }

    return contribution;
  };

  const addMilestone = (goalId: number, milestone: Omit<GoalMilestone, 'id' | 'goalId'>) => {
    const newMilestone: GoalMilestone = {
      ...milestone,
      id: Date.now(),
      goalId,
    };

    const goal = goals.value.find((g) => g.id === goalId);
    if (goal) {
      goal.milestones.push(newMilestone);
      goal.updatedAt = new Date();
    }

    return newMilestone;
  };

  const completeMilestone = (goalId: number, milestoneId: number) => {
    const goal = goals.value.find((g) => g.id === goalId);
    if (goal) {
      const milestone = goal.milestones.find((m) => m.id === milestoneId);
      if (milestone) {
        milestone.isCompleted = true;
        milestone.completedAt = new Date();
        goal.updatedAt = new Date();
      }
    }
  };

  const getGoalProgress = (goalId: number) => {
    const goal = goals.value.find((g) => g.id === goalId);
    if (!goal) return 0;

    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getTimeProgress = (goal: Goal) => {
    const now = new Date();
    const created = new Date(goal.createdAt);
    const target = new Date(goal.targetDate);

    const totalTime = target.getTime() - created.getTime();
    const elapsedTime = now.getTime() - created.getTime();

    return Math.min((elapsedTime / totalTime) * 100, 100);
  };

  const getGoalProjection = (goalId: number) => {
    const goal = goals.value.find((g) => g.id === goalId);
    if (!goal) return null;

    const goalContributions = contributions.value.filter((c) => c.goalId === goalId);
    if (goalContributions.length < 2) return null;

    // Calculate average monthly contribution
    const sortedContributions = goalContributions.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const firstContribution = sortedContributions[0];
    const lastContribution = sortedContributions[sortedContributions.length - 1];

    const monthsDiff = Math.max(
      1,
      (new Date(lastContribution.date).getTime() - new Date(firstContribution.date).getTime()) /
        (1000 * 60 * 60 * 24 * 30),
    );

    const totalContributed = goalContributions.reduce((sum, c) => sum + c.amount, 0);
    const avgMonthlyContribution = totalContributed / monthsDiff;

    // Project completion date
    const remaining = goal.targetAmount - goal.currentAmount;
    const monthsToComplete = remaining / avgMonthlyContribution;
    const projectedCompletionDate = new Date();
    projectedCompletionDate.setMonth(projectedCompletionDate.getMonth() + monthsToComplete);

    return {
      avgMonthlyContribution,
      monthsToComplete,
      projectedCompletionDate,
      isOnTrack: projectedCompletionDate <= new Date(goal.targetDate),
    };
  };

  const getGoalsByCategory = (category: Goal['category']) => {
    return goals.value.filter((goal) => goal.category === category);
  };

  const searchGoals = (query: string) => {
    if (!query.trim()) return goals.value;

    const searchTerm = query.toLowerCase();
    return goals.value.filter(
      (goal) =>
        goal.title.toLowerCase().includes(searchTerm) ||
        goal.description.toLowerCase().includes(searchTerm) ||
        goal.category.toLowerCase().includes(searchTerm),
    );
  };

  return {
    // State
    goals,
    contributions,

    // Getters
    activeGoals,
    completedGoals,
    goalsByPriority,
    totalTargetAmount,
    totalCurrentAmount,
    overallProgress,
    goalsNearDeadline,
    overdueGoals,
    goalStatistics,

    // Actions
    addGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    addMilestone,
    completeMilestone,
    getGoalProgress,
    getTimeProgress,
    getGoalProjection,
    getGoalsByCategory,
    searchGoals,
  };
});
