<!-- src/App.vue -->
<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSettingsStore } from 'src/stores/settings';
import { useQuasar } from 'quasar';

const settingsStore = useSettingsStore();
const $q = useQuasar();

onMounted(() => {
  // Initialize app theme based on settings
  const theme = settingsStore.settings.theme;
  if (theme === 'dark') {
    $q.dark.set(true);
  } else if (theme === 'light') {
    $q.dark.set(false);
  } else {
    // Auto theme
    $q.dark.set('auto');
  }

  // Set up any initial app configuration
  setupApp();
});

const setupApp = () => {
  // Set up global error handling
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

  // Set up periodic budget alerts check
  setInterval(() => {
    // This would be implemented in the budget composable
    // checkBudgetAlerts();
  }, 60000); // Check every minute
};
</script>

<style>
#q-app {
  font-family: 'Roboto', sans-serif;
}

/* Global styles for consistent theming */
.stat-card {
  border-radius: 12px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.transaction-item {
  border-radius: 8px;
  transition: background-color 0.2s;
}

.transaction-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.category-progress {
  height: 6px;
  border-radius: 3px;
}

.floating-add-btn {
  position: fixed;
  bottom: 80px;
  right: 16px;
  z-index: 1000;
}

.bottom-nav {
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

/* Responsive design */
@media (max-width: 768px) {
  .q-pa-md {
    padding: 8px;
  }

  .q-gutter-md > * {
    margin: 4px;
  }
}
</style>
