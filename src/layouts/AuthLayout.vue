<!-- src/layouts/AuthLayout.vue -->
<template>
  <div class="relative min-h-screen flex flex-col items-center justify-center bg-background p-4 overflow-hidden">
    <!-- Background glow -->
    <div class="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
      <div class="w-175 h-100 -translate-y-1/4 rounded-full bg-indigo-600/10 blur-[120px]" />
    </div>

    <!-- Logo -->
    <div class="mb-8 flex flex-col items-center gap-2 z-10">
      <div class="flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#6366f1" />
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#6366f1" stroke-width="2" stroke-linecap="round" />
        </svg>
        <span class="text-2xl font-bold tracking-tight">
          Spend<span class="text-indigo-500">Wise</span>
        </span>
      </div>
      <p class="text-xs text-muted-foreground">Smart personal finance</p>
    </div>

    <!-- Page content (LoginPage / RegisterPage card) -->
    <div class="z-10 w-full">
      <router-view />
    </div>

    <!-- Footer -->
    <p class="z-10 mt-8 text-xs text-muted-foreground">
      &copy; {{ year }} SpendWise. All rights reserved.
    </p>
  </div>
</template>

<script setup lang="ts">
const year = new Date().getFullYear();
</script>
