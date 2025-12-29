// src/composables/useTransactions.ts

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/vue-query';
import { transactionsService } from 'src/services/transactions.service';
import { useQuasar } from 'quasar';
import type { Ref } from 'vue';
import {
  BulkTransactionDto,
  CreateTransactionDto,
  TransactionFilters,
  UpdateTransactionDto,
} from 'src/types/transaction.types';

// Query Keys
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters?: TransactionFilters) => [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: number) => [...transactionKeys.details(), id] as const,
  statistics: (filters?: TransactionFilters) =>
    [...transactionKeys.all, 'statistics', filters] as const,
  spending: (filters?: TransactionFilters) =>
    [...transactionKeys.all, 'spending', filters] as const,
  incomeVsExpenses: (filters?: TransactionFilters) =>
    [...transactionKeys.all, 'income-vs-expenses', filters] as const,
};

// Composables
export function useTransactions(filters?: Ref<TransactionFilters> | TransactionFilters) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: async () => {
      return await transactionsService.getTransactions(filters.value);
    },
  });
}

export function useInfiniteTransactions(filters?: Ref<TransactionFilters> | TransactionFilters) {
  return useInfiniteQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const queryFilters = filters.value;
      return await transactionsService.getTransactions({
        ...queryFilters,
        page: pageParam,
      });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useTransaction(id: Ref<number> | number) {
  const transactionId = typeof id === 'object' && 'value' in id ? id.value : id;

  return useQuery({
    queryKey: transactionKeys.detail(transactionId),
    queryFn: async () => {
      const response = await transactionsService.getTransaction(transactionId);
      return response.data;
    },
    enabled: !!transactionId,
  });
}

export function useTransactionStatistics(filters?: Ref<TransactionFilters> | TransactionFilters) {
  return useQuery({
    queryKey: transactionKeys.statistics(filters),
    queryFn: async () => {
      const queryFilters = filters.value;
      const response = await transactionsService.getStatistics(queryFilters);
      return response.data;
    },
  });
}

export function useSpendingByCategory(filters?: Ref<TransactionFilters> | TransactionFilters) {
  return useQuery({
    queryKey: transactionKeys.spending(filters),
    queryFn: async () => {
      const queryFilters = filters.value;
      const response = await transactionsService.getSpendingByCategory(queryFilters);
      return response.data;
    },
  });
}

export function useIncomeVsExpenses(filters?: Ref<TransactionFilters> | TransactionFilters) {
  return useQuery({
    queryKey: transactionKeys.incomeVsExpenses(filters),
    queryFn: async () => {
      const queryFilters = filters.value;
      const response = await transactionsService.getIncomeVsExpenses(queryFilters);
      return response.data;
    },
  });
}

// Mutations
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const $q = useQuasar();

  return useMutation({
    mutationFn: (data: CreateTransactionDto) => transactionsService.createTransaction(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      $q.notify({
        type: 'positive',
        message: 'Transaction created successfully',
      });
    },
    onError: (error: any) => {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Failed to create transaction',
      });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const $q = useQuasar();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTransactionDto }) =>
      transactionsService.updateTransaction(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      $q.notify({
        type: 'positive',
        message: 'Transaction updated successfully',
      });
    },
    onError: (error: any) => {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Failed to update transaction',
      });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const $q = useQuasar();

  return useMutation({
    mutationFn: (id: number) => transactionsService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      $q.notify({
        type: 'positive',
        message: 'Transaction deleted successfully',
      });
    },
    onError: (error: any) => {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Failed to delete transaction',
      });
    },
  });
}

export function useBulkCreateTransactions() {
  const queryClient = useQueryClient();
  const $q = useQuasar();

  return useMutation({
    mutationFn: (data: BulkTransactionDto) => transactionsService.bulkCreateTransactions(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      $q.notify({
        type: 'positive',
        message: `${response.data.length} transactions created successfully`,
      });
    },
    onError: (error: any) => {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Failed to create transactions',
      });
    },
  });
}

export function useBulkDeleteTransactions() {
  const queryClient = useQueryClient();
  const $q = useQuasar();

  return useMutation({
    mutationFn: (ids: number[]) => transactionsService.bulkDeleteTransactions(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      $q.notify({
        type: 'positive',
        message: 'Transactions deleted successfully',
      });
    },
    onError: (error: any) => {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Failed to delete transactions',
      });
    },
  });
}

export function useImportTransactions() {
  const queryClient = useQueryClient();
  const $q = useQuasar();

  return useMutation({
    mutationFn: (file: File) => transactionsService.importTransactions(file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      $q.notify({
        type: 'positive',
        message: `Successfully imported ${response.data.success_count} transactions`,
      });
      if (response.data.error_count > 0) {
        $q.notify({
          type: 'warning',
          message: `${response.data.error_count} transactions failed to import`,
        });
      }
    },
    onError: (error: any) => {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Failed to import transactions',
      });
    },
  });
}

// export function useDuplicateTransaction() {
//   const queryClient = useQueryClient();
//   const $q = useQuasar();

//   return useMutation({
//     mutationFn: (id: number) => transactionsService.duplicateTransaction(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: transactionKeys.all });
//       $q.notify({
//         type: 'positive',
//         message: 'Transaction duplicated successfully',
//       });
//     },
//     onError: (error: any) => {
//       $q.notify({
//         type: 'negative',
//         message: error.response?.data?.message || 'Failed to duplicate transaction',
//       });
//     },
//   });
// }

export function useUploadReceipt() {
  const queryClient = useQueryClient();
  const $q = useQuasar();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      transactionsService.uploadReceipt(id, file),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(variables.id) });
      $q.notify({
        type: 'positive',
        message: 'Receipt uploaded successfully',
      });
    },
    onError: (error: any) => {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Failed to upload receipt',
      });
    },
  });
}
