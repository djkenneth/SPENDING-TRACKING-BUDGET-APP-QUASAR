// src/composables/useCategories.ts
import { ref, readonly } from 'vue';
import { categoriesService } from '../services/categories.service';
import type { Category } from 'src/types/category.types';

// ── Module-level singleton ─────────────────────────────────────────────────────
const categoriesData = ref<Category[] | undefined>(undefined);
const categoriesLoading = ref(false);
const categoriesError = ref<Error | null>(null);
let categoriesFetched = false;

async function fetchCategories() {
  if (categoriesFetched) return;
  categoriesLoading.value = true;
  categoriesError.value = null;
  try {
    const response = await categoriesService.getCategories();
    if (response.success) {
      categoriesData.value = response.data;
      categoriesFetched = true;
    }
  } catch (err: any) {
    categoriesError.value = err;
    console.error('[useCategories] getCategories:', err);
  } finally {
    categoriesLoading.value = false;
  }
}

export function useCategories() {
  // Does NOT auto-fetch — call fetchCategories() via initializeTransactionsPage()
  return {
    data: readonly(categoriesData),
    isLoading: readonly(categoriesLoading),
    error: readonly(categoriesError),
    refetch: async () => { categoriesFetched = false; await fetchCategories(); },
  };
}

// ── initializeTransactionsPage ─────────────────────────────────────────────────
// Sequential: accounts (already cached) → categories → transactions → favorites
export { fetchCategories };
