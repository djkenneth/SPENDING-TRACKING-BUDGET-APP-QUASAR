import { defineBoot } from '#q-app/wrappers';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default defineBoot(({ app }) => {
  // Install Vue Query plugin
  app.use(VueQueryPlugin, {
    queryClient,
  });
});

export { queryClient };
