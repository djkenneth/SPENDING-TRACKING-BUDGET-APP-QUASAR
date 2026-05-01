// src/stores/icons.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { iconsService } from 'src/services/icons.service';
import type { Icon } from 'src/types/icon.types';

export const useIconsStore = defineStore('icons', () => {
  const icons = ref<Icon[]>([]);
  const loading = ref(false);
  const uploading = ref(false);

  let iconsFetched = false;

  async function fetchIcons() {
    if (iconsFetched) return;
    loading.value = true;
    try {
      const response = await iconsService.getIcons();
      if (response.success && response.data) {
        icons.value = response.data;
        iconsFetched = true;
      }
    } catch (err) {
      console.error('[iconsStore] getIcons:', err);
    } finally {
      loading.value = false;
    }
  }

  async function uploadIcon(file: File, name: string): Promise<Icon | undefined> {
    uploading.value = true;
    try {
      const response = await iconsService.uploadIcon(file, name);
      if (response.success && response.data) {
        icons.value = [response.data, ...icons.value];
        return response.data;
      }
    } finally {
      uploading.value = false;
    }
  }

  return { icons, loading, uploading, fetchIcons, uploadIcon };
});
