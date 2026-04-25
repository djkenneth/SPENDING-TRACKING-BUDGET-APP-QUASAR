<!-- src/pages/SettingsPage.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ImageCropDialog from 'src/components/ImageCropDialog.vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from 'src/stores/settings';
import { useOfflineStore } from 'src/stores/offline';
import { useAuthStore } from 'src/stores/auth';
import { userService } from 'src/services/user.service';
import { SUPPORTED_CURRENCIES } from 'src/utilities/currency';
import { toast } from 'vue-sonner';

import { Card, CardContent } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Switch } from 'src/components/ui/switch';
import { Input } from 'src/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from 'src/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'src/components/ui/tabs';
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

import {
  User, Bell, Shield, Database, HelpCircle, Download, Upload, Trash2,
  ChevronRight, Sun, Moon, Monitor, Wallet, Loader2, AlertTriangle,
  LogOut, Camera, X, Palette,
} from 'lucide-vue-next';

const router = useRouter();
const settingsStore = useSettingsStore();
const offlineStore = useOfflineStore();
const authStore = useAuthStore();

// ── Dialog state ───────────────────────────────────────────────────────────────
const showImportDialog = ref(false);
const showAboutDialog = ref(false);
const showHelpDialog = ref(false);
const showClearNotificationsConfirm = ref(false);
const showResetStep1 = ref(false);
const showResetStep2 = ref(false);
const importFile = ref<File | null>(null);
const importLoading = ref(false);
const fileInputRef = ref<HTMLInputElement>();

// ── Avatar state ───────────────────────────────────────────────────────────────
const avatarInputRef = ref<HTMLInputElement>();
const avatarLoading = ref(false);
const avatarUploading = ref(false);
const avatarDeleting = ref(false);
const showCropDialog = ref(false);
const pendingAvatarFile = ref<File | null>(null);

// ── Computed ───────────────────────────────────────────────────────────────────
const settings = computed(() => settingsStore.settings);
const user = computed(() => authStore.currentUser);

const userInitials = computed(() => {
  const name = authStore.userName;
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
});

const currencyOptions = computed(() =>
  Object.values(SUPPORTED_CURRENCIES).map((c: any) => ({
    code: c.code,
    name: `${c.name} (${c.symbol})`,
  })),
);

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

// ── Settings handlers ──────────────────────────────────────────────────────────
const updateSettings = (patch: any) => {
  settingsStore.updateSettings(patch);
  toast.success('Settings updated');
};

const updateCurrency = (code: string) => {
  const cfg = (SUPPORTED_CURRENCIES as any)[code];
  if (cfg) {
    settingsStore.setCurrency(code, cfg.symbol);
    toast.success(`Currency changed to ${cfg.name}`);
  }
};

const updateTheme = (theme: string) => {
  settingsStore.setTheme(theme as 'light' | 'dark' | 'auto');
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
  toast.success(`Theme changed to ${theme}`);
};

const updateNotificationSettings = (patch: any) => {
  settingsStore.updateNotificationSettings(patch);
  toast.success('Notification settings updated');
};

const updatePrivacySettings = (patch: any) => {
  settingsStore.updatePrivacySettings(patch);
  toast.success('Privacy settings updated');
};

// ── Data handlers ──────────────────────────────────────────────────────────────
const exportAllData = () => {
  try {
    offlineStore.exportData('json');
    toast.success('Data exported successfully');
  } catch {
    toast.error('Failed to export data');
  }
};

const triggerFileInput = () => fileInputRef.value?.click();

const handleFileSelected = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) importFile.value = file;
};

const importData = async () => {
  if (!importFile.value) return;
  importLoading.value = true;
  try {
    await offlineStore.importData(importFile.value);
    toast.success('Data imported successfully');
    showImportDialog.value = false;
    importFile.value = null;
  } catch {
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

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};

// ── Avatar handlers ────────────────────────────────────────────────────────────
const loadAvatar = async () => {
  avatarLoading.value = true;
  try {
    const response = await userService.getAvatar();
    if (response.success && response.data) {
      authStore.updateUserProfile({
        avatar_url: response.data.avatar_url,
        avatar: response.data.avatar ?? undefined,
      });
    }
  } catch {
    // silently fall back to cached avatar in store
  } finally {
    avatarLoading.value = false;
  }
};

onMounted(loadAvatar);

const triggerAvatarInput = () => avatarInputRef.value?.click();

const handleAvatarSelected = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (avatarInputRef.value) avatarInputRef.value.value = '';

  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    toast.error('Image must be smaller than 10 MB');
    return;
  }

  pendingAvatarFile.value = file;
  showCropDialog.value = true;
};

