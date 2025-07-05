<!-- src/pages/OfflineManagerPage.vue -->
<template>
  <div class="offline-page">
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center justify-between q-mb-lg">
        <div class="text-h5">Offline Manager</div>
        <q-chip
          :color="syncStatus.isOnline ? 'positive' : 'negative'"
          text-color="white"
          :icon="syncStatus.isOnline ? 'wifi' : 'wifi_off'"
        >
          {{ syncStatus.isOnline ? 'Online' : 'Offline' }}
        </q-chip>
      </div>

      <!-- Sync Status Card -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">Sync Status</div>
          <div class="row q-gutter-md">
            <div class="col-md-3 col-6">
              <div class="sync-stat">
                <div class="sync-value">{{ syncStatus.pendingActions }}</div>
                <div class="sync-label">Pending Actions</div>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="sync-stat">
                <div class="sync-value text-negative">{{ syncStatus.failedActions }}</div>
                <div class="sync-label">Failed Actions</div>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="sync-stat">
                <div class="sync-value text-positive">{{ syncStatistics.completed }}</div>
                <div class="sync-label">Completed</div>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="sync-stat">
                <div class="sync-value">{{ syncStatistics.successRate.toFixed(1) }}%</div>
                <div class="sync-label">Success Rate</div>
              </div>
            </div>
          </div>

          <div class="q-mt-md">
            <div class="text-body2 q-mb-sm">
              Last sync: {{ syncStatus.lastSync ? formatLastSync(syncStatus.lastSync) : 'Never' }}
            </div>
            <div class="row q-gutter-md">
              <q-btn
                color="primary"
                icon="sync"
                label="Sync Now"
                @click="syncNow"
                :loading="syncStatus.syncInProgress"
                :disable="!canSync || !syncStatus.isOnline"
              />
              <q-btn
                color="warning"
                icon="refresh"
                label="Retry Failed"
                @click="retryFailed"
                :disable="syncStatus.failedActions === 0"
              />
              <q-btn
                flat
                color="grey-7"
                icon="clear"
                label="Clear Completed"
                @click="clearCompleted"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Pending Actions -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">Pending Actions</div>

          <div v-if="pendingActions.length === 0" class="text-center text-grey-6 q-pa-md">
            No pending actions
          </div>

          <q-list v-else separator>
            <q-item v-for="action in pendingActions" :key="action.id" class="action-item">
              <q-item-section avatar>
                <q-avatar :color="getActionColor(action.type)" text-color="white" size="sm">
                  <q-icon :name="getActionIcon(action.type)" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label> {{ action.type }} {{ action.entity }} </q-item-label>
                <q-item-label caption>
                  {{ formatActionDescription(action) }}
                </q-item-label>
                <q-item-label caption>
                  {{ formatDate(action.timestamp) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-chip :color="getStatusColor(action.status)" text-color="white" size="sm">
                  {{ action.status }}
                </q-chip>
              </q-item-section>

              <q-item-section side v-if="action.status === 'failed'">
                <q-btn flat round icon="info" size="sm" @click="showActionError(action)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Data Backup -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">Data Backup</div>

          <div class="row q-gutter-md q-mb-md">
            <div class="col-md-4 col-12">
              <div class="backup-stat">
                <div class="backup-value">{{ backups.length }}</div>
                <div class="backup-label">Total Backups</div>
              </div>
            </div>
            <div class="col-md-4 col-12">
              <div class="backup-stat">
                <div class="backup-value">{{ formatFileSize(storageUsage.used) }}</div>
                <div class="backup-label">Storage Used</div>
              </div>
            </div>
            <div class="col-md-4 col-12">
              <div class="backup-stat">
                <div class="backup-value">{{ storageUsage.percentage.toFixed(1) }}%</div>
                <div class="backup-label">Storage Usage</div>
              </div>
            </div>
          </div>

          <q-linear-progress
            :value="storageUsage.percentage / 100"
            color="primary"
            size="8px"
            class="q-mb-md"
          />

          <div class="row q-gutter-md q-mb-md">
            <q-btn color="primary" icon="backup" label="Create Backup" @click="createBackup" />
            <q-btn
              color="positive"
              icon="file_download"
              label="Export Data"
              @click="showExportDialog = true"
            />
            <q-btn
              color="warning"
              icon="file_upload"
              label="Import Data"
              @click="triggerFileInput"
            />
          </div>

          <!-- Hidden file input for import -->
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            style="display: none"
            @change="handleFileImport"
          />
        </q-card-section>
      </q-card>

      <!-- Backup List -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">Backup History</div>

          <div v-if="backups.length === 0" class="text-center text-grey-6 q-pa-md">
            No backups available
          </div>

          <q-list v-else separator>
            <q-item v-for="backup in backups" :key="backup.id" class="backup-item">
              <q-item-section avatar>
                <q-avatar
                  :color="backup.type === 'manual' ? 'primary' : 'secondary'"
                  text-color="white"
                  size="sm"
                >
                  <q-icon :name="backup.type === 'manual' ? 'person' : 'schedule'" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  {{ backup.type === 'manual' ? 'Manual' : 'Automatic' }} Backup
                </q-item-label>
                <q-item-label caption>
                  {{ formatDate(backup.timestamp) }}
                </q-item-label>
                <q-item-label caption> Size: {{ formatFileSize(backup.size) }} </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-sm">
                  <q-btn flat round icon="restore" size="sm" @click="confirmRestore(backup)" />
                  <q-btn
                    flat
                    round
                    icon="delete"
                    size="sm"
                    color="negative"
                    @click="confirmDeleteBackup(backup)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Settings -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">Offline Settings</div>

          <div class="settings-list">
            <q-item>
              <q-item-section>
                <q-item-label>Auto Sync</q-item-label>
                <q-item-label caption> Automatically sync when online </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="autoSyncEnabled" />
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label>Sync Interval</q-item-label>
                <q-item-label caption> How often to check for sync (seconds) </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-input
                  v-model.number="syncInterval"
                  type="number"
                  dense
                  style="width: 100px"
                  :min="10"
                  :max="300"
                />
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label>Max Backups</q-item-label>
                <q-item-label caption> Maximum number of backups to keep </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-input
                  v-model.number="maxBackups"
                  type="number"
                  dense
                  style="width: 100px"
                  :min="1"
                  :max="50"
                />
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label>Conflict Resolution</q-item-label>
                <q-item-label caption> How to handle sync conflicts </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-select
                  v-model="conflictResolution"
                  :options="conflictOptions"
                  dense
                  style="width: 120px"
                />
              </q-item-section>
            </q-item>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Export Dialog -->
    <q-dialog v-model="showExportDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Export Data</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="q-gutter-md">
            <q-btn
              color="primary"
              icon="description"
              label="Export as JSON"
              @click="exportData('json')"
            />
            <q-btn
              color="positive"
              icon="table_chart"
              label="Export as CSV"
              @click="exportData('csv')"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showExportDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Error Dialog -->
    <q-dialog v-model="showErrorDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Action Error</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="text-body2">{{ selectedActionError }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showErrorDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useOfflineStore } from 'src/stores/offline';
import { formatDate } from 'src/utils/date';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const offlineStore = useOfflineStore();

// Refs
const fileInput = ref<HTMLInputElement>();
const showExportDialog = ref(false);
const showErrorDialog = ref(false);
const selectedActionError = ref('');

// Computed
const syncStatus = computed(() => offlineStore.syncStatus);
const pendingActions = computed(() => offlineStore.pendingActions);
const backups = computed(() => offlineStore.backups);
const storageUsage = computed(() => offlineStore.storageUsage);
const syncStatistics = computed(() => offlineStore.syncStatistics);
const canSync = computed(() => offlineStore.canSync);

const autoSyncEnabled = computed({
  get: () => offlineStore.autoSyncEnabled,
  set: (value) => (offlineStore.autoSyncEnabled = value),
});

const syncInterval = computed({
  get: () => offlineStore.syncInterval / 1000, // Convert to seconds
  set: (value) => (offlineStore.syncInterval = value * 1000),
});

const maxBackups = computed({
  get: () => offlineStore.maxBackups,
  set: (value) => (offlineStore.maxBackups = value),
});

const conflictResolution = computed({
  get: () => offlineStore.conflictResolution,
  set: (value) => (offlineStore.conflictResolution = value),
});

const conflictOptions = computed(() => [
  { label: 'Server Wins', value: 'server' },
  { label: 'Client Wins', value: 'client' },
  { label: 'Merge', value: 'merge' },
]);

// Methods
const syncNow = async () => {
  try {
    await offlineStore.syncPendingActions();
    $q.notify({
      type: 'positive',
      message: 'Sync completed successfully',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Sync failed',
    });
  }
};

const retryFailed = async () => {
  try {
    await offlineStore.retryFailedActions();
    $q.notify({
      type: 'positive',
      message: 'Retrying failed actions',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to retry actions',
    });
  }
};

const clearCompleted = () => {
  offlineStore.clearCompletedActions();
  $q.notify({
    type: 'positive',
    message: 'Completed actions cleared',
  });
};

const createBackup = () => {
  try {
    offlineStore.createBackup('manual');
    $q.notify({
      type: 'positive',
      message: 'Backup created successfully',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to create backup',
    });
  }
};

const confirmRestore = (backup: any) => {
  $q.dialog({
    title: 'Restore Backup',
    message: `Are you sure you want to restore this backup from ${formatDate(backup.timestamp)}? This will overwrite your current data.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    restoreBackup(backup);
  });
};

const restoreBackup = async (backup: any) => {
  try {
    await offlineStore.restoreBackup(backup.id);
    $q.notify({
      type: 'positive',
      message: 'Backup restored successfully',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to restore backup',
    });
  }
};

const confirmDeleteBackup = (backup: any) => {
  $q.dialog({
    title: 'Delete Backup',
    message: `Are you sure you want to delete this backup from ${formatDate(backup.timestamp)}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    offlineStore.deleteBackup(backup.id);
    $q.notify({
      type: 'positive',
      message: 'Backup deleted successfully',
    });
  });
};

const exportData = (format: 'json' | 'csv') => {
  try {
    offlineStore.exportData(format);
    showExportDialog.value = false;
    $q.notify({
      type: 'positive',
      message: 'Data exported successfully',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to export data',
    });
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileImport = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  try {
    await offlineStore.importData(file);
    $q.notify({
      type: 'positive',
      message: 'Data imported successfully',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to import data',
    });
  }

  // Reset file input
  target.value = '';
};

const showActionError = (action: any) => {
  selectedActionError.value = action.error || 'Unknown error';
  showErrorDialog.value = true;
};

const formatLastSync = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`;
  return formatDate(date);
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatActionDescription = (action: any) => {
  if (action.data.name) return action.data.name;
  if (action.data.title) return action.data.title;
  if (action.data.description) return action.data.description;
  return 'Data action';
};

const getActionColor = (type: string) => {
  switch (type) {
    case 'CREATE':
      return 'positive';
    case 'UPDATE':
      return 'warning';
    case 'DELETE':
      return 'negative';
    default:
      return 'primary';
  }
};

const getActionIcon = (type: string) => {
  switch (type) {
    case 'CREATE':
      return 'add';
    case 'UPDATE':
      return 'edit';
    case 'DELETE':
      return 'delete';
    default:
      return 'sync';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'positive';
    case 'failed':
      return 'negative';
    case 'syncing':
      return 'warning';
    default:
      return 'primary';
  }
};

// Initialize offline store
offlineStore.initialize();
</script>

<style scoped>
.offline-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.sync-stat,
.backup-stat {
  text-align: center;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.sync-value,
.backup-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.sync-label,
.backup-label {
  font-size: 0.875rem;
  color: #666;
}

.action-item,
.backup-item {
  border-radius: 8px;
  margin-bottom: 8px;
}

.action-item:hover,
.backup-item:hover {
  background-color: #f5f5f5;
}

.settings-list {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.settings-list .q-item {
  border-bottom: 1px solid #e0e0e0;
}

.settings-list .q-item:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .sync-value,
  .backup-value {
    font-size: 1.25rem;
  }
}
</style>
