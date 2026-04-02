<!-- src/App.vue -->
<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useQuasar } from 'quasar';
import { useSettingsStore } from 'src/stores/settings';

const $q = useQuasar();
const settingsStore = useSettingsStore();

// ─── PWA Install Prompt ───────────────────────────────────────────────────────

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const installPrompt = ref<BeforeInstallPromptEvent | null>(null);
const showInstallDialog = ref(false);
const showIOSInstructions = ref(false);
const showDesktopInstructions = ref(false);
const browserType = ref<'chrome' | 'edge' | 'other'>('other');

// ─── Platform & Browser Detection ────────────────────────────────────────────

function detectPlatform() {
  const p = $q.platform;

  // The only reliable cross-browser check for standalone/installed PWA
  const isStandalonePWA =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  const isNativeApp = !!(p.is.capacitor || p.is.cordova || p.is.electron);

  if (p.is.chrome) browserType.value = 'chrome';
  else if (p.is.edge) browserType.value = 'edge';
  else browserType.value = 'other';

  const info = {
    isMobile: p.is.mobile ?? false,
    isDesktop: p.is.desktop ?? false,
    isTablet: p.is.ipad ?? false,
    isIos: p.is.ios ?? false,
    isAndroid: p.is.android ?? false,
    isWindows: p.is.win ?? false,
    isMac: p.is.mac ?? false,
    isLinux: p.is.linux ?? false,
    isChrome: p.is.chrome ?? false,
    isFirefox: p.is.firefox ?? false,
    isSafari: p.is.safari ?? false,
    isEdge: p.is.edge ?? false,
    isPWA: isStandalonePWA,
    isElectron: p.is.electron ?? false,
    userAgent: navigator.userAgent,
  };

  settingsStore.setPlatformInfo(info);

  return {
    isIOS: p.is.ios ?? false,
    isAndroid: p.is.android ?? false,
    isDesktop: p.is.desktop ?? false,
    isSafari: p.is.safari ?? false,
    isNativeApp,
    isStandalonePWA,
  };
}

// ─── Install Prompt Helpers ───────────────────────────────────────────────────

function hasUserDismissedPrompt(): boolean {
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  if (!dismissed) return false;
  const daysSince = (Date.now() - new Date(dismissed).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince < 7;
}

function dismissInstallPrompt() {
  localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  showInstallDialog.value = false;
  showIOSInstructions.value = false;
  showDesktopInstructions.value = false;
}

function showInstallPromptDialog() {
  const { isIOS, isAndroid, isDesktop, isNativeApp, isStandalonePWA } = detectPlatform();

  if (isNativeApp) {
    console.log('SKIPPING: Native Capacitor/Cordova/Electron app');
    return;
  }

  if (isStandalonePWA) {
    console.log('SKIPPING: Already running as installed PWA');
    return;
  }

  if (hasUserDismissedPrompt()) {
    console.log('SKIPPING: User dismissed recently');
    return;
  }

  setTimeout(() => {
    if (isIOS) {
      showIOSInstructions.value = true;
    } else if ((isAndroid || isDesktop) && installPrompt.value) {
      showInstallDialog.value = true;
    } else if (isDesktop && !installPrompt.value) {
      showDesktopInstructions.value = true;
    }
  }, 2000);
}

async function installPwa() {
  if (!installPrompt.value) {
    showInstallDialog.value = false;
    return;
  }

  try {
    await installPrompt.value.prompt();
    const { outcome } = await installPrompt.value.userChoice;

    if (outcome === 'accepted') {
      $q.notify({ color: 'positive', position: 'top', message: 'App installation started!', icon: 'check_circle' });
      localStorage.removeItem('pwa-install-dismissed');
    } else {
      dismissInstallPrompt();
    }
  } catch (error) {
    console.error('Error installing PWA:', error);
    $q.notify({ color: 'negative', position: 'top', message: 'Installation failed. Please try again.', icon: 'error' });
  } finally {
    showInstallDialog.value = false;
    installPrompt.value = null;
  }
}

// ─── localStorage / App Data Cleanup ─────────────────────────────────────────

async function clearAllAppData() {
  localStorage.clear();
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  }
}

function onSWMessage(event: MessageEvent) {
  if (event.data?.type === 'CLEAR_LOCAL_STORAGE') {
    void clearAllAppData();
  }
}

function onPageHide(event: PageTransitionEvent) {
  if (!event.persisted) {
    localStorage.setItem('app_last_seen', Date.now().toString());
  }
}

// ─── Theme Initialization ─────────────────────────────────────────────────────

function applyTheme() {
  const theme = settingsStore.settings.theme;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
  }
}

// ─── Global Error Handling ────────────────────────────────────────────────────

function setupGlobalErrorHandling() {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    settingsStore.addNotification({
      title: 'Error',
      message: 'An unexpected error occurred',
      icon: 'error',
      color: 'red',
      type: 'general',
    });
  });

  setInterval(() => {
    // checkBudgetAlerts();
  }, 60_000);
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(() => {
  applyTheme();
  setupGlobalErrorHandling();

  navigator.serviceWorker?.addEventListener('message', onSWMessage);
  window.addEventListener('pagehide', onPageHide);

  // Android/Desktop: browser fires beforeinstallprompt — handle only here (no duplicate call)
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    installPrompt.value = e as BeforeInstallPromptEvent;
    console.log('PWA install prompt captured');
    showInstallPromptDialog();
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    installPrompt.value = null;
    localStorage.removeItem('pwa-install-dismissed');
    $q.notify({ color: 'positive', position: 'top', message: 'App installed successfully!', icon: 'check_circle' });
  });

  const { isIOS, isNativeApp, isStandalonePWA } = detectPlatform();

  if (isNativeApp) {
    console.log('NATIVE APP: Skipping PWA install prompt');
    return;
  }

  // iOS: beforeinstallprompt never fires on iOS, must trigger manually
  if (isIOS && !isStandalonePWA && !hasUserDismissedPrompt()) {
    showInstallPromptDialog();
  }
  // Android/Desktop: handled exclusively by the beforeinstallprompt listener above
});

onBeforeUnmount(() => {
  navigator.serviceWorker?.removeEventListener('message', onSWMessage);
  window.removeEventListener('pagehide', onPageHide);
});

// Expose for template use
defineExpose({ showInstallDialog, showIOSInstructions, showDesktopInstructions, browserType, installPwa, dismissInstallPrompt });
</script>
