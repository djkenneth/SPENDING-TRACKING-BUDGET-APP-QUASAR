// src/composables/useDebts.ts
// Thin wrappers around useDebtsStore — all service calls live in the store.
import { ref, computed, readonly } from 'vue';
import { useDebtsStore } from 'src/stores/debts';
import type { CreateDebtDto, UpdateDebtDto } from 'src/types/debt.types';

export async function initializeDebts() {
  const store = useDebtsStore();
  await store.initializeDebts();
}

export function useDebts() {
  const store = useDebtsStore();
  store.fetchDebts();
  return {
    data: computed(() => store.debts),
    isLoading: computed(() => store.debtsLoading),
    error: computed(() => store.debtsError),
    refetch: () => store.refetchDebts(),
  };
}

export function useDebtsSummary() {
  const store = useDebtsStore();
  return {
    data: computed(() => store.summary),
    isLoading: computed(() => store.summaryLoading),
    error: ref<Error | null>(null),
    refetch: () => store.refetchSummary(),
  };
}

export function useCreateDebt() {
  const store = useDebtsStore();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate(data: CreateDebtDto) {
    isPending.value = true;
    error.value = null;
    try {
      return await store.createDebt(data);
    } catch (err: any) {
      error.value = err;
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}

export function useUpdateDebt() {
  const store = useDebtsStore();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate({ id, data }: { id: number; data: UpdateDebtDto }) {
    isPending.value = true;
    error.value = null;
    try {
      return await store.updateDebt(id, data);
    } catch (err: any) {
      error.value = err;
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}

export function useDeleteDebt() {
  const store = useDebtsStore();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate(id: number) {
    isPending.value = true;
    error.value = null;
    try {
      return await store.deleteDebt(id);
    } catch (err: any) {
      error.value = err;
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}

export function useRecordDebtPayment() {
  const store = useDebtsStore();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate({
    id,
    data,
  }: {
    id: number;
    data: { amount: number; date?: string; notes?: string };
  }) {
    isPending.value = true;
    error.value = null;
    try {
      return await store.recordPayment(id, data);
    } catch (err: any) {
      error.value = err;
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}

export function useMarkDebtPaidOff() {
  const store = useDebtsStore();
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  async function mutate(id: number) {
    isPending.value = true;
    error.value = null;
    try {
      return await store.markAsPaidOff(id);
    } catch (err: any) {
      error.value = err;
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return { mutate, mutateAsync: mutate, isPending: readonly(isPending), error: readonly(error) };
}
