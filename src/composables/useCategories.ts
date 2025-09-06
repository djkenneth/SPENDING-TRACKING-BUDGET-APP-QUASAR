// src/composables/useCategories.ts
import { useQuery } from '@tanstack/vue-query';
import { categoriesService } from '../services/categories.service';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesService.getCategories();
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
