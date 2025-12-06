<!-- src/layouts/MainLayout.vue -->
<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header -->
    <q-header class="bg-white text-dark" style="box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)">
      <q-toolbar>
        <q-avatar size="32px" class="q-mr-sm">
          <q-icon name="account_balance_wallet" color="orange" size="24px" />
        </q-avatar>
        <q-toolbar-title class="text-weight-medium">Budget</q-toolbar-title>
        <q-btn flat round icon="notifications_none" @click="showNotifications = true">
          <q-badge v-if="unreadCount > 0" color="red" floating>{{ unreadCount }}</q-badge>
        </q-btn>
        <q-btn flat round icon="more_vert" @click="showMenu = true" />
      </q-toolbar>
    </q-header>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Floating Action Button -->
    <!-- <q-btn fab icon="add" color="primary" class="floating-add-btn" @click="openAddTransactionDialog" /> -->

    <!-- Bottom Navigation -->
    <q-footer class="bg-white text-dark bottom-nav">
      <q-tabs v-model="activeTab" class="text-grey-6" active-color="primary" indicator-color="primary"
        @update:model-value="handleTabChange">
        <q-tab name="home" content-class="column">
          <q-icon name="home" size="sm" />
          <p class="q-mb-none" style="font-size: 0.7rem; font-weight: 500;">Home</p>
        </q-tab>
        <q-tab name="accounts" content-class="column">
          <q-icon name="account_balance_wallet" size="sm" />
          <p class="q-mb-none" style="font-size: 0.7rem; font-weight: 500;">Accounts</p>
        </q-tab>
        <q-tab name="transactions" content-class="column">
          <q-icon name="receipt_long" size="sm" />
          <p class="q-mb-none" style="font-size: 0.7rem; font-weight: 500;">Transactions</p>
        </q-tab>
        <q-tab name="budget" content-class="column">
          <q-icon name="pie_chart" size="sm" />
          <p class="q-mb-none" style="font-size: 0.7rem; font-weight: 500;">Budget</p>
        </q-tab>
        <q-tab name="settings">
          <q-icon name="settings" size="sm" />
          <p class="q-mb-none" style="font-size: 0.7rem; font-weight: 500;">Settings</p>
        </q-tab>
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
            <q-input v-model="transactionForm.description" label="Description" required
              :rules="[(val) => (val && val.length > 0) || 'Description is required']" />

            <q-input v-model.number="transactionForm.amount" label="Amount" type="number" step="0.01" required
              :prefix="settings.currencySymbol" :rules="[(val) => val > 0 || 'Amount must be greater than 0']" />

            <q-select v-model="transactionForm.type" :options="transactionTypeOptions" label="Type" required />

            <q-select v-model="transactionForm.category" :options="categories" option-label="name" option-value="id"
              label="Category" required />

            <q-select v-model="transactionForm.account" :options="accounts" option-label="name" option-value="name"
              label="Account" required />

            <q-input v-model="transactionForm.date" label="Date" type="date" required />
          </q-form>
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
              <q-icon name="file_download" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Export Data</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable @click="showMenu = false">
            <q-item-section avatar>
              <q-icon name="close" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Close</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
interface RoutesProps {
  home: string;
  accounts: string;
  transactions: string;
  budget: string;
  settings: string;
}

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTransactions } from 'src/composables/useTransactions';
import { useAccounts } from 'src/composables/useAccounts';
import { useSettingsStore } from 'src/stores/settings';
import { useQuasar } from 'quasar';

const router = useRouter();
const settingsStore = useSettingsStore();
const $q = useQuasar();

// Composables
const {
  transactionForm,
  categories,
  transactionTypeOptions,
  saveTransaction: saveTransactionComposable,
  loading,
  resetTransactionForm,
} = useTransactions();

const { accounts } = useAccounts();

// Local state
const showNotifications = ref(false);
const showMenu = ref(false);
const showAddTransactionDialog = ref(false);
const activeTab = ref('home')

// Computed properties
// const activeTab = computed({
//   get: () => settingsStore.activeTab,
//   set: (value) => settingsStore.setActiveTab(value),
// });

const settings = computed(() => settingsStore.settings);
const notifications = computed(() => settingsStore.notifications);
const unreadCount = computed(() => settingsStore.unreadCount);

// Methods
const handleTabChange = async (tabName: keyof RoutesProps) => {
  const routes: RoutesProps = {
    home: '/',
    accounts: '/accounts',
    transactions: '/transactions',
    budget: '/budget',
    settings: '/settings',
  };

  const route = routes[tabName];
  if (route && router.currentRoute.value.path !== route) {
    await router.push(route);
  }
};

const openAddTransactionDialog = () => {
  resetTransactionForm();
  showAddTransactionDialog.value = true;
};

const closeAddTransactionDialog = () => {
  showAddTransactionDialog.value = false;
  resetTransactionForm();
};

const addTransaction = async () => {
  try {
    await saveTransactionComposable();
    closeAddTransactionDialog();
  } catch (error) {
    console.error('Error adding transaction:', error);
  }
};

const toggleBalanceVisibility = () => {
  settingsStore.toggleBalancesVisibility();
  showMenu.value = false;
};

const goToSettings = async () => {
  showMenu.value = false;
  settingsStore.setActiveTab('settings');
  await router.push('/settings');
};

const markAllAsRead = () => {
  settingsStore.markAllNotificationsAsRead();
};

const exportData = () => {
  // This would implement data export functionality
  $q.notify({
    type: 'info',
    message: 'Export functionality coming soon!',
    position: 'top',
  });
  showMenu.value = false;
};
</script>

<style scoped>
.floating-add-btn {
  position: fixed;
  bottom: 80px;
  right: 16px;
  z-index: 1000;
}

.bottom-nav {
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}
</style>
