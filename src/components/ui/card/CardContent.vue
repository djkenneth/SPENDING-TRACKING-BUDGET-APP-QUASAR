<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "src/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div :class="cn('tw:p-6 tw:pt-0', props.class)">
    <slot />
  </div>
</template>
