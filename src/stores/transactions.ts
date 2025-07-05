// src/stores/transactions.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category: Category;
  account: string;
  date: Date;
  recurring: boolean;
}

export const useTransactionsStore = defineStore('transactions', () => {
  // State
  const transactions = ref<Transaction[]>([
    {
      id: 1,
      description: 'Grocery Shopping',
      amount: 2450.75,
      type: 'expense',
      category: { id: 1, name: 'Food & Dining', icon: 'restaurant', color: 'orange' },
      account: 'GCash',
      date: new Date('2025-06-27'),
      recurring: false,
    },
    {
      id: 2,
      description: 'Salary',
      amount: 50000.0,
      type: 'income',
      category: { id: 8, name: 'Salary', icon: 'work', color: 'green' },
      account: 'Metrobank: ACDC',
      date: new Date('2025-06-25'),
      recurring: true,
    },
    {
      id: 3,
      description: 'Netflix Subscription',
      amount: 549.0,
      type: 'expense',
      category: { id: 3, name: 'Entertainment', icon: 'movie', color: 'red' },
      account: 'GCash',
      date: new Date('2025-06-26'),
      recurring: true,
    },
    {
      id: 4,
      description: 'Gas Station',
      amount: 1850.0,
      type: 'expense',
      category: { id: 2, name: 'Transportation', icon: 'local_gas_station', color: 'blue' },
      account: 'My Wallet',
      date: new Date('2025-06-25'),
      recurring: false,
    },
    {
      id: 5,
      description: 'Coffee Shop',
      amount: 285.5,
      type: 'expense',
      category: { id: 1, name: 'Food & Dining', icon: 'local_cafe', color: 'orange' },
      account: 'GCash',
      date: new Date('2025-06-24'),
      recurring: false,
    },
  ]);

  const categories = ref<Category[]>([
    { id: 1, name: 'Food & Dining', icon: 'restaurant', color: 'orange' },
    { id: 2, name: 'Transportation', icon: 'directions_car', color: 'blue' },
    { id: 3, name: 'Entertainment', icon: 'movie', color: 'red' },
    { id: 4, name: 'Shopping', icon: 'shopping_cart', color: 'purple' },
    { id: 5, name: 'Bills & Utilities', icon: 'receipt', color: 'green' },
    { id: 6, name: 'Health & Medical', icon: 'local_hospital', color: 'teal' },
    { id: 7, name: 'Education', icon: 'school', color: 'indigo' },
    { id: 8, name: 'Salary', icon: 'work', color: 'green' },
    { id: 9, name: 'Investment', icon: 'trending_up', color: 'blue' },
  ]);

  // Getters
  const recentTransactions = computed(() => {
    return transactions.value
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  });

  const totalIncome = computed(() => {
    return transactions.value
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  });

  const totalExpenses = computed(() => {
    return transactions.value
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  });

  const monthlyTransactions = computed(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return transactions.value.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startOfMonth && transactionDate <= endOfMonth;
    });
  });

  const monthlySpent = computed(() => {
    return monthlyTransactions.value
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  });

  const monthlyIncome = computed(() => {
    return monthlyTransactions.value
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  });

  const expensesByCategory = computed(() => {
    const expenses = transactions.value.filter((t) => t.type === 'expense');
    const categoryTotals = expenses.reduce(
      (acc, transaction) => {
        const categoryName = transaction.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = {
            category: transaction.category,
            total: 0,
            count: 0,
          };
        }
        acc[categoryName].total += transaction.amount;
        acc[categoryName].count += 1;
        return acc;
      },
      {} as Record<string, { category: Category; total: number; count: number }>,
    );

    return Object.values(categoryTotals);
  });

  const getCategoryById = computed(() => {
    return (id: number) => categories.value.find((category) => category.id === id);
  });

  // Actions
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now(),
    };
    transactions.value.unshift(newTransaction);
    return newTransaction;
  };

  const updateTransaction = (id: number, updates: Partial<Transaction>) => {
    const index = transactions.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      transactions.value[index] = { ...transactions.value[index], ...updates };
      return transactions.value[index];
    }
    return null;
  };

  const deleteTransaction = (id: number) => {
    const index = transactions.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      transactions.value.splice(index, 1);
      return true;
    }
    return false;
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now(),
    };
    categories.value.push(newCategory);
    return newCategory;
  };

  const filterTransactions = (filters: {
    type?: 'expense' | 'income';
    category?: string;
    account?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) => {
    return transactions.value.filter((transaction) => {
      if (filters.type && transaction.type !== filters.type) return false;
      if (filters.category && transaction.category.name !== filters.category) return false;
      if (filters.account && transaction.account !== filters.account) return false;
      if (filters.dateFrom && new Date(transaction.date) < filters.dateFrom) return false;
      if (filters.dateTo && new Date(transaction.date) > filters.dateTo) return false;
      return true;
    });
  };

  return {
    // State
    transactions,
    categories,
    // Getters
    recentTransactions,
    totalIncome,
    totalExpenses,
    monthlyTransactions,
    monthlySpent,
    monthlyIncome,
    expensesByCategory,
    getCategoryById,
    // Actions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    filterTransactions,
  };
});
