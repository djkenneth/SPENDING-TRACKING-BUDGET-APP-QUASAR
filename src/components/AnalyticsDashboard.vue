<template>
  <div class="mx-auto max-w-[1400px]">
    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <!-- Income Card -->
      <Card class="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-0 transition-transform duration-200 hover:-translate-y-0.5">
        <CardContent class="text-center pt-6">
          <TrendingUp class="mx-auto mb-2 size-8" />
          <div class="text-xl font-bold">{{ formatCurrency(totalIncome) }}</div>
          <div class="text-sm text-white/80">Total Income</div>
          <div class="text-sm" :class="incomeChange >= 0 ? 'text-emerald-200' : 'text-red-200'">
            {{ incomeChange >= 0 ? '+' : '' }}{{ incomeChange.toFixed(1) }}% from last month
          </div>
        </CardContent>
      </Card>

      <!-- Expense Card -->
      <Card class="bg-gradient-to-br from-red-500 to-red-700 text-white border-0 transition-transform duration-200 hover:-translate-y-0.5">
        <CardContent class="text-center pt-6">
          <TrendingDown class="mx-auto mb-2 size-8" />
          <div class="text-xl font-bold">{{ formatCurrency(totalExpenses) }}</div>
          <div class="text-sm text-white/80">Total Expenses</div>
          <div class="text-sm" :class="expenseChange >= 0 ? 'text-red-200' : 'text-emerald-200'">
            {{ expenseChange >= 0 ? '+' : '' }}{{ expenseChange.toFixed(1) }}% from last month
          </div>
        </CardContent>
      </Card>

      <!-- Savings Card -->
      <Card class="bg-gradient-to-br from-blue-500 to-blue-700 text-white border-0 transition-transform duration-200 hover:-translate-y-0.5">
        <CardContent class="text-center pt-6">
          <PiggyBank class="mx-auto mb-2 size-8" />
          <div class="text-xl font-bold">{{ formatCurrency(netSavings) }}</div>
          <div class="text-sm text-white/80">Net Savings</div>
          <div class="text-sm" :class="savingsRate >= 20 ? 'text-emerald-200' : 'text-orange-200'">
            {{ savingsRate.toFixed(1) }}% savings rate
          </div>
        </CardContent>
      </Card>

      <!-- Budget Card -->
      <Card class="bg-gradient-to-br from-amber-500 to-amber-700 text-white border-0 transition-transform duration-200 hover:-translate-y-0.5">
        <CardContent class="text-center pt-6">
          <PieChart class="mx-auto mb-2 size-8" />
          <div class="text-xl font-bold">{{ budgetUtilization.toFixed(1) }}%</div>
          <div class="text-sm text-white/80">Budget Utilization</div>
          <div class="text-sm" :class="budgetUtilization <= 80 ? 'text-emerald-200' : 'text-red-200'">
            {{ formatCurrency(remainingBudget) }} remaining
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <!-- Monthly Trends (wider) -->
      <Card class="lg:col-span-1">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="text-lg">Monthly Trends</CardTitle>
            <div class="flex gap-1 bg-muted rounded-lg p-1">
              <Button
                v-for="option in timeframeOptions"
                :key="option.value"
                size="sm"
                :variant="trendsTimeframe === option.value ? 'default' : 'ghost'"
                @click="trendsTimeframe = option.value"
              >
                {{ option.label }}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="relative h-[300px] w-full md:h-[250px]">
            <canvas ref="trendsChart"></canvas>
          </div>
        </CardContent>
      </Card>

      <!-- Category Breakdown -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="relative h-[300px] w-full md:h-[250px]">
            <canvas ref="categoryChart"></canvas>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Income vs Expenses / Cash Flow -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="relative h-[300px] w-full md:h-[250px]">
            <canvas ref="incomeExpenseChart"></canvas>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Cash Flow Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="relative h-[300px] w-full md:h-[250px]">
            <canvas ref="cashFlowChart"></canvas>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Detailed Analysis -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Top Categories -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Top Spending Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            v-for="category in topCategories"
            :key="category.name"
            class="mb-4 last:mb-0 transition-transform duration-200 hover:translate-x-1"
          >
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <component
                  :is="categoryIconMap[category.icon]"
                  class="size-5"
                  :class="categoryColorClass(category.color)"
                />
                <span class="text-sm font-medium">{{ category.name }}</span>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium">{{ formatCurrency(category.amount) }}</div>
                <div class="text-xs text-muted-foreground">{{ category.percentage.toFixed(1) }}%</div>
              </div>
            </div>
            <div class="h-2 bg-muted rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="progressColorClass(category.color)"
                :style="{ width: category.percentage + '%' }"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Financial Insights -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Financial Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div
              v-for="insight in insights"
              :key="insight.id"
              class="flex items-center gap-3 rounded-lg border-l-4 border-transparent p-2 transition-all duration-200 hover:bg-muted/50 hover:border-l-primary"
            >
              <div
                class="flex size-8 shrink-0 items-center justify-center rounded-full"
                :class="avatarColorClass(insight.color)"
              >
                <component
                  :is="insightIconMap[insight.icon]"
                  class="size-4 text-white"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium">{{ insight.title }}</div>
                <div class="text-xs text-muted-foreground">{{ insight.description }}</div>
              </div>
              <div v-if="insight.value" class="text-sm font-medium shrink-0">
                {{ insight.value }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart,
  Utensils,
  Car,
  Film,
  ShoppingCart,
  Receipt,
  AlertTriangle,
  Flag,
  Star,
} from 'lucide-vue-next';

// Icon maps for dynamic rendering
const categoryIconMap: Record<string, any> = {
  restaurant: Utensils,
  directions_car: Car,
  movie: Film,
  shopping_cart: ShoppingCart,
  receipt: Receipt,
};

const insightIconMap: Record<string, any> = {
  trending_up: TrendingUp,
  flag: Flag,
  warning: AlertTriangle,
  star: Star,
};

// Color utility functions
const categoryColorClass = (color: string) => {
  const map: Record<string, string> = {
    orange: 'text-orange-500',
    blue: 'text-blue-500',
    red: 'text-red-500',
    purple: 'text-purple-500',
    green: 'text-green-500',
  };
  return map[color] || 'text-muted-foreground';
};

const progressColorClass = (color: string) => {
  const map: Record<string, string> = {
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
  };
  return map[color] || 'bg-primary';
};

const avatarColorClass = (color: string) => {
  const map: Record<string, string> = {
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  };
  return map[color] || 'bg-primary';
};

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

const formatCurrency = (amount: number) => {
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
