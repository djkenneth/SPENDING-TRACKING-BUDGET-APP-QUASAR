// src/composables/useAccounts.ts
// Thin wrappers around useAccountsStore — all service calls live in the store.
import { ref, computed, readonly } from 'vue';
import { useAccountsStore } from 'src/stores/accounts';
import type { CreateAccountDto, UpdateAccountDto } from 'src/types/account.types';

export async function initializeAccounts() {
  const store = useAccountsStore();
  await store.initializeAccounts();
}

export function useAccounts() {
  const store = useAccountsStore();
  store.fetchAccounts();
  return {
    data: computed(() => store.accounts),
    isLoading: computed(() => store.accountsLoading),
    error: computed(() => store.accountsError),
    refetch: () => store.refetchAccounts(),
  };
}

export function useAccountsSummary() {
  const store = useAccountsStore();
  return {
    data: computed(() => store.summary),
    isLoading: computed(() => store.summaryLoading),
    error: ref<Error | null>(null),
    refetch: () => store.refetchSummary(),
  };
}

export function useAccountTypes() {
  const store = useAccountsStore();
  return {
    data: computed(() => store.types),
    isLoading: computed(() => store.typesLoading),
    error: ref<Error | null>(null),
  };
}

export function useCreateAccount() {
  const store = useAccountsStore();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate(data: CreateAccountDto) {
    isPending.value = true;
    error.value = null;
    try {
      return await store.createAccount(data);
    } catch (err: any) {
      error.value = err;
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}

export function useUpdateAccount() {
  const store = useAccountsStore();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate({ id, data }: { id: number; data: UpdateAccountDto }) {
    isPending.value = true;
    error.value = null;
    try {
      return await store.updateAccount(id, data);
    } catch (err: any) {
      error.value = err;
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}

export function useDeleteAccount() {
  const store = useAccountsStore();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate(id: number) {
    isPending.value = true;
    error.value = null;
    try {
      return await store.deleteAccount(id);
    } catch (err: any) {
      error.value = err;
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}

export function useTransferBetweenAccounts() {
  const store = useAccountsStore();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate(data: {
    from_account_id: number;
    to_account_id: number;
    amount: number;
    description: string;
    transaction_fee?: number;
    date?: string;
    notes?: string;
    reference_number?: string;
  }) {
    isPending.value = true;
    error.value = null;
    try {
      return await store.transfer(data);
    } catch (err: any) {
      error.value = err;
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}

export function useReconcileAccount() {
  const store = useAccountsStore();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate({
    id,
    data,
  }: {
    id: number;
    data: { balance: number; date?: string; notes?: string };
  }) {
    isPending.value = true;
    error.value = null;
    try {
      return await store.reconcileAccount(id, data);
    } catch (err: any) {
      error.value = err;
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}
