<!-- src/pages/AnalyticsPage.vue -->
<template>
  <div class="min-h-screen bg-muted/30">
    <div class="p-4 space-y-4">
      <!-- Header Controls -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 class="text-xl font-semibold text-foreground">Analytics Dashboard</h1>
        <div class="flex items-center gap-2">
          <Tabs :default-value="selectedPeriod" @update:model-value="setPeriod">
            <TabsList>
              <TabsTrigger v-for="option in periodOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="ghost" size="icon" @click="refreshAnalytics" :disabled="isLoading">
            <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          </Button>
          <Button variant="ghost" size="icon" @click="showExportDialog = true">
            <Download class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Total Income -->
        <Card class="border-l-4 border-l-green-600">
          <CardContent class="p-4">
            <div class="text-xl sm:text-2xl font-bold text-green-600">
              {{ formatCurrency(currentAnalytics.totalIncome) }}
            </div>
            <div class="text-sm text-muted-foreground mt-1">Total Income</div>
            <div class="text-xs flex items-center gap-1 mt-1" :class="getChangeColor(comparisonData.growth.income)">
              <component :is="getChangeIcon(comparisonData.growth.income)" class="h-3 w-3" />
              {{ Math.abs(comparisonData.growth.income).toFixed(1) }}%
            </div>
          </CardContent>
        </Card>

        <!-- Total Expenses -->
        <Card class="border-l-4 border-l-red-600">
          <CardContent class="p-4">
            <div class="text-xl sm:text-2xl font-bold text-red-600">
              {{ formatCurrency(currentAnalytics.totalExpenses) }}
            </div>
            <div class="text-sm text-muted-foreground mt-1">Total Expenses</div>
            <div class="text-xs flex items-center gap-1 mt-1" :class="getChangeColor(-comparisonData.growth.expenses)">
              <component :is="getChangeIcon(-comparisonData.growth.expenses)" class="h-3 w-3" />
              {{ Math.abs(comparisonData.growth.expenses).toFixed(1) }}%
            </div>
          </CardContent>
        </Card>

        <!-- Net Income -->
        <Card class="border-l-4 border-l-blue-600">
          <CardContent class="p-4">
            <div class="text-xl sm:text-2xl font-bold text-blue-600">
              {{ formatCurrency(currentAnalytics.netIncome) }}
            </div>
            <div class="text-sm text-muted-foreground mt-1">Net Income</div>
            <div class="text-xs flex items-center gap-1 mt-1" :class="getChangeColor(comparisonData.growth.savings)">
              <component :is="getChangeIcon(comparisonData.growth.savings)" class="h-3 w-3" />
              {{ Math.abs(comparisonData.growth.savings).toFixed(1) }}%
            </div>
          </CardContent>
        </Card>

        <!-- Savings Rate -->
        <Card class="border-l-4 border-l-sky-500">
          <CardContent class="p-4">
            <div class="text-xl sm:text-2xl font-bold text-sky-500">
              {{ currentAnalytics.savingsRate.toFixed(1) }}%
            </div>
            <div class="text-sm text-muted-foreground mt-1">Savings Rate</div>
            <div class="text-xs flex items-center gap-1 mt-1"
              :class="getChangeColor(currentAnalytics.savingsRate - previousPeriodAnalytics.savingsRate)">
              <component :is="getChangeIcon(currentAnalytics.savingsRate - previousPeriodAnalytics.savingsRate)"
                class="h-3 w-3" />
              {{
                Math.abs(
                  currentAnalytics.savingsRate - previousPeriodAnalytics.savingsRate,
                ).toFixed(1)
              }}%
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- Income vs Expenses Chart -->
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-base font-semibold">Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="w-full h-[200px] flex items-center justify-center bg-muted/50 rounded-lg">
              <canvas ref="incomeExpensesChart" width="400" height="200"></canvas>
            </div>
          </CardContent>
        </Card>

        <!-- Spending by Category Chart -->
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-base font-semibold">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="w-full h-[200px] flex items-center justify-center bg-muted/50 rounded-lg">
              <canvas ref="categoryChart" width="400" height="200"></canvas>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Net Worth Trend -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-base font-semibold">Net Worth Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="w-full h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
            <canvas ref="netWorthChart" width="800" height="300"></canvas>
          </div>
        </CardContent>
      </Card>

      <!-- Detailed Analysis -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- Top Categories -->
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-base font-semibold">Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-col gap-3">
              <div v-for="category in currentAnalytics.topCategories.slice(0, 5)" :key="category.category"
                class="flex items-center gap-2">
                <div class="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs shrink-0"
                  :style="{ backgroundColor: category.color }">
                  {{ category.category.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium truncate">{{ category.category }}</div>
                  <div class="text-xs text-muted-foreground">{{ formatCurrency(category.amount) }}</div>
                </div>
                <div class="text-sm font-bold text-primary shrink-0">{{ category.percentage.toFixed(1) }}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Cash Flow -->
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-base font-semibold">Cash Flow Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex justify-between items-center py-2 border-b border-border">
              <div class="text-sm text-muted-foreground">Average Daily Income</div>
              <div class="font-medium text-green-600">
                {{ formatCurrency(currentAnalytics.totalIncome / 30) }}
              </div>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-border">
              <div class="text-sm text-muted-foreground">Average Daily Expenses</div>
              <div class="font-medium text-red-600">
                {{ formatCurrency(currentAnalytics.totalExpenses / 30) }}
              </div>
            </div>
            <div class="flex justify-between items-center py-2">
              <div class="text-sm text-muted-foreground">Net Daily Flow</div>
              <div class="font-medium text-blue-600">
                {{ formatCurrency(currentAnalytics.netIncome / 30) }}
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Forecast -->
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-base font-semibold">Next Month Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex justify-between items-center py-2 border-b border-border">
              <div class="text-sm text-muted-foreground">Projected Income</div>
              <div class="font-medium">{{ formatCurrency(forecastData.projectedIncome) }}</div>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-border">
              <div class="text-sm text-muted-foreground">Projected Expenses</div>
              <div class="font-medium">{{ formatCurrency(forecastData.projectedExpenses) }}</div>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-border">
              <div class="text-sm text-muted-foreground">Projected Savings</div>
              <div class="font-medium" :class="forecastData.projectedSavings > 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(forecastData.projectedSavings) }}
              </div>
            </div>
            <div class="mt-3 pt-3 border-t border-border">
              <div class="text-xs text-muted-foreground mb-1.5">
                Confidence: {{ forecastData.confidence }}%
              </div>
              <div class="w-full h-1 bg-secondary rounded-full overflow-hidden">
                <div class="h-full bg-primary rounded-full transition-all"
                  :style="{ width: `${forecastData.confidence}%` }"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Trends Table -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-base font-semibold">Category Trends</CardTitle>
        </CardHeader>
        <CardContent class="p-0">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th class="text-left text-sm font-medium text-muted-foreground py-3 px-4">Category</th>
                  <th class="text-center text-sm font-medium text-muted-foreground py-3 px-4">Trend</th>
                  <th class="text-center text-sm font-medium text-muted-foreground py-3 px-4">Change</th>
                  <th class="text-right text-sm font-medium text-muted-foreground py-3 px-4">Current</th>
                  <th class="text-right text-sm font-medium text-muted-foreground py-3 px-4">Previous</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in currentAnalytics.trends" :key="row.category"
                  class="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td class="text-left text-sm py-3 px-4">{{ row.category }}</td>
                  <td class="text-center py-3 px-4">
                    <Badge :class="getTrendBadgeClass(row.trend)">
                      <component :is="getTrendIcon(row.trend)" class="h-3 w-3" />
                      {{ row.trend }}
                    </Badge>
                  </td>
                  <td class="text-center text-sm py-3 px-4">
                    <span :class="getChangeColor(row.changePercent)">
                      {{ row.changePercent > 0 ? '+' : '' }}{{ row.changePercent.toFixed(1) }}%
                    </span>
                  </td>
                  <td class="text-right text-sm py-3 px-4">{{ formatCurrency(row.currentPeriod) }}</td>
                  <td class="text-right text-sm py-3 px-4">{{ formatCurrency(row.previousPeriod) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Export Dialog -->
    <Dialog :open="showExportDialog" @update:open="showExportDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Analytics</DialogTitle>
        </DialogHeader>
        <div class="flex flex-col gap-3 py-4">
          <Button class="w-full justify-start gap-3" @click="exportAnalytics('json')">
            <FileJson class="h-5 w-5" />
            Export as JSON
          </Button>
          <Button variant="outline" class="w-full justify-start gap-3" @click="exportAnalytics('csv')">
            <FileSpreadsheet class="h-5 w-5" />
            Export as CSV
          </Button>
          <Button variant="outline" class="w-full justify-start gap-3" @click="exportAnalytics('pdf')">
            <FileText class="h-5 w-5" />
            Export as PDF
          </Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" @click="showExportDialog = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, type Component } from 'vue';
import { useAnalyticsStore } from 'src/stores/analytics';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency } from 'src/utilities/currency';

// shadcn-vue components
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Badge } from 'src/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from 'src/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';

// Lucide icons
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
} from 'lucide-vue-next';

