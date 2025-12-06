<!-- src/pages/BudgetPage.vue -->
<template>
  <div class="budget-page">
    <div class="q-pa-md">
      <!-- Header Stats -->
      <div class="row q-gutter-md q-mb-lg">
        <div class="col">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h4 text-weight-bold text-primary">
                {{ formatBudgetAmount(totalBudgetLimit) }}
              </div>
              <div class="text-subtitle2">Total Budget</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h4 text-weight-bold text-negative">
                {{ formatBudgetAmount(totalBudgetSpent) }}
              </div>
              <div class="text-subtitle2">Total Spent</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h4 text-weight-bold text-positive">
                {{ formatBudgetAmount(budgetLeft) }}
              </div>
              <div class="text-subtitle2">Budget Left</div>
            </q-card-section>
          </q-card>
        </div>
        <!-- <div class="col">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h4 text-weight-bold text-info">
                {{ Math.round(budgetUtilization) }}%
              </div>
              <div class="text-subtitle2">Utilization</div>
            </q-card-section>
          </q-card>
        </div> -->
      </div>

      <!-- Overall Budget Progress -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">Overall Budget Progress</div>
          <q-linear-progress :value="budgetUtilization / 100" :color="budgetUtilization > 100 ? 'negative' : budgetUtilization > 80 ? 'warning' : 'positive'
            " size="12px" class="q-mb-sm" />
          <div class="row justify-between">
            <span class="text-caption">{{ formatBudgetAmount(totalBudgetSpent) }}</span>
            <span class="text-caption">{{ formatBudgetAmount(totalBudgetLimit) }}</span>
          </div>
        </q-card-section>
      </q-card>

      <!-- Action Buttons -->
      <div class="row q-gutter-md q-mb-lg">
        <q-btn color="primary" icon="add" label="Add Budget Category" @click="openBudgetDialog()" />
        <q-btn color="secondary" icon="subscriptions" label="Add Subscription" @click="openSubscriptionDialog()" />
        <q-btn flat color="grey-7" icon="refresh" label="Reset Budget" @click="confirmResetBudget()" />
      </div>

      <!-- Budget Categories -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">Budget Categories</div>

          <div v-if="budgetCategories.length === 0" class="text-center text-grey-6 q-pa-md">
            <q-icon name="pie_chart" size="64px" />
            <div class="text-h6 q-mt-md">No budget categories</div>
            <div class="text-body2 q-mb-md">Create budget categories to track your spending</div>
            <q-btn color="primary" @click="openBudgetDialog()">Create Your First Budget</q-btn>
          </div>

          <div v-else class="budget-categories">
            <div v-for="budget in budgetCategories" :key="budget.id" class="budget-category-item">
              <div class="row items-center justify-between q-mb-sm">
                <div class="row items-center">
                  <q-icon :name="budget.icon" :color="budget.color" size="md" class="q-mr-md" />
                  <div>
                    <div class="text-subtitle1 text-weight-medium">{{ budget.name }}</div>
                    <div class="text-caption text-grey-6">
                      {{ formatBudgetAmount(budget.spent) }} of
                      {{ formatBudgetAmount(budget.limit) }}
                    </div>
                  </div>
                </div>
                <div class="row items-center">
                  <q-chip :color="getBudgetStatusColor(budget.spent, budget.limit)" text-color="white" size="sm"
                    class="q-mr-sm">
                    {{ Math.round(calculateBudgetProgress(budget.spent, budget.limit)) }}%
                  </q-chip>
                  <q-btn-dropdown flat round icon="more_vert" size="sm">
                    <q-list>
                      <q-item clickable @click="openBudgetDialog(budget)">
                        <q-item-section avatar>
                          <q-icon name="edit" />
                        </q-item-section>
                        <q-item-section>Edit</q-item-section>
                      </q-item>
                      <q-item clickable @click="resetBudgetSpent(budget.name)">
                        <q-item-section avatar>
                          <q-icon name="refresh" />
                        </q-item-section>
                        <q-item-section>Reset Spent</q-item-section>
                      </q-item>
                      <q-item clickable @click="confirmDeleteBudget(budget)">
                        <q-item-section avatar>
                          <q-icon name="delete" color="negative" />
                        </q-item-section>
                        <q-item-section>Delete</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </div>
              </div>

              <q-linear-progress :value="calculateBudgetProgress(budget.spent, budget.limit) / 100"
                :color="getBudgetStatusColor(budget.spent, budget.limit)" size="8px" class="budget-progress" />

              <div class="row justify-between q-mt-xs">
                <span class="text-caption text-grey-6">
                  Remaining: {{ formatBudgetAmount(Math.max(0, budget.limit - budget.spent)) }}
                </span>
                <span class="text-caption" :class="getBudgetStatus(budget.spent, budget.limit)">
                  {{ getBudgetStatusText(budget.spent, budget.limit) }}
                </span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Subscriptions -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">Subscriptions</div>
            <div class="text-subtitle2 text-grey-6">
              Monthly Total: {{ formatBudgetAmount(totalMonthlySubscriptions) }}
            </div>
          </div>

          <div v-if="subscriptions.length === 0" class="text-center text-grey-6 q-pa-md">
            <q-icon name="subscriptions" size="64px" />
            <div class="text-h6 q-mt-md">No subscriptions</div>
            <div class="text-body2 q-mb-md">Track your recurring subscriptions</div>
            <q-btn color="secondary" @click="openSubscriptionDialog()">Add Subscription</q-btn>
          </div>

          <div v-else class="subscriptions-grid">
            <q-card v-for="subscription in subscriptions" :key="subscription.id" class="subscription-card">
              <q-card-section>
                <div class="row items-center justify-between q-mb-sm">
                  <div class="row items-center">
                    <q-avatar size="40px" class="q-mr-md">
                      <img :src="subscription.logo" :alt="subscription.name" />
                    </q-avatar>
                    <div>
                      <div class="text-subtitle1 text-weight-medium">{{ subscription.name }}</div>
                      <div class="text-caption text-grey-6">{{ subscription.frequency }}</div>
                    </div>
                  </div>
                  <q-btn-dropdown flat round icon="more_vert" size="sm">
                    <q-list>
                      <q-item clickable @click="openSubscriptionDialog(subscription)">
                        <q-item-section avatar>
                          <q-icon name="edit" />
                        </q-item-section>
                        <q-item-section>Edit</q-item-section>
                      </q-item>
                      <q-item clickable @click="confirmDeleteSubscription(subscription)">
                        <q-item-section avatar>
                          <q-icon name="delete" color="negative" />
                        </q-item-section>
                        <q-item-section>Delete</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </div>

                <div class="text-h6 text-weight-bold text-primary q-mb-sm">
                  {{ formatBudgetAmount(subscription.amount) }}
                </div>

                <div class="text-caption text-grey-6">
                  Next Payment: {{ formatDate(subscription.nextPayment) }}
                </div>

                <div v-if="isUpcomingPayment(subscription)" class="q-mt-sm">
                  <q-chip size="sm" color="warning" text-color="white" icon="schedule">
                    Due Soon
                  </q-chip>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>

      <!-- Budget Alerts -->
      <q-card v-if="overBudgetCategories.length > 0 || nearBudgetCategories.length > 0">
        <q-card-section>
          <div class="text-h6 q-mb-md">Budget Alerts</div>

          <div v-if="overBudgetCategories.length > 0" class="q-mb-md">
            <div class="text-subtitle2 text-negative q-mb-sm">Over Budget</div>
            <div class="row q-gutter-sm">
              <q-chip v-for="category in overBudgetCategories" :key="category.id" color="negative" text-color="white"
                :icon="category.icon">
                {{ category.name }} ({{
                  Math.round(calculateBudgetProgress(category.spent, category.limit))
                }}%)
              </q-chip>
            </div>
          </div>

          <div v-if="nearBudgetCategories.length > 0">
            <div class="text-subtitle2 text-warning q-mb-sm">Near Budget Limit</div>
            <div class="row q-gutter-sm">
              <q-chip v-for="category in nearBudgetCategories" :key="category.id" color="warning" text-color="white"
                :icon="category.icon">
                {{ category.name }} ({{
                  Math.round(calculateBudgetProgress(category.spent, category.limit))
                }}%)
              </q-chip>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Budget Dialog -->
    <q-dialog v-model="showBudgetDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ selectedBudget ? 'Edit Budget Category' : 'Add Budget Category' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveBudget" class="q-gutter-md">
            <q-input v-model="budgetForm.name" label="Category Name" required
              :rules="[(val) => (val && val.length > 0) || 'Category name is required']" />

            <q-input v-model.number="budgetForm.limit" label="Budget Limit" type="number" step="0.01" required
              :prefix="settingsStore.settings.currencySymbol"
              :rules="[(val) => val > 0 || 'Budget limit must be greater than 0']" />

            <div class="row q-gutter-md">
              <q-select v-model="budgetForm.icon" :options="iconOptions" option-label="label" option-value="value"
                label="Icon" class="col" />
              <q-select v-model="budgetForm.color" :options="colorOptions" option-label="label" option-value="value"
                label="Color" class="col" />
            </div>

            <!-- <div class="row items-center q-gutter-md">
              <div class="text-subtitle2">Preview:</div>
              <q-chip :color="budgetForm.color" text-color="white" :icon="budgetForm.icon">
                {{ budgetForm.name || 'Category Name' }}
              </q-chip>
            </div> -->
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeBudgetDialog" />
          <q-btn color="primary" label="Save" @click="saveBudget" :loading="loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Subscription Dialog -->
    <q-dialog v-model="showSubscriptionDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ selectedSubscription ? 'Edit Subscription' : 'Add Subscription' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveSubscription" class="q-gutter-md">
            <q-input v-model="subscriptionForm.name" label="Subscription Name" required
              :rules="[(val) => (val && val.length > 0) || 'Subscription name is required']" />

            <q-input v-model.number="subscriptionForm.amount" label="Amount" type="number" step="0.01" required
              :prefix="settingsStore.settings.currencySymbol"
              :rules="[(val) => val > 0 || 'Amount must be greater than 0']" />

            <q-select v-model="subscriptionForm.frequency" :options="frequencyOptions" option-label="label"
              option-value="value" label="Frequency" required />

            <q-input v-model="subscriptionForm.nextPayment" label="Next Payment Date" type="date" required />

            <q-input v-model="subscriptionForm.logo" label="Logo URL (Optional)"
              placeholder="https://example.com/logo.png" />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeSubscriptionDialog" />
          <q-btn color="primary" label="Save" @click="saveSubscription" :loading="loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { useBudget } from 'src/composables/useBudget';
