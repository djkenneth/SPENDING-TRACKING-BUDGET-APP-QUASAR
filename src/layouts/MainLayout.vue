<!-- src/layouts/MainLayout.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          Budget Tracker
        </q-toolbar-title>

        <q-btn flat round dense icon="notifications" @click="showNotifications = true">
          <q-badge v-if="unreadCount > 0" color="red" floating>{{ unreadCount }}</q-badge>
        </q-btn>

        <q-btn flat round dense icon="brightness_4" @click="toggleDarkMode">
          <q-tooltip>Toggle Dark Mode</q-tooltip>
        </q-btn>

        <q-btn flat round dense icon="more_vert" @click="showMenu = true" />
      </q-toolbar>
    </q-header>

    <!-- Sidebar Drawer -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          Navigation
        </q-item-label>

        <q-item clickable @click="navigateTo('dashboard')" :active="isActive('dashboard')">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboard</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable @click="navigateTo('accounts')" :active="isActive('accounts')">
          <q-item-section avatar>
            <q-icon name="account_balance_wallet" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Accounts</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable @click="navigateTo('transactions')" :active="isActive('transactions')">
          <q-item-section avatar>
            <q-icon name="receipt_long" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Transactions</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable @click="navigateTo('categories')" :active="isActive('categories')">
          <q-item-section avatar>
            <q-icon name="category" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Categories</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable @click="navigateTo('budget')" :active="isActive('budget')">
          <q-item-section avatar>
            <q-icon name="account_balance" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Budget</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable @click="navigateTo('goals')" :active="isActive('goals')">
          <q-item-section avatar>
            <q-icon name="flag" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Goals</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable @click="navigateTo('analytics')" :active="isActive('analytics')">
          <q-item-section avatar>
            <q-icon name="analytics" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Analytics</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item clickable @click="navigateTo('settings')" :active="isActive('settings')">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Settings</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Transaction Dialog -->
    <q-dialog v-model="showAddTransactionDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add Transaction</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select v-model="transactionForm.type" :options="transactionTypes" label="Type" option-label="label"
            option-value="value" emit-value map-options outlined dense class="q-mb-md" />

          <q-select v-model="transactionForm.account_id" :options="accountOptions" label="Account" option-label="name"
            option-value="id" emit-value map-options outlined dense class="q-mb-md" />

          <q-select v-model="transactionForm.category_id" :options="categoryOptions" label="Category"
            option-label="name" option-value="id" emit-value map-options outlined dense class="q-mb-md" />

          <q-input v-model.number="transactionForm.amount" type="number" label="Amount" outlined dense
            class="q-mb-md" />

          <q-input v-model="transactionForm.description" label="Description" outlined dense class="q-mb-md" />

          <q-input v-model="transactionForm.date" type="date" label="Date" outlined dense />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="closeAddTransactionDialog" />
          <q-btn label="Add" color="primary" @click="addTransaction" :loading="loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Notifications Dialog -->
    <q-dialog v-model="showNotifications">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="text-h6">Notifications</div>
            <q-btn flat round icon="mark_email_read" @click="markAllAsRead" v-if="unreadCount > 0" />
          </div>
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
              <q-item-section side v-if="!notification.read">
                <q-badge color="red" />
              </q-item-section>
            </q-item>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" @click="showNotifications = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Menu Dialog -->
    <q-dialog v-model="showMenu">
      <q-card style="min-width: 300px">
        <q-list>
          <q-item clickable @click="toggleBalanceVisibility">
            <q-item-section avatar>
              <q-icon :name="settings.showBalances ? 'visibility_off' : 'visibility'" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ settings.showBalances ? 'Hide' : 'Show' }} Balances</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable @click="goToSettings">
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Settings</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable @click="exportData">
            <q-item-section avatar>
              <q-icon name="download" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Export Data</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useSettingsStore } from '../stores/settings';
import { useAccountsStore } from '../stores/accounts';
import { useCategoriesStore } from '../stores/categories';
import { useTransactionsStore } from '../stores/transactions';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const settingsStore = useSettingsStore();
const accountStore = useAccountsStore();
const categoryStore = useCategoriesStore();
const transactionStore = useTransactionsStore();

// Drawer state
const leftDrawerOpen = ref(true);

// Dialog states
const showAddTransactionDialog = ref(false);
const showNotifications = ref(false);
const showMenu = ref(false);
const loading = ref(false);

// Transaction form
const transactionForm = ref({
  type: 'expense',
  account_id: null,
  category_id: null,
  amount: 0,
  description: '',
  date: new Date().toISOString().split('T')[0],
});

const transactionTypes = [
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
  { label: 'Transfer', value: 'transfer' },
];

// Computed properties
const settings = computed(() => settingsStore.settings);
const notifications = computed(() => settingsStore.notifications);
const unreadCount = computed(() => settingsStore.unreadCount);
const accountOptions = computed(() => accountStore.accounts);
const categoryOptions = computed(() => categoryStore.categories);

// Methods
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const toggleDarkMode = () => {
  const newTheme = $q.dark.isActive ? 'light' : 'dark';
  settingsStore.setTheme(newTheme);
  $q.dark.set(newTheme === 'dark');

  $q.notify({
    message: `Switched to ${newTheme} mode`,
    color: 'primary',
    icon: newTheme === 'dark' ? 'dark_mode' : 'light_mode',
    position: 'top',
    timeout: 1000,
  });
};

const navigateTo = async (routeName: string) => {
  if (route.name !== routeName) {
    await router.push({ name: routeName });
  }
};

const isActive = (routeName: string) => {
  return route.name === routeName;
};

const openAddTransactionDialog = () => {
  resetTransactionForm();
  showAddTransactionDialog.value = true;
};

const closeAddTransactionDialog = () => {
  showAddTransactionDialog.value = false;
  resetTransactionForm();
};

const resetTransactionForm = () => {
  transactionForm.value = {
    type: 'expense',
    account_id: null,
    category_id: null,
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
  };
};

const addTransaction = async () => {
  try {
    loading.value = true;
    // await transactionStore.createTransaction(transactionForm.value);
    closeAddTransactionDialog();
    $q.notify({
      type: 'positive',
      message: 'Transaction added successfully',
      position: 'top',
    });
  } catch (error) {
    console.error('Error adding transaction:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to add transaction',
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
};

const toggleBalanceVisibility = () => {
  settingsStore.toggleBalancesVisibility();
  showMenu.value = false;
};

const goToSettings = async () => {
  showMenu.value = false;
  await router.push({ name: 'settings' });
};

const markAllAsRead = () => {
  settingsStore.markAllNotificationsAsRead();
};

const exportData = () => {
  $q.notify({
    type: 'info',
    message: 'Export functionality coming soon!',
    position: 'top',
  });
  showMenu.value = false;
};
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
