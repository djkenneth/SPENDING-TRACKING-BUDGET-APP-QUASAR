<template>
  <q-page class="q-pa-md">
    <!-- Page Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="text-h4 text-weight-bold q-mb-xs">Budget Management</h4>
        <p class="text-grey-7">Track spending and manage budget allocations</p>
      </div>
      <q-btn color="primary" icon="add" label="Create Budget" @click="openCreateBudgetDialog" />
    </div>

    <!-- Period Budget Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Monthly Budget Card -->
      <div class="col-12 col-md-4">
        <q-card class="budget-period-card">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <div>
                <div class="text-subtitle1 text-weight-medium">Monthly Budget</div>
                <div class="text-caption text-grey-6">
                  {{ budgetsStore.monthlyBudget?.period || 'December 2025' }}
                </div>
              </div>
              <q-btn flat round icon="edit" size="sm" @click="editPeriodBudget('monthly')" />
            </div>
            <div class="text-h4 text-weight-bold q-mb-sm">
              {{ budgetsStore.formatCurrency(budgetsStore.monthlyBudget?.total_spent || 0) }}
              <span class="text-subtitle2 text-grey-6">
                of {{ budgetsStore.formatCurrency(budgetsStore.monthlyBudget?.total_budget || 0) }}
              </span>
            </div>
            <q-linear-progress :value="(budgetsStore.monthlyBudget?.percentage_used || 0) / 100"
              :color="budgetsStore.getProgressColor(budgetsStore.monthlyBudget?.percentage_used || 0)" size="8px"
              rounded class="q-mb-sm" />
            <div class="row justify-between text-caption">
              <span :class="getPercentageClass(budgetsStore.monthlyBudget?.percentage_used || 0)">
                {{ (budgetsStore.monthlyBudget?.percentage_used || 0).toFixed(1) }}% used
              </span>
              <span class="text-positive">
                {{ budgetsStore.formatCurrency(budgetsStore.monthlyBudget?.remaining || 0) }} remaining
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Quarterly Budget Card -->
      <div class="col-12 col-md-4">
        <q-card class="budget-period-card">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <div>
                <div class="text-subtitle1 text-weight-medium">Quarterly Budget</div>
                <div class="text-caption text-grey-6">
                  {{ budgetsStore.quarterlyBudget?.period || 'Q4 2025' }}
                </div>
              </div>
              <q-btn flat round icon="edit" size="sm" @click="editPeriodBudget('quarterly')" />
            </div>
            <div class="text-h4 text-weight-bold q-mb-sm">
              {{ budgetsStore.formatCurrency(budgetsStore.quarterlyBudget?.total_spent || 0) }}
              <span class="text-subtitle2 text-grey-6">
                of {{ budgetsStore.formatCurrency(budgetsStore.quarterlyBudget?.total_budget || 0) }}
              </span>
            </div>
            <q-linear-progress :value="(budgetsStore.quarterlyBudget?.percentage_used || 0) / 100"
              :color="budgetsStore.getProgressColor(budgetsStore.quarterlyBudget?.percentage_used || 0)" size="8px"
              rounded class="q-mb-sm" />
            <div class="row justify-between text-caption">
              <span :class="getPercentageClass(budgetsStore.quarterlyBudget?.percentage_used || 0)">
                {{ (budgetsStore.quarterlyBudget?.percentage_used || 0).toFixed(1) }}% used
              </span>
              <span class="text-positive">
                {{ budgetsStore.formatCurrency(budgetsStore.quarterlyBudget?.remaining || 0) }} remaining
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Yearly Budget Card -->
      <div class="col-12 col-md-4">
        <q-card class="budget-period-card">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <div>
                <div class="text-subtitle1 text-weight-medium">Yearly Budget</div>
                <div class="text-caption text-grey-6">
                  {{ budgetsStore.yearlyBudget?.period || '2025' }}
                </div>
              </div>
              <q-btn flat round icon="edit" size="sm" @click="editPeriodBudget('yearly')" />
            </div>
            <div class="text-h4 text-weight-bold q-mb-sm">
              {{ budgetsStore.formatCurrency(budgetsStore.yearlyBudget?.total_spent || 0) }}
              <span class="text-subtitle2 text-grey-6">
                of {{ budgetsStore.formatCurrency(budgetsStore.yearlyBudget?.total_budget || 0) }}
              </span>
            </div>
            <q-linear-progress :value="(budgetsStore.yearlyBudget?.percentage_used || 0) / 100"
              :color="budgetsStore.getProgressColor(budgetsStore.yearlyBudget?.percentage_used || 0)" size="8px" rounded
              class="q-mb-sm" />
            <div class="row justify-between text-caption">
              <span :class="getPercentageClass(budgetsStore.yearlyBudget?.percentage_used || 0)">
                {{ (budgetsStore.yearlyBudget?.percentage_used || 0).toFixed(1) }}% used
              </span>
              <span class="text-positive">
                {{ budgetsStore.formatCurrency(budgetsStore.yearlyBudget?.remaining || 0) }} remaining
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="row q-col-gutter-md">
      <!-- Left Column - Chart and Category Breakdown -->
      <div class="col-12 col-lg-8">
        <!-- Budget vs Actual Chart -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <q-icon name="bar_chart" size="24px" color="primary" class="q-mr-sm" />
              <div>
                <div class="text-subtitle1 text-weight-medium">Budget vs Actual</div>
                <div class="text-caption text-grey-6">Compare budgeted vs actual spending</div>
              </div>
            </div>
            <div class="chart-container" style="height: 300px;">
              <!-- Chart placeholder - integrate with Chart.js or similar -->
              <div class="row items-end justify-around" style="height: 100%;">
                <div v-for="item in budgetsStore.comparison" :key="item.category" class="column items-center"
                  style="width: 80px;">
                  <div class="row items-end" style="height: 200px;">
                    <div class="bg-green q-mr-xs" :style="{
                      width: '30px',
                      height: `${Math.min((item.budget / maxBudget) * 180, 180)}px`,
                      borderRadius: '4px 4px 0 0',
                    }" />
                    <div class="bg-blue" :style="{
                      width: '30px',
                      height: `${Math.min((item.spent / maxBudget) * 180, 180)}px`,
                      borderRadius: '4px 4px 0 0',
                    }" />
                  </div>
                  <div class="text-caption text-center q-mt-sm" style="max-width: 80px;">
                    {{ truncateText(item.category, 10) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="row justify-center q-mt-md q-gutter-md">
              <div class="row items-center">
                <div class="legend-dot bg-green q-mr-xs" />
                <span class="text-caption">Budget</span>
              </div>
              <div class="row items-center">
                <div class="legend-dot bg-blue q-mr-xs" />
                <span class="text-caption">Spent</span>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Category Breakdown -->
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="row items-center">
                <q-icon name="category" size="24px" color="primary" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle1 text-weight-medium">Category Breakdown</div>
                  <div class="text-caption text-grey-6">Individual category budgets</div>
                </div>
              </div>
              <q-btn flat icon="download" label="Export" size="sm" />
            </div>

            <div v-if="budgetsStore.loading" class="text-center q-pa-lg">
              <q-spinner color="primary" size="40px" />
            </div>

            <div v-else-if="budgetsStore.categoryBreakdown.length === 0" class="text-center q-pa-lg">
              <q-icon name="pie_chart" size="64px" color="grey-5" />
              <div class="text-subtitle1 q-mt-md">No budget categories</div>
              <div class="text-caption text-grey-6 q-mb-md">Create budget categories to track spending</div>
              <q-btn color="primary" @click="openCreateBudgetDialog">Create Budget</q-btn>
            </div>

            <div v-else class="row q-col-gutter-md">
              <div v-for="category in budgetsStore.categoryBreakdown" :key="category.id" class="col-12 col-sm-6">
                <q-card flat bordered class="category-card">
                  <q-card-section class="q-pa-md">
                    <div class="row items-center justify-between q-mb-sm">
                      <div class="row items-center">
                        <q-avatar :style="{ backgroundColor: category.color + '20' }" size="40px" class="q-mr-sm">
                          <q-icon :name="category.icon" :style="{ color: category.color }" />
                        </q-avatar>
                        <div>
                          <div class="text-subtitle2 text-weight-medium">{{ category.name }}</div>
                          <div class="text-caption text-grey-6">
                            {{ category.transaction_count }} transactions
                          </div>
                        </div>
                      </div>
                      <q-btn flat round icon="edit" size="sm" @click="editCategoryBudget(category)" />
                    </div>

                    <div class="row items-baseline justify-between q-mb-xs">
                      <span class="text-subtitle1 text-weight-bold"
                        :class="category.status === 'over_budget' ? 'text-negative' : ''">
                        {{ budgetsStore.formatCurrency(category.spent_amount) }}
                      </span>
                      <span class="text-caption text-grey-6">
                        / {{ budgetsStore.formatCurrency(category.budget_amount) }}
                      </span>
                    </div>

                    <q-linear-progress :value="Math.min(category.percentage / 100, 1)"
                      :color="budgetsStore.getProgressColor(category.percentage)" size="6px" rounded class="q-mb-xs" />

                    <div class="row justify-between text-caption">
                      <span :class="getPercentageClass(category.percentage)">
                        {{ category.percentage.toFixed(1) }}%
                      </span>
                      <span :class="category.remaining_amount >= 0 ? 'text-positive' : 'text-negative'">
                        {{ category.remaining_amount >= 0 ? '$' : '-$' }}{{
                          Math.abs(category.remaining_amount).toFixed(2) }}
                      </span>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right Column - Spending Velocity, Quick Adjustments, Alerts -->
      <div class="col-12 col-lg-4">
        <!-- Spending Velocity -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <q-icon name="speed" size="24px" color="primary" class="q-mr-sm" />
              <div>
                <div class="text-subtitle1 text-weight-medium">Spending Velocity</div>
                <div class="text-caption text-grey-6">Current spending rate analysis</div>
              </div>
            </div>

            <div class="q-mb-md">
              <div class="row items-center justify-between q-mb-xs">
                <span class="text-caption text-grey-6">Current Rate</span>
                <span class="text-weight-bold" :class="getVelocityColor(budgetsStore.spendingVelocity?.current_rate)">
                  {{ budgetsStore.spendingVelocity?.current_rate || 'Normal' }}
                </span>
              </div>
            </div>

            <div class="q-gutter-sm">
              <div class="row items-center justify-between">
                <span class="text-caption text-grey-6">Daily Average</span>
                <span class="text-subtitle2">
                  {{ budgetsStore.formatCurrency(budgetsStore.spendingVelocity?.daily_average || 0) }}
                </span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption text-grey-6">Projected Month-End</span>
                <span class="text-subtitle2"
                  :class="(budgetsStore.spendingVelocity?.projected_month_end || 0) > budgetsStore.totalBudgeted ? 'text-negative' : 'text-positive'">
                  {{ budgetsStore.formatCurrency(budgetsStore.spendingVelocity?.projected_month_end || 0) }}
                </span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption text-grey-6">Days Remaining</span>
                <span class="text-subtitle2">{{ budgetsStore.spendingVelocity?.days_remaining || 0 }}</span>
              </div>
            </div>

            <q-banner v-if="budgetsStore.spendingVelocity?.warning" class="bg-orange-1 text-orange-9 q-mt-md" rounded>
              <template v-slot:avatar>
                <q-icon name="warning" color="orange" />
              </template>
              <div class="text-weight-medium">Budget Overrun Warning</div>
              <div class="text-caption">{{ budgetsStore.spendingVelocity?.warning?.message }}</div>
            </q-banner>
          </q-card-section>
        </q-card>

        <!-- Quick Adjustments -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <q-icon name="tune" size="24px" color="primary" class="q-mr-sm" />
              <div>
                <div class="text-subtitle1 text-weight-medium">Quick Adjustments</div>
                <div class="text-caption text-grey-6">Modify all budgets by percentage</div>
              </div>
            </div>

            <div class="row q-gutter-sm q-mb-md">
              <q-btn outline color="positive" icon="trending_up" label="+5%" @click="applyQuickAdjustment(5)"
                :loading="budgetsStore.loading" />
              <q-btn outline color="positive" icon="trending_up" label="+10%" @click="applyQuickAdjustment(10)"
                :loading="budgetsStore.loading" />
              <q-btn outline color="negative" icon="trending_down" label="-5%" @click="applyQuickAdjustment(-5)"
                :loading="budgetsStore.loading" />
              <q-btn outline color="negative" icon="trending_down" label="-10%" @click="applyQuickAdjustment(-10)"
                :loading="budgetsStore.loading" />
            </div>

            <div class="text-caption text-grey-6">
              Quick adjustments apply percentage changes to all category budgets proportionally.
            </div>
          </q-card-section>
        </q-card>

        <!-- Alert Configuration -->
        <q-card>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <q-icon name="notifications" size="24px" color="primary" class="q-mr-sm" />
              <div>
                <div class="text-subtitle1 text-weight-medium">Alert Configuration</div>
                <div class="text-caption text-grey-6">Set thresholds for budget notifications</div>
              </div>
            </div>

            <!-- Budget Warning -->
            <div class="alert-config-item q-mb-md">
              <div class="row items-center justify-between q-mb-sm">
                <div class="row items-center">
                  <q-checkbox v-model="alertConfigLocal.budget_warning.enabled"
                    @update:model-value="updateAlertConfig" />
                  <span class="text-subtitle2">Budget Warning</span>
                </div>
                <q-chip size="sm" color="warning" text-color="white">warning</q-chip>
              </div>
              <div class="q-pl-lg">
                <div class="text-caption text-grey-6 q-mb-sm">Threshold Percentage</div>
                <q-input v-model.number="alertConfigLocal.budget_warning.threshold" type="number" dense outlined
                  :disable="!alertConfigLocal.budget_warning.enabled" @update:model-value="updateAlertConfig" />
                <div class="text-caption text-grey-6 q-mt-xs">
                  Alert when spending reaches {{ alertConfigLocal.budget_warning.threshold }}% of budget
                </div>
                <div class="row q-gutter-sm q-mt-sm">
                  <q-checkbox v-model="alertConfigLocal.budget_warning.email_notification" label="Email notification"
                    size="sm" :disable="!alertConfigLocal.budget_warning.enabled"
                    @update:model-value="updateAlertConfig" />
                  <q-checkbox v-model="alertConfigLocal.budget_warning.push_notification" label="Push notification"
                    size="sm" :disable="!alertConfigLocal.budget_warning.enabled"
                    @update:model-value="updateAlertConfig" />
                </div>
              </div>
            </div>

            <!-- Overspending Alert -->
            <div class="alert-config-item q-mb-md">
              <div class="row items-center justify-between q-mb-sm">
                <div class="row items-center">
                  <q-checkbox v-model="alertConfigLocal.overspending_alert.enabled"
                    @update:model-value="updateAlertConfig" />
                  <span class="text-subtitle2">Overspending Alert</span>
                </div>
                <q-chip size="sm" color="negative" text-color="white">critical</q-chip>
              </div>
              <div class="q-pl-lg">
                <div class="text-caption text-grey-6 q-mb-sm">Threshold Percentage</div>
                <q-input v-model.number="alertConfigLocal.overspending_alert.threshold" type="number" dense outlined
                  :disable="!alertConfigLocal.overspending_alert.enabled" @update:model-value="updateAlertConfig" />
                <div class="text-caption text-grey-6 q-mt-xs">
                  Alert when spending reaches {{ alertConfigLocal.overspending_alert.threshold }}% of budget
                </div>
                <div class="row q-gutter-sm q-mt-sm">
                  <q-checkbox v-model="alertConfigLocal.overspending_alert.email_notification"
                    label="Email notification" size="sm" :disable="!alertConfigLocal.overspending_alert.enabled"
                    @update:model-value="updateAlertConfig" />
                  <q-checkbox v-model="alertConfigLocal.overspending_alert.push_notification" label="Push notification"
                    size="sm" :disable="!alertConfigLocal.overspending_alert.enabled"
                    @update:model-value="updateAlertConfig" />
                </div>
              </div>
            </div>

            <!-- Budget Exceeded -->
            <div class="alert-config-item">
              <div class="row items-center justify-between q-mb-sm">
                <div class="row items-center">
                  <q-checkbox v-model="alertConfigLocal.budget_exceeded.enabled"
                    @update:model-value="updateAlertConfig" />
                  <span class="text-subtitle2">Budget Exceeded</span>
                </div>
                <q-chip size="sm" color="negative" text-color="white">critical</q-chip>
              </div>
              <div class="q-pl-lg">
                <div class="text-caption text-grey-6 q-mb-sm">Threshold Percentage</div>
                <q-input v-model.number="alertConfigLocal.budget_exceeded.threshold" type="number" dense outlined
                  :disable="!alertConfigLocal.budget_exceeded.enabled" @update:model-value="updateAlertConfig" />
                <div class="text-caption text-grey-6 q-mt-xs">
                  Alert when spending reaches {{ alertConfigLocal.budget_exceeded.threshold }}% of budget
                </div>
                <div class="row q-gutter-sm q-mt-sm">
                  <q-checkbox v-model="alertConfigLocal.budget_exceeded.email_notification" label="Email notification"
                    size="sm" :disable="!alertConfigLocal.budget_exceeded.enabled"
                    @update:model-value="updateAlertConfig" />
                  <q-checkbox v-model="alertConfigLocal.budget_exceeded.push_notification" label="Push notification"
                    size="sm" :disable="!alertConfigLocal.budget_exceeded.enabled"
                    @update:model-value="updateAlertConfig" />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Create Budget Dialog -->
    <q-dialog v-model="showCreateBudgetDialog" persistent>
      <q-card style="min-width: 500px;">
        <q-card-section class="row items-center">
          <q-icon name="savings" size="24px" color="primary" class="q-mr-sm" />
          <div class="text-h6">Create New Budget</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit.prevent="createBudget">
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-select v-model="budgetForm.period" :options="periodOptions" label="Budget Period *" outlined
                  emit-value map-options />
              </div>
              <div class="col-6">
                <q-input v-model="budgetForm.start_date" type="date" label="Start Date *" outlined />
              </div>
            </div>

            <q-input v-model.number="budgetForm.amount" type="number" label="Total Budget Amount *" outlined
              class="q-mt-md" prefix="$" hint="Enter the total amount for this budget period" />

            <div class="q-mt-lg">
              <div class="text-subtitle2 q-mb-sm">Category Allocations</div>
              <div v-for="category in categoriesStore.expenseCategories" :key="category.id"
                class="row items-center q-mb-sm">
                <div class="row items-center col-6">
                  <q-avatar :style="{ backgroundColor: category.color + '20' }" size="32px" class="q-mr-sm">
                    <q-icon :name="category.icon" :style="{ color: category.color }" size="18px" />
                  </q-avatar>
                  <span>{{ category.name }}</span>
                </div>
                <div class="col-6">
                  <q-input v-model.number="categoryAllocations[category.id]" type="number" dense outlined prefix="$"
                    placeholder="0.00" />
                </div>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Create Budget" @click="createBudget" :loading="budgetsStore.loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- FAB -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" @click="openCreateBudgetDialog" />
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useBudgetsStore } from 'src/stores/budget';
import { useCategoriesStore } from 'src/stores/categories';
import type { AlertConfig } from 'src/services/budgets.service';

const budgetsStore = useBudgetsStore();
const categoriesStore = useCategoriesStore();

// Dialog state
const showCreateBudgetDialog = ref(false);

// Budget form
const budgetForm = reactive({
  period: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
  start_date: new Date().toISOString().split('T')[0],
  amount: 0,
});

const categoryAllocations = reactive<Record<number, number>>({});

const periodOptions = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
];

