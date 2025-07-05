// src/stores/offline.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'transaction' | 'account' | 'budget' | 'goal';
  data: any;
  timestamp: Date;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  retryCount: number;
  error?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  syncInProgress: boolean;
  pendingActions: number;
  failedActions: number;
}

export interface BackupData {
  id: string;
  timestamp: Date;
  size: number;
  type: 'manual' | 'automatic';
  data: {
    accounts: any[];
    transactions: any[];
    budgets: any[];
    goals: any[];
    settings: any;
  };
}

export const useOfflineStore = defineStore('offline', () => {
  // State
  const isOnline = ref(navigator.onLine);
  const pendingActions = ref<OfflineAction[]>([]);
  const syncInProgress = ref(false);
  const lastSync = ref<Date | null>(null);
  const autoSyncEnabled = ref(true);
  const syncInterval = ref(30000); // 30 seconds
  const backups = ref<BackupData[]>([]);
  const maxBackups = ref(10);
  const conflictResolution = ref<'server' | 'client' | 'merge'>('merge');

  // Computed
  const syncStatus = computed(
    (): SyncStatus => ({
      isOnline: isOnline.value,
      lastSync: lastSync.value,
      syncInProgress: syncInProgress.value,
      pendingActions: pendingActions.value.filter((a) => a.status === 'pending').length,
      failedActions: pendingActions.value.filter((a) => a.status === 'failed').length,
    }),
  );

  const canSync = computed(() => {
    return isOnline.value && !syncInProgress.value && pendingActions.value.length > 0;
  });

  const storageUsage = computed(() => {
    const totalSize = backups.value.reduce((sum, backup) => sum + backup.size, 0);
    const availableStorage = 50 * 1024 * 1024; // 50MB limit

    return {
      used: totalSize,
      available: availableStorage,
      percentage: (totalSize / availableStorage) * 100,
    };
  });

  const syncStatistics = computed(() => {
    const completed = pendingActions.value.filter((a) => a.status === 'completed').length;
    const failed = pendingActions.value.filter((a) => a.status === 'failed').length;
    const pending = pendingActions.value.filter((a) => a.status === 'pending').length;

    return {
      completed,
      failed,
      pending,
      total: pendingActions.value.length,
      successRate:
        pendingActions.value.length > 0 ? (completed / pendingActions.value.length) * 100 : 0,
    };
  });

  // Actions
  const initialize = () => {
    // Set up online/offline event listeners
    window.addEventListener('online', () => {
      isOnline.value = true;
      if (autoSyncEnabled.value && canSync.value) {
        syncPendingActions();
      }
    });

    window.addEventListener('offline', () => {
      isOnline.value = false;
    });

    // Load pending actions from localStorage
    loadPendingActions();

    // Load backups from localStorage
    loadBackups();

    // Set up automatic sync interval
    if (autoSyncEnabled.value) {
      setInterval(() => {
        if (canSync.value) {
          syncPendingActions();
        }
      }, syncInterval.value);
    }
  };

  const addPendingAction = (
    action: Omit<OfflineAction, 'id' | 'timestamp' | 'status' | 'retryCount'>,
  ) => {
    const newAction: OfflineAction = {
      ...action,
      id: generateId(),
      timestamp: new Date(),
      status: 'pending',
      retryCount: 0,
    };

    pendingActions.value.push(newAction);
    savePendingActions();

    // Try to sync immediately if online
    if (isOnline.value && autoSyncEnabled.value) {
      syncPendingActions();
    }

    return newAction;
  };

  const syncPendingActions = async () => {
    if (!canSync.value) return;

    syncInProgress.value = true;

    try {
      const actionsToSync = pendingActions.value.filter((a) => a.status === 'pending');

      for (const action of actionsToSync) {
        try {
          action.status = 'syncing';
          await syncAction(action);
          action.status = 'completed';
        } catch (error) {
          action.status = 'failed';
          action.error = error instanceof Error ? error.message : 'Unknown error';
          action.retryCount++;
        }
      }

      lastSync.value = new Date();
      savePendingActions();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      syncInProgress.value = false;
    }
  };

  const syncAction = async (action: OfflineAction) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, this would make actual API calls
    switch (action.type) {
      case 'CREATE':
        console.log(`Creating ${action.entity}:`, action.data);
        break;
      case 'UPDATE':
        console.log(`Updating ${action.entity}:`, action.data);
        break;
      case 'DELETE':
        console.log(`Deleting ${action.entity}:`, action.data);
        break;
    }
  };

  const retryFailedActions = async () => {
    const failedActions = pendingActions.value.filter((a) => a.status === 'failed');

    for (const action of failedActions) {
      if (action.retryCount < 3) {
        action.status = 'pending';
        action.error = undefined;
      }
    }

    savePendingActions();

    if (canSync.value) {
      await syncPendingActions();
    }
  };

  const clearCompletedActions = () => {
    pendingActions.value = pendingActions.value.filter((a) => a.status !== 'completed');
    savePendingActions();
  };

  const createBackup = (type: 'manual' | 'automatic' = 'manual') => {
    const backup: BackupData = {
      id: generateId(),
      timestamp: new Date(),
      size: 0, // Will be calculated
      type,
      data: {
        accounts: [], // Get from stores
        transactions: [],
        budgets: [],
        goals: [],
        settings: {},
      },
    };

    // Calculate size
    backup.size = new Blob([JSON.stringify(backup.data)]).size;

    backups.value.push(backup);

    // Remove old backups if exceeding limit
    if (backups.value.length > maxBackups.value) {
      backups.value = backups.value
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, maxBackups.value);
    }

    saveBackups();
    return backup;
  };

  const restoreBackup = async (backupId: string) => {
    const backup = backups.value.find((b) => b.id === backupId);
    if (!backup) throw new Error('Backup not found');

    try {
      // In a real app, this would restore data to the stores
      console.log('Restoring backup:', backup);

      // Add restore action to pending actions
      addPendingAction({
        type: 'UPDATE',
        entity: 'account', // This would be a special restore operation
        data: backup.data,
      });

      return true;
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  };

  const deleteBackup = (backupId: string) => {
    const index = backups.value.findIndex((b) => b.id === backupId);
    if (index !== -1) {
      backups.value.splice(index, 1);
      saveBackups();
    }
  };

  const exportData = (format: 'json' | 'csv') => {
    const data = {
      accounts: [], // Get from stores
      transactions: [],
      budgets: [],
      goals: [],
      settings: {},
      exported: new Date(),
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      downloadFile(blob, `budget-app-export-${Date.now()}.json`);
    } else if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadFile(blob, `budget-app-export-${Date.now()}.csv`);
    }
  };

  const importData = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate data structure
      if (!validateImportData(data)) {
        throw new Error('Invalid data format');
      }

      // Add import actions to pending actions
      if (data.accounts) {
        data.accounts.forEach((account: any) => {
          addPendingAction({
            type: 'CREATE',
            entity: 'account',
            data: account,
          });
        });
      }

      if (data.transactions) {
        data.transactions.forEach((transaction: any) => {
          addPendingAction({
            type: 'CREATE',
            entity: 'transaction',
            data: transaction,
          });
        });
      }

      return true;
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  };

  const clearAllData = () => {
    pendingActions.value = [];
    backups.value = [];
    savePendingActions();
    saveBackups();
  };

  const getNetworkStatus = () => {
    return {
      online: isOnline.value,
      connection: (navigator as any).connection || null,
      effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
    };
  };

  // Helper functions
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const savePendingActions = () => {
    try {
      localStorage.setItem('pendingActions', JSON.stringify(pendingActions.value));
    } catch (error) {
      console.error('Failed to save pending actions:', error);
    }
  };

  const loadPendingActions = () => {
    try {
      const stored = localStorage.getItem('pendingActions');
      if (stored) {
        const parsed = JSON.parse(stored);
        pendingActions.value = parsed.map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load pending actions:', error);
    }
  };

  const saveBackups = () => {
    try {
      localStorage.setItem('backups', JSON.stringify(backups.value));
    } catch (error) {
      console.error('Failed to save backups:', error);
    }
  };

  const loadBackups = () => {
    try {
      const stored = localStorage.getItem('backups');
      if (stored) {
        const parsed = JSON.parse(stored);
        backups.value = parsed.map((backup: any) => ({
          ...backup,
          timestamp: new Date(backup.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load backups:', error);
    }
  };

  const validateImportData = (data: any): boolean => {
    // Basic validation
    return typeof data === 'object' && data !== null;
  };

  const convertToCSV = (data: any): string => {
    // Simple CSV conversion
    const lines = ['Type,Data'];

    if (data.accounts) {
      data.accounts.forEach((account: any) => {
        lines.push(`Account,"${JSON.stringify(account).replace(/"/g, '""')}"`);
      });
    }

    if (data.transactions) {
      data.transactions.forEach((transaction: any) => {
        lines.push(`Transaction,"${JSON.stringify(transaction).replace(/"/g, '""')}"`);
      });
    }

    return lines.join('\n');
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    // State
    isOnline,
    pendingActions,
    syncInProgress,
    lastSync,
    autoSyncEnabled,
    syncInterval,
    backups,
    maxBackups,
    conflictResolution,

    // Computed
    syncStatus,
    canSync,
    storageUsage,
    syncStatistics,

    // Actions
    initialize,
    addPendingAction,
    syncPendingActions,
    retryFailedActions,
    clearCompletedActions,
    createBackup,
    restoreBackup,
    deleteBackup,
    exportData,
    importData,
    clearAllData,
    getNetworkStatus,
  };
});
