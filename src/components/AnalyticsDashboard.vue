<template>
  <div class="analytics-dashboard">
    <!-- Summary Cards -->
    <div class="row q-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="summary-card income-card">
          <q-card-section class="text-center">
            <q-icon name="trending_up" size="32px" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold">{{ formatCurrency(totalIncome) }}</div>
            <div class="text-caption">Total Income</div>
            <div class="text-caption" :class="incomeChange >= 0 ? 'text-green' : 'text-red'">
              {{ incomeChange >= 0 ? '+' : '' }}{{ incomeChange.toFixed(1) }}% from last month
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="summary-card expense-card">
          <q-card-section class="text-center">
            <q-icon name="trending_down" size="32px" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold">{{ formatCurrency(totalExpenses) }}</div>
            <div class="text-caption">Total Expenses</div>
            <div class="text-caption" :class="expenseChange >= 0 ? 'text-red' : 'text-green'">
              {{ expenseChange >= 0 ? '+' : '' }}{{ expenseChange.toFixed(1) }}% from last month
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="summary-card savings-card">
          <q-card-section class="text-center">
            <q-icon name="savings" size="32px" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold">{{ formatCurrency(netSavings) }}</div>
            <div class="text-caption">Net Savings</div>
            <div class="text-caption" :class="savingsRate >= 20 ? 'text-green' : 'text-orange'">
              {{ savingsRate.toFixed(1) }}% savings rate
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="summary-card budget-card">
          <q-card-section class="text-center">
            <q-icon name="pie_chart" size="32px" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold">{{ budgetUtilization.toFixed(1) }}%</div>
            <div class="text-caption">Budget Utilization</div>
            <div class="text-caption" :class="budgetUtilization <= 80 ? 'text-green' : 'text-red'">
              {{ formatCurrency(remainingBudget) }} remaining
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row q-gutter-md q-mb-md">
      <!-- Monthly Trends -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">Monthly Trends</div>
              <q-btn-toggle
                v-model="trendsTimeframe"
                toggle-color="primary"
                :options="timeframeOptions"
                no-caps
                flat
              />
            </div>
            <div class="chart-container">
              <canvas ref="trendsChart"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Category Breakdown -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Category Breakdown</div>
            <div class="chart-container">
              <canvas ref="categoryChart"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Income vs Expenses -->
    <div class="row q-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Income vs Expenses</div>
            <div class="chart-container">
              <canvas ref="incomeExpenseChart"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Cash Flow Analysis -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Cash Flow Analysis</div>
            <div class="chart-container">
              <canvas ref="cashFlowChart"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Detailed Analysis -->
    <div class="row q-gutter-md">
      <!-- Top Categories -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Top Spending Categories</div>
            <div
              v-for="category in topCategories"
              :key="category.name"
              class="category-item q-mb-md"
            >
              <div class="row items-center justify-between q-mb-xs">
                <div class="row items-center">
                  <q-icon
                    :name="category.icon"
                    :color="category.color"
                    size="20px"
                    class="q-mr-sm"
                  />
                  <span class="text-subtitle2">{{ category.name }}</span>
                </div>
                <div class="text-right">
                  <div class="text-subtitle2">{{ formatCurrency(category.amount) }}</div>
                  <div class="text-caption text-grey-6">{{ category.percentage.toFixed(1) }}%</div>
                </div>
              </div>
              <q-linear-progress
                :value="category.percentage / 100"
                :color="category.color"
                size="8px"
                rounded
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Financial Insights -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Financial Insights</div>
            <div class="insights-list">
              <div v-for="insight in insights" :key="insight.id" class="insight-item q-mb-md">
                <q-item>
                  <q-item-section avatar>
                    <q-avatar :color="insight.color" text-color="white" size="32px">
                      <q-icon :name="insight.icon" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-subtitle2">{{ insight.title }}</q-item-label>
                    <q-item-label caption>{{ insight.description }}</q-item-label>
                  </q-item-section>
                  <q-item-section side v-if="insight.value">
                    <q-item-label class="text-subtitle2">{{ insight.value }}</q-item-label>
                  </q-item-section>
                </q-item>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';

// Static data for future backend integration
const trendsTimeframe = ref('6m');
const timeframeOptions = [
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
];

