<!-- src/pages/OfflineManagerPage.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useOfflineStore } from 'src/stores/offline';
import { formatDate } from 'src/utilities/date';
import { toast } from 'vue-sonner';

// shadcn-vue components
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Badge } from 'src/components/ui/badge';
import { Input } from 'src/components/ui/input';
import { Switch } from 'src/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
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
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2,
  Trash2,
  Plus,
  Pencil,
  RotateCcw,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  User,
  Info,
  HardDrive,
} from 'lucide-vue-next';

const offlineStore = useOfflineStore();

// Refs
const fileInput = ref<HTMLInputElement>();
const showExportDialog = ref(false);
const showErrorDialog = ref(false);
const showRestoreConfirm = ref(false);
const showDeleteBackupConfirm = ref(false);
const selectedActionError = ref('');
const selectedBackup = ref<any>(null);

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
  get: () => offlineStore.syncInterval / 1000,
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

const conflictOptions = [
  { label: 'Server Wins', value: 'server' },
  { label: 'Client Wins', value: 'client' },
  { label: 'Merge', value: 'merge' },
];

// Methods
const syncNow = async () => {
  try {
    await offlineStore.syncPendingActions();
    toast.success('Sync completed successfully');
  } catch (error) {
    toast.error('Sync failed');
  }
};

const retryFailed = async () => {
  try {
    await offlineStore.retryFailedActions();
    toast.success('Retrying failed actions');
  } catch (error) {
    toast.error('Failed to retry actions');
  }
};

const clearCompleted = () => {
  offlineStore.clearCompletedActions();
  toast.success('Completed actions cleared');
};

const createBackup = () => {
  try {
    offlineStore.createBackup('manual');
    toast.success('Backup created successfully');
  } catch (error) {
    toast.error('Failed to create backup');
  }
};

const confirmRestore = (backup: any) => {
  selectedBackup.value = backup;
  showRestoreConfirm.value = true;
};

const restoreBackup = async () => {
  if (!selectedBackup.value) return;
  try {
    await offlineStore.restoreBackup(selectedBackup.value.id);
    toast.success('Backup restored successfully');
  } catch (error) {
    toast.error('Failed to restore backup');
  } finally {
    showRestoreConfirm.value = false;
    selectedBackup.value = null;
  }
};

const confirmDeleteBackup = (backup: any) => {
  selectedBackup.value = backup;
  showDeleteBackupConfirm.value = true;
};

const deleteBackup = () => {
  if (!selectedBackup.value) return;
  offlineStore.deleteBackup(selectedBackup.value.id);
  toast.success('Backup deleted successfully');
  showDeleteBackupConfirm.value = false;
  selectedBackup.value = null;
};

const exportData = (format: 'json' | 'csv') => {
  try {
    offlineStore.exportData(format);
    showExportDialog.value = false;
    toast.success('Data exported successfully');
  } catch (error) {
    toast.error('Failed to export data');
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
    toast.success('Data imported successfully');
  } catch (error) {
    toast.error('Failed to import data');
  }

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
      return 'bg-emerald-500';
    case 'UPDATE':
      return 'bg-amber-500';
    case 'DELETE':
      return 'bg-red-500';
    default:
      return 'bg-primary';
  }
};

const getActionIcon = (type: string) => {
  switch (type) {
    case 'CREATE':
      return Plus;
    case 'UPDATE':
      return Pencil;
    case 'DELETE':
      return Trash2;
    default:
      return RefreshCw;
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'secondary' as const;
    case 'failed':
      return 'destructive' as const;
    case 'syncing':
      return 'default' as const;
    default:
      return 'outline' as const;
  }
};

// Initialize offline store
offlineStore.initialize();
</script>

