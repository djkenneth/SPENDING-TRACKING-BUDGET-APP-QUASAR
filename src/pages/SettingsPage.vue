<!-- src/pages/SettingsPage.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSettingsStore } from 'src/stores/settings';
import { useOfflineStore } from 'src/stores/offline';
import { SUPPORTED_CURRENCIES } from 'src/utilities/currency';
import { toast } from 'vue-sonner';

// shadcn-vue components
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Switch } from 'src/components/ui/switch';
import { Label } from 'src/components/ui/label';
import { Input } from 'src/components/ui/input';
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
  User,
  Palette,
  Bell,
  Shield,
  Database,
  Info,
  HelpCircle,
  Download,
  Upload,
  Trash2,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Wallet,
  Loader2,
  AlertTriangle,
} from 'lucide-vue-next';

const settingsStore = useSettingsStore();
const offlineStore = useOfflineStore();

// Local state
const showImportDialog = ref(false);
const showAboutDialog = ref(false);
const showHelpDialog = ref(false);
const showClearNotificationsConfirm = ref(false);
const showResetStep1 = ref(false);
const showResetStep2 = ref(false);
const importFile = ref<File | null>(null);
const importLoading = ref(false);
const fileInputRef = ref<HTMLInputElement>();

// Computed
const settings = computed(() => settingsStore.settings);

const currencyOptions = computed(() => {
  return Object.values(SUPPORTED_CURRENCIES).map((currency: any) => ({
    code: currency.code,
    name: `${currency.name} (${currency.symbol})`,
    symbol: currency.symbol,
  }));
});

const dateFormatOptions = [
  { label: 'MM/DD/YYYY', value: 'MM/dd/yyyy' },
  { label: 'DD/MM/YYYY', value: 'dd/MM/yyyy' },
  { label: 'YYYY-MM-DD', value: 'yyyy-MM-dd' },
  { label: 'MMM DD, YYYY', value: 'MMM dd, yyyy' },
  { label: 'DD MMM YYYY', value: 'dd MMM yyyy' },
];

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Chinese', value: 'zh' },
  { label: 'Japanese', value: 'ja' },
];

const autoLockTimeOptions = [
  { label: '1 minute', value: '1' },
  { label: '5 minutes', value: '5' },
  { label: '10 minutes', value: '10' },
  { label: '15 minutes', value: '15' },
  { label: '30 minutes', value: '30' },
  { label: '1 hour', value: '60' },
];

// Methods
const updateSettings = (newSettings: any) => {
  settingsStore.updateSettings(newSettings);
  toast.success('Settings updated');
};

const updateCurrency = (code: string) => {
  const currencyConfig = (SUPPORTED_CURRENCIES as any)[code];
  if (currencyConfig) {
    settingsStore.setCurrency(code, currencyConfig.symbol);
    toast.success(`Currency changed to ${currencyConfig.name}`);
  }
};

const updateTheme = (theme: string) => {
  settingsStore.setTheme(theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
  }
  toast.success(`Theme changed to ${theme}`);
};

const updateNotificationSettings = (notificationSettings: any) => {
  settingsStore.updateNotificationSettings(notificationSettings);
  toast.success('Notification settings updated');
};

const updatePrivacySettings = (privacySettings: any) => {
  settingsStore.updatePrivacySettings(privacySettings);
  toast.success('Privacy settings updated');
};

const exportAllData = () => {
  try {
    offlineStore.exportData('json');
    toast.success('Data exported successfully');
  } catch (error) {
    toast.error('Failed to export data');
  }
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    importFile.value = file;
  }
};

const importData = async () => {
  if (!importFile.value) return;

  importLoading.value = true;

  try {
    await offlineStore.importData(importFile.value);
    toast.success('Data imported successfully');
    showImportDialog.value = false;
    importFile.value = null;
  } catch (error) {
    toast.error('Failed to import data. Please check the file format.');
  } finally {
    importLoading.value = false;
  }
};

const clearAllNotifications = () => {
  settingsStore.clearAllNotifications();
  showClearNotificationsConfirm.value = false;
  toast.success('All notifications cleared');
};

const confirmResetAllData = () => {
  showResetStep1.value = true;
};

const proceedToResetStep2 = () => {
  showResetStep1.value = false;
  showResetStep2.value = true;
};

const executeReset = () => {
  offlineStore.clearAllData();
  settingsStore.resetSettings();
  showResetStep2.value = false;
  toast.success('All data has been reset');
};

const openPrivacyPolicy = () => {
  toast.info('Privacy policy would open here');
};

const openTermsOfService = () => {
  toast.info('Terms of service would open here');
};
</script>