// Alert config local state
const alertConfigLocal = reactive<AlertConfig>({
  budget_warning: {
    enabled: true,
    threshold: 75,
    email_notification: true,
    push_notification: true,
  },
  overspending_alert: {
    enabled: true,
    threshold: 90,
    email_notification: true,
    push_notification: true,
  },
  budget_exceeded: {
    enabled: true,
    threshold: 100,
    email_notification: true,
    push_notification: false,
  },
});

// Computed
const maxBudget = computed(() => {
  if (!budgetsStore.comparison.length) return 1000;
  return Math.max(...budgetsStore.comparison.map((c) => Math.max(c.budget, c.spent)));
});

// Watch for alert config changes from store
watch(
  () => budgetsStore.alertConfig,
  (newConfig) => {
    if (newConfig) {
      Object.assign(alertConfigLocal, newConfig);
    }
  },
  { immediate: true }
);

// Methods
const getPercentageClass = (percentage: number): string => {
  if (percentage >= 100) return 'text-negative';
  if (percentage >= 90) return 'text-warning';
  if (percentage >= 75) return 'text-orange';
  return 'text-positive';
};

const getVelocityColor = (rate?: string): string => {
  switch (rate) {
    case 'High':
      return 'text-negative';
    case 'Normal':
      return 'text-warning';
    case 'Low':
      return 'text-positive';
    default:
      return 'text-grey';
  }
};

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const openCreateBudgetDialog = () => {
  // Reset form
  budgetForm.period = 'monthly';
  budgetForm.start_date = new Date().toISOString().split('T')[0];
  budgetForm.amount = 0;
  Object.keys(categoryAllocations).forEach((key) => delete categoryAllocations[Number(key)]);
  showCreateBudgetDialog.value = true;
};

