<!-- src/pages/GoalsPage.vue -->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useGoalStore } from 'src/stores/goals';
import { storeToRefs } from 'pinia';
import { FinancialGoal, CreateGoalData, GoalFilters } from 'src/types/goal.types';
import { format } from 'date-fns';
import { formatCurrency } from 'src/utils/currency';
import { formatDate } from 'src/utils/date';

const $q = useQuasar();
const goalStore = useGoalStore();

// Reactive store refs
const {
  goals,
  meta,
  loading,
  error,
  totalTargetAmount,
  totalCurrentAmount,
  overallProgress,
} = storeToRefs(goalStore);

// Local state
const showCreateDialog = ref(false);
const showContributionDialog = ref(false);
const editingGoal = ref<FinancialGoal | null>(null);
const selectedGoalForContribution = ref<FinancialGoal | null>(null);

const filters = ref<GoalFilters>({
  sort_by: 'target_amount',
  sort_order: 'desc',
});

const goalForm = ref<Partial<CreateGoalData>>({
  name: '',
  description: '',
  target_amount: undefined,
  target_date: '',
  priority: 'medium',
  color: '#2196F3',
  icon: 'flag',
});

const contributionForm = ref({
  amount: undefined as number | undefined,
  date: format(new Date(), 'yyyy-MM-dd'),
  notes: '',
});

// Options
const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Paused', value: 'paused' },
  { label: 'Cancelled', value: 'cancelled' },
];

const priorityOptions = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const sortOptions = [
  { label: 'Name', value: 'name' },
  { label: 'Target Amount', value: 'target_amount' },
  { label: 'Progress', value: 'progress_percentage' },
  { label: 'Target Date', value: 'target_date' },
  { label: 'Priority', value: 'priority' },
];

// Methods
const fetchGoalsWithFilters = async () => {
  await goalStore.fetchGoals(filters.value);
};

const openEditDialog = (goal: FinancialGoal) => {
  editingGoal.value = goal;
  goalForm.value = {
    name: goal.name,
    description: goal.description || '',
    target_amount: parseFloat(goal.target_amount),
    target_date: goal.target_date,
    priority: goal.priority,
    color: goal.color,
    icon: goal.icon,
  };
  showCreateDialog.value = true;
};

const openContributionDialog = (goal: FinancialGoal) => {
  selectedGoalForContribution.value = goal;
  contributionForm.value = {
    amount: undefined,
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  };
  showContributionDialog.value = true;
};

const closeDialog = () => {
  showCreateDialog.value = false;
  editingGoal.value = null;
  goalForm.value = {
    name: '',
    description: '',
    target_amount: undefined,
    target_date: '',
    priority: 'medium',
    color: '#2196F3',
    icon: 'flag',
  };
};

const closeContributionDialog = () => {
  showContributionDialog.value = false;
  selectedGoalForContribution.value = null;
  contributionForm.value = {
    amount: undefined,
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  };
};

const handleSaveGoal = async () => {
  try {
    if (editingGoal.value) {
      await goalStore.updateGoal(editingGoal.value.id, goalForm.value);
      $q.notify({
        type: 'positive',
        message: 'Goal updated successfully',
        position: 'top',
      });
    } else {
      await goalStore.createGoal(goalForm.value as CreateGoalData);
      $q.notify({
        type: 'positive',
        message: 'Goal created successfully',
        position: 'top',
      });
    }
    closeDialog();
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: error.value || 'Failed to save goal',
      position: 'top',
    });
  }
};

const handleSaveContribution = async () => {
  if (!selectedGoalForContribution.value || !contributionForm.value.amount) {
    return;
  }

  try {
    await goalStore.addContribution(selectedGoalForContribution.value.id, {
      amount: contributionForm.value.amount,
      date: contributionForm.value.date,
      notes: contributionForm.value.notes || undefined,
    });

    $q.notify({
      type: 'positive',
      message: 'Contribution added successfully',
      position: 'top',
    });

    closeContributionDialog();
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: error.value || 'Failed to add contribution',
      position: 'top',
    });
  }
};

const handleCompleteGoal = async (goalId: number) => {
  $q.dialog({
    title: 'Complete Goal',
    message: 'Are you sure you want to mark this goal as completed?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await goalStore.completeGoal(goalId);
      $q.notify({
        type: 'positive',
        message: 'Goal marked as completed',
        position: 'top',
      });
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: error.value || 'Failed to complete goal',
        position: 'top',
      });
    }
  });
};

const handlePauseGoal = async (goalId: number) => {
  try {
    await goalStore.pauseGoal(goalId);
    $q.notify({
      type: 'positive',
      message: 'Goal paused',
      position: 'top',
    });
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: error.value || 'Failed to pause goal',
      position: 'top',
    });
  }
};

const handleResumeGoal = async (goalId: number) => {
  try {
    await goalStore.resumeGoal(goalId);
    $q.notify({
      type: 'positive',
      message: 'Goal resumed',
      position: 'top',
    });
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: error.value || 'Failed to resume goal',
      position: 'top',
    });
  }
};

