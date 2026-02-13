<template>
  <div class="max-w-[1000px] mx-auto">
    <!-- Goals Overview -->
    <Card class="mb-4 bg-gradient-to-br from-violet-600 to-purple-800 text-white border-0">
      <CardContent class="pt-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Financial Goals</h2>
          <Button variant="ghost" size="sm" class="text-white hover:bg-white/20" @click="showAddGoalSheet = true">
            <Plus class="w-4 h-4 mr-1" />
            Add Goal
          </Button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div class="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
            <CheckCircle2 class="w-8 h-8 mx-auto mb-2" />
            <div class="text-lg font-bold">{{ completedGoals }}</div>
            <div class="text-xs text-white/80">Completed Goals</div>
          </div>
          <div class="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
            <TrendingUp class="w-8 h-8 mx-auto mb-2" />
            <div class="text-lg font-bold">{{ activeGoals }}</div>
            <div class="text-xs text-white/80">Active Goals</div>
          </div>
          <div class="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
            <PiggyBank class="w-8 h-8 mx-auto mb-2" />
            <div class="text-lg font-bold">{{ formatCurrency(totalSaved) }}</div>
            <div class="text-xs text-white/80">Total Saved</div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Active Goals -->
    <Card class="mb-4">
      <CardHeader>
        <CardTitle class="text-lg">Active Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          v-if="goals.filter((g) => g.status === 'active').length === 0"
          class="text-center text-muted-foreground py-8"
        >
          <Flag class="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <div class="text-lg font-semibold">No Active Goals</div>
          <div class="text-sm text-muted-foreground">Create your first financial goal to get started</div>
        </div>

        <div
          v-for="goal in activeGoalsList"
          :key="goal.id"
          class="mb-4 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <Card class="border p-4">
            <div class="flex items-center mb-4">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center text-white mr-4 shrink-0"
                :class="goalColorClass(goal.color)"
              >
                <component :is="goalIconComponent(goal.icon)" class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium">{{ goal.name }}</div>
                <div class="text-xs text-muted-foreground">{{ goal.description }}</div>
              </div>
              <div>
                <Button variant="ghost" size="icon-sm" @click="editGoal(goal)">
                  <MoreVertical class="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div class="flex items-center mb-2">
              <div class="flex-1">
                <div class="text-xs text-muted-foreground">Progress</div>
                <div class="text-lg font-semibold">
                  {{ formatCurrency(goal.currentAmount) }} / {{ formatCurrency(goal.targetAmount) }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs text-muted-foreground">
                  {{ Math.round((goal.currentAmount / goal.targetAmount) * 100) }}%
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ getDaysRemaining(goal.targetDate) }} days left
                </div>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="w-full h-3 bg-muted rounded-full mb-4 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="getProgressBarColor(goal.currentAmount / goal.targetAmount)"
                :style="{ width: Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) + '%' }"
              />
            </div>

            <div class="flex gap-2">
              <Button variant="ghost" size="sm" @click="addMoney(goal)">
                <Plus class="w-4 h-4 mr-1" />
                Add Money
              </Button>
              <Button variant="ghost" size="sm" class="text-muted-foreground" @click="viewGoalDetails(goal)">
                <Eye class="w-4 h-4 mr-1" />
                View Details
              </Button>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- Emergency Fund Calculator -->
    <Card class="mb-4">
      <CardHeader>
        <CardTitle class="text-lg">Emergency Fund Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div class="space-y-2">
            <Label for="monthly-expenses">Monthly Expenses</Label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">&#8369;</span>
              <Input
                id="monthly-expenses"
                v-model.number="monthlyExpenses"
                type="number"
                step="1000"
                class="pl-7"
                @update:model-value="calculateEmergencyFund"
              />
            </div>
          </div>
          <div class="space-y-2">
            <Label for="emergency-months">Months Coverage</Label>
            <Select
              :model-value="String(emergencyMonths)"
              @update:model-value="(val) => { emergencyMonths = Number(val); calculateEmergencyFund(); }"
            >
              <SelectTrigger id="emergency-months">
                <SelectValue placeholder="Select months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="9">9</SelectItem>
                <SelectItem value="12">12</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card class="border bg-red-50 dark:bg-red-950/20">
          <CardContent class="pt-6">
            <div class="text-center">
              <Shield class="w-8 h-8 mx-auto mb-2 text-red-500" />
              <div class="text-lg font-bold">{{ formatCurrency(emergencyFundTarget) }}</div>
              <div class="text-xs text-muted-foreground">Recommended Emergency Fund</div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>

    <!-- Debt Payoff Planner -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="text-lg">Debt Payoff Planner</CardTitle>
          <Button variant="ghost" size="sm" @click="showAddDebtSheet = true">
            <Plus class="w-4 h-4 mr-1" />
            Add Debt
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="debts.length === 0" class="text-center text-muted-foreground py-8">
          <CircleDollarSign class="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <div class="text-lg font-semibold">No Debts Tracked</div>
          <div class="text-sm text-muted-foreground">Add your debts to create a payoff plan</div>
        </div>

        <div
          v-for="debt in debts"
          :key="debt.id"
          class="mb-4 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <Card class="border p-4">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white mr-4 shrink-0">
                <CreditCard class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium">{{ debt.name }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ debt.type }} &bull; {{ debt.interestRate }}% APR
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold">{{ formatCurrency(debt.balance) }}</div>
                <div class="text-xs text-muted-foreground">
                  Min: {{ formatCurrency(debt.minPayment) }}
                </div>
              </div>
            </div>

            <!-- Debt progress bar -->
            <div class="w-full h-2 bg-muted rounded-full mb-2 overflow-hidden">
              <div
                class="h-full rounded-full bg-green-500 transition-all duration-300"
                :style="{ width: Math.min((1 - debt.balance / debt.originalBalance) * 100, 100) + '%' }"
              />
            </div>

            <div class="flex items-center justify-between">
              <div class="text-xs text-muted-foreground">
                {{ Math.round((1 - debt.balance / debt.originalBalance) * 100) }}% paid off
              </div>
              <div class="text-xs text-muted-foreground">{{ debt.payoffMonths }} months remaining</div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- Add Goal Sheet (bottom) -->
    <Sheet v-model:open="showAddGoalSheet">
      <SheetContent side="bottom" class="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Financial Goal</SheetTitle>
          <SheetDescription>Create a new savings goal to track your progress.</SheetDescription>
        </SheetHeader>

        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="goal-name">Goal Name</Label>
            <Input id="goal-name" v-model="newGoal.name" placeholder="e.g. Emergency Fund" />
          </div>

          <div class="space-y-2">
            <Label for="goal-desc">Description</Label>
            <Textarea id="goal-desc" v-model="newGoal.description" placeholder="Describe your goal..." rows="2" />
          </div>

          <div class="space-y-2">
            <Label for="goal-target">Target Amount</Label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">&#8369;</span>
              <Input
                id="goal-target"
                v-model.number="newGoal.targetAmount"
                type="number"
                step="1000"
                class="pl-7"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="goal-date">Target Date</Label>
            <Input id="goal-date" v-model="newGoal.targetDate" type="date" />
          </div>

          <div class="space-y-2">
            <Label for="goal-icon">Icon</Label>
            <Select v-model="newGoal.icon">
              <SelectTrigger id="goal-icon">
                <SelectValue placeholder="Select icon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="icon in goalIcons" :key="icon" :value="icon">{{ icon }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="goal-color">Color</Label>
            <Select v-model="newGoal.color">
              <SelectTrigger id="goal-color">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="color in goalColors" :key="color" :value="color">{{ color }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter class="flex gap-2 sm:justify-end">
          <Button variant="outline" @click="showAddGoalSheet = false">Cancel</Button>
          <Button @click="addGoal">Add Goal</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>

    <!-- Add Debt Sheet (bottom) -->
    <Sheet v-model:open="showAddDebtSheet">
      <SheetContent side="bottom" class="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Debt</SheetTitle>
          <SheetDescription>Track a new debt to create a payoff plan.</SheetDescription>
        </SheetHeader>

        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="debt-name">Debt Name</Label>
            <Input id="debt-name" v-model="newDebt.name" placeholder="e.g. Credit Card" />
          </div>

          <div class="space-y-2">
            <Label for="debt-type">Debt Type</Label>
            <Select v-model="newDebt.type">
              <SelectTrigger id="debt-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="dt in debtTypes" :key="dt" :value="dt">{{ dt }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="debt-balance">Current Balance</Label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">&#8369;</span>
              <Input
                id="debt-balance"
                v-model.number="newDebt.balance"
                type="number"
                step="1000"
                class="pl-7"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="debt-rate">Interest Rate</Label>
            <div class="relative">
              <Input
                id="debt-rate"
                v-model.number="newDebt.interestRate"
                type="number"
                step="0.1"
                class="pr-7"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="debt-min">Minimum Payment</Label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">&#8369;</span>
              <Input
                id="debt-min"
                v-model.number="newDebt.minPayment"
                type="number"
                step="100"
                class="pl-7"
              />
            </div>
          </div>
        </div>

        <SheetFooter class="flex gap-2 sm:justify-end">
          <Button variant="outline" @click="showAddDebtSheet = false">Cancel</Button>
          <Button @click="addDebt">Add Debt</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { toast } from 'vue-sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import {
  CheckCircle2,
  TrendingUp,
  PiggyBank,
  Shield,
  Car,
  Plane,
  Flag,
  MoreVertical,
  Plus,
  Eye,
  CreditCard,
  CircleDollarSign,
  Home,
  GraduationCap,
  Stethoscope,
  Briefcase,
  Gamepad2,
} from 'lucide-vue-next';