const handleCropped = async ({ blob, name }: { blob: Blob; name: string }) => {
  avatarUploading.value = true;
  try {
    const file = new File([blob], `${name}.png`, { type: 'image/png' });
    const response = await userService.uploadAvatar(file);
    if (response.success && response.data) {
      authStore.updateUserProfile({ avatar_url: response.data.avatar_url });
      toast.success('Avatar updated successfully');
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Failed to upload avatar');
  } finally {
    avatarUploading.value = false;
    pendingAvatarFile.value = null;
  }
};

const handleDeleteAvatar = async () => {
  avatarDeleting.value = true;
  try {
    const response = await userService.deleteAvatar();
    if (response.success) {
      authStore.updateUserProfile({ avatar: undefined, avatar_url: null });
      toast.success('Avatar removed');
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Failed to remove avatar');
  } finally {
    avatarDeleting.value = false;
  }
};
</script>

<template>
  <div class="p-4 lg:p-8 space-y-4 max-w-4xl mx-auto">

    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Settings</h1>
        <p class="text-sm text-muted-foreground mt-0.5">Manage your account and preferences</p>
      </div>
      <Button variant="ghost" size="icon" @click="showHelpDialog = true">
        <HelpCircle class="w-5 h-5" />
      </Button>
    </div>

    <!-- Tabs -->
    <Tabs default-value="profile">
      <div class="w-full overflow-x-auto pb-1">
        <TabsList class="w-max min-w-full justify-start gap-0">
          <TabsTrigger value="profile" class="gap-1.5">
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" class="gap-1.5">
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications" class="gap-1.5">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" class="gap-1.5">
            Privacy
          </TabsTrigger>
          <TabsTrigger value="data" class="gap-1.5">
            Data
          </TabsTrigger>
        </TabsList>
      </div>

      <!-- ── Profile Tab ────────────────────────────────────────────── -->
      <TabsContent value="profile" class="mt-4">
        <div class="grid gap-4 lg:grid-cols-[300px_1fr] lg:gap-6 lg:items-start">

          <!-- Avatar Card (left on desktop, top on mobile) -->
          <Card class="border-0">
            <CardContent class="pt-6 pb-6">
              <div class="flex flex-col items-center gap-4">

                <!-- Avatar with upload button overlay -->
                <div class="relative">
                  <Avatar size="lg" shape="circle">
                    <AvatarImage v-if="authStore.userAvatar && !avatarLoading" :src="authStore.userAvatar"
                      :alt="authStore.userName" />
                    <AvatarFallback class="text-3xl font-semibold bg-primary/10 text-primary">
                      <Loader2 v-if="avatarLoading" class="w-8 h-8 animate-spin text-muted-foreground" />
                      <span v-else>{{ userInitials }}</span>
                    </AvatarFallback>
                  </Avatar>
                  <button
                    class="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                    :disabled="avatarUploading || avatarLoading" @click="triggerAvatarInput">
                    <Loader2 v-if="avatarUploading" class="w-4 h-4 animate-spin" />
                    <Camera v-else class="w-4 h-4" />
                  </button>
                </div>

                <!-- Hidden file input -->
                <input ref="avatarInputRef" type="file" accept="image/*" class="hidden"
                  @change="handleAvatarSelected" />

                <!-- Name + email -->
                <div class="text-center">
                  <p class="text-lg font-semibold text-foreground">{{ authStore.userName || '—' }}</p>
                  <p class="text-sm text-muted-foreground">{{ authStore.userEmail || '—' }}</p>
                </div>

                <!-- Avatar action buttons -->
                <div class="flex items-center gap-2 flex-wrap justify-center">
                  <Button variant="outline" size="sm" :disabled="avatarUploading || avatarDeleting || avatarLoading"
                    @click="triggerAvatarInput">
                    <Upload class="w-4 h-4 mr-1.5" />
                    {{ authStore.userAvatar ? 'Change Photo' : 'Upload Photo' }}
                  </Button>
                  <Button v-if="authStore.userAvatar" variant="ghost" size="sm"
                    class="text-destructive hover:text-destructive hover:bg-destructive/10"
                    :disabled="avatarDeleting || avatarUploading || avatarLoading" @click="handleDeleteAvatar">
                    <Loader2 v-if="avatarDeleting" class="w-4 h-4 mr-1.5 animate-spin" />
                    <X v-else class="w-4 h-4 mr-1.5" />
                    Remove
                  </Button>
                </div>
                <p class="text-xs text-muted-foreground">JPG, PNG or GIF · Max 2 MB</p>
              </div>
            </CardContent>
          </Card>

          <!-- Right column: Info + Sign Out (stacked) -->
          <div class="space-y-4">

            <!-- Profile Info -->
            <Card class="border-0">
              <CardContent class="pt-4 pb-2 divide-y divide-border">
                <div class="flex items-center justify-between py-3">
                  <span class="text-sm text-muted-foreground">Name</span>
                  <span class="text-sm font-medium">{{ user?.name || '—' }}</span>
                </div>
                <div class="flex items-center justify-between py-3">
                  <span class="text-sm text-muted-foreground">Email</span>
                  <span class="text-sm font-medium truncate max-w-50">{{ user?.email || '—' }}</span>
                </div>
                <div class="flex items-center justify-between py-3">
                  <span class="text-sm text-muted-foreground">Currency</span>
                  <span class="text-sm font-medium">{{ user?.currency || '—' }}</span>
                </div>
                <div class="flex items-center justify-between py-3">
                  <span class="text-sm text-muted-foreground">Timezone</span>
                  <span class="text-sm font-medium truncate max-w-50">{{ user?.timezone || '—' }}</span>
                </div>
                <div v-if="user?.phone" class="flex items-center justify-between py-3">
                  <span class="text-sm text-muted-foreground">Phone</span>
                  <span class="text-sm font-medium">{{ user.phone }}</span>
                </div>
                <div v-if="user?.date_of_birth" class="flex items-center justify-between py-3">
                  <span class="text-sm text-muted-foreground">Date of Birth</span>
                  <span class="text-sm font-medium">{{ user.date_of_birth }}</span>
                </div>
                <div class="flex items-center justify-between py-3">
                  <span class="text-sm text-muted-foreground">Member Since</span>
                  <span class="text-sm font-medium">{{ user?.created_at ? new Date(user.created_at).toLocaleDateString()
                    : '—' }}</span>
                </div>
              </CardContent>
            </Card>

            <!-- Sign Out -->
            <Card class="border-0">
              <CardContent class="pt-2 pb-2">
                <div
                  class="flex items-center justify-between py-3 px-2 -mx-2 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                  @click="logout">
                  <div class="flex items-center gap-3">
                    <LogOut class="w-5 h-5 text-destructive" />
                    <div>
                      <div class="text-sm font-medium text-destructive">Sign Out</div>
                      <div class="text-xs text-muted-foreground">Log out of your account</div>
                    </div>
                  </div>
                  <ChevronRight class="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </TabsContent>

      <!-- ── Preferences Tab ────────────────────────────────────────── -->
      <TabsContent value="preferences" class="mt-4">
        <div class="space-y-4 max-w-2xl">

          <!-- General Settings -->
          <Card class="border-0">
            <CardContent class="pt-4 pb-2 divide-y divide-border">

              <!-- Show Balances -->
              <div class="flex items-center justify-between py-4">
                <div class="space-y-0.5">
                  <div class="text-sm font-medium">Show Balances</div>
                  <div class="text-xs text-muted-foreground">Display amounts or hide with asterisks</div>
                </div>
                <Switch :checked="settings.showBalances"
                  @update:checked="(v: boolean) => updateSettings({ showBalances: v })" />
              </div>

              <!-- Currency -->
              <div class="flex items-center justify-between py-4">
                <div class="space-y-0.5">
                  <div class="text-sm font-medium">Currency</div>
                  <div class="text-xs text-muted-foreground">Preferred currency</div>
                </div>
                <Select :model-value="settings.currency" @update:model-value="(v: any) => updateCurrency(v)">
                  <SelectTrigger class="w-40">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="c in currencyOptions" :key="c.code" :value="c.code">
                      {{ c.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- Date Format -->
              <div class="flex items-center justify-between py-4">
                <div class="space-y-0.5">
                  <div class="text-sm font-medium">Date Format</div>
                  <div class="text-xs text-muted-foreground">How dates are displayed</div>
                </div>
                <Select :model-value="settings.dateFormat"
                  @update:model-value="(v: any) => updateSettings({ dateFormat: v })">
                  <SelectTrigger class="w-40">
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
                  <div class="text-xs text-muted-foreground">Preferred language</div>
                </div>
                <Select :model-value="settings.language"
                  @update:model-value="(v: any) => updateSettings({ language: v })">
                  <SelectTrigger class="w-35">
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

          <!-- Theme -->
          <Card class="border-0">
            <CardContent class="pt-4 pb-4">
              <div class="flex items-center justify-between flex-wrap gap-3">
                <div class="space-y-0.5">
                  <div class="text-sm font-medium">Theme</div>
                  <div class="text-xs text-muted-foreground">Light, dark, or system default</div>
                </div>
                <div class="flex gap-1 bg-muted rounded-lg p-1">
                  <Button size="sm" :variant="settings.theme === 'light' ? 'default' : 'ghost'" class="h-8 px-3"
                    @click="updateTheme('light')">
                    <Sun class="w-4 h-4 mr-1" /> Light
                  </Button>
                  <Button size="sm" :variant="settings.theme === 'dark' ? 'default' : 'ghost'" class="h-8 px-3"
                    @click="updateTheme('dark')">
                    <Moon class="w-4 h-4 mr-1" /> Dark
                  </Button>
                  <Button size="sm" :variant="settings.theme === 'auto' ? 'default' : 'ghost'" class="h-8 px-3"
                    @click="updateTheme('auto')">
                    <Monitor class="w-4 h-4 mr-1" /> Auto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- ── Notifications Tab ──────────────────────────────────────── -->
      <TabsContent value="notifications" class="mt-4">
        <div class="max-w-2xl">
          <Card class="border-0">
            <CardContent class="pt-4 pb-2 divide-y divide-border">
              <div class="flex items-center justify-between py-4">
                <div class="space-y-0.5">
                  <div class="text-sm font-medium">Budget Alerts</div>
                  <div class="text-xs text-muted-foreground">Notify when approaching or exceeding budget limits</div>
                </div>
                <Switch :checked="settings.notifications?.budgetAlerts"
                  @update:checked="(v: boolean) => updateNotificationSettings({ budgetAlerts: v })" />
              </div>
              <div class="flex items-center justify-between py-4">
                <div class="space-y-0.5">
                  <div class="text-sm font-medium">Payment Reminders</div>
                  <div class="text-xs text-muted-foreground">Upcoming subscription payments</div>
                </div>
                <Switch :checked="settings.notifications?.paymentReminders"
                  @update:checked="(v: boolean) => updateNotificationSettings({ paymentReminders: v })" />
              </div>
              <div class="flex items-center justify-between py-4">
                <div class="space-y-0.5">
                  <div class="text-sm font-medium">Monthly Reports</div>
                  <div class="text-xs text-muted-foreground">Monthly financial summary reports</div>
                </div>
                <Switch :checked="settings.notifications?.monthlyReports"
                  @update:checked="(v: boolean) => updateNotificationSettings({ monthlyReports: v })" />
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- ── Privacy Tab ────────────────────────────────────────────── -->
      <TabsContent value="privacy" class="mt-4">
        <div class="max-w-2xl">
          <Card class="border-0">
            <CardContent class="pt-4 pb-2 divide-y divide-border">
              <div class="flex items-center justify-between py-4">
                <div class="space-y-0.5">
                  <div class="text-sm font-medium">Biometric Authentication</div>
                  <div class="text-xs text-muted-foreground">Use fingerprint or face ID to unlock</div>
                </div>
                <Switch :checked="settings.privacy?.biometric"
                  @update:checked="(v: boolean) => updatePrivacySettings({ biometric: v })" />
              </div>
              <div class="flex items-center justify-between py-4">
                <div class="space-y-0.5">
                  <div class="text-sm font-medium">Auto Lock</div>
                  <div class="text-xs text-muted-foreground">Automatically lock after inactivity</div>
                </div>
                <Switch :checked="settings.privacy?.autoLock"
                  @update:checked="(v: boolean) => updatePrivacySettings({ autoLock: v })" />
              </div>
              <div v-if="settings.privacy?.autoLock" class="flex items-center justify-between py-4">
                <div class="space-y-0.5">
                  <div class="text-sm font-medium">Auto Lock Time</div>
                  <div class="text-xs text-muted-foreground">Minutes of inactivity before lock</div>
                </div>
                <Select :model-value="String(settings.privacy?.autoLockTime || '5')"
                  @update:model-value="(v: any) => updatePrivacySettings({ autoLockTime: Number(v) })">
                  <SelectTrigger class="w-35">
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
        </div>
      </TabsContent>

      <!-- ── Data Tab ───────────────────────────────────────────────── -->
      <TabsContent value="data" class="mt-4">
        <div class="space-y-4 max-w-2xl">

          <!-- Data management actions -->
          <Card class="border-0">
            <CardContent class="pt-4 pb-2 divide-y divide-border">
              <div
                class="flex items-center justify-between py-4 px-2 -mx-2 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                @click="exportAllData">
                <div class="flex items-center gap-3">
                  <Download class="w-5 h-5 text-primary" />
                  <div>
                    <div class="text-sm font-medium">Export Data</div>
                    <div class="text-xs text-muted-foreground">Download all your data as JSON</div>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-muted-foreground" />
              </div>

              <div
                class="flex items-center justify-between py-4 px-2 -mx-2 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                @click="showImportDialog = true">
                <div class="flex items-center gap-3">
                  <Upload class="w-5 h-5 text-primary" />
                  <div>
                    <div class="text-sm font-medium">Import Data</div>
                    <div class="text-xs text-muted-foreground">Restore from backup file</div>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-muted-foreground" />
              </div>

              <div
                class="flex items-center justify-between py-4 px-2 -mx-2 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                @click="showClearNotificationsConfirm = true">
                <div class="flex items-center gap-3">
                  <Bell class="w-5 h-5 text-amber-500" />
                  <div>
                    <div class="text-sm font-medium">Clear Notifications</div>
                    <div class="text-xs text-muted-foreground">Remove all notifications</div>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-muted-foreground" />
              </div>

              <div
                class="flex items-center justify-between py-4 px-2 -mx-2 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                @click="showResetStep1 = true">
                <div class="flex items-center gap-3">
                  <Trash2 class="w-5 h-5 text-destructive" />
                  <div>
                    <div class="text-sm font-medium text-destructive">Reset All Data</div>
                    <div class="text-xs text-muted-foreground">Delete all data and start fresh</div>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <!-- About -->
          <Card class="border-0">
            <CardContent class="pt-4 pb-2 divide-y divide-border">
              <div class="flex items-center justify-between py-3">
                <span class="text-sm text-muted-foreground">App Version</span>
                <span class="text-sm font-medium">1.0.0</span>
              </div>
              <div
                class="flex items-center justify-between py-4 px-2 -mx-2 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                @click="showAboutDialog = true">
                <div class="text-sm font-medium">About SpendWise</div>
                <ChevronRight class="w-4 h-4 text-muted-foreground" />
              </div>
              <div
                class="flex items-center justify-between py-4 px-2 -mx-2 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors">
                <div class="text-sm font-medium">Privacy Policy</div>
                <ChevronRight class="w-4 h-4 text-muted-foreground" />
              </div>
              <div
                class="flex items-center justify-between py-4 px-2 -mx-2 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors">
                <div class="text-sm font-medium">Terms of Service</div>
                <ChevronRight class="w-4 h-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>

    <!-- ── Dialogs ─────────────────────────────────────────────────────────── -->

    <!-- Import -->
    <Dialog v-model:open="showImportDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Select a backup file to import. This will overwrite your current data.
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <input ref="fileInputRef" type="file" accept=".json" class="hidden" @change="handleFileSelected" />
          <div
            class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            @click="triggerFileInput">
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

    <!-- About -->
    <Dialog v-model:open="showAboutDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>About SpendWise</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-2">
          <div class="flex justify-center">
            <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Wallet class="w-8 h-8 text-primary" />
            </div>
          </div>
          <p class="text-sm text-muted-foreground">
            SpendWise is a comprehensive financial management tool designed to help you track
            expenses, manage budgets, and achieve your financial goals.
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

    <!-- Help -->
    <Dialog v-model:open="showHelpDialog">
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
              <li>Use search and filter to find specific transactions</li>
              <li>Enable notifications to stay on top of your budget</li>
              <li>Check Analytics for spending insights</li>
              <li>Regularly backup your data</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showHelpDialog = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Clear Notifications -->
    <Dialog v-model:open="showClearNotificationsConfirm">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Clear All Notifications</DialogTitle>
          <DialogDescription>Are you sure you want to clear all notifications?</DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button variant="outline" @click="showClearNotificationsConfirm = false">Cancel</Button>
          <Button @click="clearAllNotifications">Clear All</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Reset Step 1 -->
    <Dialog v-model:open="showResetStep1">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-destructive" />
            Reset All Data
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete all your data? This cannot be undone.
            Consider exporting your data first.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button variant="outline" @click="showResetStep1 = false">Cancel</Button>
          <Button variant="destructive" @click="proceedToResetStep2">Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Image Crop Dialog -->
    <ImageCropDialog
      v-model:open="showCropDialog"
      :file="pendingAvatarFile"
      @cropped="handleCropped"
    />

    <!-- Reset Step 2 -->
    <Dialog v-model:open="showResetStep2">
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
        <DialogFooter class="gap-2">
          <Button variant="outline" @click="showResetStep2 = false">Cancel</Button>
          <Button variant="destructive" @click="executeReset">
            <Trash2 class="w-4 h-4 mr-1" /> Delete Everything
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  </div>
</template>
