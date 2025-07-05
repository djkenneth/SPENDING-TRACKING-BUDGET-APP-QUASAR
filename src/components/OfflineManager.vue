<template>
  <div class="offline-manager">
    <!-- Connection Status -->
    <q-banner v-if="!isOnline" class="bg-orange text-white q-mb-md" icon="wifi_off">
      <template #action>
        <q-btn flat label="Retry" @click="checkConnection" :loading="checkingConnection" />
      </template>
      You're offline. Data will sync when connection is restored.
    </q-banner>

    <q-banner
      v-if="isOnline && pendingSyncItems.length > 0"
      class="bg-blue text-white q-mb-md"
      icon="sync"
    >
      <template #action>
        <q-btn flat label="Sync Now" @click="syncData" :loading="syncing" />
      </template>
      {{ pendingSyncItems.length }} items pending sync
    </q-banner>

    <!-- Offline Storage Status -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">Offline Storage</div>

        <div class="row q-gutter-md">
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="text-center q-pa-md">
              <q-icon name="storage" size="32px" color="blue" class="q-mb-sm" />
              <div class="text-h6 text-weight-bold">{{ formatBytes(storageUsed) }}</div>
              <div class="text-caption text-grey-7">Storage Used</div>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="text-center q-pa-md">
              <q-icon name="cloud_queue" size="32px" color="green" class="q-mb-sm" />
              <div class="text-h6 text-weight-bold">{{ syncedItems }}</div>
              <div class="text-caption text-grey-7">Synced Items</div>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="text-center q-pa-md">
              <q-icon name="schedule" size="32px" color="orange" class="q-mb-sm" />
              <div class="text-h6 text-weight-bold">{{ pendingSyncItems.length }}</div>
              <div class="text-caption text-grey-7">Pending Sync</div>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="text-center q-pa-md">
              <q-icon name="update" size="32px" color="purple" class="q-mb-sm" />
              <div class="text-h6 text-weight-bold">{{ formatTimeAgo(lastSync) }}</div>
              <div class="text-caption text-grey-7">Last Sync</div>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Offline Transactions -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">Offline Transactions</div>

        <div v-if="offlineTransactions.length === 0" class="text-center text-grey-6 q-pa-lg">
          <q-icon name="sync_disabled" size="64px" class="q-mb-md" />
          <div class="text-h6">No Offline Transactions</div>
          <div class="text-caption">All transactions are synced with the server</div>
        </div>

        <div
          v-for="transaction in offlineTransactions"
          :key="transaction.id"
          class="offline-transaction q-mb-md"
        >
          <q-card flat bordered class="q-pa-md">
            <div class="row items-center">
              <q-avatar size="40px" color="orange" text-color="white" class="q-mr-md">
                <q-icon name="sync_problem" />
              </q-avatar>

              <div class="col">
                <div class="text-subtitle1 text-weight-medium">{{ transaction.description }}</div>
                <div class="text-caption text-grey-6">
                  {{ transaction.category }} • {{ formatDateTime(transaction.createdAt) }}
                </div>
              </div>

              <div class="text-right">
                <div
                  class="text-h6 text-weight-bold"
                  :class="transaction.type === 'income' ? 'text-green' : 'text-red'"
                >
                  {{ transaction.type === 'income' ? '+' : '-'
                  }}{{ formatCurrency(transaction.amount) }}
                </div>
                <div class="text-caption text-grey-6">Offline</div>
              </div>
            </div>

            <div class="row q-mt-md q-gutter-sm">
              <q-btn
                flat
                size="sm"
                color="primary"
                label="Sync Now"
                icon="sync"
                @click="syncTransaction(transaction)"
                :loading="transaction.syncing"
              />
              <q-btn
                flat
                size="sm"
                color="grey"
                label="Edit"
                icon="edit"
                @click="editOfflineTransaction(transaction)"
              />
              <q-btn
                flat
                size="sm"
                color="red"
                label="Delete"
                icon="delete"
                @click="deleteOfflineTransaction(transaction)"
              />
            </div>
          </q-card>
        </div>
      </q-card-section>
    </q-card>

    <!-- Data Backup -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">Data Backup</div>

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle1 q-mb-md">Local Backup</div>
              <div class="text-caption text-grey-6 q-mb-md">
                Last backup: {{ formatDateTime(lastBackup) }}
              </div>
              <q-btn
                color="primary"
                label="Create Backup"
                icon="backup"
                @click="createBackup"
                :loading="creatingBackup"
                class="full-width"
              />
            </q-card>
          </div>

          <div class="col-12 col-md-6">
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle1 q-mb-md">Restore Data</div>
              <div class="text-caption text-grey-6 q-mb-md">Restore from backup file</div>
              <q-btn
                color="secondary"
                label="Restore Backup"
                icon="restore"
                @click="triggerRestore"
                class="full-width"
              />
              <input
                ref="restoreFileInput"
                type="file"
                accept=".json"
                style="display: none"
                @change="restoreBackup"
              />
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Sync Settings -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">Sync Settings</div>

        <q-list>
          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label>Auto Sync</q-item-label>
              <q-item-label caption>Automatically sync when online</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="syncSettings.autoSync" />
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label>Sync on WiFi Only</q-item-label>
              <q-item-label caption>Only sync when connected to WiFi</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="syncSettings.wifiOnly" />
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label>Background Sync</q-item-label>
              <q-item-label caption>Sync data in background</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="syncSettings.backgroundSync" />
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label>Offline Mode</q-item-label>
              <q-item-label caption>Continue working offline</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="syncSettings.offlineMode" />
            </q-item-section>
          </q-item>
        </q-list>

        <div class="q-mt-md">
          <q-btn
            color="primary"
            label="Force Full Sync"
            icon="sync"
            @click="forceFullSync"
            :loading="syncing"
            class="q-mr-sm"
          />
          <q-btn
            color="negative"
            label="Clear Cache"
            icon="clear_all"
            @click="clearCache"
            outline
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

