<!-- src/pages/BudgetPage.vue -->
<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useBudgetStore } from 'src/stores/budget';
import { useSettingsStore } from 'src/stores/settings';
import { formatDate } from 'src/utils/date';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const budgetStore = useBudgetStore();
const settingsStore = useSettingsStore();

// Local state for dialogs
const selectedBudget = ref(null);
const selectedSubscription = ref(null);
const showBudgetDialog = ref(false);
const showSubscriptionDialog = ref(false);

const budgetForm = ref({
  name: '',
  limit: null,
  icon: 'category',
  color: 'blue',
  type: 'expense' as 'income' | 'expense' | 'both',
});

const subscriptionForm = ref({
  name: '',
  amount: null,
  frequency: 'Monthly' as 'Monthly' | 'Yearly' | 'Weekly',
  nextPayment: new Date().toISOString().split('T')[0],
  logo: '',
});

// Form options
const frequencyOptions = [
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Yearly', value: 'Yearly' },
  { label: 'Weekly', value: 'Weekly' },
];

const iconOptions = [
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
];

const colorOptions = [
  { label: 'Blue', value: 'blue' },
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Orange', value: 'orange' },
  { label: 'Purple', value: 'purple' },
  { label: 'Cyan', value: 'cyan' },
  { label: 'Pink', value: 'pink' },
  { label: 'Teal', value: 'teal' },
];

// Computed with balance visibility
const formattedTotalBudgetLimit = computed(() => {
  if (!settingsStore.settings.showBalances) {
    return `${settingsStore.settings.currencySymbol}****`;
  }
  return budgetStore.formatBudgetAmount(budgetStore.totalBudgetLimit);
});

const formattedTotalBudgetSpent = computed(() => {
  if (!settingsStore.settings.showBalances) {
    return `${settingsStore.settings.currencySymbol}****`;
  }
  return budgetStore.formatBudgetAmount(budgetStore.totalBudgetSpent);
});

const formattedBudgetLeft = computed(() => {
  if (!settingsStore.settings.showBalances) {
    return `${settingsStore.settings.currencySymbol}****`;
  }
  return budgetStore.formatBudgetAmount(budgetStore.budgetLeft);
});

const formattedTotalMonthlySubscriptions = computed(() => {
  if (!settingsStore.settings.showBalances) {
    return `${settingsStore.settings.currencySymbol}****`;
  }
  return budgetStore.formatBudgetAmount(budgetStore.totalMonthlySubscriptions);
});

// Budget dialog methods
const openBudgetDialog = (budget: any = null) => {
  if (budget) {
    budgetForm.value = {
      name: budget.name,
      limit: budget.limit,
      icon: budget.icon,
      color: budget.color,
      type: budget.type || 'expense',
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
    type: 'expense',
  };
};

const saveBudget = async () => {
  try {
    if (!budgetForm.value.name || !budgetForm.value.limit) {
      $q.notify({
        type: 'negative',
        message: 'Name and limit are required',
        position: 'top',
      });
      return;
    }

    const budgetData = {
      name: budgetForm.value.name,
      limit: budgetForm.value.limit,
      icon: budgetForm.value.icon,
      color: budgetForm.value.color,
      type: budgetForm.value.type,
    };

    if (selectedBudget.value) {
      await budgetStore.updateBudgetCategory(selectedBudget.value.category_id, budgetData);
    } else {
      await budgetStore.addBudgetCategory(budgetData);
    }

    closeBudgetDialog();
  } catch (error) {
    console.error('Failed to save budget:', error);
  }
};

const confirmDeleteBudget = (budget: any) => {
  $q.dialog({
    title: 'Delete Budget Category',
    message: `Are you sure you want to delete the budget for "${budget.name}"? This action cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await budgetStore.deleteBudgetCategory(budget.category_id);
    } catch (error) {
      console.error('Failed to delete budget:', error);
    }
  });
};

const resetBudgetSpentHandler = (categoryName: string) => {
  budgetStore.resetBudgetSpent(categoryName);
  $q.notify({
    type: 'positive',
    message: `Reset spending for ${categoryName}`,
    position: 'top',
  });
};

// Subscription dialog methods
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

const saveSubscription = () => {
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
    logo: subscriptionForm.value.logo,
  };

  if (selectedSubscription.value) {
    budgetStore.updateSubscription(selectedSubscription.value.id, subscriptionData);
  } else {
    budgetStore.addSubscription(subscriptionData);
  }

  $q.notify({
    type: 'positive',
    message: selectedSubscription.value ? 'Subscription updated' : 'Subscription added',
    position: 'top',
  });

  closeSubscriptionDialog();
};

const confirmDeleteSubscription = (subscription: any) => {
  $q.dialog({
    title: 'Delete Subscription',
    message: `Are you sure you want to delete the subscription for "${subscription.name}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    budgetStore.deleteSubscription(subscription.id);
    $q.notify({
      type: 'positive',
      message: 'Subscription deleted',
      position: 'top',
    });
  });
};

// Utility methods
const getBudgetStatusText = (spent: number, limit: number) => {
  const progress = (spent / limit) * 100;
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
    message: 'Are you sure you want to reset all budget spending to zero? This action cannot be undone.',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    budgetStore.resetBudgetSpent();
    $q.notify({
      type: 'positive',
      message: 'Reset all budget spending',
      position: 'top',
    });
  });
};

