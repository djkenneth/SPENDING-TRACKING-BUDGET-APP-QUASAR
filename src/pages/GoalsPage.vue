<!-- src/pages/GoalsPage.vue -->
<template>
  <div class="goals-page">
    <div class="q-pa-md">
      <!-- Header Stats -->
      <div class="row q-gutter-md q-mb-lg">
        <div class="col">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h4 text-weight-bold text-primary">
                {{ goalStatistics.activeGoals }}
              </div>
              <div class="text-subtitle2">Active Goals</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h4 text-weight-bold text-green">
                {{ Math.round(overallProgress) }}%
              </div>
              <div class="text-subtitle2">Overall Progress</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h4 text-weight-bold text-orange">
                {{ formatCurrency(totalCurrentAmount) }}
              </div>
              <div class="text-subtitle2">Total Saved</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Overall Progress Bar -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">Overall Progress</div>
          <q-linear-progress
            :value="overallProgress / 100"
            size="12px"
            color="primary"
            class="q-mb-sm"
          />
          <div class="row justify-between">
            <span class="text-caption">{{ formatCurrency(totalCurrentAmount) }}</span>
            <span class="text-caption">{{ formatCurrency(totalTargetAmount) }}</span>
          </div>
        </q-card-section>
      </q-card>

      <!-- Action Buttons -->
      <div class="row q-gutter-md q-mb-lg">
        <q-btn color="primary" icon="add" label="Add Goal" @click="openGoalDialog()" />
        <q-btn
          color="positive"
          icon="attach_money"
          label="Add Contribution"
          @click="openContributionDialog()"
        />
        <q-btn
          flat
          color="grey-7"
          icon="filter_list"
          label="Filter"
          @click="showFilterDialog = true"
        />
      </div>

      <!-- Goals List -->
      <div class="goals-grid">
        <q-card
          v-for="goal in filteredGoals"
          :key="goal.id"
          class="goal-card"
          :class="{ 'goal-completed': goal.status === 'completed' }"
        >
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="row items-center">
                <q-avatar size="40px" :color="goal.color" text-color="white" class="q-mr-md">
                  <q-icon :name="goal.icon" />
                </q-avatar>
                <div>
                  <div class="text-subtitle1 text-weight-medium">{{ goal.title }}</div>
                  <div class="text-caption text-grey-6">{{ goal.description }}</div>
                </div>
              </div>
              <q-btn-dropdown flat round icon="more_vert" size="sm">
                <q-list>
                  <q-item clickable @click="openGoalDialog(goal)">
                    <q-item-section avatar>
                      <q-icon name="edit" />
                    </q-item-section>
                    <q-item-section>Edit</q-item-section>
                  </q-item>
                  <q-item clickable @click="openContributionDialog(goal)">
                    <q-item-section avatar>
                      <q-icon name="add" />
                    </q-item-section>
                    <q-item-section>Add Contribution</q-item-section>
                  </q-item>
                  <q-item clickable @click="confirmDeleteGoal(goal)">
                    <q-item-section avatar>
                      <q-icon name="delete" color="negative" />
                    </q-item-section>
                    <q-item-section>Delete</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>

            <!-- Progress -->
            <div class="q-mb-md">
              <div class="row items-center justify-between q-mb-xs">
                <span class="text-body2">{{ formatCurrency(goal.currentAmount) }}</span>
                <span class="text-body2">{{ formatCurrency(goal.targetAmount) }}</span>
              </div>
              <q-linear-progress
                :value="getGoalProgress(goal.id) / 100"
                :color="getProgressColor(goal)"
                size="8px"
                class="q-mb-xs"
              />
              <div class="text-center text-caption">
                {{ Math.round(getGoalProgress(goal.id)) }}% Complete
              </div>
            </div>

            <!-- Goal Info -->
            <div class="row q-gutter-md">
              <div class="col">
                <div class="text-caption text-grey-6">Target Date</div>
                <div class="text-body2">{{ formatDate(goal.targetDate) }}</div>
              </div>
              <div class="col">
                <div class="text-caption text-grey-6">Priority</div>
                <q-chip :color="getPriorityColor(goal.priority)" text-color="white" size="sm">
                  {{ goal.priority }}
                </q-chip>
              </div>
            </div>

            <!-- Time Projection -->
            <div v-if="getProjection(goal)" class="q-mt-md">
              <div class="text-caption text-grey-6">Projected Completion</div>
              <div
                class="text-body2"
                :class="getProjection(goal).isOnTrack ? 'text-positive' : 'text-negative'"
              >
                {{ formatDate(getProjection(goal).projectedCompletionDate) }}
                <q-icon
                  :name="getProjection(goal).isOnTrack ? 'trending_up' : 'trending_down'"
                  size="sm"
                  class="q-ml-xs"
                />
              </div>
            </div>

            <!-- Milestones -->
            <div v-if="goal.milestones.length > 0" class="q-mt-md">
              <div class="text-caption text-grey-6 q-mb-sm">Milestones</div>
              <div class="milestones">
                <div
                  v-for="milestone in goal.milestones"
                  :key="milestone.id"
                  class="milestone-item"
                  :class="{ 'milestone-completed': milestone.isCompleted }"
                >
                  <q-icon
                    :name="milestone.isCompleted ? 'check_circle' : 'radio_button_unchecked'"
                    :color="milestone.isCompleted ? 'positive' : 'grey-5'"
                    size="sm"
                  />
                  <span class="q-ml-sm">{{ milestone.title }}</span>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Empty State -->
      <div v-if="filteredGoals.length === 0" class="text-center q-pa-xl">
        <q-icon name="flag" size="64px" color="grey-4" />
        <div class="text-h6 text-grey-6 q-mt-md">No goals found</div>
        <div class="text-body2 text-grey-6 q-mb-md">
          Start setting financial goals to track your progress
        </div>
        <q-btn color="primary" @click="openGoalDialog()">Create Your First Goal</q-btn>
      </div>
    </div>

    <!-- Goal Dialog -->
    <q-dialog v-model="showGoalDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ selectedGoal ? 'Edit Goal' : 'Add New Goal' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveGoal" class="q-gutter-md">
            <q-input
              v-model="goalForm.title"
              label="Goal Title"
              required
              :rules="[(val) => (val && val.length > 0) || 'Title is required']"
            />

            <q-input v-model="goalForm.description" label="Description" type="textarea" rows="2" />

            <q-input
              v-model.number="goalForm.targetAmount"
              label="Target Amount"
              type="number"
              step="0.01"
              :prefix="settings.currencySymbol"
              required
            />

            <q-input
              v-model.number="goalForm.currentAmount"
              label="Current Amount"
              type="number"
              step="0.01"
              :prefix="settings.currencySymbol"
            />

            <q-input v-model="goalForm.targetDate" label="Target Date" type="date" required />

            <q-select
              v-model="goalForm.category"
              :options="categoryOptions"
              label="Category"
              required
            />

            <q-select
              v-model="goalForm.priority"
              :options="priorityOptions"
              label="Priority"
              required
            />

            <div class="row q-gutter-md">
              <q-select
                v-model="goalForm.color"
                :options="colorOptions"
                label="Color"
                class="col"
              />
              <q-select v-model="goalForm.icon" :options="iconOptions" label="Icon" class="col" />
            </div>

            <q-toggle v-model="goalForm.isRecurring" label="Recurring Goal" />

            <q-select
              v-if="goalForm.isRecurring"
              v-model="goalForm.recurringPeriod"
              :options="recurringOptions"
              label="Recurring Period"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeGoalDialog" />
          <q-btn color="primary" label="Save" @click="saveGoal" :loading="loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Contribution Dialog -->
    <q-dialog v-model="showContributionDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add Contribution</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="q-gutter-md">
            <q-select
              v-model="contributionForm.goalId"
              :options="goalOptions"
              option-label="title"
              option-value="id"
              label="Goal"
              required
            />

            <q-input
              v-model.number="contributionForm.amount"
              label="Amount"
              type="number"
              step="0.01"
              :prefix="settings.currencySymbol"
              required
            />

            <q-input v-model="contributionForm.description" label="Description (Optional)" />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeContributionDialog" />
          <q-btn color="primary" label="Add" @click="addContribution" :loading="loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Filter Dialog -->
    <q-dialog v-model="showFilterDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Filter Goals</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="q-gutter-md">
            <q-select v-model="filters.status" :options="statusOptions" label="Status" clearable />

            <q-select
              v-model="filters.category"
              :options="categoryOptions"
              label="Category"
              clearable
            />

            <q-select
              v-model="filters.priority"
              :options="priorityOptions"
              label="Priority"
              clearable
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Clear" @click="clearFilters" />
          <q-btn flat label="Close" @click="showFilterDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGoalsStore } from 'src/stores/goals';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency, formatDate } from 'src/utils';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const goalsStore = useGoalsStore();
