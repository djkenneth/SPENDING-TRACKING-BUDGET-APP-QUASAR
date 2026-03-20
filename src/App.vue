<!-- src/App.vue -->
<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { useQuasar } from 'quasar';
import { useSettingsStore } from 'src/stores/settings';

const $q = useQuasar();
const settingsStore = useSettingsStore();

// ─── Platform & Browser Detection ────────────────────────────────────────────

function detectPlatform() {
  const p = $q.platform;
  const isPWA =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  const info = {
    // Device type
    isMobile: p.is.mobile ?? false,
    isDesktop: p.is.desktop ?? false,
    isTablet: p.is.ipad ?? false,
    // OS
    isIos: p.is.ios ?? false,
    isAndroid: p.is.android ?? false,
    isWindows: p.is.win ?? false,
    isMac: p.is.mac ?? false,
    isLinux: p.is.linux ?? false,
    // Browser
    isChrome: p.is.chrome ?? false,
    isFirefox: p.is.firefox ?? false,
    isSafari: p.is.safari ?? false,
    isEdge: p.is.edge ?? false,
    // App mode
    isPWA,
    isElectron: p.is.electron ?? false,
    userAgent: navigator.userAgent,
  };

  settingsStore.setPlatformInfo(info);
  return info;
}

// ─── localStorage / App Data Cleanup ─────────────────────────────────────────

/**
 * Clears all app data from localStorage, unregisters the service worker,
 * and clears all caches. Call this when the user wants to reset the app
 * or when triggered by the SW during an uninstall flow.
 */
async function clearAllAppData() {
  // Clear localStorage
  localStorage.clear();

  // Clear all caches
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  }
}

/** Listen for messages from the service worker requesting a data clear. */
function onSWMessage(event: MessageEvent) {
  if (event.data?.type === 'CLEAR_LOCAL_STORAGE') {
    void clearAllAppData();
  }
}

// pagehide fires when the browser unloads the page (tab close, navigate away).
// When persisted=false the page won't enter bfcache, meaning it's truly unloading.
function onPageHide(event: PageTransitionEvent) {
  if (!event.persisted) {
    // Mark the last-seen timestamp so the SW can detect stale sessions
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

  // Check every minute for budget alerts (hook into budget composable when ready)
  setInterval(() => {
    // checkBudgetAlerts();
  }, 60_000);
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(() => {
  applyTheme();
  detectPlatform();
  setupGlobalErrorHandling();

  // Listen for SW → page cleanup messages
  navigator.serviceWorker?.addEventListener('message', onSWMessage);

  // Track page unload
  window.addEventListener('pagehide', onPageHide);
});

onBeforeUnmount(() => {
  navigator.serviceWorker?.removeEventListener('message', onSWMessage);
  window.removeEventListener('pagehide', onPageHide);
});
</script>