<template>
  <div class="p-4 space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Settings</h1>
      <Button variant="ghost" size="icon" @click="showHelpDialog = true">
        <HelpCircle class="w-5 h-5" />
      </Button>
    </div>

    <!-- Account Settings -->
    <Card>
      <CardHeader class="pb-3">
        <div class="flex items-center gap-2">
          <User class="w-5 h-5 text-primary" />
          <CardTitle class="text-lg">Account Settings</CardTitle>
        </div>
      </CardHeader>
      <CardContent class="pt-0">
        <!-- Show Balances -->
        <div class="flex items-center justify-between py-4 border-b">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Show Balances</div>
            <div class="text-xs text-muted-foreground">Display actual amounts or hide with asterisks</div>
          </div>
          <Switch
            :checked="settings.showBalances"
            @update:checked="(v: boolean) => updateSettings({ showBalances: v })"
          />
        </div>

        <!-- Currency -->
        <div class="flex items-center justify-between py-4 border-b">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Currency</div>
            <div class="text-xs text-muted-foreground">Choose your preferred currency</div>
          </div>
          <Select
            :model-value="settings.currency"
            @update:model-value="(v: any) => updateCurrency(v)"
          >
            <SelectTrigger class="w-[160px]">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="currency in currencyOptions"
                :key="currency.code"
                :value="currency.code"
              >
                {{ currency.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Date Format -->
        <div class="flex items-center justify-between py-4 border-b">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Date Format</div>
            <div class="text-xs text-muted-foreground">Choose how dates are displayed</div>
          </div>
          <Select
            :model-value="settings.dateFormat"
            @update:model-value="(v: any) => updateSettings({ dateFormat: v })"
          >
            <SelectTrigger class="w-[160px]">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in dateFormatOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Language -->
        <div class="flex items-center justify-between py-4">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Language</div>
            <div class="text-xs text-muted-foreground">Choose your preferred language</div>
          </div>
          <Select
            :model-value="settings.language"
            @update:model-value="(v: any) => updateSettings({ language: v })"
          >
            <SelectTrigger class="w-[140px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in languageOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Appearance -->
    <Card>
      <CardHeader class="pb-3">
        <div class="flex items-center gap-2">
          <Palette class="w-5 h-5 text-primary" />
          <CardTitle class="text-lg">Appearance</CardTitle>
        </div>
      </CardHeader>
      <CardContent class="pt-0">
        <div class="flex items-center justify-between py-4">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Theme</div>
            <div class="text-xs text-muted-foreground">Choose between light, dark, or auto theme</div>
          </div>
          <div class="flex gap-1 bg-muted rounded-lg p-1">
            <Button
              size="sm"
              :variant="settings.theme === 'light' ? 'default' : 'ghost'"
              class="h-8 px-3"
              @click="updateTheme('light')"
            >
              <Sun class="w-4 h-4 mr-1" /> Light
            </Button>
            <Button
              size="sm"
              :variant="settings.theme === 'dark' ? 'default' : 'ghost'"
              class="h-8 px-3"
              @click="updateTheme('dark')"
            >
              <Moon class="w-4 h-4 mr-1" /> Dark
            </Button>
            <Button
              size="sm"
              :variant="settings.theme === 'auto' ? 'default' : 'ghost'"
              class="h-8 px-3"
              @click="updateTheme('auto')"
            >
              <Monitor class="w-4 h-4 mr-1" /> Auto
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Notifications -->
    <Card>
      <CardHeader class="pb-3">
        <div class="flex items-center gap-2">
          <Bell class="w-5 h-5 text-primary" />
          <CardTitle class="text-lg">Notifications</CardTitle>
        </div>
      </CardHeader>
      <CardContent class="pt-0">
        <div class="flex items-center justify-between py-4 border-b">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Budget Alerts</div>
            <div class="text-xs text-muted-foreground">Get notified when you approach or exceed budget limits</div>
          </div>
          <Switch
            :checked="settings.notifications?.budgetAlerts"
            @update:checked="(v: boolean) => updateNotificationSettings({ budgetAlerts: v })"
          />
        </div>

        <div class="flex items-center justify-between py-4 border-b">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Payment Reminders</div>
            <div class="text-xs text-muted-foreground">Get reminded about upcoming subscription payments</div>
          </div>
          <Switch
            :checked="settings.notifications?.paymentReminders"
            @update:checked="(v: boolean) => updateNotificationSettings({ paymentReminders: v })"
          />
        </div>

        <div class="flex items-center justify-between py-4">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Monthly Reports</div>
            <div class="text-xs text-muted-foreground">Receive monthly financial summary reports</div>
          </div>
          <Switch
            :checked="settings.notifications?.monthlyReports"
            @update:checked="(v: boolean) => updateNotificationSettings({ monthlyReports: v })"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Privacy & Security -->
    <Card>
      <CardHeader class="pb-3">
        <div class="flex items-center gap-2">
          <Shield class="w-5 h-5 text-primary" />
          <CardTitle class="text-lg">Privacy & Security</CardTitle>
        </div>
      </CardHeader>
      <CardContent class="pt-0">
        <div class="flex items-center justify-between py-4 border-b">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Biometric Authentication</div>
            <div class="text-xs text-muted-foreground">Use fingerprint or face ID to unlock the app</div>
          </div>
          <Switch
            :checked="settings.privacy?.biometric"
            @update:checked="(v: boolean) => updatePrivacySettings({ biometric: v })"
          />
        </div>

        <div class="flex items-center justify-between py-4 border-b">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Auto Lock</div>
            <div class="text-xs text-muted-foreground">Automatically lock the app after inactivity</div>
          </div>
          <Switch
            :checked="settings.privacy?.autoLock"
            @update:checked="(v: boolean) => updatePrivacySettings({ autoLock: v })"
          />
        </div>

        <div v-if="settings.privacy?.autoLock" class="flex items-center justify-between py-4">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Auto Lock Time</div>
            <div class="text-xs text-muted-foreground">Minutes of inactivity before auto lock</div>
          </div>
          <Select
            :model-value="String(settings.privacy?.autoLockTime || '5')"
            @update:model-value="(v: any) => updatePrivacySettings({ autoLockTime: Number(v) })"
          >
            <SelectTrigger class="w-[140px]">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in autoLockTimeOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Data Management -->
    <Card>
      <CardHeader class="pb-3">
        <div class="flex items-center gap-2">
          <Database class="w-5 h-5 text-primary" />
          <CardTitle class="text-lg">Data Management</CardTitle>
        </div>
      </CardHeader>
      <CardContent class="pt-0">
        <div
          class="flex items-center justify-between py-4 border-b cursor-pointer hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
          @click="exportAllData"
        >
          <div class="flex items-center gap-3">
            <Download class="w-5 h-5 text-primary" />
            <div class="space-y-0.5">
              <div class="text-sm font-medium">Export Data</div>
              <div class="text-xs text-muted-foreground">Download all your data as JSON</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-muted-foreground" />
        </div>

        <div
          class="flex items-center justify-between py-4 border-b cursor-pointer hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
          @click="showImportDialog = true"
        >
          <div class="flex items-center gap-3">
            <Upload class="w-5 h-5 text-primary" />
            <div class="space-y-0.5">
              <div class="text-sm font-medium">Import Data</div>
              <div class="text-xs text-muted-foreground">Import data from backup file</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-muted-foreground" />
        </div>

        <div
          class="flex items-center justify-between py-4 border-b cursor-pointer hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
          @click="showClearNotificationsConfirm = true"
        >
          <div class="flex items-center gap-3">
            <Bell class="w-5 h-5 text-amber-500" />
            <div class="space-y-0.5">
              <div class="text-sm font-medium">Clear Notifications</div>
              <div class="text-xs text-muted-foreground">Remove all notifications</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-muted-foreground" />
        </div>

        <div
          class="flex items-center justify-between py-4 cursor-pointer hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
          @click="confirmResetAllData"
        >
          <div class="flex items-center gap-3">
            <Trash2 class="w-5 h-5 text-destructive" />
            <div class="space-y-0.5">
              <div class="text-sm font-medium text-destructive">Reset All Data</div>
              <div class="text-xs text-muted-foreground">Delete all data and start fresh</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>

    <!-- About -->
    <Card>
      <CardHeader class="pb-3">
        <div class="flex items-center gap-2">
          <Info class="w-5 h-5 text-primary" />
          <CardTitle class="text-lg">About</CardTitle>
        </div>
      </CardHeader>
      <CardContent class="pt-0">
        <div class="flex items-center justify-between py-4 border-b">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">App Version</div>
            <div class="text-xs text-muted-foreground">1.0.0</div>
          </div>
        </div>

        <div
          class="flex items-center justify-between py-4 border-b cursor-pointer hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
          @click="showAboutDialog = true"
        >
          <div class="space-y-0.5">
            <div class="text-sm font-medium">About Budget App</div>
            <div class="text-xs text-muted-foreground">Learn more about this app</div>
          </div>
          <ChevronRight class="w-4 h-4 text-muted-foreground" />
        </div>

        <div
          class="flex items-center justify-between py-4 border-b cursor-pointer hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
          @click="openPrivacyPolicy"
        >
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Privacy Policy</div>
            <div class="text-xs text-muted-foreground">Read our privacy policy</div>
          </div>
          <ChevronRight class="w-4 h-4 text-muted-foreground" />
        </div>

        <div
          class="flex items-center justify-between py-4 cursor-pointer hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
          @click="openTermsOfService"
        >
          <div class="space-y-0.5">
            <div class="text-sm font-medium">Terms of Service</div>
            <div class="text-xs text-muted-foreground">Read our terms of service</div>
          </div>
          <ChevronRight class="w-4 h-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>

    <!-- Import Dialog -->
    <Dialog :open="showImportDialog" @update:open="(v: boolean) => { showImportDialog = v; }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Select a backup file to import your data. This will overwrite your current data.
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <input
            ref="fileInputRef"
            type="file"
            accept=".json"
            class="hidden"
            @change="handleFileSelected"
          />
          <div
            class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            @click="triggerFileInput"
          >
            <Upload class="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p class="text-sm text-muted-foreground">
              {{ importFile ? importFile.name : 'Click to choose a backup file' }}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showImportDialog = false">Cancel</Button>
          <Button @click="importData" :disabled="!importFile || importLoading">
            <Loader2 v-if="importLoading" class="w-4 h-4 mr-2 animate-spin" />
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- About Dialog -->
    <Dialog :open="showAboutDialog" @update:open="(v: boolean) => { showAboutDialog = v; }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>About Budget App</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-2">
          <div class="flex justify-center">
            <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Wallet class="w-8 h-8 text-primary" />
            </div>
          </div>
          <p class="text-sm text-muted-foreground">
            Budget App is a comprehensive financial management tool designed to help you track
            your expenses, manage budgets, and achieve your financial goals.
          </p>
          <div>
            <p class="text-sm font-medium mb-2">Features:</p>
            <ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Account and transaction management</li>
              <li>Budget tracking and alerts</li>
              <li>Financial goal setting</li>
              <li>Analytics and reporting</li>
              <li>Offline support</li>
            </ul>
          </div>
          <div class="text-sm text-muted-foreground space-y-1">
            <p><span class="font-medium text-foreground">Version:</span> 1.0.0</p>
            <p><span class="font-medium text-foreground">Built with:</span> Vue 3 + Tailwind CSS</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showAboutDialog = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Help Dialog -->
    <Dialog :open="showHelpDialog" @update:open="(v: boolean) => { showHelpDialog = v; }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Help & Support</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-2">
          <div>
            <p class="text-sm font-medium mb-2">Getting Started:</p>
            <ol class="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Add your accounts from the Accounts page</li>
              <li>Set up budget categories from the Budget page</li>
              <li>Start tracking transactions</li>
              <li>Set financial goals to stay motivated</li>
            </ol>
          </div>
          <div>
            <p class="text-sm font-medium mb-2">Tips:</p>
            <ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Use the search and filter features to find specific transactions</li>
              <li>Enable notifications to stay on top of your budget</li>
              <li>Check the Analytics page for insights into your spending</li>
              <li>Regularly backup your data for safety</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showHelpDialog = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Clear Notifications Confirm -->
    <Dialog :open="showClearNotificationsConfirm" @update:open="(v: boolean) => { showClearNotificationsConfirm = v; }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Clear All Notifications</DialogTitle>
          <DialogDescription>
            Are you sure you want to clear all notifications?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex gap-2">
          <Button variant="outline" @click="showClearNotificationsConfirm = false">Cancel</Button>
          <Button @click="clearAllNotifications">Clear All</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Reset Data Step 1 -->
    <Dialog :open="showResetStep1" @update:open="(v: boolean) => { showResetStep1 = v; }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-destructive" />
            Reset All Data
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete all your data? This action cannot be undone.
            Consider exporting your data first.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex gap-2">
          <Button variant="outline" @click="showResetStep1 = false">Cancel</Button>
          <Button variant="destructive" @click="proceedToResetStep2">Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Reset Data Step 2 -->
    <Dialog :open="showResetStep2" @update:open="(v: boolean) => { showResetStep2 = v; }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-destructive" />
            Final Confirmation
          </DialogTitle>
          <DialogDescription>
            This will permanently delete all your accounts, transactions, budgets, and goals.
            Are you absolutely sure?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex gap-2">
          <Button variant="outline" @click="showResetStep2 = false">Cancel</Button>
          <Button variant="destructive" @click="executeReset">
            <Trash2 class="w-4 h-4 mr-1" /> Delete Everything
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