const createBudget = async () => {
  try {
    // Create individual budgets for each category allocation
    for (const [categoryId, amount] of Object.entries(categoryAllocations)) {
      if (amount > 0) {
        await budgetsStore.createBudget({
          category_id: Number(categoryId),
          amount: amount,
          period: budgetForm.period,
          start_date: budgetForm.start_date,
        });
      }
    }
    showCreateBudgetDialog.value = false;
  } catch (err) {
    console.error('Failed to create budget:', err);
  }
};

const editPeriodBudget = (period: string) => {
  // TODO: Implement edit period budget dialog
  console.log('Edit period budget:', period);
};

const editCategoryBudget = (category: any) => {
  // TODO: Implement edit category budget dialog
  console.log('Edit category budget:', category);
};

const applyQuickAdjustment = async (percentage: number) => {
  try {
    await budgetsStore.applyQuickAdjustment(percentage, 'monthly');
  } catch (err) {
    console.error('Failed to apply quick adjustment:', err);
  }
};

const updateAlertConfig = async () => {
  try {
    await budgetsStore.updateAlertConfig(alertConfigLocal);
  } catch (err) {
    console.error('Failed to update alert config:', err);
  }
};

// Initialize data
onMounted(async () => {
  await Promise.all([
    budgetsStore.initializeBudgetData(),
    categoriesStore.fetchCategories({ type: 'expense' }),
  ]);
});
</script>

<style scoped lang="scss">
.budget-period-card {
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.category-card {
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.alert-config-item {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.chart-container {
  padding: 16px 0;
}
</style>
