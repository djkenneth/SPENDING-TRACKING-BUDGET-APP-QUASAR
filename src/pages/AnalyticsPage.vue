<!-- src/pages/AnalyticsPage.vue -->
<template>
  <div class="analytics-page">
    <div class="q-pa-md">
      <!-- Header Controls -->
      <div class="row items-center justify-between q-mb-lg">
        <div class="text-h5">Analytics Dashboard</div>
        <div class="row q-gutter-md">
          <q-btn-toggle v-model="selectedPeriod" :options="periodOptions" color="primary"
            @update:model-value="setPeriod" />
          <q-btn flat icon="refresh" @click="refreshAnalytics" :loading="isLoading" />
          <q-btn flat icon="file_download" @click="showExportDialog = true" />
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="row q-gutter-md q-mb-lg">
        <div class="col">
          <q-card class="metric-card">
            <q-card-section>
              <div class="metric-value text-positive">
                {{ formatCurrency(currentAnalytics.totalIncome) }}
              </div>
              <div class="metric-label">Total Income</div>
              <div class="metric-change" :class="getChangeColor(comparisonData.growth.income)">
                <q-icon :name="getChangeIcon(comparisonData.growth.income)" size="sm" />
                {{ Math.abs(comparisonData.growth.income).toFixed(1) }}%
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col">
          <q-card class="metric-card">
            <q-card-section>
              <div class="metric-value text-negative">
                {{ formatCurrency(currentAnalytics.totalExpenses) }}
              </div>
              <div class="metric-label">Total Expenses</div>
              <div class="metric-change" :class="getChangeColor(-comparisonData.growth.expenses)">
                <q-icon :name="getChangeIcon(-comparisonData.growth.expenses)" size="sm" />
                {{ Math.abs(comparisonData.growth.expenses).toFixed(1) }}%
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col">
          <q-card class="metric-card">
            <q-card-section>
              <div class="metric-value text-primary">
                {{ formatCurrency(currentAnalytics.netIncome) }}
              </div>
              <div class="metric-label">Net Income</div>
              <div class="metric-change" :class="getChangeColor(comparisonData.growth.savings)">
                <q-icon :name="getChangeIcon(comparisonData.growth.savings)" size="sm" />
                {{ Math.abs(comparisonData.growth.savings).toFixed(1) }}%
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col">
          <q-card class="metric-card">
            <q-card-section>
              <div class="metric-value text-info">
                {{ currentAnalytics.savingsRate.toFixed(1) }}%
              </div>
              <div class="metric-label">Savings Rate</div>
              <div class="metric-change" :class="getChangeColor(currentAnalytics.savingsRate - previousPeriodAnalytics.savingsRate)
                ">
                <q-icon :name="getChangeIcon(
                  currentAnalytics.savingsRate - previousPeriodAnalytics.savingsRate,
                )
                  " size="sm" />
                {{
                  Math.abs(
                    currentAnalytics.savingsRate - previousPeriodAnalytics.savingsRate,
                  ).toFixed(1)
                }}%
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row q-gutter-md q-mb-lg">
        <!-- Income vs Expenses Chart -->
        <div class="col-md-6 col-12">
          <q-card class="chart-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">Income vs Expenses</div>
              <div class="chart-container">
                <canvas ref="incomeExpensesChart" width="400" height="200"></canvas>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Spending by Category Chart -->
        <div class="col-md-6 col-12">
          <q-card class="chart-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">Spending by Category</div>
              <div class="chart-container">
                <canvas ref="categoryChart" width="400" height="200"></canvas>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Net Worth Trend -->
      <div class="row q-gutter-md q-mb-lg">
        <div class="col-12">
          <q-card class="chart-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">Net Worth Trend</div>
              <div class="chart-container">
                <canvas ref="netWorthChart" width="800" height="300"></canvas>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Detailed Analysis -->
      <div class="row q-gutter-md q-mb-lg">
        <!-- Top Categories -->
        <div class="col-md-4 col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Top Spending Categories</div>
              <div class="category-list">
                <div v-for="category in currentAnalytics.topCategories.slice(0, 5)" :key="category.category"
                  class="category-item">
                  <q-avatar size="32px" :color="category.color" text-color="white" class="q-mr-sm">
                    <q-icon :name="category.icon" size="18px" />
                  </q-avatar>
                  <div class="category-info">
                    <div class="category-name">{{ category.category }}</div>
                    <div class="category-amount">{{ formatCurrency(category.amount) }}</div>
                  </div>
                  <div class="category-percentage">{{ category.percentage.toFixed(1) }}%</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Cash Flow -->
        <div class="col-md-4 col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Cash Flow Summary</div>
              <div class="cash-flow-item">
                <div class="flow-label">Average Daily Income</div>
                <div class="flow-value text-positive">
                  {{ formatCurrency(currentAnalytics.totalIncome / 30) }}
                </div>
              </div>
              <div class="cash-flow-item">
                <div class="flow-label">Average Daily Expenses</div>
                <div class="flow-value text-negative">
                  {{ formatCurrency(currentAnalytics.totalExpenses / 30) }}
                </div>
              </div>
              <div class="cash-flow-item">
                <div class="flow-label">Net Daily Flow</div>
                <div class="flow-value text-primary">
                  {{ formatCurrency(currentAnalytics.netIncome / 30) }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Forecast -->
        <div class="col-md-4 col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Next Month Forecast</div>
              <div class="forecast-item">
                <div class="forecast-label">Projected Income</div>
                <div class="forecast-value">{{ formatCurrency(forecastData.projectedIncome) }}</div>
              </div>
              <div class="forecast-item">
                <div class="forecast-label">Projected Expenses</div>
                <div class="forecast-value">
                  {{ formatCurrency(forecastData.projectedExpenses) }}
                </div>
              </div>
              <div class="forecast-item">
                <div class="forecast-label">Projected Savings</div>
                <div class="forecast-value"
                  :class="forecastData.projectedSavings > 0 ? 'text-positive' : 'text-negative'">
                  {{ formatCurrency(forecastData.projectedSavings) }}
                </div>
              </div>
              <div class="forecast-confidence">
                <div class="text-caption">Confidence: {{ forecastData.confidence }}%</div>
                <q-linear-progress :value="forecastData.confidence / 100" color="primary" size="4px" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Trends Table -->
      <div class="row q-mb-lg">
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Category Trends</div>
              <q-table :rows="currentAnalytics.trends" :columns="trendColumns" row-key="category" flat bordered>
                <template v-slot:body-cell-trend="props">
                  <q-td :props="props">
                    <q-chip :color="getTrendColor(props.row.trend)" text-color="white"
                      :icon="getTrendIcon(props.row.trend)" size="sm">
                      {{ props.row.trend }}
                    </q-chip>
                  </q-td>
                </template>
                <template v-slot:body-cell-changePercent="props">
                  <q-td :props="props">
                    <span :class="getChangeColor(props.row.changePercent)">
                      {{ props.row.changePercent > 0 ? '+' : ''
                      }}{{ props.row.changePercent.toFixed(1) }}%
                    </span>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Export Dialog -->
    <q-dialog v-model="showExportDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Export Analytics</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="q-gutter-md">
            <q-btn color="primary" icon="description" label="Export as JSON" @click="exportAnalytics('json')" />
            <q-btn color="positive" icon="table_chart" label="Export as CSV" @click="exportAnalytics('csv')" />
            <q-btn color="negative" icon="picture_as_pdf" label="Export as PDF" @click="exportAnalytics('pdf')" />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showExportDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useAnalyticsStore } from 'src/stores/analytics';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency } from 'src/utilities/currency';

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
  analyticsStore.setPeriod(period);
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
  if (change > 0) return 'text-positive';
  if (change < 0) return 'text-negative';
  return 'text-grey-6';
};

