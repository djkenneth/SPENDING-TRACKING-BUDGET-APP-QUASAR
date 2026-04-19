// src/composables/useDebts.ts
import { ref, readonly } from 'vue';
import { debtsService } from 'src/services/debts.service';
import { useQuasar } from 'quasar';
import type { Debt, CreateDebtDto, UpdateDebtDto, DebtSummary } from 'src/types/debt.types';

// ── Module-level singletons ────────────────────────────────────────────────────

const debtsData = ref<Debt[] | undefined>(undefined);
const debtsLoading = ref(false);
const debtsError = ref<Error | null>(null);
let debtsFetched = false;
let debtsInflight: Promise<void> | null = null;

const summaryData = ref<DebtSummary | undefined>(undefined);
const summaryLoading = ref(false);
const summaryError = ref<Error | null>(null);
let summaryFetched = false;
let summaryInflight: Promise<void> | null = null;

// ── Internal fetch functions ───────────────────────────────────────────────────

function fetchDebts(): Promise<void> {
  if (debtsFetched) return Promise.resolve();
  if (debtsInflight !== null) return debtsInflight;

  debtsInflight = (async () => {
    debtsLoading.value = true;
    debtsError.value = null;
    try {
      const response = await debtsService.getDebts();
      if (response.success) {
        debtsData.value = response.data;
        debtsFetched = true;
      }
    } catch (err: unknown) {
      debtsError.value = err as Error;
      console.error('[useDebts] getDebts:', err);
    } finally {
      debtsLoading.value = false;
      debtsInflight = null;
    }
  })();

  return debtsInflight;
}

function fetchSummary(): Promise<void> {
  if (summaryFetched) return Promise.resolve();
  if (summaryInflight !== null) return summaryInflight;

  summaryInflight = (async () => {
    summaryLoading.value = true;
    summaryError.value = null;
    try {
      const response = await debtsService.getDebtSummary();
      if (response.success) {
        summaryData.value = response.data;
        summaryFetched = true;
      }
    } catch (err: unknown) {
      summaryError.value = err as Error;
      console.error('[useDebts] getDebtSummary:', err);
    } finally {
      summaryLoading.value = false;
      summaryInflight = null;
    }
  })();

  return summaryInflight;
}

// ── initializeDebts — sequential fetch for DebtsPage ──────────────────────────

export async function initializeDebts() {
  await fetchDebts();
  await fetchSummary();
}

// ── useDebts ───────────────────────────────────────────────────────────────────

export function useDebts() {
  fetchDebts();

  return {
    data: readonly(debtsData),
    isLoading: readonly(debtsLoading),
    error: readonly(debtsError),
    refetch: async () => {
      debtsFetched = false;
      debtsInflight = null;
      await fetchDebts();
    },
  };
}

// ── useDebtsSummary ────────────────────────────────────────────────────────────

export function useDebtsSummary() {
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

// ── Mutations ──────────────────────────────────────────────────────────────────

export function useCreateDebt() {
  const $q = useQuasar();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate(data: CreateDebtDto) {
    isPending.value = true;
    error.value = null;
    try {
      const response = await debtsService.createDebt(data);
      if (response.success && response.data) {
        debtsData.value = [...(debtsData.value ?? []), response.data];
        summaryFetched = false;
        $q.notify({ type: 'positive', message: 'Debt added successfully', position: 'top' });
        return response.data;
      }
    } catch (err: any) {
      error.value = err;
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to add debt',
        position: 'top',
      });
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}

export function useUpdateDebt() {
  const $q = useQuasar();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate({ id, data }: { id: number; data: UpdateDebtDto }) {
    isPending.value = true;
    error.value = null;
    try {
      const response = await debtsService.updateDebt(id, data);
      if (response.success && response.data) {
        const idx = (debtsData.value ?? []).findIndex(d => d.id === id);
        if (idx !== -1 && debtsData.value) {
          debtsData.value = [
            ...debtsData.value.slice(0, idx),
            response.data,
            ...debtsData.value.slice(idx + 1),
          ];
        }
        summaryFetched = false;
        $q.notify({ type: 'positive', message: 'Debt updated successfully', position: 'top' });
        return response.data;
      }
    } catch (err: any) {
      error.value = err;
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to update debt',
        position: 'top',
      });
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}

export function useDeleteDebt() {
  const $q = useQuasar();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate(id: number) {
    isPending.value = true;
    error.value = null;
    try {
      const response = await debtsService.deleteDebt(id);
      if (response.success) {
        debtsData.value = (debtsData.value ?? []).filter(d => d.id !== id);
        summaryFetched = false;
        $q.notify({ type: 'positive', message: 'Debt deleted successfully', position: 'top' });
        return true;
      }
    } catch (err: any) {
      error.value = err;
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to delete debt',
        position: 'top',
      });
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}

export function useRecordDebtPayment() {
  const $q = useQuasar();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate({ id, data }: { id: number; data: { amount: number; date?: string; notes?: string } }) {
    isPending.value = true;
    error.value = null;
    try {
      const response = await debtsService.recordPayment(id, data);
      if (response.success) {
        // Re-fetch to get updated balance from server
        debtsFetched = false;
        summaryFetched = false;
        await initializeDebts();
        $q.notify({ type: 'positive', message: 'Payment recorded successfully', position: 'top' });
        return response.data;
      }
    } catch (err: any) {
      error.value = err;
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to record payment',
        position: 'top',
      });
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}

export function useMarkDebtPaidOff() {
  const $q = useQuasar();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate(id: number) {
    isPending.value = true;
    error.value = null;
    try {
      const response = await debtsService.markAsPaidOff(id);
      if (response.success && response.data) {
        const idx = (debtsData.value ?? []).findIndex(d => d.id === id);
        if (idx !== -1 && debtsData.value) {
          debtsData.value = [
            ...debtsData.value.slice(0, idx),
            response.data,
            ...debtsData.value.slice(idx + 1),
          ];
        }
        summaryFetched = false;
        $q.notify({ type: 'positive', message: 'Debt marked as paid off!', position: 'top' });
        return response.data;
      }
    } catch (err: any) {
      error.value = err;
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to mark debt as paid off',
        position: 'top',
      });
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}