// Icon mapping from old Quasar material icons to Lucide components
const iconMap: Record<string, any> = {
  savings: PiggyBank,
  security: Shield,
  directions_car: Car,
  flight: Plane,
  home: Home,
  school: GraduationCap,
  medical_services: Stethoscope,
  business: Briefcase,
  sports_esports: Gamepad2,
  flag: Flag,
};

// Color mapping for goal avatar circles
const colorClassMap: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  teal: 'bg-teal-500',
  indigo: 'bg-indigo-500',
  pink: 'bg-pink-500',
};

const goalIconComponent = (iconName: string) => {
  return iconMap[iconName] || Flag;
};

const goalColorClass = (color: string) => {
  return colorClassMap[color] || 'bg-blue-500';
};

// Static data for future backend integration
const goals = ref([
  {
    id: 1,
    name: 'Emergency Fund',
    description: '6 months of expenses for financial security',
    targetAmount: 300000,
    currentAmount: 125000,
    targetDate: new Date('2025-12-31'),
    icon: 'security',
    color: 'red',
    status: 'active',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 2,
    name: 'New Car',
    description: 'Down payment for a new car',
    targetAmount: 200000,
    currentAmount: 45000,
    targetDate: new Date('2025-08-15'),
    icon: 'directions_car',
    color: 'blue',
    status: 'active',
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 3,
    name: 'Vacation to Japan',
    description: 'Family trip to Tokyo',
    targetAmount: 150000,
    currentAmount: 150000,
    targetDate: new Date('2025-03-20'),
    icon: 'flight',
    color: 'green',
    status: 'completed',
    createdAt: new Date('2024-10-01'),
  },
]);

