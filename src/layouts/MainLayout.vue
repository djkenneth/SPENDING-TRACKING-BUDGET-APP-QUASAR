<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div class="flex items-center justify-between h-14 px-4">
        <div class="flex items-center gap-3">
          <Button variant="ghost" size="icon" class="lg:hidden" @click="mobileMenuOpen = true">
            <Menu class="w-5 h-5" />
          </Button>
          <span class="text-lg font-bold">Budget Tracker</span>
        </div>

        <div class="flex items-center gap-1">
          <Button variant="ghost" size="icon" class="relative" @click="notificationsOpen = true">
            <Bell class="w-5 h-5" />
            <span v-if="unreadCount > 0"
              class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </Button>
          <Button variant="ghost" size="icon" @click="toggleDarkMode">
            <Sun v-if="isDark" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon">
                <MoreVertical class="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-48">
              <DropdownMenuItem @click="toggleBalanceVisibility">
                <EyeOff v-if="settings.showBalances" class="w-4 h-4 mr-2" />
                <Eye v-else class="w-4 h-4 mr-2" />
                {{ settings.showBalances ? 'Hide' : 'Show' }} Balances
              </DropdownMenuItem>
              <DropdownMenuItem @click="goToSettings">
                <Settings class="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem @click="exportData">
                <Download class="w-4 h-4 mr-2" />
                Export Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Desktop Sidebar -->
      <aside class="hidden lg:flex flex-col w-60 border-r bg-background min-h-[calc(100vh-3.5rem)] sticky top-14 p-3">
        <nav class="flex-1 space-y-1">
          <button v-for="item in navItems" :key="item.route"
            :class="[
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive(item.route)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            ]"
            @click="navigateTo(item.route)">
            <component :is="item.icon" class="w-5 h-5" />
            {{ item.label }}
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 min-h-[calc(100vh-3.5rem)] pb-20 lg:pb-0">
        <router-view />
      </main>
    </div>

    <!-- Mobile Bottom Navigation -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div class="flex items-center justify-around h-16 px-2">
        <button v-for="item in bottomNavItems" :key="item.route"
          :class="[
            'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors min-w-[60px]',
            isActive(item.route) ? 'text-primary' : 'text-muted-foreground'
          ]"
          @click="navigateTo(item.route)">
          <component :is="item.icon" class="w-5 h-5" />
          <span class="text-[10px] font-medium">{{ item.label }}</span>
        </button>
      </div>
    </nav>

    <!-- Mobile Menu Sheet -->
    <Sheet v-model:open="mobileMenuOpen">
      <SheetContent side="left" class="w-72 p-0">
        <SheetHeader class="p-4 border-b">
          <SheetTitle class="text-lg font-bold">Budget Tracker</SheetTitle>
          <SheetDescription class="sr-only">Navigation menu</SheetDescription>
        </SheetHeader>
        <ScrollArea class="h-[calc(100vh-80px)]">
          <nav class="p-3 space-y-1">
            <button v-for="item in navItems" :key="item.route"
              :class="[
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive(item.route)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              ]"
              @click="navigateTo(item.route); mobileMenuOpen = false">
              <component :is="item.icon" class="w-5 h-5" />
              {{ item.label }}
            </button>
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>

    <!-- Notifications Dialog -->
    <Dialog v-model:open="notificationsOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <div class="flex items-center justify-between">
            <DialogTitle>Notifications</DialogTitle>
            <Button v-if="unreadCount > 0" variant="ghost" size="sm" @click="markAllAsRead">
              <CheckCheck class="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          </div>
          <DialogDescription class="sr-only">Your notifications</DialogDescription>
        </DialogHeader>

        <div v-if="notifications.length === 0" class="text-center text-muted-foreground py-8">
          <Bell class="w-10 h-10 mx-auto mb-2 opacity-40" />
          No notifications
        </div>

        <ScrollArea v-else class="max-h-[400px]">
          <div class="space-y-2">
            <div v-for="notification in notifications" :key="notification.id"
              :class="[
                'flex items-start gap-3 p-3 rounded-lg transition-colors',
                !notification.read ? 'bg-primary/5 border-l-2 border-primary' : 'hover:bg-muted/50'
              ]">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                notification.color === 'red' ? 'bg-red-100 text-red-600' :
                notification.color === 'green' ? 'bg-green-100 text-green-600' :
                notification.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                'bg-blue-100 text-blue-600'
              ]">
                <AlertCircle class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium">{{ notification.title }}</div>
                <div class="text-xs text-muted-foreground">{{ notification.message }}</div>
              </div>
              <div v-if="!notification.read" class="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSettingsStore } from '../stores/settings';
import { toast } from 'vue-sonner';
import { Button } from 'src/components/ui/button';
import { ScrollArea } from 'src/components/ui/scroll-area';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from 'src/components/ui/sheet';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from 'src/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import {
  Home, Wallet, Receipt, Tag, PiggyBank, Target, BarChart3, Settings,
  Menu, Bell, Sun, Moon, MoreVertical, EyeOff, Eye, Download,
  AlertCircle, CheckCheck,
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const settingsStore = useSettingsStore();

const mobileMenuOpen = ref(false);
const notificationsOpen = ref(false);
const isDark = ref(false);

const navItems = [
  { label: 'Dashboard', icon: Home, route: 'dashboard' },
  { label: 'Accounts', icon: Wallet, route: 'accounts' },
  { label: 'Transactions', icon: Receipt, route: 'transactions' },
  { label: 'Categories', icon: Tag, route: 'categories' },
  { label: 'Budget', icon: PiggyBank, route: 'budget' },
  { label: 'Goals', icon: Target, route: 'goals' },
  { label: 'Analytics', icon: BarChart3, route: 'analytics' },
  { label: 'Settings', icon: Settings, route: 'settings' },
];

const bottomNavItems = [
  { label: 'Home', icon: Home, route: 'dashboard' },
  { label: 'Accounts', icon: Wallet, route: 'accounts' },
  { label: 'Transactions', icon: Receipt, route: 'transactions' },
  { label: 'Budget', icon: PiggyBank, route: 'budget' },
  { label: 'More', icon: MoreVertical, route: 'settings' },
];

const settings = computed(() => settingsStore.settings);
const notifications = computed(() => settingsStore.notifications);
const unreadCount = computed(() => settingsStore.unreadCount);

const navigateTo = async (routeName: string) => {
  if (route.name !== routeName) {
    await router.push({ name: routeName });
  }
};

const isActive = (routeName: string) => route.name === routeName;

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  const newTheme = isDark.value ? 'dark' : 'light';
  settingsStore.setTheme(newTheme);
  document.documentElement.classList.toggle('dark', isDark.value);
  toast.success(`Switched to ${newTheme} mode`);
};

const toggleBalanceVisibility = () => {
  settingsStore.toggleBalancesVisibility();
};

const goToSettings = async () => {
  await router.push({ name: 'settings' });
};

const markAllAsRead = () => {
  settingsStore.markAllNotificationsAsRead();
};

const exportData = () => {
  toast.info('Export functionality coming soon!');
};

onMounted(() => {
  const theme = settingsStore.settings.theme;
  isDark.value = theme === 'dark';
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDark.value = prefersDark;
    if (prefersDark) document.documentElement.classList.add('dark');
  }
});
</script>

<style scoped>
/* All styles handled by Tailwind CSS */
</style>