const handleDeleteGoal = async (goalId: number) => {
  $q.dialog({
    title: 'Delete Goal',
    message: 'Are you sure you want to delete this goal? This action cannot be undone.',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await goalStore.deleteGoal(goalId);
      $q.notify({
        type: 'positive',
        message: 'Goal deleted successfully',
        position: 'top',
      });
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: error.value || 'Failed to delete goal',
        position: 'top',
      });
    }
  });
};

// Utility functions
const getProgressColor = (progress: number) => {
  if (progress >= 75) return 'positive';
  if (progress >= 50) return 'warning';
  if (progress >= 25) return 'orange';
  return 'negative';
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'negative';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'grey';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'primary';
    case 'completed':
      return 'positive';
    case 'paused':
      return 'warning';
    case 'cancelled':
      return 'negative';
    default:
      return 'grey';
  }
};

// Lifecycle
onMounted(async () => {
  await fetchGoalsWithFilters();
});
</script>

<template>
  <q-page class="goals-page q-pa-md">
    <!-- Page Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">Financial Goals</div>
        <div class="text-caption text-grey-7">Track and achieve your financial objectives</div>
      </div>
      <q-btn color="primary" icon="add" label="New Goal" @click="showCreateDialog = true" unelevated />
    </div>

    <!-- Summary Stats -->
    <div class="row q-col-gutter-md q-mb-md" v-if="meta">
      <div class="col-6 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Total Goals</div>
            <div class="text-h6 text-weight-bold">{{ meta.total }}</div>
            <div class="text-caption text-positive">
              {{ meta.active_goals }} active
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Total Target</div>
            <div class="text-h6 text-weight-bold">
              {{ formatCurrency(totalTargetAmount) }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Total Saved</div>
            <div class="text-h6 text-weight-bold">
              {{ formatCurrency(totalCurrentAmount) }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Overall Progress</div>
            <div class="text-h6 text-weight-bold">{{ overallProgress.toFixed(1) }}%</div>
            <q-linear-progress :value="overallProgress / 100" color="primary" class="q-mt-sm" rounded size="8px" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filters -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-sm-4 col-md-3">
        <q-select v-model="filters.status" :options="statusOptions" label="Status" emit-value map-options clearable
          filled dense @update:model-value="fetchGoalsWithFilters" />
      </div>

      <div class="col-12 col-sm-4 col-md-3">
        <q-select v-model="filters.priority" :options="priorityOptions" label="Priority" emit-value map-options
          clearable filled dense @update:model-value="fetchGoalsWithFilters" />
      </div>

      <div class="col-12 col-sm-4 col-md-3">
        <q-select v-model="filters.sort_by" :options="sortOptions" label="Sort By" emit-value map-options filled dense
          @update:model-value="fetchGoalsWithFilters" />
      </div>

      <div class="col-12 col-sm-4 col-md-3">
        <q-btn-toggle v-model="filters.sort_order" :options="[
          { label: 'Asc', value: 'asc' },
          { label: 'Desc', value: 'desc' },
        ]" color="primary" toggle-color="primary" @update:model-value="fetchGoalsWithFilters" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-4" v-for="n in 3" :key="n">
        <q-skeleton height="200px" />
      </div>
    </div>

    <!-- Goals Grid -->
    <div v-else-if="goals.length > 0" class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-4" v-for="goal in goals" :key="goal.id">
        <q-card flat bordered class="goal-card" :class="goal.status">
          <q-card-section>
            <div class="row items-start justify-between q-mb-sm">
              <div class="col-grow">
                <div class="row items-center q-gutter-xs q-mb-xs">
                  <q-icon :name="goal.icon" :color="getPriorityColor(goal.priority)" size="20px" />
                  <div class="text-subtitle2 text-weight-bold">{{ goal.name }}</div>
                </div>
                <div class="text-caption text-grey-7" v-if="goal.description">
                  {{ goal.description.substring(0, 35) }}{{ goal.description.length > 35 ? '...' : '' }}
                </div>
              </div>
              <q-btn flat round dense icon="more_vert" @click.stop>
                <q-menu>
                  <q-list>
                    <q-item clickable v-close-popup @click="openEditDialog(goal)">
                      <q-item-section avatar>
                        <q-icon name="edit" />
                      </q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="openContributionDialog(goal)">
                      <q-item-section avatar>
                        <q-icon name="add_circle" />
                      </q-item-section>
                      <q-item-section>Add Contribution</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable v-close-popup @click="handleCompleteGoal(goal.id)"
                      v-if="goal.status === 'active'">
                      <q-item-section avatar>
                        <q-icon name="check_circle" color="positive" />
                      </q-item-section>
                      <q-item-section>Mark Complete</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="handlePauseGoal(goal.id)" v-if="goal.status === 'active'">
                      <q-item-section avatar>
                        <q-icon name="pause_circle" />
                      </q-item-section>
                      <q-item-section>Pause</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="handleResumeGoal(goal.id)" v-if="goal.status === 'paused'">
                      <q-item-section avatar>
                        <q-icon name="play_circle" color="primary" />
                      </q-item-section>
                      <q-item-section>Resume</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable v-close-popup @click="handleDeleteGoal(goal.id)">
                      <q-item-section avatar>
                        <q-icon name="delete" color="negative" />
                      </q-item-section>
                      <q-item-section>Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <!-- Progress -->
            <div class="q-mb-sm">
              <div class="row items-center justify-between q-mb-xs">
                <div class="text-caption text-grey-7">Progress</div>
                <div class="text-caption text-weight-bold">
                  {{ goal.progress_percentage.toFixed(1) }}%
                </div>
              </div>
              <q-linear-progress :value="goal.progress_percentage / 100"
                :color="getProgressColor(goal.progress_percentage)" class="q-mb-xs" rounded size="10px" />
              <div class="row items-center justify-between">
                <div class="text-caption">
                  {{ formatCurrency(parseFloat(goal.current_amount)) }}
                </div>
                <div class="text-caption">
                  {{ formatCurrency(parseFloat(goal.target_amount)) }}
                </div>
              </div>
            </div>

            <!-- Info Grid -->
            <div class="row q-col-gutter-xs q-mt-sm">
              <div class="col-6">
                <div class="text-caption text-grey-7">Target Date</div>
                <div class="text-caption text-weight-medium">
                  {{ formatDate(goal.target_date, 'MMM dd, yyyy') }}
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-7">Days Remaining</div>
                <div class="text-caption text-weight-medium">
                  {{ Math.ceil(goal.days_remaining) }} days
                </div>
              </div>
              <div class="col-6 q-mt-xs">
                <div class="text-caption text-grey-7">Monthly Target</div>
                <div class="text-caption text-weight-medium">
                  {{ formatCurrency(goal.monthly_target) }}
                </div>
              </div>
              <div class="col-6 q-mt-xs">
                <div class="text-caption text-grey-7">Status</div>
                <q-badge :color="getStatusColor(goal.status)" :label="goal.status.toUpperCase()" />
              </div>
            </div>

            <!-- Badges -->
            <div class="row q-gutter-xs q-mt-sm">
              <q-badge :color="getPriorityColor(goal.priority)" :label="goal.priority.toUpperCase()" />
              <q-badge v-if="goal.is_on_track" color="positive" label="ON TRACK" />
              <q-badge v-if="goal.is_overdue" color="negative" label="OVERDUE" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center q-pa-xl">
      <q-icon name="flag" size="80px" color="grey-5" />
      <div class="text-h6 text-grey-7 q-mt-md">No goals yet</div>
      <div class="text-caption text-grey-6 q-mb-md">Create your first financial goal to get started</div>
      <q-btn color="primary" icon="add" label="Create Goal" @click="showCreateDialog = true" unelevated />
    </div>

    <!-- Create/Edit Goal Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ editingGoal ? 'Edit Goal' : 'Create New Goal' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="goalForm.name" label="Goal Name *" outlined dense class="q-mb-md" />

          <q-input v-model="goalForm.description" label="Description" type="textarea" outlined dense rows="3"
            class="q-mb-md" />

          <q-input v-model.number="goalForm.target_amount" label="Target Amount *" type="number" outlined dense
            class="q-mb-md" prefix="$" />

          <q-input v-model="goalForm.target_date" label="Target Date *" type="date" outlined dense class="q-mb-md" />

          <q-select v-model="goalForm.priority" :options="priorityOptions" label="Priority *" emit-value map-options
            outlined dense class="q-mb-md" />

          <q-input v-model="goalForm.color" label="Color" outlined dense class="q-mb-md">
            <template v-slot:append>
              <q-icon name="colorize" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-color v-model="goalForm.color" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-input v-model="goalForm.icon" label="Icon (Material Icon name)" outlined dense />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="closeDialog" />
          <q-btn unelevated :label="editingGoal ? 'Update' : 'Create'" color="primary" @click="handleSaveGoal"
            :loading="loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Contribution Dialog -->
    <q-dialog v-model="showContributionDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add Contribution</div>
          <div class="text-caption text-grey-7" v-if="selectedGoalForContribution">
            {{ selectedGoalForContribution.name }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model.number="contributionForm.amount" label="Amount *" type="number" outlined dense
            class="q-mb-md" prefix="$" />

          <q-input v-model="contributionForm.date" label="Date" type="date" outlined dense class="q-mb-md" />

          <q-input v-model="contributionForm.notes" label="Notes" type="textarea" outlined dense rows="3" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="closeContributionDialog" />
          <q-btn unelevated label="Add Contribution" color="primary" @click="handleSaveContribution"
            :loading="loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

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
  /* border-left: 4px solid var(--q-primary); */
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
