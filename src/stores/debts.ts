// src/stores/debts.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { debtsService } from 'src/services/debts.service';
import type { Debt, CreateDebtDto, UpdateDebtDto, DebtSummary } from 'src/types/debt.types';

export const useDebtsStore = defineStore('debts', () => {
  const $q = useQuasar();

  // State
  const debts = ref<Debt[] | undefined>(undefined);
  const summary = ref<DebtSummary | undefined>(undefined);
  const debtsLoading = ref(false);
  const summaryLoading = ref(false);
  const debtsError = ref<Error | null>(null);

  // Inflight guards
  let debtsFetched = false;
  let debtsInflight: Promise<void> | null = null;
  let summaryFetched = false;
  let summaryInflight: Promise<void> | null = null;

  // ── Fetch actions ──────────────────────────────────────────────────────────────

  function fetchDebts(): Promise<void> {
    if (debtsFetched) return Promise.resolve();
    if (debtsInflight) return debtsInflight;

    debtsInflight = (async () => {
      debtsLoading.value = true;
      debtsError.value = null;
      try {
        const response = await debtsService.getDebts();
        if (response.success) {
          debts.value = response.data;
          debtsFetched = true;
        }
      } catch (err: unknown) {
        debtsError.value = err as Error;
        console.error('[debtsStore] getDebts:', err);
      } finally {
        debtsLoading.value = false;
        debtsInflight = null;
      }
    })();
    return debtsInflight;
  }

  function fetchSummary(): Promise<void> {
    if (summaryFetched) return Promise.resolve();
    if (summaryInflight) return summaryInflight;

    summaryInflight = (async () => {
      summaryLoading.value = true;
      try {
        const response = await debtsService.getDebtSummary();
        if (response.success) {
          summary.value = response.data;
          summaryFetched = true;
        }
      } catch (err: unknown) {
        console.error('[debtsStore] getDebtSummary:', err);
      } finally {
        summaryLoading.value = false;
        summaryInflight = null;
      }
    })();
    return summaryInflight;
  }

  async function initializeDebts() {
    await fetchDebts();
    await fetchSummary();
  }

  async function refetchDebts() {
    debtsFetched = false;
    debtsInflight = null;
    await fetchDebts();
  }

  async function refetchSummary() {
    summaryFetched = false;
    summaryInflight = null;
    await fetchSummary();
  }

  // ── Mutation actions ───────────────────────────────────────────────────────────

  async function createDebt(data: CreateDebtDto): Promise<Debt | undefined> {
    try {
      const response = await debtsService.createDebt(data);
      if (response.success && response.data) {
        debts.value = [...(debts.value ?? []), response.data];
        summaryFetched = false;
        $q.notify({ type: 'positive', message: 'Debt added successfully', position: 'top' });
        return response.data;
      }
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to add debt',
        position: 'top',
      });
      throw err;
    }
  }

  async function updateDebt(id: number, data: UpdateDebtDto): Promise<Debt | undefined> {
    try {
      const response = await debtsService.updateDebt(id, data);
      if (response.success && response.data) {
        const idx = (debts.value ?? []).findIndex((d) => d.id === id);
        if (idx !== -1 && debts.value) {
          debts.value = [
            ...debts.value.slice(0, idx),
            response.data,
            ...debts.value.slice(idx + 1),
          ];
        }
        summaryFetched = false;
        $q.notify({ type: 'positive', message: 'Debt updated successfully', position: 'top' });
        return response.data;
      }
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to update debt',
        position: 'top',
      });
      throw err;
    }
  }

  async function deleteDebt(id: number): Promise<boolean> {
    try {
      const response = await debtsService.deleteDebt(id);
      if (response.success) {
        debts.value = (debts.value ?? []).filter((d) => d.id !== id);
        summaryFetched = false;
        $q.notify({ type: 'positive', message: 'Debt deleted successfully', position: 'top' });
        return true;
      }
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to delete debt',
        position: 'top',
      });
      throw err;
    }
    return false;
  }

  async function recordPayment(
    id: number,
    data: { amount: number; date?: string; notes?: string },
  ) {
    try {
      const response = await debtsService.recordPayment(id, data);
      if (response.success) {
        debtsFetched = false;
        summaryFetched = false;
        await initializeDebts();
        $q.notify({ type: 'positive', message: 'Payment recorded successfully', position: 'top' });
        return response.data;
      }
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to record payment',
        position: 'top',
      });
      throw err;
    }
  }

  async function markAsPaidOff(id: number): Promise<Debt | undefined> {
    try {
      const response = await debtsService.markAsPaidOff(id);
      if (response.success && response.data) {
        const idx = (debts.value ?? []).findIndex((d) => d.id === id);
        if (idx !== -1 && debts.value) {
          debts.value = [
            ...debts.value.slice(0, idx),
            response.data,
            ...debts.value.slice(idx + 1),
          ];
        }
        summaryFetched = false;
        $q.notify({ type: 'positive', message: 'Debt marked as paid off!', position: 'top' });
        return response.data;
      }
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to mark debt as paid off',
        position: 'top',
      });
      throw err;
    }
  }

  return {
    // State
    debts,
    summary,
    debtsLoading,
    summaryLoading,
    debtsError,
    // Actions
    fetchDebts,
    fetchSummary,
    initializeDebts,
    refetchDebts,
    refetchSummary,
    createDebt,
    updateDebt,
    deleteDebt,
    recordPayment,
    markAsPaidOff,
  };
});
