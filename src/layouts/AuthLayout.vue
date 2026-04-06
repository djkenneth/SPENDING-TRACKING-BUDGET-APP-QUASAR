<!-- src/layouts/AuthLayout.vue -->
<template>
  <div class="min-h-screen bg-background">
    <!-- Background glow — fixed so it stays put while the page scrolls -->
    <div class="pointer-events-none fixed inset-0 z-0 flex items-start justify-center overflow-hidden">
      <div class="w-175 h-100 -translate-y-1/4 rounded-full bg-indigo-600/10 blur-[120px]" />
    </div>

    <!-- Scrollable column -->
    <div class="relative z-10 flex min-h-screen flex-col items-center px-4 py-10 sm:py-14">
      <!-- Logo -->
      <div class="mb-7 flex flex-col items-center gap-2">
        <div class="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#6366f1" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#6366f1" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Spend<span class="text-indigo-500">Wise</span>
          </span>
        </div>
        <p class="text-xs text-muted-foreground">Smart personal finance</p>
      </div>

      <!-- Page content (LoginPage / RegisterPage) -->
      <div class="w-full flex-1">
        <router-view />
      </div>

      <!-- Footer -->
      <p class="mt-10 text-xs text-muted-foreground">
        &copy; {{ year }} SpendWise. All rights reserved.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const year = new Date().getFullYear();
</script>
