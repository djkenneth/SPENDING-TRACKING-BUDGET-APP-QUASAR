// src/stores/transactions.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { transactionsService } from 'src/services/transactions.service';
import {
  BulkTransactionDto,
  CreateFavoriteTransactionDto,
  CreateTransactionDto,
  FavoriteTransaction,
  Transaction,
  TransactionFilters,
  UpdateTransactionDto,
} from 'src/types/transaction.types';

export interface TransactionsMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export const useTransactionsStore = defineStore('transactions', () => {
  // ============================================
  // State
  // ============================================
  const transactions = ref<Transaction[]>([]);
  const meta = ref<TransactionsMeta | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedTransaction = ref<Transaction | null>(null);

  // Favorites state
  const favorites = ref<FavoriteTransaction[]>([]);
  const favoritesLoading = ref(false);

  // Current filters state
  const currentFilters = ref<TransactionFilters>({
    page: 1,
    per_page: 15,
    sort_by: 'date',
    sort_direction: 'desc',
  });

  // ============================================
  // Getters (Computed)
  // ============================================
  const incomeTransactions = computed(() => transactions.value.filter((t) => t.type === 'income'));

  const expenseTransactions = computed(() =>
    transactions.value.filter((t) => t.type === 'expense'),
  );

  const transferTransactions = computed(() =>
    transactions.value.filter((t) => t.type === 'transfer'),
  );

  const recurringTransactions = computed(() => transactions.value.filter((t) => t.is_recurring));

  const clearedTransactions = computed(() => transactions.value.filter((t) => t.is_cleared));

  const unclearedTransactions = computed(() => transactions.value.filter((t) => !t.is_cleared));

  const totalIncome = computed(() =>
    incomeTransactions.value.reduce((sum, t) => sum + t.amount, 0),
  );

  const totalExpenses = computed(() =>
    expenseTransactions.value.reduce((sum, t) => sum + t.amount, 0),
  );

  const netAmount = computed(() => totalIncome.value - totalExpenses.value);

  const transactionCount = computed(() => transactions.value.length);

  const hasMore = computed(() => {
    if (!meta.value) return false;
    return meta.value.current_page < meta.value.last_page;
  });

  const isEmpty = computed(() => transactions.value.length === 0 && !loading.value);

  // ============================================
  // Actions
  // ============================================

  /**
   * Fetch transactions with optional filters
   */
  const fetchTransactions = async (filters?: TransactionFilters) => {
    loading.value = true;
    error.value = null;

    try {
      // Merge with current filters
      const queryFilters = { ...currentFilters.value, ...filters };
      currentFilters.value = queryFilters;

      const response = await transactionsService.getTransactions(queryFilters);

      transactions.value = response.data;
      meta.value = response.meta;

      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch transactions';
      console.error('Error fetching transactions:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load more transactions (pagination)
   */
  const loadMore = async () => {
    if (!hasMore.value || loading.value) return;

    loading.value = true;
    error.value = null;

    try {
      const nextPage = (meta.value?.current_page || 0) + 1;
      const response = await transactionsService.getTransactions({
        ...currentFilters.value,
        page: nextPage,
      });

      // Append to existing transactions
      transactions.value = [...transactions.value, ...response.data];
      meta.value = response.meta;
      currentFilters.value.page = nextPage;

      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load more transactions';
      console.error('Error loading more transactions:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch a single transaction by ID
   */
  const fetchTransaction = async (transactionId: number) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await transactionsService.getTransaction(transactionId);
      selectedTransaction.value = response.data;

      // Update transaction in the list if it exists
      const index = transactions.value.findIndex((t) => t.id === transactionId);
      if (index !== -1) {
        transactions.value[index] = response.data;
      }

      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch transaction';
      console.error('Error fetching transaction:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Create a new transaction
   */
  const createTransaction = async (transactionData: CreateTransactionDto) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await transactionsService.createTransaction(transactionData);

      // Add to the beginning of the list (most recent first)
      transactions.value.unshift(response.data);

      // Update meta count
      if (meta.value) {
        meta.value.total += 1;
      }

      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create transaction';
      console.error('Error creating transaction:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update an existing transaction
   */
  const updateTransaction = async (
    transactionId: number,
    transactionData: UpdateTransactionDto,
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await transactionsService.updateTransaction(transactionId, transactionData);

      // Update transaction in the list
      const index = transactions.value.findIndex((t) => t.id === transactionId);
      if (index !== -1) {
        transactions.value[index] = response.data;
      }

      // Update selected transaction if it's the one being updated
      if (selectedTransaction.value?.id === transactionId) {
        selectedTransaction.value = response.data;
      }

      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update transaction';
      console.error('Error updating transaction:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete a transaction
   */
  const deleteTransaction = async (transactionId: number) => {
    loading.value = true;
    error.value = null;

    try {
      await transactionsService.deleteTransaction(transactionId);

      // Remove transaction from the list
      transactions.value = transactions.value.filter((t) => t.id !== transactionId);

      // Clear selected transaction if it's the one being deleted
      if (selectedTransaction.value?.id === transactionId) {
        selectedTransaction.value = null;
      }

      // Update meta count
      if (meta.value) {
        meta.value.total -= 1;
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete transaction';
      console.error('Error deleting transaction:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Bulk create transactions
   */
  const bulkCreateTransactions = async (data: BulkTransactionDto) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await transactionsService.bulkCreateTransactions(data);

      // Add all new transactions to the beginning of the list
      transactions.value = [...response.data, ...transactions.value];

      // Update meta count
      if (meta.value) {
        meta.value.total += response.data.length;
      }

      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to bulk create transactions';
      console.error('Error bulk creating transactions:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Bulk delete transactions
   */
  const bulkDeleteTransactions = async (ids: number[]) => {
    loading.value = true;
    error.value = null;

    try {
      await transactionsService.bulkDeleteTransactions(ids);

      // Remove all deleted transactions from the list
      transactions.value = transactions.value.filter((t) => !ids.includes(t.id));

      // Clear selected transaction if it's one of the deleted ones
      if (selectedTransaction.value && ids.includes(selectedTransaction.value.id)) {
        selectedTransaction.value = null;
      }

      // Update meta count
      if (meta.value) {
        meta.value.total -= ids.length;
      }

      return ids.length;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to bulk delete transactions';
      console.error('Error bulk deleting transactions:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Search transactions
   */
  const searchTransactions = async (query: string, filters?: TransactionFilters) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await transactionsService.searchTransactions(query, filters);

      transactions.value = response.data;
      meta.value = response.meta;

      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to search transactions';
      console.error('Error searching transactions:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get recent transactions
   */
  const fetchRecentTransactions = async (limit: number = 10) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await transactionsService.getRecentTransactions(limit);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch recent transactions';
      console.error('Error fetching recent transactions:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Upload receipt for a transaction
   */
  const uploadReceipt = async (transactionId: number, file: File) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await transactionsService.uploadReceipt(transactionId, file);

      // Update transaction in the list
      const index = transactions.value.findIndex((t) => t.id === transactionId);
      if (index !== -1) {
        transactions.value[index] = response.data;
      }

      // Update selected transaction if it's the one being updated
      if (selectedTransaction.value?.id === transactionId) {
        selectedTransaction.value = response.data;
      }

      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to upload receipt';
      console.error('Error uploading receipt:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Set filters and refetch
   */
  const setFilters = async (filters: TransactionFilters) => {
    currentFilters.value = { ...currentFilters.value, ...filters, page: 1 };
    return fetchTransactions(currentFilters.value);
  };

  /**
   * Clear all filters and refetch
   */
  const clearFilters = async () => {
    currentFilters.value = {
      page: 1,
      per_page: 15,
      sort_by: 'date',
      sort_direction: 'desc',
    };
    return fetchTransactions(currentFilters.value);
  };

  /**
   * Get transaction by ID from local state
   */
  const getTransactionById = (transactionId: number) => {
    return transactions.value.find((t) => t.id === transactionId) || null;
  };

  /**
   * Set selected transaction
   */
  const setSelectedTransaction = (transaction: Transaction | null) => {
    selectedTransaction.value = transaction;
  };

  /**
   * Fetch all saved favorite templates
   */
  const fetchFavorites = async () => {
    favoritesLoading.value = true;
    try {
      const response = await transactionsService.getFavorites();
      favorites.value = response.data;
    } catch (err: any) {
      console.error('Error fetching favorites:', err);
    } finally {
      favoritesLoading.value = false;
    }
  };

  /**
   * Save a transaction form state as a favorite template
   */
  const saveFavorite = async (data: CreateFavoriteTransactionDto) => {
    try {
      const response = await transactionsService.saveFavorite(data);
      favorites.value.push(response.data);
      return response.data;
    } catch (err: any) {
      console.error('Error saving favorite:', err);
      throw err;
    }
  };

  /**
   * Delete a favorite template
   */
  const deleteFavorite = async (id: number) => {
    try {
      await transactionsService.deleteFavorite(id);
      favorites.value = favorites.value.filter((f) => f.id !== id);
    } catch (err: any) {
      console.error('Error deleting favorite:', err);
      throw err;
    }
  };

  /**
   * Reset store to initial state
   */
  const resetStore = () => {
    transactions.value = [];
    meta.value = null;
    loading.value = false;
    error.value = null;
    selectedTransaction.value = null;
    currentFilters.value = {
      page: 1,
      per_page: 15,
      sort_by: 'date',
      sort_direction: 'desc',
    };
  };

  // ============================================
  // Return
  // ============================================
  return {
    // State
    transactions,
    meta,
    loading,
    error,
    selectedTransaction,
    currentFilters,
    favorites,
    favoritesLoading,

    // Getters
    incomeTransactions,
    expenseTransactions,
    transferTransactions,
    recurringTransactions,
    clearedTransactions,
    unclearedTransactions,
    totalIncome,
    totalExpenses,
    netAmount,
    transactionCount,
    hasMore,
    isEmpty,

    // Actions
    fetchFavorites,
    saveFavorite,
    deleteFavorite,
    fetchTransactions,
    loadMore,
    fetchTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    bulkCreateTransactions,
    bulkDeleteTransactions,
    searchTransactions,
    fetchRecentTransactions,
    uploadReceipt,
    setFilters,
    clearFilters,
    getTransactionById,
    setSelectedTransaction,
    resetStore,
  };
});
