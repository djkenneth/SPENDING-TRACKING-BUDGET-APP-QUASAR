<!-- src/pages/HomePage.vue -->
<template>
  <div class="home-page">
    <!-- Net Worth Card -->
    <q-card class="net-worth-card q-mb-md q-pa-lg">
      <div class="row items-center justify-between">
        <q-icon name="trending_up" size="24px" />
        <div class="text-center">
          <div class="text-h6">Net Worth</div>
          <div class="text-h4 text-weight-bold q-mt-xs">
            {{ formattedNetWorth }}
          </div>
        </div>
        <q-btn flat round icon="analytics" size="sm" />
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
    <div class="row q-gutter-md q-mb-md">
      <div class="col">
        <q-card class="stat-card q-pa-md text-center">
          <q-icon name="savings" size="32px" class="q-mb-xs" />
          <div class="text-caption">This Month</div>
          <div class="text-h6">
            {{ formattedMonthlySpent }}
          </div>
        </q-card>
      </div>
      <div class="col">
        <q-card class="bg-green text-white q-pa-md text-center" style="border-radius: 12px">
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
          <q-btn flat size="sm" color="primary" label="View All" @click="goToTransactions" />
        </div>

        <div v-if="recentTransactions.length === 0" class="text-center text-grey-6 q-pa-md">
          No recent transactions
        </div>

        <div
          v-for="transaction in recentTransactions"
          :key="transaction.id"
          class="transaction-item q-pa-sm"
        >
          <div class="row items-center">
            <q-avatar
              size="40px"
              :color="transaction.category.color"
              text-color="white"
              class="q-mr-md"
            >
              <q-icon :name="transaction.category.icon" />
            </q-avatar>
            <div class="col">
              <div class="text-subtitle2">{{ transaction.description }}</div>
              <div class="text-caption text-grey-6">
                {{ transaction.category.name }} • {{ formatTransactionDate(transaction.date) }}
              </div>
            </div>
            <div class="text-right">
              <div
                class="text-subtitle1"
                :class="transaction.type === 'income' ? 'text-green' : 'text-red'"
              >
                {{ formatTransactionAmount(transaction.amount, transaction.type) }}
              </div>
              <div class="text-caption text-grey-6">{{ transaction.account?.name }}</div>
            </div>
          </div>
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
              <q-icon :name="budget.icon" :color="budget.color" class="q-mr-sm" />
              <span class="text-subtitle2">{{ budget.name }}</span>
            </div>
            <span class="text-caption text-grey-6">
              {{ formatBudgetSpent(budget.spent) }} /
              {{ formatBudgetLimit(budget.limit) }}
            </span>
          </div>
          <q-linear-progress
            :value="budget.spent / budget.limit"
            :color="budget.spent > budget.limit ? 'red' : budget.color"
            class="category-progress"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAccounts } from 'src/composables/useAccounts';
import { useTransactions } from 'src/composables/useTransactions';
import { useBudget } from 'src/composables/useBudget';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency } from 'src/utils/currency';

const router = useRouter();
const settingsStore = useSettingsStore();

// Composables
const { totalAssets, formattedTotalAssets } = useAccounts();

const { recentTransactions, monthlySpent, formatTransactionAmount, formatTransactionDate } =
  useTransactions();

const { budgetCategories, budgetLeft, formattedBudgetLeft } = useBudget();

// Computed properties
const formattedNetWorth = computed(() => {
  // For now, net worth is just total assets (no liabilities tracking)
  return settingsStore.settings.showBalances
    ? formatCurrency(totalAssets.value, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
});

const formattedTotalLiabilities = computed(() => {
  // Placeholder for liabilities - could be expanded later
  return settingsStore.settings.showBalances
    ? formatCurrency(0, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
});

const formattedMonthlySpent = computed(() => {
  return settingsStore.settings.showBalances
    ? formatCurrency(monthlySpent.value, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
});

// Methods
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
  height: 6px;
  border-radius: 3px;
}

.opacity-80 {
  opacity: 0.8;
}
</style>
