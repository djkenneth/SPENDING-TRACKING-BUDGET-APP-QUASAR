// src/stores/analytics.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useTransactionsStore } from './transactions';
import { useAccountsStore } from './accounts';

export interface AnalyticsData {
  period: 'week' | 'month' | 'quarter' | 'year';
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
  topCategories: CategoryAnalysis[];
  accountGrowth: AccountGrowthData[];
  cashFlow: CashFlowData[];
  trends: TrendAnalysis[];
}

export interface CategoryAnalysis {
  category: string;
  amount: number;
  percentage: number;
  transactions: number;
  avgTransaction: number;
  color: string;
  icon: string;
}

export interface AccountGrowthData {
  date: Date;
  accountName: string;
  balance: number;
  change: number;
  changePercent: number;
}

export interface CashFlowData {
  date: Date;
  income: number;
  expenses: number;
  net: number;
  cumulativeNet: number;
}

export interface TrendAnalysis {
  category: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  previousPeriod: number;
  currentPeriod: number;
}

export interface ComparisonData {
  current: AnalyticsData;
  previous: AnalyticsData;
  growth: {
    income: number;
    expenses: number;
    savings: number;
    netWorth: number;
  };
}

export interface ForecastData {
  period: 'next_month' | 'next_quarter' | 'next_year';
  projectedIncome: number;
  projectedExpenses: number;
  projectedSavings: number;
  confidence: number;
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

export const useAnalyticsStore = defineStore('analytics', () => {
  // State
  const selectedPeriod = ref<'week' | 'month' | 'quarter' | 'year'>('month');
  const selectedStartDate = ref<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const selectedEndDate = ref<Date>(new Date());
  const isLoading = ref(false);

  // Get other stores
  const transactionsStore = useTransactionsStore();
  const accountsStore = useAccountsStore();

  // Computed analytics data
  const currentAnalytics = computed((): AnalyticsData => {
    const transactions = getTransactionsForPeriod(selectedStartDate.value, selectedEndDate.value);

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

    const topCategories = calculateTopCategories(transactions);
    const accountGrowth = calculateAccountGrowth();
    const cashFlow = calculateCashFlow();
    const trends = calculateTrends();

    return {
      period: selectedPeriod.value,
      startDate: selectedStartDate.value,
      endDate: selectedEndDate.value,
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate,
      topCategories,
      accountGrowth,
      cashFlow,
      trends,
    };
  });

  const previousPeriodAnalytics = computed(() => {
    const periodDiff = selectedEndDate.value.getTime() - selectedStartDate.value.getTime();
    const prevEndDate = new Date(selectedStartDate.value.getTime() - 1);
    const prevStartDate = new Date(prevEndDate.getTime() - periodDiff);

    const transactions = getTransactionsForPeriod(prevStartDate, prevEndDate);

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
    };
  });

  const comparisonData = computed((): ComparisonData => {
    const current = currentAnalytics.value;
    const previous = previousPeriodAnalytics.value;

    const growth = {
      income:
        previous.totalIncome > 0
          ? ((current.totalIncome - previous.totalIncome) / previous.totalIncome) * 100
          : 0,
      expenses:
        previous.totalExpenses > 0
          ? ((current.totalExpenses - previous.totalExpenses) / previous.totalExpenses) * 100
          : 0,
      savings:
        previous.netIncome > 0
          ? ((current.netIncome - previous.netIncome) / previous.netIncome) * 100
          : 0,
      netWorth: 0, // Would calculate from historical data
    };

    return {
      current,
      previous: {
        ...current,
        ...previous,
      },
      growth,
    };
  });

  const forecastData = computed((): ForecastData => {
    const transactions = transactionsStore.transactions;
    const recentTransactions = transactions.slice(-90); // Last 90 days

    const avgMonthlyIncome =
      recentTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) /
      3;

    const avgMonthlyExpenses =
      recentTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) /
      3;

    const projectedSavings = avgMonthlyIncome - avgMonthlyExpenses;

    return {
      period: 'next_month',
      projectedIncome: avgMonthlyIncome,
      projectedExpenses: avgMonthlyExpenses,
      projectedSavings,
      confidence: 75, // Placeholder confidence score
      scenarios: {
        optimistic: projectedSavings * 1.2,
        realistic: projectedSavings,
        pessimistic: projectedSavings * 0.8,
      },
    };
  });

  const netWorthHistory = computed(() => {
    // This would typically come from historical data
    // For now, generate sample data
    const history = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const baseAmount = accountsStore.totalAssets;
      const variation = (Math.random() - 0.5) * 0.1; // ±10% variation

      history.push({
        date,
        amount: baseAmount * (1 + variation),
      });
    }

    return history;
  });

  const spendingByCategory = computed(() => {
    const transactions = transactionsStore.transactions.filter((t) => t.type === 'expense');
    const categoryMap = new Map<
      string,
      { amount: number; count: number; color: string; icon: string }
    >();

    transactions.forEach((transaction) => {
      const category = transaction.category.name;
      const existing = categoryMap.get(category) || {
        amount: 0,
        count: 0,
        color: transaction.category.color,
        icon: transaction.category.icon,
      };

      existing.amount += transaction.amount;
      existing.count += 1;
      categoryMap.set(category, existing);
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        color: data.color,
        icon: data.icon,
        percentage: (data.amount / currentAnalytics.value.totalExpenses) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);
  });

  const monthlyTrends = computed(() => {
    const months = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthTransactions = getTransactionsForPeriod(monthStart, monthEnd);

      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      months.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income,
        expenses,
        net: income - expenses,
        date: monthStart,
      });
    }

    return months;
  });

  // Actions
  const setPeriod = (period: 'week' | 'month' | 'quarter' | 'year') => {
    selectedPeriod.value = period;
    updateDateRange(period);
  };

  const updateDateRange = (period: 'week' | 'month' | 'quarter' | 'year') => {
    const now = new Date();

    switch (period) {
      case 'week':
        selectedStartDate.value = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        selectedEndDate.value = now;
        break;
      case 'month':
        selectedStartDate.value = new Date(now.getFullYear(), now.getMonth(), 1);
        selectedEndDate.value = now;
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        selectedStartDate.value = new Date(now.getFullYear(), quarterStart, 1);
        selectedEndDate.value = now;
        break;
      case 'year':
        selectedStartDate.value = new Date(now.getFullYear(), 0, 1);
        selectedEndDate.value = now;
        break;
    }
  };

  const setCustomDateRange = (startDate: Date, endDate: Date) => {
    selectedStartDate.value = startDate;
    selectedEndDate.value = endDate;
  };

  const refreshAnalytics = async () => {
    isLoading.value = true;

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Force reactivity update
      selectedStartDate.value = new Date(selectedStartDate.value);
    } finally {
      isLoading.value = false;
    }
  };

  const exportAnalytics = (format: 'csv' | 'pdf' | 'json') => {
    const data = currentAnalytics.value;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      downloadFile(blob, `analytics-${Date.now()}.json`);
    } else if (format === 'csv') {
      const csv = convertToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadFile(blob, `analytics-${Date.now()}.csv`);
    }
  };

  // Helper functions
  const getTransactionsForPeriod = (startDate: Date, endDate: Date) => {
    return transactionsStore.transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const calculateTopCategories = (transactions: any[]): CategoryAnalysis[] => {
    const expenseTransactions = transactions.filter((t) => t.type === 'expense');
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = new Map<string, { amount: number; count: number; category: any }>();

    expenseTransactions.forEach((transaction) => {
      const categoryName = transaction.category.name;
      const existing = categoryMap.get(categoryName) || {
        amount: 0,
        count: 0,
        category: transaction.category,
      };

      existing.amount += transaction.amount;
      existing.count += 1;
      categoryMap.set(categoryName, existing);
    });

    return Array.from(categoryMap.entries())
      .map(([categoryName, data]) => ({
        category: categoryName,
        amount: data.amount,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
        transactions: data.count,
        avgTransaction: data.count > 0 ? data.amount / data.count : 0,
        color: data.category.color,
        icon: data.category.icon,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  };

  const calculateAccountGrowth = (): AccountGrowthData[] => {
    // This would typically use historical account data
    // For now, return sample data
    return accountsStore.accounts.map((account) => ({
      date: new Date(),
      accountName: account.name,
      balance: account.balance,
      change: Math.random() * 10000 - 5000, // Sample change
      changePercent: (Math.random() - 0.5) * 20, // Sample percentage
    }));
  };

  const calculateCashFlow = (): CashFlowData[] => {
    const data: CashFlowData[] = [];
    const now = new Date();
    let cumulativeNet = 0;

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayTransactions = getTransactionsForPeriod(dayStart, dayEnd);

      const income = dayTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = dayTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const net = income - expenses;
      cumulativeNet += net;

      data.push({
        date,
        income,
        expenses,
        net,
        cumulativeNet,
      });
    }

    return data;
  };

  const calculateTrends = (): TrendAnalysis[] => {
    // This would compare current period with previous period
    // For now, return sample data
    return currentAnalytics.value.topCategories.map((category) => ({
      category: category.category,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      changePercent: (Math.random() - 0.5) * 50,
      previousPeriod: category.amount * (1 + (Math.random() - 0.5) * 0.3),
      currentPeriod: category.amount,
    }));
  };

  const convertToCSV = (data: AnalyticsData): string => {
    const headers = ['Category', 'Amount', 'Percentage', 'Transactions'];
    const rows = data.topCategories.map((cat) => [
      cat.category,
      cat.amount,
      cat.percentage,
      cat.transactions,
    ]);

    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    // State
    selectedPeriod,
    selectedStartDate,
    selectedEndDate,
    isLoading,

    // Computed
    currentAnalytics,
    previousPeriodAnalytics,
    comparisonData,
    forecastData,
    netWorthHistory,
    spendingByCategory,
    monthlyTrends,

    // Actions
    setPeriod,
    updateDateRange,
    setCustomDateRange,
    refreshAnalytics,
    exportAnalytics,
  };
});