<template>
  <div class="p-4 space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Offline Manager</h1>
      <Badge
        :variant="syncStatus.isOnline ? 'default' : 'destructive'"
        class="flex items-center gap-1"
      >
        <Wifi v-if="syncStatus.isOnline" class="w-3 h-3" />
        <WifiOff v-else class="w-3 h-3" />
        {{ syncStatus.isOnline ? 'Online' : 'Offline' }}
      </Badge>
    </div>

    <!-- Sync Status Card -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-lg">Sync Status</CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div class="text-center p-3 bg-muted/50 rounded-lg">
            <div class="text-2xl font-bold">{{ syncStatus.pendingActions }}</div>
            <div class="text-xs text-muted-foreground mt-1">Pending Actions</div>
          </div>
          <div class="text-center p-3 bg-muted/50 rounded-lg">
            <div class="text-2xl font-bold text-destructive">{{ syncStatus.failedActions }}</div>
            <div class="text-xs text-muted-foreground mt-1">Failed Actions</div>
          </div>
          <div class="text-center p-3 bg-muted/50 rounded-lg">
            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ syncStatistics.completed }}</div>
            <div class="text-xs text-muted-foreground mt-1">Completed</div>
          </div>
          <div class="text-center p-3 bg-muted/50 rounded-lg">
            <div class="text-2xl font-bold">{{ syncStatistics.successRate.toFixed(1) }}%</div>
            <div class="text-xs text-muted-foreground mt-1">Success Rate</div>
          </div>
        </div>

        <div class="text-sm text-muted-foreground mb-3">
          Last sync: {{ syncStatus.lastSync ? formatLastSync(syncStatus.lastSync) : 'Never' }}
        </div>

        <div class="flex flex-wrap gap-2">
          <Button
            @click="syncNow"
            :disabled="!canSync || !syncStatus.isOnline || syncStatus.syncInProgress"
          >
            <Loader2 v-if="syncStatus.syncInProgress" class="w-4 h-4 mr-1 animate-spin" />
            <RefreshCw v-else class="w-4 h-4 mr-1" />
            Sync Now
          </Button>
          <Button
            variant="outline"
            @click="retryFailed"
            :disabled="syncStatus.failedActions === 0"
          >
            <RotateCcw class="w-4 h-4 mr-1" /> Retry Failed
          </Button>
          <Button variant="ghost" @click="clearCompleted">
            <Trash2 class="w-4 h-4 mr-1" /> Clear Completed
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Pending Actions -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-lg">Pending Actions</CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <div v-if="pendingActions.length === 0" class="text-center text-muted-foreground py-6">
          No pending actions
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="action in pendingActions"
            :key="action.id"
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white"
              :class="getActionColor(action.type)"
            >
              <component :is="getActionIcon(action.type)" class="w-4 h-4" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium">{{ action.type }} {{ action.entity }}</div>
              <div class="text-xs text-muted-foreground truncate">
                {{ formatActionDescription(action) }}
              </div>
              <div class="text-xs text-muted-foreground">
                {{ formatDate(action.timestamp) }}
              </div>
            </div>

            <Badge :variant="getStatusVariant(action.status)" class="flex-shrink-0">
              {{ action.status }}
            </Badge>

            <Button
              v-if="action.status === 'failed'"
              variant="ghost"
              size="icon"
              class="h-8 w-8 flex-shrink-0"
              @click="showActionError(action)"
            >
              <Info class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Data Backup -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-lg">Data Backup</CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div class="text-center p-3 bg-muted/50 rounded-lg">
            <div class="text-2xl font-bold">{{ backups.length }}</div>
            <div class="text-xs text-muted-foreground mt-1">Total Backups</div>
          </div>
          <div class="text-center p-3 bg-muted/50 rounded-lg">
            <div class="text-2xl font-bold">{{ formatFileSize(storageUsage.used) }}</div>
            <div class="text-xs text-muted-foreground mt-1">Storage Used</div>
          </div>
          <div class="text-center p-3 bg-muted/50 rounded-lg">
            <div class="text-2xl font-bold">{{ storageUsage.percentage.toFixed(1) }}%</div>
            <div class="text-xs text-muted-foreground mt-1">Storage Usage</div>
          </div>
        </div>

        <!-- Storage progress bar -->
        <div class="mb-4">
          <div class="h-2 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-primary transition-all"
              :style="{ width: storageUsage.percentage + '%' }"
            />
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mb-4">
          <Button @click="createBackup">
            <HardDrive class="w-4 h-4 mr-1" /> Create Backup
          </Button>
          <Button variant="outline" @click="showExportDialog = true">
            <Download class="w-4 h-4 mr-1" /> Export Data
          </Button>
          <Button variant="outline" @click="triggerFileInput">
            <Upload class="w-4 h-4 mr-1" /> Import Data
          </Button>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleFileImport"
        />
      </CardContent>
    </Card>

    <!-- Backup History -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-lg">Backup History</CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <div v-if="backups.length === 0" class="text-center text-muted-foreground py-6">
          No backups available
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="backup in backups"
            :key="backup.id"
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white"
              :class="backup.type === 'manual' ? 'bg-primary' : 'bg-violet-500'"
            >
              <User v-if="backup.type === 'manual'" class="w-4 h-4" />
              <Clock v-else class="w-4 h-4" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium">
                {{ backup.type === 'manual' ? 'Manual' : 'Automatic' }} Backup
              </div>
              <div class="text-xs text-muted-foreground">
                {{ formatDate(backup.timestamp) }}
              </div>
              <div class="text-xs text-muted-foreground">
                Size: {{ formatFileSize(backup.size) }}
              </div>
            </div>

            <div class="flex gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" class="h-8 w-8" @click="confirmRestore(backup)">
                <RotateCcw class="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive" @click="confirmDeleteBackup(backup)">
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Offline Settings -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-lg">Offline Settings</CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <div class="flex items-center justify-between py-4 border-b">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Auto Sync</div>
            <div class="text-xs text-muted-foreground">Automatically sync when online</div>
          </div>
          <Switch
            :checked="autoSyncEnabled"
            @update:checked="(v: boolean) => { autoSyncEnabled = v; }"
          />
        </div>

        <div class="flex items-center justify-between py-4 border-b">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Sync Interval</div>
            <div class="text-xs text-muted-foreground">How often to check for sync (seconds)</div>
          </div>
          <Input
            :model-value="syncInterval"
            @update:model-value="(v: any) => { syncInterval = Number(v); }"
            type="number"
            class="w-[100px]"
            :min="10"
            :max="300"
          />
        </div>

        <div class="flex items-center justify-between py-4 border-b">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Max Backups</div>
            <div class="text-xs text-muted-foreground">Maximum number of backups to keep</div>
          </div>
          <Input
            :model-value="maxBackups"
            @update:model-value="(v: any) => { maxBackups = Number(v); }"
            type="number"
            class="w-[100px]"
            :min="1"
            :max="50"
          />
        </div>

        <div class="flex items-center justify-between py-4">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Conflict Resolution</div>
            <div class="text-xs text-muted-foreground">How to handle sync conflicts</div>
          </div>
          <Select
            :model-value="conflictResolution"
            @update:model-value="(v: any) => { conflictResolution = v; }"
          >
            <SelectTrigger class="w-[140px]">
              <SelectValue placeholder="Resolution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in conflictOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Export Dialog -->
    <Dialog :open="showExportDialog" @update:open="(v: boolean) => { showExportDialog = v; }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>Choose your preferred export format</DialogDescription>
        </DialogHeader>
        <div class="flex flex-col gap-3 py-4">
          <Button variant="outline" class="justify-start h-auto py-3" @click="exportData('json')">
            <FileJson class="w-5 h-5 mr-3 text-primary" />
            <div class="text-left">
              <div class="font-medium">Export as JSON</div>
              <div class="text-xs text-muted-foreground">Full data backup format</div>
            </div>
          </Button>
          <Button variant="outline" class="justify-start h-auto py-3" @click="exportData('csv')">
            <FileSpreadsheet class="w-5 h-5 mr-3 text-emerald-500" />
            <div class="text-left">
              <div class="font-medium">Export as CSV</div>
              <div class="text-xs text-muted-foreground">Spreadsheet compatible format</div>
            </div>
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showExportDialog = false">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Error Dialog -->
    <Dialog :open="showErrorDialog" @update:open="(v: boolean) => { showErrorDialog = v; }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <AlertCircle class="w-5 h-5 text-destructive" />
            Action Error
          </DialogTitle>
        </DialogHeader>
        <div class="py-2">
          <p class="text-sm text-muted-foreground">{{ selectedActionError }}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showErrorDialog = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Restore Confirm Dialog -->
    <Dialog :open="showRestoreConfirm" @update:open="(v: boolean) => { showRestoreConfirm = v; }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restore Backup</DialogTitle>
          <DialogDescription>
            Are you sure you want to restore this backup
            {{ selectedBackup ? 'from ' + formatDate(selectedBackup.timestamp) : '' }}?
            This will overwrite your current data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex gap-2">
          <Button variant="outline" @click="showRestoreConfirm = false">Cancel</Button>
          <Button @click="restoreBackup">Restore</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Backup Confirm Dialog -->
    <Dialog :open="showDeleteBackupConfirm" @update:open="(v: boolean) => { showDeleteBackupConfirm = v; }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Backup</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this backup
            {{ selectedBackup ? 'from ' + formatDate(selectedBackup.timestamp) : '' }}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex gap-2">
          <Button variant="outline" @click="showDeleteBackupConfirm = false">Cancel</Button>
          <Button variant="destructive" @click="deleteBackup">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
