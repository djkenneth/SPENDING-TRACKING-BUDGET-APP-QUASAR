<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-blue-700 text-white p-6 text-center">
    <div class="text-[20vh] font-bold leading-none opacity-80">404</div>
    <div class="text-2xl font-medium opacity-60 mt-4 mb-8">Oops. Nothing here...</div>
    <Button variant="secondary" size="lg" @click="$router.push('/')">
      <Home class="w-5 h-5 mr-2" />
      Go Home
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from 'src/components/ui/button';
import { Home } from 'lucide-vue-next';
</script>
