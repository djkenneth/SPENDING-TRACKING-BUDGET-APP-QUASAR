<template>
  <div class="max-w-[1000px] mx-auto px-2 md:px-0">
    <!-- Connection Status: Offline Banner -->
    <Alert v-if="!isOnline" variant="destructive" class="mb-4">
      <WifiOff class="w-4 h-4" />
      <AlertTitle>Offline</AlertTitle>
      <AlertDescription class="flex items-center justify-between">
        <span>You're offline. Data will sync when connection is restored.</span>
        <Button
          variant="outline"
          size="sm"
          @click="checkConnection"
          :disabled="checkingConnection"
        >
          <Loader2 v-if="checkingConnection" class="w-4 h-4 mr-1 animate-spin" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>

    <!-- Connection Status: Pending Sync Banner -->
    <Alert v-if="isOnline && pendingSyncItems.length > 0" class="mb-4">
      <RefreshCw class="w-4 h-4" />
      <AlertTitle>Pending Sync</AlertTitle>
      <AlertDescription class="flex items-center justify-between">
        <span>{{ pendingSyncItems.length }} items pending sync</span>
        <Button
          variant="outline"
          size="sm"
          @click="syncData"
          :disabled="syncing"
        >
          <Loader2 v-if="syncing" class="w-4 h-4 mr-1 animate-spin" />
          Sync Now
        </Button>
      </AlertDescription>
    </Alert>

    <!-- Offline Storage Status -->
    <Card class="mb-4">
      <CardHeader class="pb-3">
        <CardTitle class="text-lg">Offline Storage</CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card class="border text-center p-4">
            <HardDrive class="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div class="text-xl font-bold">{{ formatBytes(storageUsed) }}</div>
            <div class="text-xs text-muted-foreground mt-1">Storage Used</div>
          </Card>

          <Card class="border text-center p-4">
            <Cloud class="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            <div class="text-xl font-bold">{{ syncedItems }}</div>
            <div class="text-xs text-muted-foreground mt-1">Synced Items</div>
          </Card>

          <Card class="border text-center p-4">
            <Clock class="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <div class="text-xl font-bold">{{ pendingSyncItems.length }}</div>
            <div class="text-xs text-muted-foreground mt-1">Pending Sync</div>
          </Card>

          <Card class="border text-center p-4">
            <RefreshCw class="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <div class="text-xl font-bold">{{ formatTimeAgo(lastSync) }}</div>
            <div class="text-xs text-muted-foreground mt-1">Last Sync</div>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- Offline Transactions -->
    <Card class="mb-4">
      <CardHeader class="pb-3">
        <CardTitle class="text-lg">Offline Transactions</CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <div
          v-if="offlineTransactions.length === 0"
          class="text-center text-muted-foreground py-10"
        >
          <CloudOff class="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <div class="text-lg font-semibold">No Offline Transactions</div>
          <div class="text-xs text-muted-foreground mt-1">
            All transactions are synced with the server
          </div>
        </div>

        <div class="space-y-3">
          <Card
            v-for="transaction in offlineTransactions"
            :key="transaction.id"
            class="border p-4 transition-transform hover:-translate-y-0.5"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0"
              >
                <AlertTriangle class="w-5 h-5" />
              </div>

              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium">{{ transaction.description }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ transaction.category }} &bull; {{ formatDateTime(transaction.createdAt) }}
                </div>
              </div>

              <div class="text-right shrink-0">
                <div
                  class="text-lg font-bold"
                  :class="
                    transaction.type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  "
                >
                  {{ transaction.type === 'income' ? '+' : '-'
                  }}{{ formatCurrency(transaction.amount) }}
                </div>
                <div class="text-xs text-muted-foreground">Offline</div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                @click="syncTransaction(transaction)"
                :disabled="transaction.syncing"
              >
                <Loader2
                  v-if="transaction.syncing"
                  class="w-4 h-4 mr-1 animate-spin"
                />
                <RefreshCw v-else class="w-4 h-4 mr-1" />
                Sync Now
              </Button>
              <Button
                variant="ghost"
                size="sm"
                @click="editOfflineTransaction(transaction)"
              >
                <Pencil class="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                class="text-destructive hover:text-destructive"
                @click="openDeleteDialog(transaction)"
              >
                <Trash2 class="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- Data Backup -->
    <Card class="mb-4">
      <CardHeader class="pb-3">
        <CardTitle class="text-lg">Data Backup</CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card class="border p-4">
            <div class="text-sm font-medium mb-3">Local Backup</div>
            <div class="text-xs text-muted-foreground mb-3">
              Last backup: {{ formatDateTime(lastBackup) }}
            </div>
            <Button
              class="w-full"
              @click="createBackup"
              :disabled="creatingBackup"
            >
              <Loader2 v-if="creatingBackup" class="w-4 h-4 mr-1 animate-spin" />
              <HardDrive v-else class="w-4 h-4 mr-1" />
              Create Backup
            </Button>
          </Card>

          <Card class="border p-4">
            <div class="text-sm font-medium mb-3">Restore Data</div>
            <div class="text-xs text-muted-foreground mb-3">
              Restore from backup file
            </div>
            <Button
              variant="secondary"
              class="w-full"
              @click="triggerRestore"
            >
              <RotateCcw class="w-4 h-4 mr-1" />
              Restore Backup
            </Button>
            <input
              ref="restoreFileInput"
              type="file"
              accept=".json"
              class="hidden"
              @change="restoreBackup"
            />
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- Sync Settings -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-lg">Sync Settings</CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <div class="flex items-center justify-between py-4 border-b">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Auto Sync</div>
            <div class="text-xs text-muted-foreground">
              Automatically sync when online
            </div>
          </div>
          <Switch
            :checked="syncSettings.autoSync"
            @update:checked="(v: boolean) => { syncSettings.autoSync = v; }"
          />
        </div>

        <div class="flex items-center justify-between py-4 border-b">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Sync on WiFi Only</div>
            <div class="text-xs text-muted-foreground">
              Only sync when connected to WiFi
            </div>
          </div>
          <Switch
            :checked="syncSettings.wifiOnly"
            @update:checked="(v: boolean) => { syncSettings.wifiOnly = v; }"
          />
        </div>

        <div class="flex items-center justify-between py-4 border-b">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Background Sync</div>
            <div class="text-xs text-muted-foreground">
              Sync data in background
            </div>
          </div>
          <Switch
            :checked="syncSettings.backgroundSync"
            @update:checked="(v: boolean) => { syncSettings.backgroundSync = v; }"
          />
        </div>

        <div class="flex items-center justify-between py-4 border-b">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Offline Mode</div>
            <div class="text-xs text-muted-foreground">
              Continue working offline
            </div>
          </div>
          <Switch
            :checked="syncSettings.offlineMode"
            @update:checked="(v: boolean) => { syncSettings.offlineMode = v; }"
          />
        </div>

        <div class="flex flex-wrap gap-2 mt-4">
          <Button
            @click="forceFullSync"
            :disabled="syncing"
          >
            <Loader2 v-if="syncing" class="w-4 h-4 mr-1 animate-spin" />
            <RefreshCw v-else class="w-4 h-4 mr-1" />
            Force Full Sync
          </Button>
          <Button
            variant="destructive"
            @click="openClearCacheDialog"
          >
            <Trash2 class="w-4 h-4 mr-1" />
            Clear Cache
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Delete Transaction Confirmation Dialog -->
    <Dialog
      :open="showDeleteDialog"
      @update:open="(v: boolean) => { showDeleteDialog = v; }"
    >
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Offline Transaction</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this offline transaction?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex gap-2">
          <Button variant="outline" @click="showDeleteDialog = false">
            Cancel
          </Button>
          <Button variant="destructive" @click="confirmDeleteTransaction">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Clear Cache Confirmation Dialog -->
    <Dialog
      :open="showClearCacheDialog"
      @update:open="(v: boolean) => { showClearCacheDialog = v; }"
    >
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Clear Cache</DialogTitle>
          <DialogDescription>
            This will clear all offline data. Are you sure?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex gap-2">
          <Button variant="outline" @click="showClearCacheDialog = false">
            Cancel
          </Button>
          <Button variant="destructive" @click="confirmClearCache">
            Clear Cache
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { toast } from 'vue-sonner';

