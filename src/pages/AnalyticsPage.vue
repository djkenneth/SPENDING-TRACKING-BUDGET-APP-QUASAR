<!-- src/pages/AnalyticsPage.vue -->
<script setup lang="ts">
import { ref, computed, type Component } from 'vue';
import { useAnalyticsStore } from 'src/stores/analytics';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency } from 'src/utilities/currency';

import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Badge } from 'src/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';

import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  PiggyBank,
} from 'lucide-vue-next';

const analyticsStore = useAnalyticsStore();
const settingsStore = useSettingsStore();

const showExportDialog = ref(false);

const selectedPeriod = computed({
  get: () => analyticsStore.selectedPeriod,
  set: (value) => analyticsStore.setPeriod(value),
});

const currentAnalytics = computed(() => analyticsStore.currentAnalytics);
const previousPeriodAnalytics = computed(() => analyticsStore.previousPeriodAnalytics);
const comparisonData = computed(() => analyticsStore.comparisonData);
const forecastData = computed(() => analyticsStore.forecastData);
const isLoading = computed(() => analyticsStore.isLoading);
const monthlyTrends = computed(() => analyticsStore.monthlyTrends);

const periodOptions = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Quarter', value: 'quarter' },
  { label: 'Year', value: 'year' },
];

const setPeriod = (period: string) => {
  analyticsStore.setPeriod(period as 'month' | 'week' | 'quarter' | 'year');
};

const refreshAnalytics = () => {
  analyticsStore.refreshAnalytics();
};

const exportAnalytics = (format: 'json' | 'csv' | 'pdf') => {
  analyticsStore.exportAnalytics(format);
  showExportDialog.value = false;
};

const getChangeColor = (change: number) => {
  if (change > 0) return 'text-emerald-600';
  if (change < 0) return 'text-rose-600';
  return 'text-muted-foreground';
};

const getChangeIcon = (change: number): Component => {
  if (change > 0) return TrendingUp;
  if (change < 0) return TrendingDown;
  return Minus;
};