const analyticsStore = useAnalyticsStore();
const settingsStore = useSettingsStore();

// Chart references
const incomeExpensesChart = ref<HTMLCanvasElement>();
const categoryChart = ref<HTMLCanvasElement>();
const netWorthChart = ref<HTMLCanvasElement>();

// State
const showExportDialog = ref(false);

// Computed
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
const netWorthHistory = computed(() => analyticsStore.netWorthHistory);

console.log('currentAnalytics', currentAnalytics.value)

const periodOptions = computed(() => [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Quarter', value: 'quarter' },
  { label: 'Year', value: 'year' },
]);

const trendColumns = computed(() => [
  {
    name: 'category',
    label: 'Category',
    field: 'category',
    align: 'left',
  },
  {
    name: 'trend',
    label: 'Trend',
    field: 'trend',
    align: 'center',
  },
  {
    name: 'changePercent',
    label: 'Change',
    field: 'changePercent',
    align: 'center',
  },
  {
    name: 'currentPeriod',
    label: 'Current',
    field: 'currentPeriod',
    align: 'right',
    format: (val: number) => formatCurrency(val),
  },
  {
    name: 'previousPeriod',
    label: 'Previous',
    field: 'previousPeriod',
    align: 'right',
    format: (val: number) => formatCurrency(val),
  },
]);

