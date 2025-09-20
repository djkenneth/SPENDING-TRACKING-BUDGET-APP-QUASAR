<!-- src/pages/HomePage.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAccounts, useAccountsSummary } from 'src/composables/useAccounts';
import { useTransactions, useTransactionStatistics } from 'src/composables/useTransactions';
import { useBudget } from 'src/composables/useBudget';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency } from 'src/utils/currency';
import { startOfMonth, endOfMonth } from 'date-fns';

const router = useRouter();
const settingsStore = useSettingsStore();

// Use Accounts composable
const { data: accountsData } = useAccounts();
const { data: accountsSummary } = useAccountsSummary();

// Use Transactions composable with filters for current month
const currentMonthFilter = computed(() => ({
  date_from: startOfMonth(new Date()).toISOString(),
  date_to: endOfMonth(new Date()).toISOString(),
  limit: 5,
  sort_by: 'date',
  sort_order: 'desc' as const
}));

const { data: transactionsData } = useTransactions(currentMonthFilter);
const { data: statisticsData } = useTransactionStatistics(currentMonthFilter);

const { budgetCategories, budgetLeft, formattedBudgetLeft } = useBudget();

// Computed properties
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
  return statisticsData.value?.total_expenses || 0;
});

const formattedMonthlySpent = computed(() => {
  return settingsStore.settings.showBalances
    ? formatCurrency(monthlySpent.value, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
});

const recentTransactions = computed(() => {
  return transactionsData.value?.data || [];
});

// Methods
const formatTransactionAmount = (amount: number, type: string) => {
  const prefix = type === 'income' ? '+' : '-';
  if (settingsStore.settings.showBalances) {
    return `${prefix}${formatCurrency(Math.abs(amount), settingsStore.settings.currency)}`;
  }
  return `${prefix}${settingsStore.settings.currencySymbol}****`;
};

const formatTransactionDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const goToTransactions = async () => {
  settingsStore.setActiveTab('transactions');
  await router.push('/transactions');
};

const formatBudgetSpent = (spent: number) => {
  return settingsStore.settings.showBalances
    ? formatCurrency(spent, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
};

const formatBudgetLimit = (limit: number) => {
  return settingsStore.settings.showBalances
    ? formatCurrency(limit, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
};
</script>

<template>
  <div class="home-page">
    <!-- Net Worth Card -->
    <q-card class="net-worth-card q-mb-md q-pa-lg">
      <div class="row items-center justify-center">
        <div class="text-center">
          <div class="text-h6">Net Worth</div>
          <div class="text-h4 text-weight-bold q-mt-xs">
            {{ formattedNetWorth }}
          </div>
        </div>
      </div>
      <div class="row q-mt-md">
        <div class="col text-center">
          <div class="text-caption opacity-80">Assets</div>
          <div class="text-h6">
            {{ formattedTotalAssets }}
          </div>
        </div>
        <div class="col text-center">
          <div class="text-caption opacity-80">Liabilities</div>
          <div class="text-h6">
            {{ formattedTotalLiabilities }}
          </div>
        </div>
      </div>
    </q-card>

    <!-- Quick Stats -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col">
        <q-card class="stat-card q-pa-md text-center items-center">
          <q-icon name="savings" size="32px" class="q-mb-xs" />
          <div class="text-caption">This Month</div>
          <div class="text-h6">
            {{ formattedMonthlySpent }}
          </div>
        </q-card>
      </div>
      <div class="col">
        <q-card class="stat-card text-white q-pa-md text-center items-center bg-green">
          <q-icon name="account_balance" size="32px" class="q-mb-xs" />
          <div class="text-caption">Budget Left</div>
          <div class="text-h6">
            {{ formattedBudgetLeft }}
          </div>
        </q-card>
      </div>
    </div>

    <!-- Recent Transactions -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Recent Transactions</div>
          <q-btn flat size="md" color="primary" label="View All" @click="goToTransactions" />
        </div>

        <div v-if="recentTransactions.length === 0" class="text-center text-grey-6 q-pa-md">
          No recent transactions
        </div>

        <div v-for="transaction in recentTransactions.slice(0, 5)" :key="transaction.id">
          <q-item class="transaction-item q-px-none">
            <q-item-section>
              <q-item-label>{{ transaction.description }}</q-item-label>
              <q-item-label caption>{{ formatTransactionDate(transaction.date) }}</q-item-label>
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
        <div class="text-h6 q-mb-md">Budget Overview</div>

        <div v-if="budgetCategories.length === 0" class="text-center text-grey-6 q-pa-md">
          No budget categories set up
        </div>

        <div v-for="budget in budgetCategories" :key="budget.id" class="q-mb-md">
          <div class="row items-center justify-between q-mb-xs">
            <div class="row items-center">
              <span class="text-subtitle2">{{ budget.name }}</span>
            </div>
            <span class="text-caption text-grey-6">
              {{ formatBudgetSpent(budget.spent) }} /
              {{ formatBudgetLimit(budget.limit) }}
            </span>
          </div>
          <q-linear-progress :value="budget.spent / budget.limit"
            :color="budget.spent > budget.limit ? 'red' : budget.color" class="category-progress" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

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
  border-radius: 3px;
}

.opacity-80 {
  opacity: 0.8;
}
</style>