const settingsStore = useSettingsStore();

// State
const loading = ref(false);
const selectedGoal = ref(null);
const showGoalDialog = ref(false);
const showContributionDialog = ref(false);
const showFilterDialog = ref(false);

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

const filters = ref({
  status: '',
  category: '',
  priority: '',
});

// Computed
const settings = computed(() => settingsStore.settings);
const goals = computed(() => goalsStore.goals);
const activeGoals = computed(() => goalsStore.activeGoals);
const goalStatistics = computed(() => goalsStore.goalStatistics);
const totalCurrentAmount = computed(() => goalsStore.totalCurrentAmount);
const totalTargetAmount = computed(() => goalsStore.totalTargetAmount);
const overallProgress = computed(() => goalsStore.overallProgress);

const filteredGoals = computed(() => {
  let filtered = goals.value;

  if (filters.value.status) {
    filtered = filtered.filter((goal) => goal.status === filters.value.status);
  }

  if (filters.value.category) {
    filtered = filtered.filter((goal) => goal.category === filters.value.category);
  }

  if (filters.value.priority) {
    filtered = filtered.filter((goal) => goal.priority === filters.value.priority);
  }

  return filtered;
});

const goalOptions = computed(() => {
  return activeGoals.value.map((goal) => ({
    id: goal.id,
    title: goal.title,
  }));
});