// Methods
const setPeriod = (period: string) => {
  analyticsStore.setPeriod(period as 'month' | 'week' | 'quarter' | 'year');
  nextTick(() => {
    initializeCharts();
  });
};

const refreshAnalytics = () => {
  analyticsStore.refreshAnalytics();
  nextTick(() => {
    initializeCharts();
  });
};

const exportAnalytics = (format: 'json' | 'csv' | 'pdf') => {
  analyticsStore.exportAnalytics(format);
  showExportDialog.value = false;
};

const getChangeColor = (change: number) => {
  if (change > 0) return 'text-green-600';
  if (change < 0) return 'text-red-600';
  return 'text-muted-foreground';
};

const getChangeIcon = (change: number): Component => {
  if (change > 0) return TrendingUp;
  if (change < 0) return TrendingDown;
  return Minus;
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    default:
      return 'text-muted-foreground';
  }
};

const getTrendIcon = (trend: string): Component => {
  switch (trend) {
    case 'up':
      return TrendingUp;
    case 'down':
      return TrendingDown;
    default:
      return Minus;
  }
};

const getTrendBadgeClass = (trend: string) => {
  switch (trend) {
    case 'up':
      return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100';
    case 'down':
      return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100';
  }
};

const initializeCharts = () => {
  // Initialize charts (would use Chart.js or similar)
  // For now, just placeholder implementation
  console.log('Initializing charts with data:', {
    currentAnalytics: currentAnalytics.value,
    monthlyTrends: monthlyTrends.value,
    netWorthHistory: netWorthHistory.value,
  });
};

onMounted(() => {
  nextTick(() => {
    initializeCharts();
  });
});
</script>
