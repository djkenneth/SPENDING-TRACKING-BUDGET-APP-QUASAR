// src/stores/accounts.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { accountsService } from 'src/services/accounts.service';
import type {
  Account,
  AccountSummary,
  AccountTypesMap,
  CreateAccountDto,
  UpdateAccountDto,
} from 'src/types/account.types';

export { type Account };

export const useAccountsStore = defineStore('accounts', () => {
  const $q = useQuasar();

  // State
  const accounts = ref<Account[] | undefined>(undefined);
  const summary = ref<AccountSummary | undefined>(undefined);
  const types = ref<AccountTypesMap | undefined>(undefined);
  const accountsLoading = ref(false);
  const summaryLoading = ref(false);
  const typesLoading = ref(false);
  const accountsError = ref<Error | null>(null);

  // Inflight guards (closure variables — not reactive, store is a singleton)
  let accountsFetched = false;
  let accountsInflight: Promise<void> | null = null;
  let summaryFetched = false;
  let summaryInflight: Promise<void> | null = null;
  let typesFetched = false;
  let typesInflight: Promise<void> | null = null;

  // ── Fetch actions ──────────────────────────────────────────────────────────────

  function fetchAccounts(): Promise<void> {
    if (accountsFetched) return Promise.resolve();
    if (accountsInflight) return accountsInflight;

    accountsInflight = (async () => {
      accountsLoading.value = true;
      accountsError.value = null;
      try {
        const response = await accountsService.getAccounts();
        if (response.success) {
          accounts.value = response.data;
          accountsFetched = true;
        }
      } catch (err: unknown) {
        accountsError.value = err as Error;
        console.error('[accountsStore] getAccounts:', err);
      } finally {
        accountsLoading.value = false;
        accountsInflight = null;
      }
    })();
    return accountsInflight;
  }

  function fetchSummary(): Promise<void> {
    if (summaryFetched) return Promise.resolve();
    if (summaryInflight) return summaryInflight;

    summaryInflight = (async () => {
      summaryLoading.value = true;
      try {
        const response = await accountsService.getAccountsSummary();
        if (response.success) {
          summary.value = response.data;
          summaryFetched = true;
        }
      } catch (err: unknown) {
        console.error('[accountsStore] getAccountsSummary:', err);
      } finally {
        summaryLoading.value = false;
        summaryInflight = null;
      }
    })();
    return summaryInflight;
  }

  function fetchTypes(): Promise<void> {
    if (typesFetched) return Promise.resolve();
    if (typesInflight) return typesInflight;

    typesInflight = (async () => {
      typesLoading.value = true;
      try {
        const response = await accountsService.getAccountTypes();
        if (response.success) {
          types.value = response.data;
          typesFetched = true;
        }
      } catch (err: unknown) {
        console.error('[accountsStore] getAccountTypes:', err);
      } finally {
        typesLoading.value = false;
        typesInflight = null;
      }
    })();
    return typesInflight;
  }

  async function initializeAccounts() {
    await fetchAccounts();
    await fetchSummary();
    await fetchTypes();
  }

  async function refetchAccounts() {
    accountsFetched = false;
    accountsInflight = null;
    await fetchAccounts();
  }

  async function refetchSummary() {
    summaryFetched = false;
    summaryInflight = null;
    await fetchSummary();
  }

  // ── Mutation actions ───────────────────────────────────────────────────────────

  async function createAccount(data: CreateAccountDto): Promise<Account | undefined> {
    try {
      const response = await accountsService.createAccount(data);
      if (response.success && response.data) {
        accounts.value = [...(accounts.value ?? []), response.data];
        summaryFetched = false;
        $q.notify({ type: 'positive', message: 'Account created successfully', position: 'top' });
        return response.data;
      }
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to create account',
        position: 'top',
      });
      throw err;
    }
  }

  async function updateAccount(id: number, data: UpdateAccountDto): Promise<Account | undefined> {
    try {
      const response = await accountsService.updateAccount(id, data);
      if (response.success && response.data) {
        const idx = (accounts.value ?? []).findIndex((a) => a.id === id);
        if (idx !== -1 && accounts.value) {
          accounts.value = [
            ...accounts.value.slice(0, idx),
            response.data,
            ...accounts.value.slice(idx + 1),
          ];
        }
        summaryFetched = false;
        $q.notify({ type: 'positive', message: 'Account updated successfully', position: 'top' });
        return response.data;
      }
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to update account',
        position: 'top',
      });
      throw err;
    }
  }

  async function deleteAccount(id: number): Promise<boolean> {
    try {
      const response = await accountsService.deleteAccount(id);
      if (response.success) {
        accounts.value = (accounts.value ?? []).filter((a) => a.id !== id);
        summaryFetched = false;
        $q.notify({ type: 'positive', message: 'Account deleted successfully', position: 'top' });
        return true;
      }
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to delete account',
        position: 'top',
      });
      throw err;
    }
    return false;
  }

  async function transfer(data: {
    from_account_id: number;
    to_account_id: number;
    amount: number;
    description: string;
    transaction_fee?: number;
    date?: string;
    notes?: string;
    reference_number?: string;
  }) {
    try {
      const response = await accountsService.transfer(data);
      if (response.success) {
        accountsFetched = false;
        summaryFetched = false;
        $q.notify({ type: 'positive', message: 'Transfer completed successfully', position: 'top' });
        return response.data;
      }
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to complete transfer',
        position: 'top',
      });
      throw err;
    }
  }

  async function reconcileAccount(
    id: number,
    data: { balance: number; date?: string; notes?: string },
  ): Promise<Account | undefined> {
    try {
      const response = await accountsService.reconcileAccount(id, data);
      if (response.success && response.data) {
        const idx = (accounts.value ?? []).findIndex((a) => a.id === id);
        if (idx !== -1 && accounts.value) {
          accounts.value = [
            ...accounts.value.slice(0, idx),
            response.data,
            ...accounts.value.slice(idx + 1),
          ];
        }
        summaryFetched = false;
        $q.notify({ type: 'positive', message: 'Account reconciled successfully', position: 'top' });
        return response.data;
      }
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to reconcile account',
        position: 'top',
      });
      throw err;
    }
  }

  return {
    // State
    accounts,
    summary,
    types,
    accountsLoading,
    summaryLoading,
    typesLoading,
    accountsError,
    // Actions
    fetchAccounts,
    fetchSummary,
    fetchTypes,
    initializeAccounts,
    refetchAccounts,
    refetchSummary,
    createAccount,
    updateAccount,
    deleteAccount,
    transfer,
    reconcileAccount,
  };
});
