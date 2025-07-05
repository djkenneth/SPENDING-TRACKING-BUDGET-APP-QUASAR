// src/composables/useTransactions.ts
import { computed, ref } from 'vue';
import { useTransactionsStore } from 'src/stores/transactions';
import { useAccountsStore } from 'src/stores/accounts';
import { useBudgetStore } from 'src/stores/budget';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency, formatDate } from 'src/utils';
import { validateTransaction } from 'src/utils/validators';
import { useQuasar } from 'quasar';

export const useTransactions = () => {
  const transactionsStore = useTransactionsStore();
  const accountsStore = useAccountsStore();
  const budgetStore = useBudgetStore();
  const settingsStore = useSettingsStore();
  const $q = useQuasar();

  // State for transaction operations
  const loading = ref(false);
  const selectedTransaction = ref(null);
  const showTransactionDialog = ref(false);
  const showFilterDialog = ref(false);
  const showSearchDialog = ref(false);

  const transactionForm = ref({
    description: '',
    amount: null,
    type: 'expense' as 'expense' | 'income',
    category: null,
    account: null,
    date: new Date().toISOString().split('T')[0],
    recurring: false,
  });

  const filters = ref({
    type: '',
    category: '',
    account: '',
    dateFrom: '',
    dateTo: '',
    amountMin: null,
    amountMax: null,
  });

  const searchQuery = ref('');

  // Computed properties
  const transactions = computed(() => transactionsStore.transactions);
  const recentTransactions = computed(() => transactionsStore.recentTransactions);
  const categories = computed(() => transactionsStore.categories);
  const accounts = computed(() => accountsStore.accounts);
  const totalIncome = computed(() => transactionsStore.totalIncome);
  const totalExpenses = computed(() => transactionsStore.totalExpenses);
  const monthlySpent = computed(() => transactionsStore.monthlySpent);
  const monthlyIncome = computed(() => transactionsStore.monthlyIncome);

  const transactionTypeOptions = computed(() => [
    { label: 'Expense', value: 'expense', icon: 'remove', color: 'negative' },
    { label: 'Income', value: 'income', icon: 'add', color: 'positive' },
  ]);

  const filteredTransactions = computed(() => {
    let filtered = transactions.value;

    // Apply search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        (transaction) =>
          transaction.description.toLowerCase().includes(query) ||
          transaction.category.name.toLowerCase().includes(query) ||
          transaction.account.toLowerCase().includes(query),
      );
    }

    // Apply filters
    if (filters.value.type) {
      filtered = filtered.filter((t) => t.type === filters.value.type);
    }

    if (filters.value.category) {
      filtered = filtered.filter((t) => t.category.name === filters.value.category);
    }

    if (filters.value.account) {
      filtered = filtered.filter((t) => t.account === filters.value.account);
    }

    if (filters.value.dateFrom) {
      filtered = filtered.filter((t) => new Date(t.date) >= new Date(filters.value.dateFrom));
    }

    if (filters.value.dateTo) {
      filtered = filtered.filter((t) => new Date(t.date) <= new Date(filters.value.dateTo));
    }

    if (filters.value.amountMin !== null) {
      filtered = filtered.filter((t) => t.amount >= filters.value.amountMin);
    }

    if (filters.value.amountMax !== null) {
      filtered = filtered.filter((t) => t.amount <= filters.value.amountMax);
    }

    return filtered;
  });

  const transactionStatistics = computed(() => {
    const stats = {
      totalTransactions: transactions.value.length,
      totalIncome: totalIncome.value,
      totalExpenses: totalExpenses.value,
      netIncome: totalIncome.value - totalExpenses.value,
      monthlyIncome: monthlyIncome.value,
      monthlySpent: monthlySpent.value,
      averageTransaction:
        transactions.value.length > 0
          ? (totalIncome.value + totalExpenses.value) / transactions.value.length
          : 0,
      savingsRate:
        totalIncome.value > 0
          ? ((totalIncome.value - totalExpenses.value) / totalIncome.value) * 100
          : 0,
    };

    return stats;
  });

  // Methods
  const formatTransactionAmount = (amount: number, type: string) => {
    if (!settingsStore.settings.showBalances) {
      return `${settingsStore.settings.currencySymbol}****`;
    }
    const formatted = formatCurrency(amount, settingsStore.settings.currency);
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  const formatTransactionDate = (date: Date) => {
    return formatDate(date, settingsStore.settings.dateFormat);
  };

  const openTransactionDialog = (transaction: any = null) => {
    if (transaction) {
      // Edit mode
      transactionForm.value = {
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        account: transaction.account,
        date: new Date(transaction.date).toISOString().split('T')[0],
        recurring: transaction.recurring,
      };
      selectedTransaction.value = transaction;
    } else {
      // Add mode
      resetTransactionForm();
      selectedTransaction.value = null;
    }
    showTransactionDialog.value = true;
  };

  const closeTransactionDialog = () => {
    showTransactionDialog.value = false;
    selectedTransaction.value = null;
    resetTransactionForm();
  };

  const resetTransactionForm = () => {
    transactionForm.value = {
      description: '',
      amount: null,
      type: 'expense',
      category: null,
      account: null,
      date: new Date().toISOString().split('T')[0],
      recurring: false,
    };
  };

  const validateTransactionForm = () => {
    return validateTransaction({
      description: transactionForm.value.description,
      amount: transactionForm.value.amount || 0,
      type: transactionForm.value.type,
      category: transactionForm.value.category?.name || '',
      account: transactionForm.value.account || '',
      date: transactionForm.value.date,
    });
  };

  const saveTransaction = async () => {
    loading.value = true;

    try {
      const validation = validateTransactionForm();
      if (!validation.isValid) {
        $q.notify({
          type: 'negative',
          message: validation.errors.join(', '),
          position: 'top',
        });
        return;
      }

      const transactionData = {
        description: transactionForm.value.description,
        amount: transactionForm.value.amount || 0,
        type: transactionForm.value.type,
        category: transactionForm.value.category,
        account: transactionForm.value.account,
        date: new Date(transactionForm.value.date),
        recurring: transactionForm.value.recurring,
      };

      if (selectedTransaction.value) {
        // Update existing transaction
        transactionsStore.updateTransaction(selectedTransaction.value.id, transactionData);
        $q.notify({
          type: 'positive',
          message: 'Transaction updated successfully',
          position: 'top',
        });
      } else {
        // Add new transaction
        transactionsStore.addTransaction(transactionData);

        // Update account balance
        if (transactionData.type === 'income') {
          accountsStore.updateBalance(transactionData.account, transactionData.amount, 'add');
        } else {
          accountsStore.updateBalance(transactionData.account, transactionData.amount, 'subtract');

          // Update budget spending
          if (transactionData.category) {
            budgetStore.updateBudgetSpent(transactionData.category.name, transactionData.amount);
          }
        }

        $q.notify({
          type: 'positive',
          message: 'Transaction added successfully',
          position: 'top',
        });
      }

      closeTransactionDialog();
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to save transaction',
        position: 'top',
      });
    } finally {
      loading.value = false;
    }
  };

  const deleteTransaction = async (transactionId: number) => {
    try {
      const success = transactionsStore.deleteTransaction(transactionId);
      if (success) {
        $q.notify({
          type: 'positive',
          message: 'Transaction deleted successfully',
          position: 'top',
        });
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to delete transaction',
        position: 'top',
      });
    }
  };

  const confirmDeleteTransaction = (transaction: any) => {
    $q.dialog({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete "${transaction.description}"?`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      deleteTransaction(transaction.id);
    });
  };

  const clearFilters = () => {
    filters.value = {
      type: '',
      category: '',
      account: '',
      dateFrom: '',
      dateTo: '',
      amountMin: null,
      amountMax: null,
    };
  };

  const clearSearch = () => {
    searchQuery.value = '';
  };

  const getTransactionsByCategory = (categoryName: string) => {
    return transactions.value.filter((transaction) => transaction.category.name === categoryName);
  };

  const getTransactionsByAccount = (accountName: string) => {
    return transactions.value.filter((transaction) => transaction.account === accountName);
  };

  const getTransactionsByDateRange = (startDate: Date, endDate: Date) => {
    return transactions.value.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const exportTransactions = () => {
    const csvData = filteredTransactions.value.map((transaction) => ({
      Date: formatTransactionDate(transaction.date),
      Description: transaction.description,
      Amount: transaction.amount,
      Type: transaction.type,
      Category: transaction.category.name,
      Account: transaction.account,
    }));

    // Convert to CSV format
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map((row) => headers.map((header) => row[header]).join(',')),
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    // State
    loading,
    selectedTransaction,
    showTransactionDialog,
    showFilterDialog,
    showSearchDialog,
    transactionForm,
    filters,
    searchQuery,

    // Computed
    transactions,
    recentTransactions,
    categories,
    accounts,
    totalIncome,
    totalExpenses,
    monthlySpent,
    monthlyIncome,
    transactionTypeOptions,
    filteredTransactions,
    transactionStatistics,

    // Methods
    formatTransactionAmount,
    formatTransactionDate,
    openTransactionDialog,
    closeTransactionDialog,
    resetTransactionForm,
    validateTransactionForm,
    saveTransaction,
    deleteTransaction,
    confirmDeleteTransaction,
    clearFilters,
    clearSearch,
    getTransactionsByCategory,
    getTransactionsByAccount,
    getTransactionsByDateRange,
    exportTransactions,
  };
};
