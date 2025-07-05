<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header -->
    <q-header class="bg-white text-dark" style="box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)">
      <q-toolbar>
        <q-avatar size="32px" class="q-mr-sm">
          <q-icon name="account_balance_wallet" color="orange" size="24px" />
        </q-avatar>
        <q-toolbar-title class="text-weight-medium">Budget</q-toolbar-title>

        <!-- Currency Selector -->
        <q-select
          v-model="selectedCurrency"
          :options="currencies"
          option-label="symbol"
          option-value="code"
          emit-value
          map-options
          borderless
          dense
          class="q-mr-sm"
          style="min-width: 60px"
        />

        <!-- Connection Status -->
        <q-icon
          :name="isOnline ? 'wifi' : 'wifi_off'"
          :color="isOnline ? 'green' : 'red'"
          size="20px"
          class="q-mr-sm"
        />

        <q-btn flat round icon="notifications" @click="showNotifications = true">
          <q-badge v-if="unreadNotifications > 0" color="red" floating>
            {{ unreadNotifications }}
          </q-badge>
        </q-btn>
        <q-btn flat round icon="more_vert" @click="showMenu = true" />
      </q-toolbar>
    </q-header>

    <!-- Main Content -->
    <q-page-container>
      <q-page class="q-pa-md">
        <!-- Home/Dashboard View -->
        <div v-if="activeTab === 'home'">
          <!-- Net Worth Card -->
          <q-card class="net-worth-card q-mb-md q-pa-lg">
            <div class="row items-center justify-between">
              <q-icon name="trending_up" size="24px" />
              <div class="text-center">
                <div class="text-h6">Net Worth</div>
                <div class="text-h4 text-weight-bold q-mt-xs">
                  {{ showBalances ? formatCurrency(netWorth) : getCurrencySymbol() + '****' }}
                </div>
              </div>
              <q-btn flat round icon="analytics" size="sm" @click="activeTab = 'analytics'" />
            </div>
            <div class="row q-mt-md">
              <div class="col text-center">
                <div class="text-caption opacity-80">Assets</div>
                <div class="text-h6">
                  {{ showBalances ? formatCurrency(totalAssets) : getCurrencySymbol() + '****' }}
                </div>
              </div>
              <div class="col text-center">
                <div class="text-caption opacity-80">Liabilities</div>
                <div class="text-h6">
                  {{
                    showBalances ? formatCurrency(totalLiabilities) : getCurrencySymbol() + '****'
                  }}
                </div>
              </div>
            </div>
          </q-card>

          <!-- Quick Actions -->
          <div class="row q-gutter-md q-mb-md">
            <div class="col">
              <q-card
                class="quick-action-card q-pa-md text-center cursor-pointer"
                @click="showAddTransactionDialog = true"
              >
                <q-icon name="add" size="32px" color="primary" class="q-mb-xs" />
                <div class="text-caption">Add Transaction</div>
              </q-card>
            </div>
            <div class="col">
              <q-card
                class="quick-action-card q-pa-md text-center cursor-pointer"
                @click="activeTab = 'goals'"
              >
                <q-icon name="flag" size="32px" color="green" class="q-mb-xs" />
                <div class="text-caption">Goals</div>
              </q-card>
            </div>
            <div class="col">
              <q-card
                class="quick-action-card q-pa-md text-center cursor-pointer"
                @click="activeTab = 'analytics'"
              >
                <q-icon name="analytics" size="32px" color="blue" class="q-mb-xs" />
                <div class="text-caption">Analytics</div>
              </q-card>
            </div>
            <div class="col">
              <q-card
                class="quick-action-card q-pa-md text-center cursor-pointer"
                @click="activeTab = 'currency'"
              >
                <q-icon name="currency_exchange" size="32px" color="purple" class="q-mb-xs" />
                <div class="text-caption">Currency</div>
              </q-card>
            </div>
          </div>

          <!-- Recent Transactions -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">Recent Transactions</div>
                <q-btn
                  flat
                  size="sm"
                  color="primary"
                  label="View All"
                  @click="activeTab = 'transactions'"
                />
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
                      {{ transaction.category.name }} • {{ formatDate(transaction.date) }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div
                      class="text-subtitle1"
                      :class="transaction.type === 'income' ? 'text-green' : 'text-red'"
                    >
                      {{ transaction.type === 'income' ? '+' : '-'
                      }}{{
                        showBalances
                          ? formatCurrency(transaction.amount)
                          : getCurrencySymbol() + '****'
                      }}
                    </div>
                    <div class="text-caption text-grey-6">{{ transaction.account }}</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Accounts View -->
        <div v-if="activeTab === 'accounts'">
          <div class="account-grid">
            <q-card
              v-for="account in accounts"
              :key="account.id"
              class="account-card q-pa-md cursor-pointer"
              @click="selectAccount(account)"
            >
              <div class="text-center">
                <q-avatar size="48px" :color="account.color" text-color="white" class="q-mb-sm">
                  <q-icon :name="account.icon" size="24px" />
                </q-avatar>
                <div class="text-subtitle2 q-mb-xs">{{ account.name }}</div>
                <div v-if="account.number" class="text-caption text-grey-6 q-mb-sm">
                  {{ account.number }}
                </div>
                <div class="text-h6 text-weight-bold">
                  {{
                    showBalances ? formatCurrency(account.balance) : getCurrencySymbol() + '****'
                  }}
                </div>
              </div>
            </q-card>
          </div>
        </div>

        <!-- Transactions View -->
        <div v-if="activeTab === 'transactions'">
          <q-card>
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">All Transactions</div>
                <div class="row q-gutter-sm">
                  <q-btn flat size="sm" icon="filter_list" @click="showFilterDialog = true" />
                  <q-btn flat size="sm" icon="search" @click="showSearchDialog = true" />
                </div>
              </div>

              <q-separator class="q-mb-md" />

              <div
                v-for="transaction in filteredTransactions"
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
                      {{ transaction.category.name }} • {{ transaction.account }} •
                      {{ formatDateTime(transaction.date) }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div
                      class="text-subtitle1"
                      :class="transaction.type === 'income' ? 'text-green' : 'text-red'"
                    >
                      {{ transaction.type === 'income' ? '+' : '-'
                      }}{{
                        showBalances
                          ? formatCurrency(transaction.amount)
                          : getCurrencySymbol() + '****'
                      }}
                    </div>
                    <q-btn
                      flat
                      size="sm"
                      round
                      icon="more_vert"
                      @click="editTransaction(transaction)"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Budget View -->
        <div v-if="activeTab === 'budget'">
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">Monthly Budget</div>
                <q-btn
                  flat
                  size="sm"
                  color="primary"
                  label="Add Category"
                  @click="showAddBudgetDialog = true"
                />
              </div>

              <div class="row q-mb-md">
                <div class="col text-center q-pa-md bg-blue-1 rounded-borders q-mr-sm">
                  <div class="text-caption text-grey-7">Total Budget</div>
                  <div class="text-h6 text-weight-bold">
                    {{ showBalances ? formatCurrency(totalBudget) : getCurrencySymbol() + '****' }}
                  </div>
                </div>
                <div class="col text-center q-pa-md bg-orange-1 rounded-borders q-ml-sm">
                  <div class="text-caption text-grey-7">Total Spent</div>
                  <div class="text-h6 text-weight-bold">
                    {{ showBalances ? formatCurrency(totalSpent) : getCurrencySymbol() + '****' }}
                  </div>
                </div>
              </div>

              <div v-for="budget in budgetCategories" :key="budget.id" class="q-mb-lg">
                <div class="row items-center justify-between q-mb-sm">
                  <div class="row items-center">
                    <q-icon :name="budget.icon" :color="budget.color" size="20px" class="q-mr-sm" />
                    <span class="text-subtitle1">{{ budget.name }}</span>
                  </div>
                  <div class="row items-center">
                    <span class="text-caption text-grey-6 q-mr-sm">
                      {{
                        showBalances ? formatCurrency(budget.spent) : getCurrencySymbol() + '****'
                      }}
                      /
                      {{
                        showBalances ? formatCurrency(budget.limit) : getCurrencySymbol() + '****'
                      }}
                    </span>
                    <q-btn flat size="sm" round icon="edit" @click="editBudget(budget)" />
                  </div>
                </div>
                <q-linear-progress
                  :value="budget.spent / budget.limit"
                  :color="budget.spent > budget.limit ? 'red' : budget.color"
                  size="12px"
                  rounded
                  class="q-mb-xs"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- New Feature Views -->
        <div v-if="activeTab === 'currency'">
          <MultiCurrency />
        </div>

        <div v-if="activeTab === 'goals'">
          <FinancialGoals />
        </div>

        <div v-if="activeTab === 'analytics'">
          <AnalyticsDashboard />
        </div>

        <div v-if="activeTab === 'notifications'">
          <NotificationSystem />
        </div>

        <div v-if="activeTab === 'offline'">
          <OfflineManager />
        </div>

        <!-- Settings View -->
        <div v-if="activeTab === 'settings'">
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Privacy</div>
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Show Account Balances</q-item-label>
                  <q-item-label caption>Display actual amounts instead of ****</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="showBalances" />
                </q-item-section>
              </q-item>
            </q-card-section>
          </q-card>

          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Currency Settings</div>
              <q-select
                v-model="selectedCurrency"
                :options="currencies"
                option-label="name"
                option-value="code"
                label="Base Currency"
                emit-value
                map-options
              />
            </q-card-section>
          </q-card>

          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Data Management</div>
              <q-item clickable v-ripple @click="exportData">
                <q-item-section avatar>
                  <q-icon name="download" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Export Data</q-item-label>
                  <q-item-label caption>Download your data as CSV</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="triggerImport">
                <q-item-section avatar>
                  <q-icon name="upload" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Import Data</q-item-label>
                  <q-item-label caption>Import transactions from CSV</q-item-label>
                </q-item-section>
              </q-item>
              <input
                ref="fileInput"
                type="file"
                accept=".csv"
                style="display: none"
                @change="importData"
              />
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>

    <!-- Bottom Navigation -->
    <q-footer class="bg-white text-dark bottom-nav">
      <q-tabs
        v-model="activeTab"
        class="text-grey-6"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab name="home" icon="home" label="Home" />
        <q-tab name="accounts" icon="account_balance_wallet" label="Accounts" />
        <q-tab name="transactions" icon="receipt_long" label="Transactions" />
        <q-tab name="budget" icon="pie_chart" label="Budget" />
        <q-tab name="currency" icon="currency_exchange" label="Currency" />
        <q-tab name="goals" icon="flag" label="Goals" />
        <q-tab name="analytics" icon="analytics" label="Analytics" />
        <q-tab name="notifications" icon="notifications" label="Alerts" />
        <q-tab name="offline" icon="cloud_off" label="Offline" />
        <q-tab name="settings" icon="settings" label="Settings" />
      </q-tabs>
    </q-footer>

    <!-- Add Transaction Dialog -->
    <q-dialog v-model="showAddTransactionDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add Transaction</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="addTransaction" class="q-gutter-md">
            <q-input v-model="newTransaction.description" label="Description" required />
            <q-input
              v-model.number="newTransaction.amount"
              label="Amount"
              type="number"
              step="0.01"
              required
              :prefix="getCurrencySymbol()"
            />
            <q-select
              v-model="newTransaction.type"
              :options="['expense', 'income']"
              label="Type"
              required
            />
            <q-select
              v-model="newTransaction.category"
              :options="categories"
              option-label="name"
              option-value="id"
              label="Category"
              required
            />
            <q-select
              v-model="newTransaction.account"
              :options="accounts"
              option-label="name"
              option-value="name"
              label="Account"
              required
            />
            <q-input v-model="newTransaction.date" label="Date" type="date" required />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="showAddTransactionDialog = false" />
          <q-btn label="Add" color="primary" @click="addTransaction" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add Budget Dialog -->
    <q-dialog v-model="showAddBudgetDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add Budget Category</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="q-gutter-md">
            <q-input v-model="newBudget.name" label="Category Name" required />

            <q-input
              v-model.number="newBudget.limit"
              label="Budget Limit"
              type="number"
              step="0.01"
              required
              prefix="₱"
            />

            <q-select v-model="newBudget.icon" :options="iconOptions" label="Icon" required />

            <q-select v-model="newBudget.color" :options="colorOptions" label="Color" required />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="showAddBudgetDialog = false" />
          <q-btn label="Add" color="primary" @click="addBudget" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Notifications Dialog -->
    <q-dialog v-model="showNotifications">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Notifications</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="notifications.length === 0" class="text-center text-grey-6 q-pa-md">
            No notifications
          </div>
          <div v-for="notification in notifications" :key="notification.id" class="q-mb-md">
            <q-item>
              <q-item-section avatar>
                <q-icon :name="notification.icon" :color="notification.color" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ notification.title }}</q-item-label>
                <q-item-label caption>{{ notification.message }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" @click="showNotifications = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import MultiCurrency from 'src/components/MultiCurrency.vue';
import FinancialGoals from 'src/components/FinancialGoals.vue';
import AnalyticsDashboard from 'src/components/AnalyticsDashboard.vue';
import NotificationSystem from 'src/components/NotificationSystem.vue';
import OfflineManager from 'src/components/OfflineManager.vue';

const $q = useQuasar();

// State
const activeTab = ref('home');
const showBalances = ref(false);
const showAddTransactionDialog = ref(false);
const showNotifications = ref(false);
const showMenu = ref(false);
const showFilterDialog = ref(false);
const showSearchDialog = ref(false);
const showAddBudgetDialog = ref(false);
const isOnline = ref(navigator.onLine);
const selectedCurrency = ref('PHP');

// Currency data
const currencies = ref([
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
]);

// Sample data (same as before)
const accounts = ref([
  {
    id: 1,
    name: 'My Wallet',
    number: null,
    balance: 15420.5,
    color: 'orange',
    icon: 'account_balance_wallet',
    type: 'cash',
  },
  {
    id: 2,
    name: 'Seabank',
    number: '921',
    balance: 45250.75,
    color: 'blue',
    icon: 'account_balance',
    type: 'bank',
  },
  {
    id: 3,
    name: 'GCash',
    number: '09166453412',
    balance: 8750.25,
    color: 'blue',
    icon: 'phone_android',
    type: 'ewallet',
  },
  {
    id: 4,
    name: 'Metrobank: ACDC',
    number: '002-3-00279546-0',
    balance: 125680.0,
    color: 'red',
    icon: 'account_balance',
    type: 'bank',
  },
]);

const transactions = ref([
  {
    id: 1,
    description: 'Grocery Shopping',
    amount: 2450.75,
    type: 'expense',
    category: { name: 'Food & Dining', icon: 'restaurant', color: 'orange' },
    account: 'GCash',
    date: new Date('2025-06-27'),
    recurring: false,
  },
  {
    id: 2,
    description: 'Salary',
    amount: 50000.0,
    type: 'income',
    category: { name: 'Salary', icon: 'work', color: 'green' },
    account: 'Metrobank: ACDC',
    date: new Date('2025-06-25'),
    recurring: true,
  },
]);

const budgetCategories = ref([
  {
    id: 1,
    name: 'Food & Dining',
    icon: 'restaurant',
    color: 'orange',
    limit: 15000,
    spent: 8750.25,
  },
  {
    id: 2,
    name: 'Transportation',
    icon: 'directions_car',
    color: 'blue',
    limit: 8000,
    spent: 4250.8,
  },
  { id: 3, name: 'Entertainment', icon: 'movie', color: 'red', limit: 3000, spent: 2150.75 },
]);

const categories = ref([
  { id: 1, name: 'Food & Dining', icon: 'restaurant', color: 'orange' },
  { id: 2, name: 'Transportation', icon: 'directions_car', color: 'blue' },
  { id: 3, name: 'Entertainment', icon: 'movie', color: 'red' },
]);

const notifications = ref([
  {
    id: 1,
    title: 'Budget Alert',
    message: "You've exceeded your Entertainment budget this month",
    icon: 'warning',
    color: 'orange',
  },
]);

const newTransaction = ref({
  description: '',
  amount: null,
  type: 'expense',
  category: null,
  account: null,
  date: new Date().toISOString().split('T')[0],
});

const newBudget = ref({
  name: '',
  limit: null,
  icon: 'category',
  color: 'blue',
});

const iconOptions = ref([
  'restaurant',
  'directions_car',
  'movie',
  'shopping_cart',
  'receipt',
  'local_hospital',
  'school',
  'work',
  'trending_up',
  'home',
  'local_gas_station',
  'local_cafe',
  'fitness_center',
  'pets',
]);

const colorOptions = ref([
  'blue',
  'red',
  'green',
  'orange',
  'purple',
  'teal',
  'indigo',
  'pink',
  'cyan',
]);

// Computed properties
const totalAssets = computed(() => {
  return accounts.value
    .filter((account) => account.type !== 'liability')
    .reduce((sum, account) => sum + account.balance, 0);
});

const totalLiabilities = computed(() => {
  return accounts.value
    .filter((account) => account.type === 'liability')
    .reduce((sum, account) => sum + account.balance, 0);
});

const netWorth = computed(() => {
  return totalAssets.value - totalLiabilities.value;
});

const totalBudget = computed(() => {
  return budgetCategories.value.reduce((sum, budget) => sum + budget.limit, 0);
});

const totalSpent = computed(() => {
  return budgetCategories.value.reduce((sum, budget) => sum + budget.spent, 0);
});

const recentTransactions = computed(() => {
  return transactions.value
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
});

const filteredTransactions = computed(() => {
  return transactions.value.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
});

const unreadNotifications = computed(() => {
  return notifications.value.filter((n) => !n.read).length;
});

// Methods
const addBudget = () => {
  if (!newBudget.value.name || !newBudget.value.limit) {
    return;
  }

  const budget = {
    id: Date.now(),
    name: newBudget.value.name,
    icon: newBudget.value.icon,
    color: newBudget.value.color,
    limit: parseFloat(newBudget.value.limit),
    spent: 0,
  };

  budgetCategories.value.push(budget);

  // Reset form
  newBudget.value = {
    name: '',
    limit: null,
    icon: 'category',
    color: 'blue',
  };

  showAddBudgetDialog.value = false;

  $q.notify({
    color: 'positive',
    message: 'Budget category added successfully',
    icon: 'check',
  });
};

const formatCurrency = (amount) => {
  const currency = currencies.value.find((c) => c.code === selectedCurrency.value);
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: selectedCurrency.value,
    minimumFractionDigits: 2,
  }).format(amount);
};