const getTrendBadgeClass = (trend: string) => {
  switch (trend) {
    case 'up': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'down': return 'bg-rose-100 text-rose-700 border-rose-200';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getTrendIcon = (trend: string): Component => {
  if (trend === 'up') return TrendingUp;
  if (trend === 'down') return TrendingDown;
  return Minus;
};

// Bar chart helper for monthly trends (inline SVG-style bars)
const maxMonthlyValue = computed(() => {
  return Math.max(...monthlyTrends.value.map(m => Math.max(m.income, m.expenses)), 1);
});

const barHeight = (value: number) => `${Math.round((value / maxMonthlyValue.value) * 80)}px`;
</script>

<template>
  <div class="min-h-screen bg-muted/30">
    <div class="p-4 space-y-4 max-w-4xl mx-auto">

      <!-- Header -->
      <div class="flex items-center justify-between gap-2">
        <h1 class="text-xl font-bold">Analytics</h1>
        <div class="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" class="h-8 w-8" :disabled="isLoading" @click="refreshAnalytics">
            <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          </Button>
          <Button variant="ghost" size="icon" class="h-8 w-8" @click="showExportDialog = true">
            <Download class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- Period Selector — scrollable chips -->
      <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button v-for="opt in periodOptions" :key="opt.value" :class="[
          'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
          selectedPeriod === opt.value
            ? 'bg-primary text-primary-foreground'
            : 'bg-background border border-border text-muted-foreground hover:bg-muted'
        ]" @click="setPeriod(opt.value)">
          {{ opt.label }}
        </button>
      </div>

      <!-- Key Metrics — 2 col mobile, 4 col desktop -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Income -->
        <Card class="border-0 bg-emerald-50 dark:bg-emerald-950/30">
          <CardContent class="!p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <ArrowDownLeft class="w-4 h-4 text-emerald-600" />
              </div>
              <div class="flex items-center gap-0.5 text-xs" :class="getChangeColor(comparisonData.growth.income)">
                <component :is="getChangeIcon(comparisonData.growth.income)" class="h-3 w-3" />
                {{ Math.abs(comparisonData.growth.income).toFixed(1) }}%
              </div>
            </div>
            <p class="text-xs text-muted-foreground mb-0.5">Income</p>
            <p class="text-lg font-bold text-emerald-600 leading-tight truncate">
              {{ formatCurrency(currentAnalytics.totalIncome, settingsStore.settings.currency) }}
            </p>
          </CardContent>
        </Card>

        <!-- Expenses -->
        <Card class="border-0 bg-rose-50 dark:bg-rose-950/30">
          <CardContent class="!p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                <ArrowUpRight class="w-4 h-4 text-rose-600" />
              </div>
              <div class="flex items-center gap-0.5 text-xs" :class="getChangeColor(-comparisonData.growth.expenses)">
                <component :is="getChangeIcon(-comparisonData.growth.expenses)" class="h-3 w-3" />
                {{ Math.abs(comparisonData.growth.expenses).toFixed(1) }}%
              </div>
            </div>
            <p class="text-xs text-muted-foreground mb-0.5">Expenses</p>
            <p class="text-lg font-bold text-rose-600 leading-tight truncate">
              {{ formatCurrency(currentAnalytics.totalExpenses, settingsStore.settings.currency) }}
            </p>
          </CardContent>
        </Card>

        <!-- Net Income -->
        <Card class="border-0 bg-blue-50 dark:bg-blue-950/30">
          <CardContent class="!p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Wallet class="w-4 h-4 text-blue-600" />
              </div>
              <div class="flex items-center gap-0.5 text-xs" :class="getChangeColor(comparisonData.growth.savings)">
                <component :is="getChangeIcon(comparisonData.growth.savings)" class="h-3 w-3" />
                {{ Math.abs(comparisonData.growth.savings).toFixed(1) }}%
              </div>
            </div>
            <p class="text-xs text-muted-foreground mb-0.5">Net Income</p>
            <p class="text-lg font-bold text-blue-600 leading-tight truncate">
              {{ formatCurrency(currentAnalytics.netIncome, settingsStore.settings.currency) }}
            </p>
          </CardContent>
        </Card>

        <!-- Savings Rate -->
        <Card class="border-0 bg-violet-50 dark:bg-violet-950/30">
          <CardContent class="!p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                <PiggyBank class="w-4 h-4 text-violet-600" />
              </div>
              <div class="flex items-center gap-0.5 text-xs"
                :class="getChangeColor(currentAnalytics.savingsRate - previousPeriodAnalytics.savingsRate)">
                <component :is="getChangeIcon(currentAnalytics.savingsRate - previousPeriodAnalytics.savingsRate)"
                  class="h-3 w-3" />
                {{ Math.abs(currentAnalytics.savingsRate - previousPeriodAnalytics.savingsRate).toFixed(1) }}%
              </div>
            </div>
            <p class="text-xs text-muted-foreground mb-0.5">Savings Rate</p>
            <p class="text-lg font-bold text-violet-600 leading-tight">
              {{ currentAnalytics.savingsRate.toFixed(1) }}%
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Monthly Bar Chart (inline, no lib needed) -->
      <Card class="border-0">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-semibold">Income vs Expenses — Last 12 Months</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="overflow-x-auto pb-2">
            <div class="flex items-end gap-1.5 min-w-max h-24">
              <div v-for="m in monthlyTrends" :key="m.month" class="flex flex-col items-center gap-0.5">
                <div class="flex items-end gap-0.5">
                  <div class="w-3 rounded-t bg-emerald-400 transition-all" :style="{ height: barHeight(m.income) }"
                    :title="`Income: ${formatCurrency(m.income, settingsStore.settings.currency)}`" />
                  <div class="w-3 rounded-t bg-rose-400 transition-all" :style="{ height: barHeight(m.expenses) }"
                    :title="`Expenses: ${formatCurrency(m.expenses, settingsStore.settings.currency)}`" />
                </div>
                <span class="text-[9px] text-muted-foreground w-8 text-center leading-none">
                  {{ m.month.split(' ')[0] }}
                </span>
              </div>
            </div>
          </div>
          <!-- Legend -->
          <div class="flex items-center gap-4 mt-2">
            <div class="flex items-center gap-1.5">
              <div class="w-3 h-3 rounded-sm bg-emerald-400" />
              <span class="text-xs text-muted-foreground">Income</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-3 h-3 rounded-sm bg-rose-400" />
              <span class="text-xs text-muted-foreground">Expenses</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Top Categories + Forecast — stacked mobile, side by side desktop -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">

        <!-- Top Spending Categories -->
        <Card class="border-0">
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-semibold">Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div v-if="currentAnalytics.topCategories.length === 0"
              class="text-sm text-muted-foreground text-center py-6">
              No expense data for this period
            </div>
            <div v-for="cat in currentAnalytics.topCategories.slice(0, 6)" :key="cat.category" class="space-y-1">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: cat.color || '#6366f1' }" />
                  <span class="text-sm truncate">{{ cat.category }}</span>
                </div>
                <div class="flex items-center gap-2 shrink-0 ml-2">
                  <span class="text-xs text-muted-foreground">{{ cat.percentage.toFixed(1) }}%</span>
                  <span class="text-sm font-medium">{{ formatCurrency(cat.amount, settingsStore.settings.currency)
                    }}</span>
                </div>
              </div>
              <div class="h-1.5 bg-muted rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all"
                  :style="{ width: `${Math.min(cat.percentage, 100)}%`, backgroundColor: cat.color || '#6366f1' }" />
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Forecast -->
        <Card class="border-0">
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-semibold">Next Month Forecast</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex justify-between items-center py-2.5 border-b border-border">
              <span class="text-sm text-muted-foreground">Projected Income</span>
              <span class="font-semibold text-emerald-600">
                {{ formatCurrency(forecastData.projectedIncome, settingsStore.settings.currency) }}
              </span>
            </div>
            <div class="flex justify-between items-center py-2.5 border-b border-border">
              <span class="text-sm text-muted-foreground">Projected Expenses</span>
              <span class="font-semibold text-rose-600">
                {{ formatCurrency(forecastData.projectedExpenses, settingsStore.settings.currency) }}
              </span>
            </div>
            <div class="flex justify-between items-center py-2.5 border-b border-border">
              <span class="text-sm text-muted-foreground">Projected Savings</span>
              <span class="font-semibold"
                :class="forecastData.projectedSavings >= 0 ? 'text-blue-600' : 'text-rose-600'">
                {{ formatCurrency(forecastData.projectedSavings, settingsStore.settings.currency) }}
              </span>
            </div>
            <div class="pt-1">
              <div class="flex justify-between mb-1.5">
                <span class="text-xs text-muted-foreground">Forecast confidence</span>
                <span class="text-xs font-medium">{{ forecastData.confidence }}%</span>
              </div>
              <div class="h-1.5 bg-muted rounded-full overflow-hidden">
                <div class="h-full bg-primary rounded-full transition-all"
                  :style="{ width: `${forecastData.confidence}%` }" />
              </div>
            </div>
            <!-- Scenarios -->
            <div class="grid grid-cols-3 gap-2 pt-1">
              <div class="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                <p class="text-[10px] text-muted-foreground mb-0.5">Optimistic</p>
                <p class="text-xs font-semibold text-emerald-600">
                  {{ formatCurrency(forecastData.scenarios.optimistic, settingsStore.settings.currency) }}
                </p>
              </div>
              <div class="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <p class="text-[10px] text-muted-foreground mb-0.5">Realistic</p>
                <p class="text-xs font-semibold text-blue-600">
                  {{ formatCurrency(forecastData.scenarios.realistic, settingsStore.settings.currency) }}
                </p>
              </div>
              <div class="text-center p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30">
                <p class="text-[10px] text-muted-foreground mb-0.5">Pessimistic</p>
                <p class="text-xs font-semibold text-rose-600">
                  {{ formatCurrency(forecastData.scenarios.pessimistic, settingsStore.settings.currency) }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Cash Flow Summary -->
      <Card class="border-0">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-semibold">Cash Flow Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-3 gap-3">
            <div class="text-center p-3 rounded-xl bg-muted/50">
              <p class="text-xs text-muted-foreground mb-1">Avg Daily Income</p>
              <p class="text-sm font-bold text-emerald-600">
                {{ formatCurrency(currentAnalytics.totalIncome / 30, settingsStore.settings.currency) }}
              </p>
            </div>
            <div class="text-center p-3 rounded-xl bg-muted/50">
              <p class="text-xs text-muted-foreground mb-1">Avg Daily Expense</p>
              <p class="text-sm font-bold text-rose-600">
                {{ formatCurrency(currentAnalytics.totalExpenses / 30, settingsStore.settings.currency) }}
              </p>
            </div>
            <div class="text-center p-3 rounded-xl bg-muted/50">
              <p class="text-xs text-muted-foreground mb-1">Net Daily Flow</p>
              <p class="text-sm font-bold" :class="currentAnalytics.netIncome >= 0 ? 'text-blue-600' : 'text-rose-600'">
                {{ formatCurrency(currentAnalytics.netIncome / 30, settingsStore.settings.currency) }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Category Trends Table — horizontally scrollable on mobile -->
      <Card class="border-0">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-semibold">Category Trends</CardTitle>
        </CardHeader>
        <CardContent class="p-0">
          <div v-if="currentAnalytics.trends.length === 0" class="text-sm text-muted-foreground text-center py-10">
            No trend data available for this period
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full min-w-120">
              <thead>
                <tr class="border-b bg-muted/30">
                  <th class="text-left text-xs font-medium text-muted-foreground py-2.5 px-4">Category</th>
                  <th class="text-center text-xs font-medium text-muted-foreground py-2.5 px-3">Trend</th>
                  <th class="text-center text-xs font-medium text-muted-foreground py-2.5 px-3">Change</th>
                  <th class="text-right text-xs font-medium text-muted-foreground py-2.5 px-4">Current</th>
                  <th class="text-right text-xs font-medium text-muted-foreground py-2.5 px-4">Previous</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr v-for="row in currentAnalytics.trends" :key="row.category"
                  class="hover:bg-muted/40 transition-colors">
                  <td class="text-sm py-3 px-4 font-medium">{{ row.category }}</td>
                  <td class="py-3 px-3 text-center">
                    <Badge class="text-[10px] gap-0.5" :class="getTrendBadgeClass(row.trend)">
                      <component :is="getTrendIcon(row.trend)" class="h-2.5 w-2.5" />
                      {{ row.trend }}
                    </Badge>
                  </td>
                  <td class="text-sm py-3 px-3 text-center">
                    <span :class="getChangeColor(row.changePercent)">
                      {{ row.changePercent > 0 ? '+' : '' }}{{ row.changePercent.toFixed(1) }}%
                    </span>
                  </td>
                  <td class="text-sm py-3 px-4 text-right font-medium">
                    {{ formatCurrency(row.currentPeriod, settingsStore.settings.currency) }}
                  </td>
                  <td class="text-sm py-3 px-4 text-right text-muted-foreground">
                    {{ formatCurrency(row.previousPeriod, settingsStore.settings.currency) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>

    <!-- Export Dialog -->
    <Dialog :open="showExportDialog" @update:open="showExportDialog = $event">
      <DialogContent class="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Export Analytics</DialogTitle>
        </DialogHeader>
        <div class="flex flex-col gap-2 py-3">
          <Button class="w-full justify-start gap-3" @click="exportAnalytics('json')">
            <FileJson class="h-4 w-4" />
            Export as JSON
          </Button>
          <Button variant="outline" class="w-full justify-start gap-3" @click="exportAnalytics('csv')">
            <FileSpreadsheet class="h-4 w-4" />
            Export as CSV
          </Button>
          <Button variant="outline" class="w-full justify-start gap-3" @click="exportAnalytics('pdf')">
            <FileText class="h-4 w-4" />
            Export as PDF
          </Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" class="w-full" @click="showExportDialog = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
