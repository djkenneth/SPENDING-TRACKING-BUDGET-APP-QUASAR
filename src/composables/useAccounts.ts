// src/composables/useAccounts.ts
import { ref, readonly } from 'vue';
import { accountsService } from 'src/services/accounts.service';
import { useQuasar } from 'quasar';
import type {
  Account,
  AccountSummary,
  AccountTypesMap,
  CreateAccountDto,
  UpdateAccountDto,
} from 'src/types/account.types';

// ── Module-level singletons (shared across all component instances) ────────────
// This ensures each endpoint is only fetched once, regardless of how many
// components call useAccounts(), useAccountsSummary(), or useAccountTypes().

const accountsData = ref<Account[] | undefined>(undefined);
const accountsLoading = ref(false);
const accountsError = ref<Error | null>(null);
let accountsFetched = false;
let accountsInflight: Promise<void> | null = null;

const summaryData = ref<AccountSummary | undefined>(undefined);
const summaryLoading = ref(false);
const summaryError = ref<Error | null>(null);
let summaryFetched = false;
let summaryInflight: Promise<void> | null = null;

const typesData = ref<AccountTypesMap | undefined>(undefined);
const typesLoading = ref(false);
const typesError = ref<Error | null>(null);
let typesFetched = false;
let typesInflight: Promise<void> | null = null;

// ── Internal fetch functions (shared by composables & initializeAccounts) ──────

function fetchAccounts(): Promise<void> {
  if (accountsFetched) return Promise.resolve();
  if (accountsInflight) return accountsInflight;

  accountsInflight = (async () => {
    accountsLoading.value = true;
    accountsError.value = null;
    try {
      const response = await accountsService.getAccounts();
      if (response.success) {
        accountsData.value = response.data;
        accountsFetched = true;
      }
    } catch (err: any) {
      accountsError.value = err;
      console.error('[useAccounts] getAccounts:', err);
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
    summaryError.value = null;
    try {
      const response = await accountsService.getAccountsSummary();
      if (response.success) {
        summaryData.value = response.data;
        summaryFetched = true;
      }
    } catch (err: any) {
      summaryError.value = err;
      console.error('[useAccounts] getAccountsSummary:', err);
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
    typesError.value = null;
    try {
      const response = await accountsService.getAccountTypes();
      if (response.success) {
        typesData.value = response.data;
        typesFetched = true;
      }
    } catch (err: any) {
      typesError.value = err;
      console.error('[useAccounts] getAccountTypes:', err);
    } finally {
      typesLoading.value = false;
      typesInflight = null;
    }
  })();

  return typesInflight;
}

// ── initializeAccounts — sequential fetch for AccountsPage ────────────────────
// Call this in onMounted to load accounts → summary → types one after another.

export async function initializeAccounts() {
  await fetchAccounts();
  await fetchSummary();
  await fetchTypes();
}

// ── useAccounts ────────────────────────────────────────────────────────────────
// Auto-fetches accounts only (used by TransactionsPage which only needs accounts list)

export function useAccounts() {
  fetchAccounts(); // no-op if already fetched (singleton flag)

  return {
    data: readonly(accountsData),
    isLoading: readonly(accountsLoading),
    error: readonly(accountsError),
    refetch: async () => {
      accountsFetched = false;
      accountsInflight = null;
      await fetchAccounts();
    },
  };
}

// ── useAccountsSummary ─────────────────────────────────────────────────────────
// Does NOT auto-fetch — call initializeAccounts() in onMounted instead.

export function useAccountsSummary() {
  return {
    data: readonly(summaryData),
    isLoading: readonly(summaryLoading),
    error: readonly(summaryError),
    refetch: async () => {
      summaryFetched = false;
      summaryInflight = null;
      await fetchSummary();
    },
  };
}

// ── useAccountTypes ────────────────────────────────────────────────────────────
// Does NOT auto-fetch — call initializeAccounts() in onMounted instead.

export function useAccountTypes() {
  // intentionally no auto-fetch

  return {
    data: readonly(typesData),
    isLoading: readonly(typesLoading),
    error: readonly(typesError),
  };
}

// ── Mutations ──────────────────────────────────────────────────────────────────

export function useCreateAccount() {
  const $q = useQuasar();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate(data: CreateAccountDto) {
    isPending.value = true;
    error.value = null;
    try {
      const response = await accountsService.createAccount(data);
      if (response.success && response.data) {
        accountsData.value = [...(accountsData.value ?? []), response.data];
        summaryFetched = false; // invalidate summary
        $q.notify({ type: 'positive', message: 'Account created successfully', position: 'top' });
        return response.data;
      }
    } catch (err: any) {
      error.value = err;
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to create account',
        position: 'top',
      });
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}

export function useUpdateAccount() {
  const $q = useQuasar();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate({ id, data }: { id: number; data: UpdateAccountDto }) {
    isPending.value = true;
    error.value = null;
    try {
      const response = await accountsService.updateAccount(id, data);
      if (response.success && response.data) {
        const idx = (accountsData.value ?? []).findIndex((a) => a.id === id);
        if (idx !== -1 && accountsData.value) {
          accountsData.value = [
            ...accountsData.value.slice(0, idx),
            response.data,
            ...accountsData.value.slice(idx + 1),
          ];
        }
        summaryFetched = false;
        $q.notify({ type: 'positive', message: 'Account updated successfully', position: 'top' });
        return response.data;
      }
    } catch (err: any) {
      error.value = err;
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to update account',
        position: 'top',
      });
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}

export function useDeleteAccount() {
  const $q = useQuasar();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate(id: number) {
    isPending.value = true;
    error.value = null;
    try {
      const response = await accountsService.deleteAccount(id);
      if (response.success) {
        accountsData.value = (accountsData.value ?? []).filter((a) => a.id !== id);
        summaryFetched = false;
        $q.notify({ type: 'positive', message: 'Account deleted successfully', position: 'top' });
        return true;
      }
    } catch (err: any) {
      error.value = err;
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to delete account',
        position: 'top',
      });
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}

export function useTransferBetweenAccounts() {
  const $q = useQuasar();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate(data: {
    from_account_id: number;
    to_account_id: number;
    amount: number;
    description?: string;
    date?: string;
  }) {
    isPending.value = true;
    error.value = null;
    try {
      const response = await accountsService.transfer(data);
      if (response.success) {
        accountsFetched = false;
        summaryFetched = false;
        $q.notify({
          type: 'positive',
          message: 'Transfer completed successfully',
          position: 'top',
        });
        return response.data;
      }
    } catch (err: any) {
      error.value = err;
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to complete transfer',
        position: 'top',
      });
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}

export function useReconcileAccount() {
  const $q = useQuasar();
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
      const response = await accountsService.reconcileAccount(id, data);
      if (response.success && response.data) {
        const idx = (accountsData.value ?? []).findIndex((a) => a.id === id);
        if (idx !== -1 && accountsData.value) {
          accountsData.value = [
            ...accountsData.value.slice(0, idx),
            response.data,
            ...accountsData.value.slice(idx + 1),
          ];
        }
        summaryFetched = false;
        $q.notify({
          type: 'positive',
          message: 'Account reconciled successfully',
          position: 'top',
        });
        return response.data;
      }
    } catch (err: any) {
      error.value = err;
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to reconcile account',
        position: 'top',
      });
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}