const getCurrencySymbol = () => {
  const currency = currencies.value.find((c) => c.code === selectedCurrency.value);
  return currency ? currency.symbol : '₱';
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
};

const selectAccount = (account) => {
  console.log('Selected account:', account);
  // Navigate to account details or perform account-specific actions
};

const addTransaction = () => {
  if (
    !newTransaction.value.description ||
    !newTransaction.value.amount ||
    !newTransaction.value.category ||
    !newTransaction.value.account
  ) {
    $q.notify({
      color: 'negative',
      message: 'Please fill in all required fields',
      icon: 'error',
    });
    return;
  }

  const transaction = {
    id: Date.now(),
    description: newTransaction.value.description,
    amount: parseFloat(newTransaction.value.amount),
    type: newTransaction.value.type,
    category: newTransaction.value.category,
    account: newTransaction.value.account,
    date: new Date(newTransaction.value.date),
    recurring: false,
  };

  transactions.value.unshift(transaction);

  // Update budget spent
  const budget = budgetCategories.value.find((b) => b.name === transaction.category.name);
  if (budget && transaction.type === 'expense') {
    budget.spent += transaction.amount;
  }

  // Reset form
  newTransaction.value = {
    description: '',
    amount: null,
    type: 'expense',
    category: null,
    account: null,
    date: new Date().toISOString().split('T')[0],
  };

  showAddTransactionDialog.value = false;

  $q.notify({
    color: 'positive',
    message: 'Transaction added successfully',
    icon: 'check',
  });

  // Store offline if needed
  if (!isOnline.value) {
    storeOfflineTransaction(transaction);
  }
};

