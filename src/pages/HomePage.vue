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
  TrendingDown, Wallet, Loader2, PieChart,
  Receipt, ShoppingCart, Home, Car, Utensils, Coffee,
  Film, Heart, Zap, Tag, ArrowUpRight, ArrowDownLeft,
} from 'lucide-vue-next';

const router = useRouter();
const settingsStore = useSettingsStore();
const budgetsStore = useBudgetsStore();

const loading = ref(false);
const budgetLoading = ref(false);
const recentTransactions = ref<any[]>([]);
const accountsSummary = ref<any>(null);
const monthlyStats = ref<any>(null);

// ── Computed ──────────────────────────────────────────────────────────────────

const totalAssets = computed(() => accountsSummary.value?.total_balance || 0);

const formattedNetWorth = computed(() =>
  settingsStore.settings.showBalances
    ? formatCurrency(totalAssets.value, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`,
);

const formattedTotalAssets = computed(() =>
  settingsStore.settings.showBalances
    ? formatCurrency(totalAssets.value, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`,
);

const formattedTotalLiabilities = computed(() =>
  settingsStore.settings.showBalances
    ? formatCurrency(0, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`,
);

const monthlyIncome = computed(() => monthlyStats.value?.total_income || 0);
const monthlySpent = computed(() => monthlyStats.value?.total_expenses || 0);

const formattedMonthlyIncome = computed(() =>
  settingsStore.settings.showBalances
    ? formatCurrency(monthlyIncome.value, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`,
);

const formattedMonthlySpent = computed(() =>
  settingsStore.settings.showBalances
    ? formatCurrency(monthlySpent.value, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`,
);

const formattedBudgetLeft = computed(() => {
  const remaining = budgetsStore.monthlyBudget?.remaining || 0;
  return settingsStore.settings.showBalances
    ? formatCurrency(remaining, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
});

const budgetCategories = computed(() =>
  budgetsStore.categoryBreakdown.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    limit: cat.budget_amount,
    spent: cat.spent_amount,
  })),
);

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (date: string) => format(new Date(date), 'MMM d');

const formatAmount = (amount: number, type: string) => {
  const prefix = type === 'income' ? '+' : '-';
  if (!settingsStore.settings.showBalances)
    return `${prefix}${settingsStore.settings.currencySymbol}****`;
  return `${prefix}${formatCurrency(Math.abs(amount), settingsStore.settings.currency)}`;
};

const calcProgress = (spent: number, limit: number) =>
  limit === 0 ? 0 : Math.min(spent / limit, 1);

const progressColor = (spent: number, limit: number) => {
  const p = calcProgress(spent, limit);
  if (p >= 1) return 'bg-red-500';
  if (p >= 0.8) return 'bg-amber-500';
  return 'bg-indigo-500';
};

const iconMap: Record<string, any> = {
  receipt: Receipt, shopping_cart: ShoppingCart, home: Home, car: Car,
  restaurant: Utensils, utensils: Utensils, coffee: Coffee, movie: Film,
  film: Film, favorite: Heart, heart: Heart, bolt: Zap, zap: Zap,
  tag: Tag, wallet: Wallet, trending_down: TrendingDown,
};

const getIcon = (name?: string) => {
  if (!name) return Receipt;
  return iconMap[name.toLowerCase().replace(/-/g, '_')] || Receipt;
};

// ── Data fetching ─────────────────────────────────────────────────────────────

onMounted(async () => {
  loading.value = true;
  budgetLoading.value = true;

  const now = new Date();

  try {
    const txResponse = await transactionsService.getTransactions({ per_page: 5, sort_by: 'date', sort_direction: 'desc' });
    if (txResponse.success) recentTransactions.value = txResponse.data;
  } catch (err) {
    console.error('[HomePage] transactions:', err);
  }

  try {
    const accountsResponse = await accountsService.getAccountsSummary();
    if (accountsResponse.success) accountsSummary.value = accountsResponse.data;
  } catch (err) {
    console.error('[HomePage] accounts summary:', err);
  }

  loading.value = false;

  try {
    const statsResponse = await transactionsService.getTransactionStatistics({
      start_date: format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd'),
      end_date: format(new Date(now.getFullYear(), now.getMonth() + 1, 0), 'yyyy-MM-dd'),
    });
    if (statsResponse.success) monthlyStats.value = statsResponse.data;
  } catch (err) {
    console.error('[HomePage] statistics:', err);
  }

  try {
    await budgetsStore.initializeBudgetData();
  } catch (err) {
    console.error('[HomePage] budgets:', err);
  }

  budgetLoading.value = false;
});
</script>

<template>
  <div class="p-4 space-y-4 max-w-2xl mx-auto lg:max-w-full">

    <!-- Net Worth hero card -->
    <Card class="relative overflow-hidden border-0 bg-linear-to-br from-indigo-600 to-violet-700 text-white shadow-lg">
      <!-- subtle pattern overlay -->
      <div class="pointer-events-none absolute inset-0 opacity-10"
        style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px); background-size: 48px 48px;" />
      <CardContent class="relative p-6!">
        <p class="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">Net Worth</p>
        <div class="text-4xl font-bold tracking-tight mb-5">{{ formattedNetWorth }}</div>
        <div class="grid grid-cols-2 gap-4">
          <div class="rounded-xl bg-white/10 px-4 py-3">
            <p class="text-xs text-white/70 mb-0.5">Assets</p>
            <p class="text-lg font-semibold">{{ formattedTotalAssets }}</p>
          </div>
          <div class="rounded-xl bg-white/10 px-4 py-3">
            <p class="text-xs text-white/70 mb-0.5">Liabilities</p>
            <p class="text-lg font-semibold">{{ formattedTotalLiabilities }}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Monthly stats row -->
    <div class="grid grid-cols-3 gap-3">
      <Card class="border-border/60">
        <CardContent class="p-4 flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <p class="text-xs text-muted-foreground font-medium">Income</p>
            <div class="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <ArrowDownLeft class="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </div>
          <p class="text-base font-bold text-emerald-600">{{ formattedMonthlyIncome }}</p>
        </CardContent>
      </Card>

      <Card class="border-border/60">
        <CardContent class="p-4 flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <p class="text-xs text-muted-foreground font-medium">Spent</p>
            <div class="w-7 h-7 rounded-full bg-rose-500/10 flex items-center justify-center">
              <ArrowUpRight class="w-3.5 h-3.5 text-rose-500" />
            </div>
          </div>
          <p class="text-base font-bold text-rose-600">{{ formattedMonthlySpent }}</p>
        </CardContent>
      </Card>

      <Card class="border-border/60">
        <CardContent class="p-4 flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <p class="text-xs text-muted-foreground font-medium">Budget</p>
            <div class="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <Wallet class="w-3.5 h-3.5 text-indigo-500" />
            </div>
          </div>
          <p class="text-base font-bold">{{ formattedBudgetLeft }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Transactions -->
    <Card class="border-border/60">
      <CardHeader class="pb-2">
        <div class="flex items-center justify-between">
          <CardTitle class="text-base font-semibold">Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm" class="text-indigo-500 hover:text-indigo-400 text-xs h-7 px-2"
            @click="router.push('/transactions')">
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent class="pt-0">
        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-10">
          <Loader2 class="w-8 h-8 text-indigo-500 animate-spin" />
        </div>

        <!-- Empty -->
        <div v-else-if="recentTransactions.length === 0"
          class="flex flex-col items-center py-10 gap-2 text-muted-foreground">
          <Receipt class="w-10 h-10 opacity-30" />
          <p class="text-sm">No recent transactions</p>
          <Button size="sm" variant="outline" class="mt-1" @click="router.push('/transactions')">
            Add transaction
          </Button>
        </div>

        <!-- List -->
        <div v-else class="divide-y divide-border/50">
          <div v-for="tx in recentTransactions" :key="tx.id"
            class="flex items-center gap-3 py-3 hover:bg-muted/40 -mx-1 px-1 rounded-lg transition-colors cursor-pointer"
            @click="router.push(`/transactions`)">
            <!-- Icon bubble -->
            <div :class="[
              'flex items-center justify-center w-9 h-9 rounded-full shrink-0',
              tx.type === 'income' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
            ]">
              <component :is="getIcon(tx.category?.icon)" :class="[
                'w-4 h-4',
                tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
              ]" />
            </div>

            <!-- Details -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ tx.description }}</p>
              <p class="text-xs text-muted-foreground truncate">
                {{ tx.category?.name || 'Uncategorized' }} &middot; {{ formatDate(tx.date) }}
              </p>
            </div>

            <!-- Amount -->
            <span :class="[
              'text-sm font-bold shrink-0',
              tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
            ]">
              {{ formatAmount(tx.amount, tx.type) }}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Budget Overview -->
    <Card class="border-border/60">
      <CardHeader class="pb-2">
        <div class="flex items-center justify-between">
          <CardTitle class="text-base font-semibold">Budget Overview</CardTitle>
          <Button variant="ghost" size="sm" class="text-indigo-500 hover:text-indigo-400 text-xs h-7 px-2"
            @click="router.push('/budget')">
            Manage
          </Button>
        </div>
      </CardHeader>
      <CardContent class="pt-0">
        <div v-if="budgetLoading" class="flex justify-center py-10">
          <Loader2 class="w-8 h-8 text-indigo-500 animate-spin" />
        </div>

        <div v-else-if="budgetCategories.length === 0"
          class="flex flex-col items-center py-10 gap-2 text-muted-foreground">
          <PieChart class="w-10 h-10 opacity-30" />
          <p class="text-sm">No budget set up yet</p>
          <Button size="sm" variant="outline" class="mt-1" @click="router.push('/budget')">
            Set up budget
          </Button>
        </div>

        <div v-else class="space-y-4">
          <div v-for="budget in budgetCategories.slice(0, 5)" :key="budget.id">
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <component :is="getIcon(budget.icon)" class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm font-medium">{{ budget.name }}</span>
              </div>
              <span class="text-xs text-muted-foreground">
                {{ settingsStore.settings.showBalances
                  ? `${formatCurrency(budget.spent, settingsStore.settings.currency)} / ${formatCurrency(budget.limit,
                    settingsStore.settings.currency)}`
                  : `${settingsStore.settings.currencySymbol}**** / ${settingsStore.settings.currencySymbol}****`
                }}
              </span>
            </div>
            <div class="h-1.5 bg-muted rounded-full overflow-hidden">
              <div :class="['h-full rounded-full transition-all', progressColor(budget.spent, budget.limit)]"
                :style="{ width: `${calcProgress(budget.spent, budget.limit) * 100}%` }" />
            </div>
          </div>

          <Button v-if="budgetCategories.length > 5" variant="ghost" size="sm" class="w-full text-muted-foreground"
            @click="router.push('/budget')">
            View all {{ budgetCategories.length }} categories
          </Button>
        </div>
      </CardContent>
    </Card>

  </div>
</template>