// Sample data
const monthlyData = ref([
  { month: 'Jan', income: 65000, expenses: 45000 },
  { month: 'Feb', income: 68000, expenses: 48000 },
  { month: 'Mar', income: 70000, expenses: 52000 },
  { month: 'Apr', income: 72000, expenses: 49000 },
  { month: 'May', income: 69000, expenses: 51000 },
  { month: 'Jun', income: 75000, expenses: 53000 },
]);

const categoryData = ref([
  { name: 'Food & Dining', amount: 15750, icon: 'restaurant', color: 'orange' },
  { name: 'Transportation', amount: 8500, icon: 'directions_car', color: 'blue' },
  { name: 'Entertainment', amount: 6200, icon: 'movie', color: 'red' },
  { name: 'Shopping', amount: 12800, icon: 'shopping_cart', color: 'purple' },
  { name: 'Bills & Utilities', amount: 9750, icon: 'receipt', color: 'green' },
]);

const insights = ref([
  {
    id: 1,
    title: 'Spending Increase',
    description: 'Your dining expenses increased by 15% this month',
    icon: 'trending_up',
    color: 'orange',
    value: '+15%',
  },
  {
    id: 2,
    title: 'Savings Goal',
    description: "You're on track to meet your emergency fund goal",
    icon: 'flag',
    color: 'green',
    value: '75%',
  },
  {
    id: 3,
    title: 'Budget Alert',
    description: 'Entertainment budget is 90% utilized',
    icon: 'warning',
    color: 'red',
    value: '90%',
  },
  {
    id: 4,
    title: 'Best Month',
    description: 'Highest savings rate achieved in March',
    icon: 'star',
    color: 'blue',
    value: '25.7%',
  },
]);

// Chart references
const trendsChart = ref(null);
const categoryChart = ref(null);
const incomeExpenseChart = ref(null);
const cashFlowChart = ref(null);

// Computed values
const totalIncome = computed(() => monthlyData.value.reduce((sum, month) => sum + month.income, 0));
const totalExpenses = computed(() =>
  monthlyData.value.reduce((sum, month) => sum + month.expenses, 0),
);
const netSavings = computed(() => totalIncome.value - totalExpenses.value);
const savingsRate = computed(() => (netSavings.value / totalIncome.value) * 100);
const budgetUtilization = computed(() => (totalExpenses.value / (totalIncome.value * 0.8)) * 100);
const remainingBudget = computed(() => totalIncome.value * 0.8 - totalExpenses.value);

const incomeChange = ref(5.2);
const expenseChange = ref(2.8);

const topCategories = computed(() => {
  const totalCategoryExpenses = categoryData.value.reduce((sum, cat) => sum + cat.amount, 0);
  return categoryData.value
    .map((cat) => ({
      ...cat,
      percentage: (cat.amount / totalCategoryExpenses) * 100,
    }))
    .sort((a, b) => b.amount - a.amount);
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Chart.js implementation would go here
// For now, we'll use placeholder functions
const initTrendsChart = () => {
  // Initialize line chart for monthly trends
  console.log('Initializing trends chart');
};

const initCategoryChart = () => {
  // Initialize doughnut chart for category breakdown
  console.log('Initializing category chart');
};

const initIncomeExpenseChart = () => {
  // Initialize bar chart for income vs expenses
  console.log('Initializing income vs expense chart');
};

const initCashFlowChart = () => {
  // Initialize area chart for cash flow
  console.log('Initializing cash flow chart');
};

onMounted(async () => {
  await nextTick();
  initTrendsChart();
  initCategoryChart();
  initIncomeExpenseChart();
  initCashFlowChart();
});
</script>

<style scoped>
.analytics-dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.summary-card {
  transition: transform 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.income-card {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  color: white;
}

.expense-card {
  background: linear-gradient(135deg, #f44336 0%, #ef5350 100%);
  color: white;
}

.savings-card {
  background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%);
  color: white;
}

.budget-card {
  background: linear-gradient(135deg, #ff9800 0%, #ffa726 100%);
  color: white;
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

.category-item {
  transition: transform 0.2s ease;
}

.category-item:hover {
  transform: translateX(4px);
}

.insight-item {
  border-left: 4px solid transparent;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.insight-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
  border-left-color: #2196f3;
}

@media (max-width: 768px) {
  .chart-container {
    height: 250px;
  }
}
</style>