const categoryOptions = computed(() => [
  { label: 'Savings', value: 'savings' },
  { label: 'Investment', value: 'investment' },
  { label: 'Debt', value: 'debt' },
  { label: 'Purchase', value: 'purchase' },
  { label: 'Emergency', value: 'emergency' },
]);

const priorityOptions = computed(() => [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]);

const statusOptions = computed(() => [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Paused', value: 'paused' },
  { label: 'Cancelled', value: 'cancelled' },
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
  { label: 'Emergency', value: 'emergency' },
  { label: 'Laptop', value: 'laptop' },
  { label: 'Flight', value: 'flight' },
  { label: 'Home', value: 'home' },
  { label: 'Car', value: 'directions_car' },
  { label: 'School', value: 'school' },
  { label: 'Health', value: 'health_and_safety' },
]);

const recurringOptions = computed(() => [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
]);

// Methods
const openGoalDialog = (goal = null) => {
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

const saveGoal = async () => {
  loading.value = true;

  try {
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
        message: 'Goal added successfully',
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

const openContributionDialog = (goal = null) => {
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

const confirmDeleteGoal = (goal) => {
  $q.dialog({
    title: 'Delete Goal',
    message: `Are you sure you want to delete "${goal.title}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    goalsStore.deleteGoal(goal.id);
    $q.notify({
      type: 'positive',
      message: 'Goal deleted successfully',
    });
  });
};

const getGoalProgress = (goalId) => {
  return goalsStore.getGoalProgress(goalId);
};

const getProgressColor = (goal) => {
  const progress = getGoalProgress(goal.id);
  if (progress >= 100) return 'positive';
  if (progress >= 75) return 'info';
  if (progress >= 50) return 'warning';
  return 'negative';
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return 'red';
    case 'medium':
      return 'orange';
    case 'low':
      return 'green';
    default:
      return 'grey';
  }
};

const getProjection = (goal) => {
  return goalsStore.getGoalProjection(goal.id);
};

const clearFilters = () => {
  filters.value = {
    status: '',
    category: '',
    priority: '',
  };
};
</script>

<style scoped>
.goals-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.stat-card {
  border-radius: 12px;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.goal-card {
  border-radius: 12px;
  transition: all 0.2s ease;
  border-left: 4px solid var(--q-primary);
  position: relative;
}

.goal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.goal-completed {
  opacity: 0.8;
  border-left-color: var(--q-positive);
}

.goal-completed::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 45%, rgba(76, 175, 80, 0.1) 50%, transparent 55%);
  pointer-events: none;
}

.milestones {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.milestone-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.milestone-item:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.milestone-completed {
  background-color: rgba(76, 175, 80, 0.1);
  text-decoration: line-through;
  opacity: 0.7;
}

.milestone-completed .q-icon {
  color: var(--q-positive);
}

/* Progress bar animations */
.q-linear-progress {
  transition: all 0.3s ease;
}

/* Responsive design */
@media (max-width: 768px) {
  .goals-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-card {
    min-height: 80px;
  }
}

/* Goal status indicators */
.goal-card[data-status='completed'] {
  border-left-color: var(--q-positive);
}

.goal-card[data-status='paused'] {
  border-left-color: var(--q-warning);
}

.goal-card[data-status='cancelled'] {
  border-left-color: var(--q-negative);
}

/* Animation for new goals */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.goal-card {
  animation: slideInUp 0.3s ease-out;
}

/* Chip styling */
.q-chip {
  font-weight: 500;
  text-transform: capitalize;
}

/* Form styling */
.q-form .q-field {
  margin-bottom: 16px;
}

.q-dialog .q-card {
  border-radius: 12px;
}

/* Button styling */
.q-btn {
  border-radius: 8px;
  font-weight: 500;
}

.q-btn--flat {
  border-radius: 50%;
}

/* Progress text */
.text-center.text-caption {
  font-weight: 500;
  color: var(--q-primary);
}

/* Card section padding */
.q-card-section {
  padding: 20px;
}

/* Icon styling */
.q-avatar .q-icon {
  font-size: 24px;
}

/* Responsive text */
@media (max-width: 480px) {
  .text-h4 {
    font-size: 1.5rem;
  }

  .text-h6 {
    font-size: 1.1rem;
  }

  .goal-card {
    margin-bottom: 16px;
  }
}
</style>
