<template>
  <a
    :href="link"
    target="_blank"
    class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
  >
    <span v-if="icon" class="text-muted-foreground">{{ icon }}</span>
    <div>
      <div class="text-sm font-medium">{{ title }}</div>
      <div v-if="caption" class="text-xs text-muted-foreground">{{ caption }}</div>
    </div>
  </a>
</template>

<script setup lang="ts">
export interface EssentialLinkProps {
  title: string;
  caption?: string;
  link?: string;
  icon?: string;
};

withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  link: '#',
  icon: '',
});
</script>
