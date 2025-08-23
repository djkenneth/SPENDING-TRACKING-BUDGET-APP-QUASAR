import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  accountsService,
  type Account,
  type CreateAccountDto,
  type UpdateAccountDto,
  type QueryParams,
} from '../services/accounts.service';
import { useQuasar } from 'quasar';
import type { Ref } from 'vue';

// Query Keys
export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...accountKeys.lists(), params] as const,
  details: () => [...accountKeys.all, 'detail'] as const,
  detail: (id: number) => [...accountKeys.details(), id] as const,
  transactions: (id: number, params?: QueryParams) =>
    [...accountKeys.detail(id), 'transactions', params] as const,
  balanceHistory: (id: number, params?: QueryParams) =>
    [...accountKeys.detail(id), 'balance-history', params] as const,
  summary: () => [...accountKeys.all, 'summary'] as const,
  types: () => [...accountKeys.all, 'types'] as const,
};

// Composables
export function useAccounts(params?: Ref<QueryParams> | QueryParams) {
  const $q = useQuasar();

  return useQuery({
    queryKey: params
      ? typeof params === 'object' && 'value' in params
        ? accountKeys.list(params.value)
        : accountKeys.list(params)
      : accountKeys.lists(),
    queryFn: async () => {
      const queryParams = params
        ? typeof params === 'object' && 'value' in params
          ? params.value
          : params
        : undefined;
      const response = await accountsService.getAccounts(queryParams);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAccount(id: Ref<number> | number) {
  const accountId = typeof id === 'object' && 'value' in id ? id.value : id;

  return useQuery({
    queryKey: accountKeys.detail(accountId),
    queryFn: async () => {
      const response = await accountsService.getAccount(accountId);
      return response.data;
    },
    enabled: !!accountId,
  });
}

export function useAccountsSummary() {
  return useQuery({
    queryKey: accountKeys.summary(),
    queryFn: async () => {
      const response = await accountsService.getAccountsSummary();
      return response.data;
    },
  });
}

export function useAccountTypes() {
  return useQuery({
    queryKey: accountKeys.types(),
    queryFn: async () => {
      const response = await accountsService.getAccountTypes();
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour (rarely changes)
  });
}

export function useAccountTransactions(
  id: Ref<number> | number,
  params?: Ref<QueryParams> | QueryParams,
) {
  const accountId = typeof id === 'object' && 'value' in id ? id.value : id;

  return useQuery({
    queryKey: params
      ? typeof params === 'object' && 'value' in params
        ? accountKeys.transactions(accountId, params.value)
        : accountKeys.transactions(accountId, params)
      : accountKeys.transactions(accountId),
    queryFn: async () => {
      const queryParams = params
        ? typeof params === 'object' && 'value' in params
          ? params.value
          : params
        : undefined;
      return await accountsService.getAccountTransactions(accountId, queryParams);
    },
    enabled: !!accountId,
  });
}

export function useAccountBalanceHistory(
  id: Ref<number> | number,
  params?: Ref<QueryParams> | QueryParams,
) {
  const accountId = typeof id === 'object' && 'value' in id ? id.value : id;

  return useQuery({
    queryKey: params
      ? typeof params === 'object' && 'value' in params
        ? accountKeys.balanceHistory(accountId, params.value)
        : accountKeys.balanceHistory(accountId, params)
      : accountKeys.balanceHistory(accountId),
    queryFn: async () => {
      const queryParams = params
        ? typeof params === 'object' && 'value' in params
          ? params.value
          : params
        : undefined;
      const response = await accountsService.getAccountBalanceHistory(accountId, queryParams);
      return response.data;
    },
    enabled: !!accountId,
  });
}

// Mutations
export function useCreateAccount() {
  const queryClient = useQueryClient();
  const $q = useQuasar();

  return useMutation({
    mutationFn: (data: CreateAccountDto) => accountsService.createAccount(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      $q.notify({
        type: 'positive',
        message: 'Account created successfully',
      });
    },
    onError: (error: any) => {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Failed to create account',
      });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  const $q = useQuasar();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAccountDto }) =>
      accountsService.updateAccount(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      $q.notify({
        type: 'positive',
        message: 'Account updated successfully',
      });
    },
    onError: (error: any) => {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Failed to update account',
      });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const $q = useQuasar();

  return useMutation({
    mutationFn: (id: number) => accountsService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      $q.notify({
        type: 'positive',
        message: 'Account deleted successfully',
      });
    },
    onError: (error: any) => {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Failed to delete account',
      });
    },
  });
}

export function useTransferBetweenAccounts() {
  const queryClient = useQueryClient();
  const $q = useQuasar();

  return useMutation({
    mutationFn: (data: {
      from_account_id: number;
      to_account_id: number;
      amount: number;
      description?: string;
      date?: string;
    }) => accountsService.transfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      $q.notify({
        type: 'positive',
        message: 'Transfer completed successfully',
      });
    },
    onError: (error: any) => {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Failed to complete transfer',
      });
    },
  });
}

export function useReconcileAccount() {
  const queryClient = useQueryClient();
  const $q = useQuasar();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { balance: number; date?: string; notes?: string };
    }) => accountsService.reconcileAccount(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      $q.notify({
        type: 'positive',
        message: 'Account reconciled successfully',
      });
    },
    onError: (error: any) => {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Failed to reconcile account',
      });
    },
  });
}
