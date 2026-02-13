<!-- src/App.vue -->
<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSettingsStore } from 'src/stores/settings';

const settingsStore = useSettingsStore();

onMounted(() => {
  // Initialize app theme based on settings
  const theme = settingsStore.settings.theme;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // Auto theme - check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
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
