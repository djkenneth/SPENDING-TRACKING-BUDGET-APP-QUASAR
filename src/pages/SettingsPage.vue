<!-- src/pages/SettingsPage.vue -->
<template>
  <div class="settings-page">
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center justify-between q-mb-lg">
        <div class="text-h5">Settings</div>
        <q-btn flat round icon="help_outline" @click="showHelpDialog = true" />
      </div>

      <!-- Account Settings -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="person" class="q-mr-sm" />
            Account Settings
          </div>

          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label>Show Balances</q-item-label>
                <q-item-label caption>Display actual amounts or hide with asterisks</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  v-model="settings.showBalances"
                  @update:model-value="updateSettings({ showBalances: $event })"
                />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item>
              <q-item-section>
                <q-item-label>Currency</q-item-label>
                <q-item-label caption>Choose your preferred currency</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-select
                  v-model="settings.currency"
                  :options="currencyOptions"
                  option-label="name"
                  option-value="code"
                  dense
                  borderless
                  @update:model-value="updateCurrency"
                />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item>
              <q-item-section>
                <q-item-label>Date Format</q-item-label>
                <q-item-label caption>Choose how dates are displayed</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-select
                  v-model="settings.dateFormat"
                  :options="dateFormatOptions"
                  option-label="label"
                  option-value="value"
                  dense
                  borderless
                  @update:model-value="updateSettings({ dateFormat: $event })"
                />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item>
              <q-item-section>
                <q-item-label>Language</q-item-label>
                <q-item-label caption>Choose your preferred language</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-select
                  v-model="settings.language"
                  :options="languageOptions"
                  option-label="label"
                  option-value="value"
                  dense
                  borderless
                  @update:model-value="updateSettings({ language: $event })"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Appearance Settings -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="palette" class="q-mr-sm" />
            Appearance
          </div>

          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label>Theme</q-item-label>
                <q-item-label caption>Choose between light, dark, or auto theme</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn-toggle
                  v-model="settings.theme"
                  :options="themeOptions"
                  color="primary"
                  toggle-color="primary"
                  @update:model-value="updateTheme"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Notification Settings -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="notifications" class="q-mr-sm" />
            Notifications
          </div>

          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label>Budget Alerts</q-item-label>
                <q-item-label caption
                  >Get notified when you approach or exceed budget limits</q-item-label
                >
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  v-model="settings.notifications.budgetAlerts"
                  @update:model-value="updateNotificationSettings({ budgetAlerts: $event })"
                />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item>
              <q-item-section>
                <q-item-label>Payment Reminders</q-item-label>
                <q-item-label caption
                  >Get reminded about upcoming subscription payments</q-item-label
                >
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  v-model="settings.notifications.paymentReminders"
                  @update:model-value="updateNotificationSettings({ paymentReminders: $event })"
                />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item>
              <q-item-section>
                <q-item-label>Monthly Reports</q-item-label>
                <q-item-label caption>Receive monthly financial summary reports</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  v-model="settings.notifications.monthlyReports"
                  @update:model-value="updateNotificationSettings({ monthlyReports: $event })"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Privacy & Security -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="security" class="q-mr-sm" />
            Privacy & Security
          </div>

          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label>Biometric Authentication</q-item-label>
                <q-item-label caption>Use fingerprint or face ID to unlock the app</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  v-model="settings.privacy.biometric"
                  @update:model-value="updatePrivacySettings({ biometric: $event })"
                />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item>
              <q-item-section>
                <q-item-label>Auto Lock</q-item-label>
                <q-item-label caption>Automatically lock the app after inactivity</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  v-model="settings.privacy.autoLock"
                  @update:model-value="updatePrivacySettings({ autoLock: $event })"
                />
              </q-item-section>
            </q-item>

            <q-item v-if="settings.privacy.autoLock">
              <q-item-section>
                <q-item-label>Auto Lock Time</q-item-label>
                <q-item-label caption>Minutes of inactivity before auto lock</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-select
                  v-model="settings.privacy.autoLockTime"
                  :options="autoLockTimeOptions"
                  option-label="label"
                  option-value="value"
                  dense
                  borderless
                  @update:model-value="updatePrivacySettings({ autoLockTime: $event })"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Data Management -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="storage" class="q-mr-sm" />
            Data Management
          </div>

          <q-list>
            <q-item clickable @click="exportAllData">
              <q-item-section avatar>
                <q-icon name="file_download" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Export Data</q-item-label>
                <q-item-label caption>Download all your data as JSON</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable @click="showImportDialog = true">
              <q-item-section avatar>
                <q-icon name="file_upload" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Import Data</q-item-label>
                <q-item-label caption>Import data from backup file</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable @click="clearAllNotifications">
              <q-item-section avatar>
                <q-icon name="clear_all" color="warning" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Clear Notifications</q-item-label>
                <q-item-label caption>Remove all notifications</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable @click="confirmResetAllData">
              <q-item-section avatar>
                <q-icon name="delete_forever" color="negative" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Reset All Data</q-item-label>
                <q-item-label caption>Delete all data and start fresh</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- About -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="info" class="q-mr-sm" />
            About
          </div>

          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label>App Version</q-item-label>
                <q-item-label caption>1.0.0</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable @click="showAboutDialog = true">
              <q-item-section>
                <q-item-label>About Budget App</q-item-label>
                <q-item-label caption>Learn more about this app</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable @click="openPrivacyPolicy">
              <q-item-section>
                <q-item-label>Privacy Policy</q-item-label>
                <q-item-label caption>Read our privacy policy</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable @click="openTermsOfService">
              <q-item-section>
                <q-item-label>Terms of Service</q-item-label>
                <q-item-label caption>Read our terms of service</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <!-- Import Data Dialog -->
    <q-dialog v-model="showImportDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Import Data</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body2 q-mb-md">
            Select a backup file to import your data. This will overwrite your current data.
          </div>

          <q-file
            v-model="importFile"
            accept=".json"
            label="Choose backup file"
            filled
            @input="handleFileSelected"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showImportDialog = false" />
          <q-btn
            color="primary"
            label="Import"
            @click="importData"
            :loading="importLoading"
            :disable="!importFile"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- About Dialog -->
    <q-dialog v-model="showAboutDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">About Budget App</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-center q-mb-md">
            <q-icon name="account_balance_wallet" size="64px" color="primary" />
          </div>

          <div class="text-body2">
            <p>
              Budget App is a comprehensive financial management tool designed to help you track
              your expenses, manage budgets, and achieve your financial goals.
            </p>

            <p><strong>Features:</strong></p>
            <ul>
              <li>Account and transaction management</li>
              <li>Budget tracking and alerts</li>
              <li>Financial goal setting</li>
              <li>Analytics and reporting</li>
              <li>Offline support</li>
            </ul>

            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Built with:</strong> Vue 3 + Quasar Framework</p>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showAboutDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Help Dialog -->
    <q-dialog v-model="showHelpDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Help & Support</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body2">
            <p><strong>Getting Started:</strong></p>
            <ol>
              <li>Add your accounts from the Accounts page</li>
              <li>Set up budget categories from the Budget page</li>
              <li>Start tracking transactions</li>
              <li>Set financial goals to stay motivated</li>
            </ol>

            <p><strong>Tips:</strong></p>
            <ul>
              <li>Use the search and filter features to find specific transactions</li>
              <li>Enable notifications to stay on top of your budget</li>
              <li>Check the Analytics page for insights into your spending</li>
              <li>Regularly backup your data for safety</li>
            </ul>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showHelpDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSettingsStore } from 'src/stores/settings';