// Connection state
const isOnline = ref(navigator.onLine);
const checkingConnection = ref(false);
const syncing = ref(false);
const creatingBackup = ref(false);

// Storage stats
const storageUsed = ref(0);
const syncedItems = ref(0);
const lastSync = ref(new Date());
const lastBackup = ref(new Date());

// Offline data
const offlineTransactions = ref([
  {
    id: 'offline_1',
    description: 'Coffee Shop',
    amount: 150.5,
    type: 'expense',
    category: 'Food & Dining',
    account: 'Cash',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    syncing: false,
  },
  {
    id: 'offline_2',
    description: 'Grocery Store',
    amount: 2500.0,
    type: 'expense',
    category: 'Food & Dining',
    account: 'GCash',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    syncing: false,
  },
]);

const pendingSyncItems = ref([
  { id: 1, type: 'transaction', description: 'Coffee Shop - ₱150.50' },
  { id: 2, type: 'transaction', description: 'Grocery Store - ₱2,500.00' },
  { id: 3, type: 'budget', description: 'Food & Dining budget update' },
]);

// Sync settings
const syncSettings = ref({
  autoSync: true,
  wifiOnly: false,
  backgroundSync: true,
  offlineMode: true,
});

// File input ref
const restoreFileInput = ref(null);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const diffTime = now - date;
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

const checkConnection = async () => {
  checkingConnection.value = true;

  try {
    // Simulate network check
    await new Promise((resolve) => setTimeout(resolve, 1000));
    isOnline.value = navigator.onLine;

    if (isOnline.value && syncSettings.value.autoSync) {
      await syncData();
    }
  } catch (error) {
    console.error('Connection check failed:', error);
  } finally {
    checkingConnection.value = false;
  }
};

const syncData = async () => {
  if (!isOnline.value) {
    $q.notify({
      color: 'negative',
      message: 'Cannot sync while offline',
      icon: 'wifi_off',
    });
    return;
  }

  syncing.value = true;

  try {
    // Simulate sync process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Clear pending sync items
    pendingSyncItems.value = [];
    offlineTransactions.value = [];
    syncedItems.value += 3;
    lastSync.value = new Date();

    $q.notify({
      color: 'positive',
      message: 'Data synced successfully',
      icon: 'cloud_done',
    });
  } catch (error) {
    console.error('Sync failed:', error);
    $q.notify({
      color: 'negative',
      message: 'Sync failed. Please try again.',
      icon: 'sync_problem',
    });
  } finally {
    syncing.value = false;
  }
};

const syncTransaction = async (transaction) => {
  if (!isOnline.value) {
    $q.notify({
      color: 'negative',
      message: 'Cannot sync while offline',
      icon: 'wifi_off',
    });
    return;
  }

  transaction.syncing = true;

  try {
    // Simulate individual transaction sync
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Remove from offline transactions
    const index = offlineTransactions.value.findIndex((t) => t.id === transaction.id);
    if (index > -1) {
      offlineTransactions.value.splice(index, 1);
    }

    // Remove from pending sync items
    const pendingIndex = pendingSyncItems.value.findIndex((item) =>
      item.description.includes(transaction.description),
    );
    if (pendingIndex > -1) {
      pendingSyncItems.value.splice(pendingIndex, 1);
    }

    syncedItems.value += 1;

    $q.notify({
      color: 'positive',
      message: 'Transaction synced successfully',
      icon: 'check',
    });
  } catch (error) {
    console.error('Transaction sync failed:', error);
    $q.notify({
      color: 'negative',
      message: 'Transaction sync failed',
      icon: 'error',
    });
  } finally {
    transaction.syncing = false;
  }
};