// Initialize data
onMounted(async () => {
  await budgetStore.fetchCategories();
  // await budgetStore.refreshBudgetSpending();
});
</script>

<template>
  <div class="budget-page">
    <div class="q-pa-md">
      <!-- Header Stats -->
      <div class="row q-gutter-md q-mb-lg">
        <div class="col">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h5 text-weight-bold text-primary">
                {{ formattedTotalBudgetLimit }}
              </div>
              <div class="text-subtitle2">Total Budget</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h5 text-weight-bold text-negative">
                {{ formattedTotalBudgetSpent }}
              </div>
              <div class="text-subtitle2">Total Spent</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h5 text-weight-bold text-positive">
                {{ formattedBudgetLeft }}
              </div>
              <div class="text-subtitle2">Budget Left</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Overall Budget Progress -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">Overall Budget Progress</div>
          <q-linear-progress :value="budgetStore.budgetUtilization / 100" :color="budgetStore.budgetUtilization > 100
            ? 'negative'
            : budgetStore.budgetUtilization > 80
              ? 'warning'
              : 'positive'
            " size="12px" class="q-mb-sm" />
          <div class="row justify-between">
            <span class="text-caption">{{ formattedTotalBudgetSpent }}</span>
            <span class="text-caption">{{ formattedTotalBudgetLimit }}</span>
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

          <div v-if="budgetStore.budgetCategories.length === 0 && !budgetStore.loading"
            class="text-center text-grey-6 q-pa-md">
            <q-icon name="pie_chart" size="64px" />
            <div class="text-h6 q-mt-md">No budget categories</div>
            <div class="text-body2 q-mb-md">
              Create budget categories to track your spending
            </div>
            <q-btn color="primary" @click="openBudgetDialog()">
              Create Your First Budget
            </q-btn>
          </div>

          <div v-else-if="budgetStore.loading" class="text-center q-pa-md">
            <q-spinner color="primary" size="50px" />
            <div class="text-subtitle2 q-mt-md">Loading budget categories...</div>
          </div>

          <div v-else class="budget-categories">
            <div v-for="budget in budgetStore.budgetCategories" :key="budget.id" class="budget-category-item">
              <div class="row items-center justify-between q-mb-sm">
                <div class="row items-center">
                  <q-icon :name="budget.icon" :color="budget.color" size="md" class="q-mr-md" />
                  <div>
                    <div class="text-subtitle1 text-weight-medium">{{ budget.name }}</div>
                    <div class="text-caption text-grey-6">
                      {{ budgetStore.formatBudgetAmount(budget.spent) }} of
                      {{ budgetStore.formatBudgetAmount(budget.limit) }}
                    </div>
                  </div>
                </div>
                <div class="row items-center">
                  <q-chip :color="budgetStore.getBudgetStatusColor(budget.spent, budget.limit)" text-color="white"
                    size="sm" class="q-mr-sm">
                    {{ Math.round((budget.spent / budget.limit) * 100) }}%
                  </q-chip>
                  <q-btn-dropdown flat round icon="more_vert" size="sm">
                    <q-list>
                      <q-item clickable @click="openBudgetDialog(budget)">
                        <q-item-section avatar>
                          <q-icon name="edit" />
                        </q-item-section>
                        <q-item-section>Edit</q-item-section>
                      </q-item>
                      <q-item clickable @click="resetBudgetSpentHandler(budget.name)">
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

              <q-linear-progress :value="(budget.spent / budget.limit)"
                :color="budgetStore.getBudgetStatusColor(budget.spent, budget.limit)" size="8px"
                class="budget-progress" />

              <div class="row justify-between q-mt-xs">
                <span class="text-caption text-grey-6">
                  Remaining:
                  {{ budgetStore.formatBudgetAmount(Math.max(0, budget.limit - budget.spent)) }}
                </span>
                <span class="text-caption" :class="budgetStore.getBudgetStatus(budget.spent, budget.limit)">
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
            <q-chip color="primary" text-color="white">
              {{ formattedTotalMonthlySubscriptions }} / month
            </q-chip>
          </div>

          <div v-if="budgetStore.subscriptions.length === 0" class="text-center text-grey-6 q-pa-md">
            <q-icon name="subscriptions" size="64px" />
            <div class="text-h6 q-mt-md">No subscriptions</div>
            <div class="text-body2 q-mb-md">Add your recurring subscriptions</div>
            <q-btn color="secondary" @click="openSubscriptionDialog()">
              Add Subscription
            </q-btn>
          </div>

          <div v-else class="row q-gutter-md">
            <q-card v-for="subscription in budgetStore.subscriptions" :key="subscription.id"
              class="subscription-card col-12 col-sm-5 col-md-3">
              <q-card-section>
                <div class="row items-center justify-between q-mb-sm">
                  <div class="row items-center">
                    <q-avatar size="40px" class="q-mr-sm">
                      <img :src="subscription.logo" :alt="subscription.name" />
                    </q-avatar>
                    <div class="text-subtitle1 text-weight-medium">
                      {{ subscription.name }}
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
                  {{ budgetStore.formatBudgetAmount(subscription.amount) }}
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
      <q-card v-if="budgetStore.overBudgetCategories.length > 0 || budgetStore.nearBudgetCategories.length > 0">
        <q-card-section>
          <div class="text-h6 q-mb-md">Budget Alerts</div>

          <div v-if="budgetStore.overBudgetCategories.length > 0" class="q-mb-md">
            <div class="text-subtitle2 text-negative q-mb-sm">Over Budget</div>
            <div class="row q-gutter-sm">
              <q-chip v-for="category in budgetStore.overBudgetCategories" :key="category.id" color="negative"
                text-color="white" :icon="category.icon">
                {{ category.name }} ({{ Math.round((category.spent / category.limit) * 100) }}%)
              </q-chip>
            </div>
          </div>

          <div v-if="budgetStore.nearBudgetCategories.length > 0">
            <div class="text-subtitle2 text-warning q-mb-sm">Near Budget Limit</div>
            <div class="row q-gutter-sm">
              <q-chip v-for="category in budgetStore.nearBudgetCategories" :key="category.id" color="warning"
                text-color="white" :icon="category.icon">
                {{ category.name }} ({{ Math.round((category.spent / category.limit) * 100) }}%)
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

        <q-card-section>
          <q-input v-model="budgetForm.name" label="Category Name" outlined dense class="q-mb-md" />

          <q-input v-model.number="budgetForm.limit" label="Budget Limit" type="number" outlined dense prefix="₱"
            class="q-mb-md" />

          <q-select v-model="budgetForm.icon" :options="iconOptions" label="Icon" outlined dense emit-value map-options
            class="q-mb-md">
            <template #prepend>
              <q-icon :name="budgetForm.icon" />
            </template>
          </q-select>

          <q-select v-model="budgetForm.color" :options="colorOptions" label="Color" outlined dense emit-value
            map-options>
            <template #prepend>
              <q-icon name="palette" :color="budgetForm.color" />
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" @click="closeBudgetDialog" />
          <q-btn flat label="Save" color="primary" :loading="budgetStore.loading" @click="saveBudget" />
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

        <q-card-section>
          <q-input v-model="subscriptionForm.name" label="Subscription Name" outlined dense class="q-mb-md" />

          <q-input v-model.number="subscriptionForm.amount" label="Amount" type="number" outlined dense prefix="₱"
            class="q-mb-md" />

          <q-select v-model="subscriptionForm.frequency" :options="frequencyOptions" label="Frequency" outlined dense
            emit-value map-options class="q-mb-md" />

          <q-input v-model="subscriptionForm.nextPayment" label="Next Payment Date" type="date" outlined dense />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" @click="closeSubscriptionDialog" />
          <q-btn flat label="Save" color="primary" @click="saveSubscription" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped lang="scss">
.budget-page {
  .stat-card {
    // background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
    color: #000;

    .text-h4 {
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  .budget-categories {
    .budget-category-item {
      padding: 16px;
      border-radius: 8px;
      background: white;
      border: 1px solid #e0e0e0;
      margin-bottom: 16px;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
      }

      .budget-progress {
        border-radius: 4px;
      }
    }
  }

  .subscription-card {
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
  }
}
</style>