const debts = ref([
  {
    id: 1,
    name: 'Credit Card',
    type: 'Credit Card',
    balance: 45000,
    originalBalance: 80000,
    interestRate: 24.0,
    minPayment: 2500,
    payoffMonths: 18,
  },
  {
    id: 2,
    name: 'Personal Loan',
    type: 'Personal Loan',
    balance: 120000,
    originalBalance: 200000,
    interestRate: 12.5,
    minPayment: 8500,
    payoffMonths: 14,
  },
]);

const showAddGoalSheet = ref(false);
const showAddDebtSheet = ref(false);

const newGoal = ref({
  name: '',
  description: '',
  targetAmount: null as number | null,
  targetDate: new Date().toISOString().split('T')[0],
  icon: 'savings',
  color: 'blue',
});

const newDebt = ref({
  name: '',
  type: 'Credit Card',
  balance: null as number | null,
  interestRate: null as number | null,
  minPayment: null as number | null,
});

const monthlyExpenses = ref(50000);
const emergencyMonths = ref(6);
const emergencyFundTarget = ref(300000);

const goalIcons = [
  'savings',
  'home',
  'directions_car',
  'flight',
  'school',
  'medical_services',
  'business',
  'sports_esports',
];
const goalColors = ['blue', 'green', 'red', 'orange', 'purple', 'teal', 'indigo', 'pink'];
const debtTypes = [
  'Credit Card',
  'Personal Loan',
  'Auto Loan',
  'Home Loan',
  'Student Loan',
  'Other',
];