import { useSettingsStore } from 'src/stores/settings';
import { formatDate } from 'src/utils/date';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const settingsStore = useSettingsStore();

// Use budget composable
const {
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
  saveBudget,
  confirmDeleteBudget,
  resetBudgetSpent,
  openSubscriptionDialog,
  closeSubscriptionDialog,
  saveSubscription,
  confirmDeleteSubscription,
} = useBudget();

// Local methods
const getBudgetStatusText = (spent: number, limit: number) => {
  const progress = calculateBudgetProgress(spent, limit);
  if (progress >= 100) return 'Over Budget';
  if (progress >= 80) return 'Near Limit';
  return 'On Track';
};

const isUpcomingPayment = (subscription: any) => {
  const now = new Date();
  const paymentDate = new Date(subscription.nextPayment);
  const diffTime = paymentDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7 && diffDays >= 0;
};

const confirmResetBudget = () => {
  $q.dialog({
    title: 'Reset All Budget Spending',
    message:
      'Are you sure you want to reset all budget spending to zero? This action cannot be undone.',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    resetBudgetSpent();
  });
};
</script>

<style scoped>
.budget-page {
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

.budget-categories {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.budget-category-item {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  background-color: white;
  transition: all 0.2s ease;
}

.budget-category-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.budget-progress {
  margin: 8px 0;
}

.subscriptions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.subscription-card {
  border-radius: 12px;
  transition: all 0.2s ease;
}

.subscription-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.subscription-card .q-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* Progress bar colors */
.q-linear-progress--positive {
  background-color: rgba(76, 175, 80, 0.2);
}

.q-linear-progress--warning {
  background-color: rgba(255, 193, 7, 0.2);
}

.q-linear-progress--negative {
  background-color: rgba(244, 67, 54, 0.2);
}

/* Alert chips */
.q-chip {
  margin: 4px;
  font-weight: 500;
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

/* Responsive design */
@media (max-width: 768px) {
  .stat-card {
    min-height: 80px;
  }

  .text-h4 {
    font-size: 1.5rem;
  }

  .subscriptions-grid {
    grid-template-columns: 1fr;
  }

  .budget-category-item {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .row.q-gutter-md {
    flex-direction: column;
  }

  .q-btn {
    width: 100%;
  }
}

/* Animation for budget items */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.budget-category-item {
  animation: slideInLeft 0.3s ease-out;
}

.subscription-card {
  animation: slideInLeft 0.3s ease-out;
}

/* Status text colors */
.text-on-track {
  color: #4caf50;
}

.text-near-limit {
  color: #ff9800;
}

.text-over-budget {
  color: #f44336;
}

/* Empty state styling */
.text-center {
  padding: 40px 20px;
}

/* Icon styling */
.q-icon {
  transition: all 0.2s ease;
}

.budget-category-item:hover .q-icon {
  transform: scale(1.1);
}
</style>