const getChangeIcon = (change: number) => {
  if (change > 0) return 'trending_up';
  if (change < 0) return 'trending_down';
  return 'trending_flat';
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up':
      return 'positive';
    case 'down':
      return 'negative';
    default:
      return 'grey-6';
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return 'trending_up';
    case 'down':
      return 'trending_down';
    default:
      return 'trending_flat';
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

<style scoped>
.analytics-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.metric-card {
  border-radius: 12px;
  border-left: 4px solid var(--q-primary);
}

.metric-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 4px;
}

.metric-change {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.chart-card {
  border-radius: 12px;
  height: 100%;
}

.chart-container {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  border-radius: 8px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-info {
  flex: 1;
}

.category-name {
  font-weight: 500;
  font-size: 0.875rem;
}

.category-amount {
  font-size: 0.75rem;
  color: #666;
}

.category-percentage {
  font-weight: bold;
  color: var(--q-primary);
}

.cash-flow-item,
.forecast-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.cash-flow-item:last-child,
.forecast-item:last-child {
  border-bottom: none;
}

.flow-label,
.forecast-label {
  font-size: 0.875rem;
  color: #666;
}

.flow-value,
.forecast-value {
  font-weight: 500;
}

.forecast-confidence {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

@media (max-width: 768px) {
  .metric-value {
    font-size: 1.25rem;
  }

  .chart-container {
    height: 150px;
  }
}
</style>
