<!-- src/pages/HomePage.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from 'src/stores/settings';
import { useBudgetsStore } from 'src/stores/budget';
import { formatCurrency } from 'src/utilities/currency';
import { format } from 'date-fns';
import { transactionsService } from 'src/services/transactions.service';
import { accountsService } from 'src/services/accounts.service';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import {
  TrendingDown,
  Wallet,
  Loader2,
  PieChart,
  Receipt,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Coffee,
  Film,
  Heart,
  Zap,
  Tag,
  type LucideIcon,
} from 'lucide-vue-next';

const router = useRouter();
const settingsStore = useSettingsStore();
const budgetsStore = useBudgetsStore();

// Local state
const loading = ref(false);
const budgetLoading = ref(false);
const recentTransactions = ref<any[]>([]);
const accountsSummary = ref<any>(null);
const monthlyStats = ref<any>(null);

// ============================================================================
// Computed Properties
// ============================================================================

const totalAssets = computed(() => accountsSummary.value?.total_balance || 0);

const formattedTotalAssets = computed(() => {
  return settingsStore.settings.showBalances
    ? formatCurrency(totalAssets.value, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
});

const formattedNetWorth = computed(() => {
  return settingsStore.settings.showBalances
    ? formatCurrency(totalAssets.value, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
});

const formattedTotalLiabilities = computed(() => {
  return settingsStore.settings.showBalances
    ? formatCurrency(0, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
});

const monthlySpent = computed(() => {
  return monthlyStats.value?.total_expenses || 0;
});

const formattedMonthlySpent = computed(() => {
  return settingsStore.settings.showBalances
    ? formatCurrency(monthlySpent.value, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
});

const budgetLeft = computed(() => {
  return budgetsStore.monthlyBudget?.remaining || 0;
});

const formattedBudgetLeft = computed(() => {
  return settingsStore.settings.showBalances
    ? formatCurrency(budgetLeft.value, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
});

// Budget categories from store
const budgetCategories = computed(() => {
  return budgetsStore.categoryBreakdown.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    limit: cat.budget_amount,
    spent: cat.spent_amount,
  }));
});

// ============================================================================
// Methods
// ============================================================================

const formatDate = (date: string) => {
  return format(new Date(date), 'MMM d, yyyy');
};

const formatTransactionAmount = (amount: number, type: string) => {
  const prefix = type === 'income' ? '+' : '-';
  if (!settingsStore.settings.showBalances) {
    return `${prefix}${settingsStore.settings.currencySymbol}****`;
  }
  return `${prefix}${formatCurrency(amount, settingsStore.settings.currency)}`;
};

const formatBudgetSpent = (spent: number) => {
  if (!settingsStore.settings.showBalances) {
    return `${settingsStore.settings.currencySymbol}****`;
  }
  return formatCurrency(spent, settingsStore.settings.currency);
};

const formatBudgetLimit = (limit: number) => {
  if (!settingsStore.settings.showBalances) {
    return `${settingsStore.settings.currencySymbol}****`;
  }
  return formatCurrency(limit, settingsStore.settings.currency);
};

const calculateProgress = (spent: number, limit: number) => {
  if (limit === 0) return 0;
  return Math.min(spent / limit, 1);
};

const getProgressColorClass = (spent: number, limit: number) => {
  const progress = calculateProgress(spent, limit);
  if (progress >= 1) return 'bg-red-500';
  if (progress >= 0.8) return 'bg-yellow-500';
  return 'bg-green-500';
};

// Icon mapping for transactions and categories
const iconMap: Record<string, any> = {
  receipt: Receipt,
  shopping_cart: ShoppingCart,
  home: Home,
  car: Car,
  restaurant: Utensils,
  utensils: Utensils,
  coffee: Coffee,
  movie: Film,
  film: Film,
  favorite: Heart,
  heart: Heart,
  bolt: Zap,
  zap: Zap,
  tag: Tag,
  wallet: Wallet,
  trending_down: TrendingDown,
};

const getTransactionIcon = (iconName?: string) => {
  if (!iconName) return Receipt;
  // Handle both snake_case and kebab-case
  const normalizedName = iconName.toLowerCase().replace(/-/g, '_');
  return iconMap[normalizedName] || Receipt;
};

const getCategoryIcon = (iconName?: string) => {
  if (!iconName) return Tag;
  const normalizedName = iconName.toLowerCase().replace(/-/g, '_');
  return iconMap[normalizedName] || Tag;
};

const getBudgetColor = (color?: string) => {
  if (!color) return 'text-gray-500';
  // Map Quasar color names to Tailwind classes
  const colorMap: Record<string, string> = {
    primary: 'text-blue-500',
    secondary: 'text-purple-500',
    positive: 'text-green-500',
    negative: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-400',
    accent: 'text-pink-500',
  };
  return colorMap[color] || `text-${color}-500`;
};

// ============================================================================
// Data Fetching
// ============================================================================

const fetchRecentTransactions = async () => {
  try {
    const response = await transactionsService.getTransactions({
      per_page: 5,
      sort_by: 'date',
      sort_direction: 'desc',
    });
    if (response.success && response.data) {
      recentTransactions.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch recent transactions:', error);
  }
};

const fetchAccountsSummary = async () => {
  try {
    const response = await accountsService.getAccountsSummary();
    if (response.success && response.data) {
      accountsSummary.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch accounts summary:', error);
  }
};

const fetchMonthlyStats = async () => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const response = await transactionsService.getTransactionStatistics({
      start_date: startOfMonth.toISOString().split('T')[0],
      end_date: endOfMonth.toISOString().split('T')[0],
    });
    if (response.success && response.data) {
      monthlyStats.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch monthly stats:', error);
  }
};

const fetchBudgetData = async () => {
  budgetLoading.value = true;
  try {
    await budgetsStore.initializeBudgetData();
  } catch (error) {
    console.error('Failed to fetch budget data:', error);
  } finally {
    budgetLoading.value = false;
  }
};

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      fetchRecentTransactions(),
      fetchAccountsSummary(),
      fetchMonthlyStats(),
      fetchBudgetData(),
    ]);
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="p-4 space-y-4">
    <!-- Net Worth Card -->
    <Card class="bg-gradient-to-br from-purple-600 to-purple-800 text-white border-0">
      <CardContent class="p-6">
        <div class="text-xs uppercase tracking-wide opacity-80 mb-2">Net Worth</div>
        <div class="text-4xl font-bold mb-4">{{ formattedNetWorth }}</div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs opacity-80 mb-1">Total Assets</div>
            <div class="text-lg font-medium">{{ formattedTotalAssets }}</div>
          </div>
          <div>
            <div class="text-xs opacity-80 mb-1">Total Liabilities</div>
            <div class="text-lg font-medium">{{ formattedTotalLiabilities }}</div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 gap-4">
      <Card>
        <CardContent class="p-6 text-center flex flex-col items-center justify-center min-h-[120px]">
          <TrendingDown class="w-8 h-8 text-red-500 mb-2" />
          <div class="text-xs text-muted-foreground mb-1">Monthly Spent</div>
          <div class="text-xl font-bold">{{ formattedMonthlySpent }}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6 text-center flex flex-col items-center justify-center min-h-[120px]">
          <Wallet class="w-8 h-8 text-green-500 mb-2" />
          <div class="text-xs text-muted-foreground mb-1">Budget Left</div>
          <div class="text-xl font-bold">{{ formattedBudgetLeft }}</div>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Transactions -->
    <Card>
      <CardHeader class="pb-3">
        <div class="flex items-center justify-between">
          <CardTitle class="text-xl">Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm" @click="router.push('/transactions')">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent class="pt-0">
        <div v-if="loading" class="flex justify-center py-8">
          <Loader2 class="w-10 h-10 text-primary animate-spin" />
        </div>

        <div v-else-if="recentTransactions.length === 0" class="text-center text-muted-foreground py-8">
          No recent transactions
        </div>

        <div v-else class="space-y-2">
          <div v-for="transaction in recentTransactions" :key="transaction.id"
            class="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            @click="router.push(`/transactions?id=${transaction.id}`)">
            <div :class="[
              'flex items-center justify-center w-10 h-10 rounded-full',
              transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
            ]">
              <component :is="getTransactionIcon(transaction.category?.icon)" class="w-5 h-5 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium truncate">{{ transaction.description }}</div>
              <div class="text-sm text-muted-foreground">
                {{ transaction.category?.name || 'Uncategorized' }} •
                {{ formatDate(transaction.date) }}
              </div>
            </div>
            <div :class="[
              'font-bold text-right',
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            ]">
              {{ formatTransactionAmount(transaction.amount, transaction.type) }}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Budget Overview -->
    <Card>
      <CardHeader class="pb-3">
        <div class="flex items-center justify-between">
          <CardTitle class="text-xl">Budget Overview</CardTitle>
          <Button variant="ghost" size="sm" @click="router.push('/budget')">
            Manage
          </Button>
        </div>
      </CardHeader>
      <CardContent class="pt-0">
        <div v-if="budgetLoading" class="flex justify-center py-8">
          <Loader2 class="w-10 h-10 text-primary animate-spin" />
        </div>

        <div v-else-if="budgetCategories.length === 0" class="text-center py-8 space-y-3">
          <PieChart class="w-12 h-12 mx-auto text-muted-foreground" />
          <div class="text-muted-foreground">No budget categories set up</div>
          <Button variant="ghost" @click="router.push('/budget')">
            Set Up Budget
          </Button>
        </div>

        <div v-else class="space-y-4">
          <div v-for="budget in budgetCategories.slice(0, 5)" :key="budget.id">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <component :is="getCategoryIcon(budget.icon)" :class="['w-5 h-5', getBudgetColor(budget.color)]" />
                <span class="font-medium text-sm">{{ budget.name }}</span>
              </div>
              <span class="text-xs text-muted-foreground">
                {{ formatBudgetSpent(budget.spent) }} /
                {{ formatBudgetLimit(budget.limit) }}
              </span>
            </div>
            <div class="h-2 bg-muted rounded-full overflow-hidden">
              <div :class="[
                'h-full rounded-full transition-all',
                getProgressColorClass(budget.spent, budget.limit)
              ]" :style="{ width: `${Math.min(calculateProgress(budget.spent, budget.limit) * 100, 100)}%` }" />
            </div>
          </div>

          <div v-if="budgetCategories.length > 5" class="text-center pt-2">
            <Button variant="ghost" @click="router.push('/budget')">
              View all {{ budgetCategories.length }} categories
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
/* All styles are now handled by Tailwind CSS classes */
</style>