const storeOfflineTransaction = (transaction) => {
  // Store transaction for offline sync
  const offlineTransactions = JSON.parse(localStorage.getItem('offlineTransactions') || '[]');
  offlineTransactions.push({
    ...transaction,
    offline: true,
    syncStatus: 'pending',
  });
  localStorage.setItem('offlineTransactions', JSON.stringify(offlineTransactions));
};

const editTransaction = (transaction) => {
  console.log('Edit transaction:', transaction);
  // Open edit dialog
};

const editBudget = (budget) => {
  console.log('Edit budget:', budget);
  // Open edit dialog
};

const exportData = () => {
  const csvContent = transactions.value
    .map(
      (t) =>
        `"${t.description}","${t.amount}","${t.type}","${t.category.name}","${t.account}","${t.date}"`,
    )
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);

  $q.notify({
    color: 'positive',
    message: 'Data exported successfully',
    icon: 'download',
  });
};

const triggerImport = () => {
  fileInput.value.click();
};

const importData = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const lines = e.target.result.split('\n');
      let importedCount = 0;

      lines.forEach((line, index) => {
        if (index === 0 || !line.trim()) return; // Skip header and empty lines

        const values = line.split(',').map((v) => v.replace(/"/g, ''));
        if (values.length >= 6) {
          const transaction = {
            id: Date.now() + index,
            description: values[0],
            amount: parseFloat(values[1]),
            type: values[2],
            category: categories.value.find((c) => c.name === values[3]) || categories.value[0],
            account: values[4],
            date: new Date(values[5]),
            recurring: false,
          };

          transactions.value.push(transaction);
          importedCount++;
        }
      });

      $q.notify({
        color: 'positive',
        message: `${importedCount} transactions imported successfully`,
        icon: 'upload',
      });
    } catch (error) {
      $q.notify({
        color: 'negative',
        message: 'Error importing data',
        icon: 'error',
      });
    }
  };
  reader.readAsText(file);
};