const editOfflineTransaction = (transaction) => {
  // This would open an edit dialog
  console.log('Edit offline transaction:', transaction);
};

const deleteOfflineTransaction = (transaction) => {
  $q.dialog({
    title: 'Delete Offline Transaction',
    message: `Are you sure you want to delete this offline transaction?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    const index = offlineTransactions.value.findIndex((t) => t.id === transaction.id);
    if (index > -1) {
      offlineTransactions.value.splice(index, 1);

      // Remove from pending sync items
      const pendingIndex = pendingSyncItems.value.findIndex((item) =>
        item.description.includes(transaction.description),
      );
      if (pendingIndex > -1) {
        pendingSyncItems.value.splice(pendingIndex, 1);
      }

      $q.notify({
        color: 'positive',
        message: 'Offline transaction deleted',
        icon: 'check',
      });
    }
  });
};

const createBackup = async () => {
  creatingBackup.value = true;

  try {
    // Simulate backup creation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create backup data
    const backupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      transactions: offlineTransactions.value,
      settings: syncSettings.value,
      storageInfo: {
        storageUsed: storageUsed.value,
        syncedItems: syncedItems.value,
        lastSync: lastSync.value,
      },
    };

    // Download backup file
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-app-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    lastBackup.value = new Date();

    $q.notify({
      color: 'positive',
      message: 'Backup created successfully',
      icon: 'backup',
    });
  } catch (error) {
    console.error('Backup creation failed:', error);
    $q.notify({
      color: 'negative',
      message: 'Backup creation failed',
      icon: 'error',
    });
  } finally {
    creatingBackup.value = false;
  }
};

const triggerRestore = () => {
  restoreFileInput.value.click();
};

const restoreBackup = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const backupData = JSON.parse(text);

    // Validate backup data
    if (!backupData.version || !backupData.timestamp) {
      throw new Error('Invalid backup file');
    }

    // Restore data
    if (backupData.transactions) {
      offlineTransactions.value = backupData.transactions;
    }
    if (backupData.settings) {
      syncSettings.value = { ...syncSettings.value, ...backupData.settings };
    }
    if (backupData.storageInfo) {
      storageUsed.value = backupData.storageInfo.storageUsed || 0;
      syncedItems.value = backupData.storageInfo.syncedItems || 0;
      lastSync.value = new Date(backupData.storageInfo.lastSync) || new Date();
    }

    $q.notify({
      color: 'positive',
      message: 'Backup restored successfully',
      icon: 'restore',
    });
  } catch (error) {
    console.error('Backup restore failed:', error);
    $q.notify({
      color: 'negative',
      message: 'Invalid backup file or restore failed',
      icon: 'error',
    });
  }

  // Reset file input
  event.target.value = '';
};

const forceFullSync = async () => {
  await syncData();
};

const clearCache = () => {
  $q.dialog({
    title: 'Clear Cache',
    message: 'This will clear all offline data. Are you sure?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    offlineTransactions.value = [];
    pendingSyncItems.value = [];
    storageUsed.value = 0;

    $q.notify({
      color: 'positive',
      message: 'Cache cleared successfully',
      icon: 'clear_all',
    });
  });
};

// Connection event handlers
const handleOnline = () => {
  isOnline.value = true;
  if (syncSettings.value.autoSync) {
    syncData();
  }
};

const handleOffline = () => {
  isOnline.value = false;
};

// Calculate storage usage
const calculateStorageUsage = () => {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length;
      }
    }
    storageUsed.value = total * 2; // Approximate bytes (each character is 2 bytes in UTF-16)
    syncedItems.value = Object.keys(localStorage).length;
  } catch (error) {
    console.error('Storage calculation failed:', error);
  }
};

onMounted(() => {
  // Add event listeners
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Calculate initial storage usage
  calculateStorageUsage();

  // Auto-sync if online and auto-sync is enabled
  if (isOnline.value && syncSettings.value.autoSync) {
    syncData();
  }
});

onUnmounted(() => {
  // Remove event listeners
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
});
</script>

<style scoped>
.offline-manager {
  max-width: 1000px;
  margin: 0 auto;
}

.offline-transaction {
  transition: transform 0.2s ease;
}

.offline-transaction:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .offline-manager {
    padding: 0 8px;
  }
}
</style>
