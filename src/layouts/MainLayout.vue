<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header -->
    <q-header class="bg-white text-dark" style="box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)">
      <q-toolbar>
        <q-avatar size="32px" class="q-mr-sm">
          <q-icon name="account_balance_wallet" color="orange" size="24px" />
        </q-avatar>
        <q-toolbar-title class="text-weight-medium">Budget</q-toolbar-title>
        <q-btn flat round icon="notifications_none" @click="showNotifications = true" />
        <q-btn flat round icon="more_vert" @click="showMenu = true" />
      </q-toolbar>
    </q-header>

    <!-- Main Content -->
    <q-page-container>
      <q-page class="q-pa-md">
        <!-- Net Worth Card (Dashboard View) -->
        <div v-if="activeTab === 'home'">
          <q-card class="net-worth-card q-mb-md q-pa-lg">
            <div class="row items-center justify-between">
              <q-icon name="trending_up" size="24px" />
              <div class="text-center">
                <div class="text-h6">Net Worth</div>
                <div class="text-h4 text-weight-bold q-mt-xs">
                  {{ showBalances ? formatCurrency(netWorth) : '₱****' }}
                </div>
              </div>
              <q-btn flat round icon="analytics" size="sm" />
            </div>
            <div class="row q-mt-md">
              <div class="col text-center">
                <div class="text-caption opacity-80">Assets</div>
                <div class="text-h6">
                  {{ showBalances ? formatCurrency(totalAssets) : '₱****' }}
                </div>
              </div>
              <div class="col text-center">
                <div class="text-caption opacity-80">Liabilities</div>
                <div class="text-h6">
                  {{ showBalances ? formatCurrency(totalLiabilities) : '₱****' }}
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
                  {{ showBalances ? formatCurrency(monthlySpent) : '₱****' }}
                </div>
              </q-card>
            </div>
            <div class="col">
              <q-card class="bg-green text-white q-pa-md text-center" style="border-radius: 12px">
                <q-icon name="account_balance" size="32px" class="q-mb-xs" />
                <div class="text-caption">Budget Left</div>
                <div class="text-h6">{{ showBalances ? formatCurrency(budgetLeft) : '₱****' }}</div>
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
                      }}{{ showBalances ? formatCurrency(transaction.amount) : '₱****' }}
                    </div>
                    <div class="text-caption text-grey-6">{{ transaction.account }}</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Budget Overview -->
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Budget Overview</div>
              <div v-for="budget in budgetCategories" :key="budget.id" class="q-mb-md">
                <div class="row items-center justify-between q-mb-xs">
                  <div class="row items-center">
                    <q-icon :name="budget.icon" :color="budget.color" class="q-mr-sm" />
                    <span class="text-subtitle2">{{ budget.name }}</span>
                  </div>
                  <span class="text-caption text-grey-6">
                    {{ showBalances ? formatCurrency(budget.spent) : '₱****' }} /
                    {{ showBalances ? formatCurrency(budget.limit) : '₱****' }}
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
                  {{ showBalances ? formatCurrency(account.balance) : '₱****' }}
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
                      }}{{ showBalances ? formatCurrency(transaction.amount) : '₱****' }}
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

        <!-- Budget Planning View -->
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
                    {{ showBalances ? formatCurrency(totalBudget) : '₱****' }}
                  </div>
                </div>
                <div class="col text-center q-pa-md bg-orange-1 rounded-borders q-ml-sm">
                  <div class="text-caption text-grey-7">Total Spent</div>
                  <div class="text-h6 text-weight-bold">
                    {{ showBalances ? formatCurrency(totalSpent) : '₱****' }}
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
                      {{ showBalances ? formatCurrency(budget.spent) : '₱****' }} /
                      {{ showBalances ? formatCurrency(budget.limit) : '₱****' }}
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
                <div class="text-caption text-grey-6">
                  {{ Math.round((budget.spent / budget.limit) * 100) }}% used
                  <span v-if="budget.spent > budget.limit" class="text-red"> • Over budget!</span>
                  <span v-else class="text-green">
                    •
                    {{ showBalances ? formatCurrency(budget.limit - budget.spent) : '₱****' }}
                    remaining</span
                  >
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Subscriptions -->
          <q-card>
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">Subscriptions</div>
                <q-btn
                  flat
                  size="sm"
                  color="primary"
                  label="Add Subscription"
                  @click="showAddSubscriptionDialog = true"
                />
              </div>

              <div
                v-for="subscription in subscriptions"
                :key="subscription.id"
                class="subscription-card q-pa-md q-mb-sm bg-grey-1"
              >
                <div class="row items-center justify-between">
                  <div class="row items-center">
                    <q-avatar size="32px" class="q-mr-md">
                      <img :src="subscription.logo" :alt="subscription.name" />
                    </q-avatar>
                    <div>
                      <div class="text-subtitle2">{{ subscription.name }}</div>
                      <div class="text-caption text-grey-6">{{ subscription.frequency }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-subtitle1 text-weight-bold">
                      {{ showBalances ? formatCurrency(subscription.amount) : '₱****' }}
                    </div>
                    <div class="text-caption text-grey-6">
                      Next: {{ formatDate(subscription.nextPayment) }}
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
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

          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">About</div>
              <q-item>
                <q-item-section>
                  <q-item-label>Version</q-item-label>
                  <q-item-label caption>1.0.0</q-item-label>
                </q-item-section>
              </q-item>
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>

    <!-- Floating Action Button -->
    <q-btn
      fab
      icon="add"
      color="primary"
      class="floating-add-btn"
      @click="showAddTransactionDialog = true"
    />

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
              prefix="₱"
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

    <!-- Add Subscription Dialog -->
    <q-dialog v-model="showAddSubscriptionDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add Subscription</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="q-gutter-md">
            <q-input v-model="newSubscription.name" label="Service Name" required />

            <q-input
              v-model.number="newSubscription.amount"
              label="Amount"
              type="number"
              step="0.01"
              required
              prefix="₱"
            />

            <q-select
              v-model="newSubscription.frequency"
              :options="['Monthly', 'Yearly', 'Weekly']"
              label="Frequency"
              required
            />

            <q-input
              v-model="newSubscription.nextPayment"
              label="Next Payment Date"
              type="date"
              required
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="showAddSubscriptionDialog = false" />
          <q-btn label="Add" color="primary" @click="addSubscription" />
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
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const activeTab = ref('home');
const showBalances = ref(true);
const showAddTransactionDialog = ref(false);
const showAddBudgetDialog = ref(false);
const showAddSubscriptionDialog = ref(false);
const showNotifications = ref(false);
const showMenu = ref(false);
const showFilterDialog = ref(false);
const showSearchDialog = ref(false);

// Sample data based on the UI images
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
  {
    id: 5,
    name: 'BPI: Sun Life',
    number: '9199363937',
    balance: 85420.3,
    color: 'red',
    icon: 'account_balance',
    type: 'investment',
  },
  {
    id: 6,
    name: 'EastWest',
    number: '200064021221',
    balance: 23750.8,
    color: 'green',
    icon: 'account_balance',
    type: 'bank',
  },
  {
    id: 7,
    name: 'Security Bank',
    number: '7976',
    balance: 65280.45,
    color: 'blue',
    icon: 'security',
    type: 'bank',
  },
  {
    id: 8,
    name: 'UnionBank PlayEveryday',
    number: '1096 5371 1141',
    balance: 42850.2,
    color: 'orange',
    icon: 'account_balance',
    type: 'bank',
  },
  {
    id: 9,
    name: 'GoTyme',
    number: '09166453412',
    balance: 12680.75,
    color: 'cyan',
    icon: 'account_balance',
    type: 'bank',
  },
  {
    id: 10,
    name: 'UNO Digital Bank',
    number: '3000 1241 3272 72',
    balance: 18920.6,
    color: 'purple',
    icon: 'account_balance',
    type: 'bank',
  },
  {
    id: 11,
    name: 'Maya Wallet',
    number: '09166453412',
    balance: 9840.35,
    color: 'green',
    icon: 'phone_android',
    type: 'ewallet',
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
  {
    id: 3,
    description: 'Netflix Subscription',
    amount: 549.0,
    type: 'expense',
    category: { name: 'Entertainment', icon: 'movie', color: 'red' },
    account: 'GCash',
    date: new Date('2025-06-26'),
    recurring: true,
  },
  {
    id: 4,
    description: 'Gas Station',
    amount: 1850.0,
    type: 'expense',
    category: { name: 'Transportation', icon: 'local_gas_station', color: 'blue' },
    account: 'My Wallet',
    date: new Date('2025-06-25'),
    recurring: false,
  },
  {
    id: 5,
    description: 'Coffee Shop',
    amount: 285.5,
    type: 'expense',
    category: { name: 'Food & Dining', icon: 'local_cafe', color: 'orange' },
    account: 'GCash',
    date: new Date('2025-06-24'),
    recurring: false,
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
  { id: 4, name: 'Shopping', icon: 'shopping_cart', color: 'purple', limit: 10000, spent: 6420.5 },
  {
    id: 5,
    name: 'Bills & Utilities',
    icon: 'receipt',
    color: 'green',
    limit: 12000,
    spent: 8900.25,
  },
]);

const subscriptions = ref([
  {
    id: 1,
    name: 'Netflix',
    amount: 549.0,
    frequency: 'Monthly',
    nextPayment: new Date('2025-07-26'),
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0UwMDkxNCIvPgo8L3N2Zz4=',
  },
  {
    id: 2,
    name: 'Spotify',
    amount: 149.0,
    frequency: 'Monthly',
    nextPayment: new Date('2025-07-15'),
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzFEQjk1NCIvPgo8L3N2Zz4=',
  },
  {
    id: 3,
    name: 'Adobe Creative Cloud',
    amount: 2680.0,
    frequency: 'Monthly',
    nextPayment: new Date('2025-07-10'),
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0ZGMDAwMCIvPgo8L3N2Zz4=',
  },
]);

const categories = ref([
  { id: 1, name: 'Food & Dining', icon: 'restaurant', color: 'orange' },
  { id: 2, name: 'Transportation', icon: 'directions_car', color: 'blue' },
  { id: 3, name: 'Entertainment', icon: 'movie', color: 'red' },
  { id: 4, name: 'Shopping', icon: 'shopping_cart', color: 'purple' },
  { id: 5, name: 'Bills & Utilities', icon: 'receipt', color: 'green' },
  { id: 6, name: 'Health & Medical', icon: 'local_hospital', color: 'teal' },
  { id: 7, name: 'Education', icon: 'school', color: 'indigo' },
  { id: 8, name: 'Salary', icon: 'work', color: 'green' },
  { id: 9, name: 'Investment', icon: 'trending_up', color: 'blue' },
]);

const notifications = ref([
  {
    id: 1,
    title: 'Budget Alert',
    message: "You've exceeded your Entertainment budget this month",
    icon: 'warning',
    color: 'orange',
  },
  {
    id: 2,
    title: 'Upcoming Payment',
    message: 'Netflix subscription due in 2 days',
    icon: 'payment',
    color: 'blue',
  },
]);

// Form data
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

const newSubscription = ref({
  name: '',
  amount: null,
  frequency: 'Monthly',
  nextPayment: new Date().toISOString().split('T')[0],
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

const monthlySpent = computed(() => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return transactions.value
    .filter((t) => {
      const tDate = new Date(t.date);
      return (
        t.type === 'expense' &&
        tDate.getMonth() === currentMonth &&
        tDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);
});

const totalBudget = computed(() => {
  return budgetCategories.value.reduce((sum, budget) => sum + budget.limit, 0);
});

const totalSpent = computed(() => {
  return budgetCategories.value.reduce((sum, budget) => sum + budget.spent, 0);
});

const budgetLeft = computed(() => {
  return totalBudget.value - totalSpent.value;
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
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
  // Handle account selection
  console.log('Selected account:', account);
};

const addTransaction = () => {
  if (
    !newTransaction.value.description ||
    !newTransaction.value.amount ||
    !newTransaction.value.category ||
    !newTransaction.value.account
  ) {
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
};

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

const addSubscription = () => {
  if (!newSubscription.value.name || !newSubscription.value.amount) {
    return;
  }

  const subscription = {
    id: Date.now(),
    name: newSubscription.value.name,
    amount: parseFloat(newSubscription.value.amount),
    frequency: newSubscription.value.frequency,
    nextPayment: new Date(newSubscription.value.nextPayment),
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzJGOTZGMyIvPgo8L3N2Zz4=',
  };

  subscriptions.value.push(subscription);

  // Reset form
  newSubscription.value = {
    name: '',
    amount: null,
    frequency: 'Monthly',
    nextPayment: new Date().toISOString().split('T')[0],
  };

  showAddSubscriptionDialog.value = false;
  $q.notify({
    color: 'positive',
    message: 'Subscription added successfully',
    icon: 'check',
  });
};

const editTransaction = (transaction) => {
  // Handle transaction editing
  console.log('Edit transaction:', transaction);
};

const editBudget = (budget) => {
  // Handle budget editing
  console.log('Edit budget:', budget);
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
  a.download = 'transactions.csv';
  a.click();
  window.URL.revokeObjectURL(url);

  $q.notify({
    color: 'positive',
    message: 'Data exported successfully',
    icon: 'download',
  });
};

const triggerImport = () => {
  $refs.fileInput.click();
};

const importData = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      // Simple CSV parsing - in a real app, use a proper CSV parser
      const lines = e.target.result.split('\n');
      lines.forEach((line, index) => {
        if (index === 0 || !line.trim()) return; // Skip header and empty lines

        const values = line.split(',').map((v) => v.replace(/"/g, ''));
        if (values.length >= 6) {
          // Add imported transaction logic here
          console.log('Imported transaction:', values);
        }
      });

      $q.notify({
        color: 'positive',
        message: 'Data imported successfully',
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
.balance-hidden {
  font-family: monospace;
  letter-spacing: 2px;
}
.category-progress {
  height: 8px;
  border-radius: 4px;
}
.transaction-item {
  border-radius: 8px;
  margin-bottom: 8px;
}
.chart-container {
  height: 300px;
}
.mini-chart {
  height: 100px;
}
.floating-add-btn {
  position: fixed;
  bottom: 80px;
  right: 16px;
  z-index: 1000;
}
.bottom-nav {
  border-top: 1px solid #e0e0e0;
}
.account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}
.stat-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-radius: 12px;
}
.subscription-card {
  border-left: 4px solid #2196f3;
}
</style>