// Connection monitoring
const handleOnline = () => {
  isOnline.value = true;
  $q.notify({
    color: 'positive',
    message: 'Connection restored',
    icon: 'wifi',
  });
};

const handleOffline = () => {
  isOnline.value = false;
  $q.notify({
    color: 'warning',
    message: 'Working offline',
    icon: 'wifi_off',
  });
};

// Lifecycle
onMounted(() => {
  // Add connection event listeners
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Load offline transactions on startup
  const offlineTransactions = JSON.parse(localStorage.getItem('offlineTransactions') || '[]');
  if (offlineTransactions.length > 0) {
    $q.notify({
      color: 'info',
      message: `${offlineTransactions.length} offline transactions pending sync`,
      icon: 'sync',
    });
  }
});

onUnmounted(() => {
  // Remove event listeners
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
});
</script>

<style scoped lang="scss">
.net-worth-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
}

.account-card {
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.account-card:hover {
  transform: translateY(-2px);
}

.quick-action-card {
  border-radius: 12px;
  transition: all 0.2s ease;
  border: 1px solid #e0e0e0;
}

.quick-action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.transaction-item {
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background-color 0.2s ease;
}

.transaction-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.bottom-nav {
  border-top: 1px solid #e0e0e0;
  overflow-x: auto;

  .q-tabs {
    min-width: 100%;
  }

  .q-tab {
    min-width: 80px;
    padding: 8px 4px;
    font-size: 11px;

    .q-tab__icon {
      font-size: 20px;
    }

    .q-tab__label {
      font-size: 10px;
      margin-top: 2px;
    }
  }
}

.account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

@media (max-width: 768px) {
  .bottom-nav {
    .q-tab {
      min-width: 60px;
      padding: 6px 2px;

      .q-tab__icon {
        font-size: 18px;
      }

      .q-tab__label {
        font-size: 9px;
      }
    }
  }

  .account-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
  }
}

// Responsive bottom navigation for mobile
@media (max-width: 480px) {
  .bottom-nav {
    .q-tabs {
      .q-tab {
        .q-tab__label {
          display: none; // Hide labels on very small screens
        }
      }
    }
  }
}
</style>