const completedGoals = computed(() => goals.value.filter((g) => g.status === 'completed').length);
const activeGoals = computed(() => goals.value.filter((g) => g.status === 'active').length);
const totalSaved = computed(() => goals.value.reduce((sum, goal) => sum + goal.currentAmount, 0));

const activeGoalsList = computed(() => goals.value.filter((g) => g.status === 'active'));

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount);
};

const getDaysRemaining = (targetDate: Date) => {
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const getProgressBarColor = (progress: number) => {
  if (progress >= 0.8) return 'bg-green-500';
  if (progress >= 0.5) return 'bg-orange-500';
  return 'bg-red-500';
};

const calculateEmergencyFund = () => {
  emergencyFundTarget.value = monthlyExpenses.value * emergencyMonths.value;
};

const addGoal = () => {
  if (!newGoal.value.name || !newGoal.value.targetAmount || !newGoal.value.targetDate) {
    return;
  }

  const goal = {
    id: Date.now(),
    name: newGoal.value.name,
    description: newGoal.value.description,
    targetAmount: parseFloat(String(newGoal.value.targetAmount)),
    currentAmount: 0,
    targetDate: new Date(newGoal.value.targetDate),
    icon: newGoal.value.icon,
    color: newGoal.value.color,
    status: 'active',
    createdAt: new Date(),
  };

  goals.value.push(goal);

  // Reset form
  newGoal.value = {
    name: '',
    description: '',
    targetAmount: null,
    targetDate: new Date().toISOString().split('T')[0],
    icon: 'savings',
    color: 'blue',
  };

  showAddGoalSheet.value = false;

  toast.success('Goal added successfully');
};

const addDebt = () => {
  if (
    !newDebt.value.name ||
    !newDebt.value.balance ||
    !newDebt.value.interestRate ||
    !newDebt.value.minPayment
  ) {
    return;
  }

  const debt = {
    id: Date.now(),
    name: newDebt.value.name,
    type: newDebt.value.type,
    balance: parseFloat(String(newDebt.value.balance)),
    originalBalance: parseFloat(String(newDebt.value.balance)),
    interestRate: parseFloat(String(newDebt.value.interestRate)),
    minPayment: parseFloat(String(newDebt.value.minPayment)),
    payoffMonths: calculatePayoffMonths(
      newDebt.value.balance,
      newDebt.value.interestRate,
      newDebt.value.minPayment,
    ),
  };

  debts.value.push(debt);

  // Reset form
  newDebt.value = {
    name: '',
    type: 'Credit Card',
    balance: null,
    interestRate: null,
    minPayment: null,
  };

  showAddDebtSheet.value = false;

  toast.success('Debt added successfully');
};

const calculatePayoffMonths = (balance: number, interestRate: number, minPayment: number) => {
  const monthlyRate = interestRate / 100 / 12;
  if (monthlyRate === 0) return Math.ceil(balance / minPayment);

  const months = Math.log(1 + (balance * monthlyRate) / minPayment) / Math.log(1 + monthlyRate);
  return Math.ceil(months);
};

const addMoney = (goal: any) => {
  // This would open a dialog to add money to the goal
  console.log('Add money to goal:', goal);
};

const editGoal = (goal: any) => {
  // This would open an edit dialog
  console.log('Edit goal:', goal);
};

const viewGoalDetails = (goal: any) => {
  // This would show detailed goal information
  console.log('View goal details:', goal);
};

onMounted(() => {
  calculateEmergencyFund();
});
</script>
