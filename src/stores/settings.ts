// src/stores/settings.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface AppSettings {
  showBalances: boolean;
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    budgetAlerts: boolean;
    paymentReminders: boolean;
    monthlyReports: boolean;
  };
  privacy: {
    biometric: boolean;
    autoLock: boolean;
    autoLockTime: number; // in minutes
  };
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  icon: string;
  color: string;
  timestamp: Date;
  read: boolean;
  type: 'budget' | 'payment' | 'security' | 'general';
}

export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref<AppSettings>({
    showBalances: true,
    currency: 'PHP',
    currencySymbol: '₱',
    dateFormat: 'MM/dd/yyyy',
    theme: 'light',
    language: 'en',
    notifications: {
      budgetAlerts: true,
      paymentReminders: true,
      monthlyReports: false,
    },
    privacy: {
      biometric: false,
      autoLock: true,
      autoLockTime: 5,
    },
  });

  const notifications = ref<Notification[]>([
    {
      id: 1,
      title: 'Budget Alert',
      message: "You've exceeded your Entertainment budget this month",
      icon: 'warning',
      color: 'orange',
      timestamp: new Date(),
      read: false,
      type: 'budget',
    },
    {
      id: 2,
      title: 'Upcoming Payment',
      message: 'Netflix subscription due in 2 days',
      icon: 'payment',
      color: 'blue',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      read: false,
      type: 'payment',
    },
  ]);

  const activeTab = ref('home');

  // Getters
  const unreadNotifications = computed(() => {
    return notifications.value.filter((n) => !n.read);
  });

  const unreadCount = computed(() => {
    return unreadNotifications.value.length;
  });

  const notificationsByType = computed(() => {
    return notifications.value.reduce(
      (acc, notification) => {
        if (!acc[notification.type]) {
          acc[notification.type] = [];
        }
        acc[notification.type].push(notification);
        return acc;
      },
      {} as Record<string, Notification[]>,
    );
  });

  const isDarkMode = computed(() => {
    if (settings.value.theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return settings.value.theme === 'dark';
  });

  // Actions
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    settings.value = { ...settings.value, ...newSettings };
  };

  const toggleBalancesVisibility = () => {
    settings.value.showBalances = !settings.value.showBalances;
  };

  const setTheme = (theme: 'light' | 'dark' | 'auto') => {
    settings.value.theme = theme;
  };

  const setCurrency = (currency: string, symbol: string) => {
    settings.value.currency = currency;
    settings.value.currencySymbol = symbol;
  };

  const setActiveTab = (tab: string) => {
    activeTab.value = tab;
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date(),
      read: false,
    };
    notifications.value.unshift(newNotification);
    return newNotification;
  };

  const markNotificationAsRead = (id: number) => {
    const notification = notifications.value.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
  };

  const markAllNotificationsAsRead = () => {
    notifications.value.forEach((notification) => {
      notification.read = true;
    });
  };

  const deleteNotification = (id: number) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
      return true;
    }
    return false;
  };

  const clearAllNotifications = () => {
    notifications.value = [];
  };

  const updateNotificationSettings = (
    notificationSettings: Partial<AppSettings['notifications']>,
  ) => {
    settings.value.notifications = { ...settings.value.notifications, ...notificationSettings };
  };

  const updatePrivacySettings = (privacySettings: Partial<AppSettings['privacy']>) => {
    settings.value.privacy = { ...settings.value.privacy, ...privacySettings };
  };

  const exportSettings = () => {
    return JSON.stringify(settings.value, null, 2);
  };

  const importSettings = (settingsJson: string) => {
    try {
      const importedSettings = JSON.parse(settingsJson);
      settings.value = { ...settings.value, ...importedSettings };
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  };

  const resetSettings = () => {
    settings.value = {
      showBalances: true,
      currency: 'PHP',
      currencySymbol: '₱',
      dateFormat: 'MM/dd/yyyy',
      theme: 'light',
      language: 'en',
      notifications: {
        budgetAlerts: true,
        paymentReminders: true,
        monthlyReports: false,
      },
      privacy: {
        biometric: false,
        autoLock: true,
        autoLockTime: 5,
      },
    };
  };

  return {
    // State
    settings,
    notifications,
    activeTab,
    // Getters
    unreadNotifications,
    unreadCount,
    notificationsByType,
    isDarkMode,
    // Actions
    updateSettings,
    toggleBalancesVisibility,
    setTheme,
    setCurrency,
    setActiveTab,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    updateNotificationSettings,
    updatePrivacySettings,
    exportSettings,
    importSettings,
    resetSettings,
  };
});
