// src/composables/useCategories.ts
// Thin wrapper around useCategoriesStore — all service calls live in the store.
import { computed } from 'vue';
import { useCategoriesStore } from 'src/stores/categories';

export function useCategories() {
  const store = useCategoriesStore();
  return {
    data: computed(() => store.categories),
    isLoading: computed(() => store.loading),
    error: computed(() => (store.error ? new Error(store.error) : null)),
    refetch: () => store.fetchCategories(),
  };
}

export async function fetchCategories() {
  const store = useCategoriesStore();
  if (store.categories.length > 0) return;
  await store.fetchCategories();
}