// shadcn-vue components
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from 'src/components/ui/alert';
import { Switch } from 'src/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';

// Lucide icons
import {
  WifiOff,
  RefreshCw,
  HardDrive,
  Cloud,
  Clock,
  CloudOff,
  AlertTriangle,
  Pencil,
  Trash2,
  RotateCcw,
  Loader2,
} from 'lucide-vue-next';

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
  { id: 1, type: 'transaction', description: 'Coffee Shop - \u20B1150.50' },
  { id: 2, type: 'transaction', description: 'Grocery Store - \u20B12,500.00' },
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
const restoreFileInput = ref<HTMLInputElement | null>(null);

// Dialog state refs (replacing $q.dialog)
const showDeleteDialog = ref(false);
const showClearCacheDialog = ref(false);
const transactionToDelete = ref<(typeof offlineTransactions.value)[0] | null>(null);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const formatDateTime = (date: Date) => {
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
    toast.error('Cannot sync while offline');
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

    toast.success('Data synced successfully');
  } catch (error) {
    console.error('Sync failed:', error);
    toast.error('Sync failed. Please try again.');
  } finally {
    syncing.value = false;
  }
};

const syncTransaction = async (transaction: (typeof offlineTransactions.value)[0]) => {
  if (!isOnline.value) {
    toast.error('Cannot sync while offline');
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

    toast.success('Transaction synced successfully');
  } catch (error) {
    console.error('Transaction sync failed:', error);
    toast.error('Transaction sync failed');
  } finally {
    transaction.syncing = false;
  }
};

const editOfflineTransaction = (transaction: (typeof offlineTransactions.value)[0]) => {
  // This would open an edit dialog
  console.log('Edit offline transaction:', transaction);
};

const openDeleteDialog = (transaction: (typeof offlineTransactions.value)[0]) => {
  transactionToDelete.value = transaction;
  showDeleteDialog.value = true;
};

const confirmDeleteTransaction = () => {
  const transaction = transactionToDelete.value;
  if (!transaction) return;

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

    toast.success('Offline transaction deleted');
  }

  showDeleteDialog.value = false;
  transactionToDelete.value = null;
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

    toast.success('Backup created successfully');
  } catch (error) {
    console.error('Backup creation failed:', error);
    toast.error('Backup creation failed');
  } finally {
    creatingBackup.value = false;
  }
};

const triggerRestore = () => {
  restoreFileInput.value?.click();
};

const restoreBackup = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
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

    toast.success('Backup restored successfully');
  } catch (error) {
    console.error('Backup restore failed:', error);
    toast.error('Invalid backup file or restore failed');
  }

  // Reset file input
  (event.target as HTMLInputElement).value = '';
};

const forceFullSync = async () => {
  await syncData();
};

const openClearCacheDialog = () => {
  showClearCacheDialog.value = true;
};

const confirmClearCache = () => {
  offlineTransactions.value = [];
  pendingSyncItems.value = [];
  storageUsed.value = 0;

  toast.success('Cache cleared successfully');
  showClearCacheDialog.value = false;
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