import { useOfflineStore } from 'src/stores/offline';
import { SUPPORTED_CURRENCIES } from 'src/utils/currency';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const settingsStore = useSettingsStore();
const offlineStore = useOfflineStore();

// Local state
const showImportDialog = ref(false);
const showAboutDialog = ref(false);
const showHelpDialog = ref(false);
const importFile = ref(null);
const importLoading = ref(false);

// Computed
const settings = computed(() => settingsStore.settings);

const currencyOptions = computed(() => {
  return Object.values(SUPPORTED_CURRENCIES).map((currency) => ({
    code: currency.code,
    name: `${currency.name} (${currency.symbol})`,
    symbol: currency.symbol,
  }));
});

const dateFormatOptions = computed(() => [
  { label: 'MM/DD/YYYY', value: 'MM/dd/yyyy' },
  { label: 'DD/MM/YYYY', value: 'dd/MM/yyyy' },
  { label: 'YYYY-MM-DD', value: 'yyyy-MM-dd' },
  { label: 'MMM DD, YYYY', value: 'MMM dd, yyyy' },
  { label: 'DD MMM YYYY', value: 'dd MMM yyyy' },
]);

const languageOptions = computed(() => [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Chinese', value: 'zh' },
  { label: 'Japanese', value: 'ja' },
]);

const themeOptions = computed(() => [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Auto', value: 'auto' },
]);

