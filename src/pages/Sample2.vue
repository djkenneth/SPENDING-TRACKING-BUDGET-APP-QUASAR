<script setup lang="ts">

</script>

<template>
  <!-- All Tailwind classes use tw- prefix -->
  <div class="tw-container tw-mx-auto tw-p-4">
    <h1 class="tw-text-3xl tw-font-bold tw-text-red-900">
      Budget Dashboard
    </h1>

    <!-- Quasar components work normally without prefix -->
    <q-card class="tw-mt-6 tw-shadow-lg">
      <q-card-section>
        <div class="tw-text-h6">Account Balance</div>
        <div class="tw-text-4xl tw-font-bold tw-text-green-600 tw-mt-2">
          $12,345.67
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped lang="scss"></style>
