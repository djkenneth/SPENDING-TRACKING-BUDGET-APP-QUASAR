<!-- src/pages/HomePage.vue -->
<template>
  <div class="home-page">
    <!-- Net Worth Card -->
    <q-card class="net-worth-card q-mb-md">
      <q-card-section>
        <div class="text-overline opacity-80">Net Worth</div>
        <div class="text-h4 text-weight-bold">{{ formattedNetWorth }}</div>
        <div class="row q-mt-sm">
          <div class="col-6">
            <div class="text-caption opacity-80">Total Assets</div>
            <div class="text-subtitle1">{{ formattedTotalAssets }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption opacity-80">Total Liabilities</div>
            <div class="text-subtitle1">{{ formattedTotalLiabilities }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Quick Stats -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-6">
        <q-card class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="trending_down" color="negative" size="32px" />
            <div class="text-caption text-grey-6 q-mt-sm">Monthly Spent</div>
            <div class="text-h6 text-weight-bold">{{ formattedMonthlySpent }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6">
        <q-card class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="account_balance_wallet" color="positive" size="32px" />
            <div class="text-caption text-grey-6 q-mt-sm">Budget Left</div>
            <div class="text-h6 text-weight-bold">{{ formattedBudgetLeft }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent Transactions -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Recent Transactions</div>
          <q-btn flat color="primary" label="View All" @click="router.push('/transactions')" />
        </div>

        <div v-if="loading" class="text-center q-pa-md">
          <q-spinner color="primary" size="40px" />
        </div>

        <div v-else-if="recentTransactions.length === 0" class="text-center text-grey-6 q-pa-md">
          No recent transactions
        </div>

        <div v-else>
          <q-item v-for="transaction in recentTransactions" :key="transaction.id" class="transaction-item q-mb-sm"
            clickable @click="router.push(`/transactions?id=${transaction.id}`)">
            <q-item-section avatar>
              <q-avatar :color="transaction.type === 'income' ? 'positive' : 'negative'" text-color="white" size="40px">
                <q-icon :name="transaction.category?.icon || 'receipt'" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ transaction.description }}</q-item-label>
              <q-item-label caption>
                {{ transaction.category?.name || 'Uncategorized' }} •
                {{ formatDate(transaction.date) }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label :class="transaction.type === 'income' ? 'text-positive' : 'text-negative'"
                class="text-weight-bold">
                {{ formatTransactionAmount(transaction.amount, transaction.type) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </q-card-section>
    </q-card>

    <!-- Budget Overview -->
    <q-card>
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Budget Overview</div>
          <q-btn flat color="primary" label="Manage" @click="router.push('/budget')" />
        </div>

        <div v-if="budgetLoading" class="text-center q-pa-md">
          <q-spinner color="primary" size="40px" />
        </div>

        <div v-else-if="budgetCategories.length === 0" class="text-center text-grey-6 q-pa-md">
          <q-icon name="pie_chart" size="48px" class="q-mb-sm" />
          <div>No budget categories set up</div>
          <q-btn flat color="primary" label="Set Up Budget" class="q-mt-sm" @click="router.push('/budget')" />
        </div>

        <div v-else>
          <div v-for="budget in budgetCategories.slice(0, 5)" :key="budget.id" class="q-mb-md">
            <div class="row items-center justify-between q-mb-xs">
              <div class="row items-center">
                <q-icon :name="budget.icon || 'category'" :color="budget.color" class="q-mr-sm" />
                <span class="text-subtitle2">{{ budget.name }}</span>
              </div>
              <span class="text-caption text-grey-6">
                {{ formatBudgetSpent(budget.spent) }} /
                {{ formatBudgetLimit(budget.limit) }}
              </span>
            </div>
            <q-linear-progress :value="calculateProgress(budget.spent, budget.limit)"
              :color="getProgressColor(budget.spent, budget.limit)" class="category-progress" rounded />
          </div>

          <div v-if="budgetCategories.length > 5" class="text-center q-mt-md">
            <q-btn flat color="primary" :label="`View all ${budgetCategories.length} categories`"
              @click="router.push('/budget')" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from 'src/stores/settings';
import { useBudgetsStore } from 'src/stores/budget';
import { formatCurrency } from 'src/utils/currency';
import { format } from 'date-fns';
import { transactionsService } from 'src/services/transactions.service';
import { accountsService } from 'src/services/accounts.service';

const router = useRouter();
const settingsStore = useSettingsStore();
const budgetsStore = useBudgetsStore();

// Local state
const loading = ref(false);
const budgetLoading = ref(false);
const recentTransactions = ref<any[]>([]);
const accountsSummary = ref<any>(null);
const monthlyStats = ref<any>(null);

// ============================================================================
// Computed Properties
// ============================================================================

const totalAssets = computed(() => accountsSummary.value?.total_balance || 0);

const formattedTotalAssets = computed(() => {
  return settingsStore.settings.showBalances
    ? formatCurrency(totalAssets.value, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
});

const formattedNetWorth = computed(() => {
  return settingsStore.settings.showBalances
    ? formatCurrency(totalAssets.value, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
});

const formattedTotalLiabilities = computed(() => {
  return settingsStore.settings.showBalances
    ? formatCurrency(0, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
});

const monthlySpent = computed(() => {
  return monthlyStats.value?.total_expenses || 0;
});

const formattedMonthlySpent = computed(() => {
  return settingsStore.settings.showBalances
    ? formatCurrency(monthlySpent.value, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
});

const budgetLeft = computed(() => {
  return budgetsStore.monthlyBudget?.remaining || 0;
});

const formattedBudgetLeft = computed(() => {
  return settingsStore.settings.showBalances
    ? formatCurrency(budgetLeft.value, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
});

// Budget categories from store
const budgetCategories = computed(() => {
  return budgetsStore.categoryBreakdown.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    limit: cat.budget_amount,
    spent: cat.spent_amount,
  }));
});

// ============================================================================
// Methods
// ============================================================================

const formatDate = (date: string) => {
  return format(new Date(date), 'MMM d, yyyy');
};

const formatTransactionAmount = (amount: number, type: string) => {
  const prefix = type === 'income' ? '+' : '-';
  if (!settingsStore.settings.showBalances) {
    return `${prefix}${settingsStore.settings.currencySymbol}****`;
  }
  return `${prefix}${formatCurrency(amount, settingsStore.settings.currency)}`;
};

const formatBudgetSpent = (spent: number) => {
  if (!settingsStore.settings.showBalances) {
    return `${settingsStore.settings.currencySymbol}****`;
  }
  return formatCurrency(spent, settingsStore.settings.currency);
};

const formatBudgetLimit = (limit: number) => {
  if (!settingsStore.settings.showBalances) {
    return `${settingsStore.settings.currencySymbol}****`;
  }
  return formatCurrency(limit, settingsStore.settings.currency);
};

const calculateProgress = (spent: number, limit: number) => {
  if (limit === 0) return 0;
  return Math.min(spent / limit, 1);
};

const getProgressColor = (spent: number, limit: number) => {
  const progress = calculateProgress(spent, limit);
  if (progress >= 1) return 'negative';
  if (progress >= 0.8) return 'warning';
  return 'positive';
};

// ============================================================================
// Data Fetching
// ============================================================================

const fetchRecentTransactions = async () => {
  try {
    const response = await transactionsService.getTransactions({
      per_page: 5,
      sort_by: 'date',
      sort_direction: 'desc',
    });
    if (response.success && response.data) {
      recentTransactions.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch recent transactions:', error);
  }
};

const fetchAccountsSummary = async () => {
  try {
    const response = await accountsService.getAccountsSummary();
    if (response.success && response.data) {
      accountsSummary.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch accounts summary:', error);
  }
};

const fetchMonthlyStats = async () => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const response = await transactionsService.getTransactionStatistics({
      start_date: startOfMonth.toISOString().split('T')[0],
      end_date: endOfMonth.toISOString().split('T')[0],
    });
    if (response.success && response.data) {
      monthlyStats.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch monthly stats:', error);
  }
};

const fetchBudgetData = async () => {
  budgetLoading.value = true;
  try {
    await budgetsStore.initializeBudgetData();
  } catch (error) {
    console.error('Failed to fetch budget data:', error);
  } finally {
    budgetLoading.value = false;
  }
};

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      fetchRecentTransactions(),
      fetchAccountsSummary(),
      fetchMonthlyStats(),
      fetchBudgetData(),
    ]);
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.home-page {
  padding: 16px;
}

.net-worth-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
}

.stat-card {
  border-radius: 12px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.transaction-item {
  border-radius: 8px;
  transition: background-color 0.2s;
}

.transaction-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.category-progress {
  height: 8px;
  border-radius: 4px;
}

.opacity-80 {
  opacity: 0.8;
}
</style>