const autoLockTimeOptions = computed(() => [
  { label: '1 minute', value: 1 },
  { label: '5 minutes', value: 5 },
  { label: '10 minutes', value: 10 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
]);

// Methods
const updateSettings = (newSettings: any) => {
  settingsStore.updateSettings(newSettings);
  $q.notify({
    type: 'positive',
    message: 'Settings updated successfully',
    timeout: 1000,
  });
};

const updateCurrency = (currency: string) => {
  const currencyConfig = SUPPORTED_CURRENCIES[currency];
  if (currencyConfig) {
    settingsStore.setCurrency(currency, currencyConfig.symbol);
    $q.notify({
      type: 'positive',
      message: `Currency changed to ${currencyConfig.name}`,
      timeout: 1000,
    });
  }
};

const updateTheme = (theme: string) => {
  settingsStore.setTheme(theme);

  // Apply theme to Quasar
  if (theme === 'dark') {
    $q.dark.set(true);
  } else if (theme === 'light') {
    $q.dark.set(false);
  } else {
    $q.dark.set('auto');
  }

  $q.notify({
    type: 'positive',
    message: `Theme changed to ${theme}`,
    timeout: 1000,
  });
};

const updateNotificationSettings = (notificationSettings: any) => {
  settingsStore.updateNotificationSettings(notificationSettings);
  $q.notify({
    type: 'positive',
    message: 'Notification settings updated',
    timeout: 1000,
  });
};

const updatePrivacySettings = (privacySettings: any) => {
  settingsStore.updatePrivacySettings(privacySettings);
  $q.notify({
    type: 'positive',
    message: 'Privacy settings updated',
    timeout: 1000,
  });
};

const exportAllData = () => {
  try {
    offlineStore.exportData('json');
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

const handleFileSelected = (file: File) => {
  importFile.value = file;
};

const importData = async () => {
  if (!importFile.value) return;

  importLoading.value = true;

  try {
    await offlineStore.importData(importFile.value);
    $q.notify({
      type: 'positive',
      message: 'Data imported successfully',
    });
    showImportDialog.value = false;
    importFile.value = null;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to import data. Please check the file format.',
    });
  } finally {
    importLoading.value = false;
  }
};

const clearAllNotifications = () => {
  $q.dialog({
    title: 'Clear All Notifications',
    message: 'Are you sure you want to clear all notifications?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    settingsStore.clearAllNotifications();
    $q.notify({
      type: 'positive',
      message: 'All notifications cleared',
    });
  });
};

const confirmResetAllData = () => {
  $q.dialog({
    title: 'Reset All Data',
    message:
      'Are you sure you want to delete all your data? This action cannot be undone. Consider exporting your data first.',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    $q.dialog({
      title: 'Final Confirmation',
      message:
        'This will permanently delete all your accounts, transactions, budgets, and goals. Are you absolutely sure?',
      cancel: true,
      persistent: true,
    }).onOk(() => {
      offlineStore.clearAllData();
      settingsStore.resetSettings();
      $q.notify({
        type: 'positive',
        message: 'All data has been reset',
      });
    });
  });
};

const openPrivacyPolicy = () => {
  // In a real app, this would open a privacy policy page or external link
  $q.notify({
    type: 'info',
    message: 'Privacy policy would open here',
  });
};

const openTermsOfService = () => {
  // In a real app, this would open a terms of service page or external link
  $q.notify({
    type: 'info',
    message: 'Terms of service would open here',
  });
};
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.q-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.q-card-section {
  padding: 20px;
}

.q-list {
  padding: 0;
}

.q-item {
  padding: 16px 0;
  min-height: 56px;
}

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.q-item-label {
  font-weight: 500;
}

.q-item-label--caption {
  color: #666;
  font-size: 0.875rem;
}

.q-separator {
  margin: 0 16px;
}

.text-h6 {
  color: #333;
  font-weight: 600;
}

.text-h6 .q-icon {
  vertical-align: middle;
  margin-top: -2px;
}

.q-toggle {
  transform: scale(1.1);
}

.q-btn-toggle {
  border-radius: 8px;
}

.q-select {
  min-width: 120px;
}

.q-dialog .q-card {
  border-radius: 12px;
}

.q-file {
  border-radius: 8px;
}

/* Responsive design */
@media (max-width: 768px) {
  .q-item {
    padding: 12px 0;
  }

  .q-item-section--side {
    padding-left: 16px;
  }

  .q-btn-toggle {
    transform: scale(0.9);
  }
}

@media (max-width: 480px) {
  .q-card-section {
    padding: 16px;
  }

  .q-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .q-item-section--side {
    padding-left: 0;
    padding-top: 8px;
  }

  .q-btn-toggle {
    transform: scale(0.8);
  }
}

/* Animation */
.q-card {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Icon colors */
.q-icon {
  color: #666;
}

.q-item-section--avatar .q-icon {
  color: var(--q-primary);
}

/* List item hover effect */
.q-item[clickable]:hover {
  background-color: rgba(25, 118, 210, 0.04);
}

/* Toggle styling */
.q-toggle__inner {
  transition: all 0.3s ease;
}

/* Dialog styling */
.q-dialog__inner {
  padding: 16px;
}

/* File input styling */
.q-field--filled .q-field__control {
  border-radius: 8px;
}

/* About dialog content */
.q-dialog .q-card ul {
  padding-left: 20px;
}

.q-dialog .q-card ol {
  padding-left: 20px;
}

.q-dialog .q-card li {
  margin-bottom: 4px;
}
</style>
