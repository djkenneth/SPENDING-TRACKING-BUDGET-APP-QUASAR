<template>
  <div class="financial-goals-container">
    <!-- Goals Overview -->
    <q-card class="goals-overview-card q-mb-md">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Financial Goals</div>
          <q-btn
            flat
            size="sm"
            color="primary"
            label="Add Goal"
            icon="add"
            @click="showAddGoalDialog = true"
          />
        </div>

        <div class="row q-gutter-md">
          <div class="col-12 col-sm-6 col-md-4">
            <q-card flat bordered class="text-center q-pa-md bg-green-1">
              <q-icon name="check_circle" size="32px" color="green" class="q-mb-sm" />
              <div class="text-h6 text-weight-bold">{{ completedGoals }}</div>
              <div class="text-caption text-grey-7">Completed Goals</div>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-card flat bordered class="text-center q-pa-md bg-orange-1">
              <q-icon name="trending_up" size="32px" color="orange" class="q-mb-sm" />
              <div class="text-h6 text-weight-bold">{{ activeGoals }}</div>
              <div class="text-caption text-grey-7">Active Goals</div>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-card flat bordered class="text-center q-pa-md bg-blue-1">
              <q-icon name="savings" size="32px" color="blue" class="q-mb-sm" />
              <div class="text-h6 text-weight-bold">{{ formatCurrency(totalSaved) }}</div>
              <div class="text-caption text-grey-7">Total Saved</div>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Active Goals -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">Active Goals</div>

        <div
          v-if="goals.filter((g) => g.status === 'active').length === 0"
          class="text-center text-grey-6 q-pa-lg"
        >
          <q-icon name="flag" size="64px" class="q-mb-md" />
          <div class="text-h6">No Active Goals</div>
          <div class="text-caption">Create your first financial goal to get started</div>
        </div>

        <div v-for="goal in activeGoalsList" :key="goal.id" class="goal-card q-mb-md">
          <q-card flat bordered class="q-pa-md">
            <div class="row items-center q-mb-md">
              <q-avatar size="40px" :color="goal.color" text-color="white" class="q-mr-md">
                <q-icon :name="goal.icon" />
              </q-avatar>
              <div class="col">
                <div class="text-subtitle1 text-weight-medium">{{ goal.name }}</div>
                <div class="text-caption text-grey-6">{{ goal.description }}</div>
              </div>
              <div class="text-right">
                <q-btn flat size="sm" round icon="more_vert" @click="editGoal(goal)" />
              </div>
            </div>

            <div class="row items-center q-mb-sm">
              <div class="col">
                <div class="text-caption text-grey-6">Progress</div>
                <div class="text-h6">
                  {{ formatCurrency(goal.currentAmount) }} / {{ formatCurrency(goal.targetAmount) }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-caption text-grey-6">
                  {{ Math.round((goal.currentAmount / goal.targetAmount) * 100) }}%
                </div>
                <div class="text-caption text-grey-6">
                  {{ getDaysRemaining(goal.targetDate) }} days left
                </div>
              </div>
            </div>

            <q-linear-progress
              :value="goal.currentAmount / goal.targetAmount"
              :color="getProgressColor(goal.currentAmount / goal.targetAmount)"
              size="12px"
              rounded
              class="q-mb-md"
            />

            <div class="row q-gutter-sm">
              <q-btn
                flat
                size="sm"
                color="primary"
                label="Add Money"
                icon="add"
                @click="addMoney(goal)"
              />
              <q-btn
                flat
                size="sm"
                color="grey"
                label="View Details"
                icon="visibility"
                @click="viewGoalDetails(goal)"
              />
            </div>
          </q-card>
        </div>
      </q-card-section>
    </q-card>

    <!-- Emergency Fund Calculator -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">Emergency Fund Calculator</div>

        <div class="row q-gutter-md q-mb-md">
          <div class="col">
            <q-input
              v-model.number="monthlyExpenses"
              type="number"
              label="Monthly Expenses"
              prefix="₱"
              step="1000"
              @update:model-value="calculateEmergencyFund"
            />
          </div>
          <div class="col">
            <q-select
              v-model="emergencyMonths"
              :options="[3, 6, 9, 12]"
              label="Months Coverage"
              @update:model-value="calculateEmergencyFund"
            />
          </div>
        </div>

        <q-card flat bordered class="q-pa-md bg-red-1">
          <div class="text-center">
            <q-icon name="security" size="32px" color="red" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold">{{ formatCurrency(emergencyFundTarget) }}</div>
            <div class="text-caption text-grey-7">Recommended Emergency Fund</div>
          </div>
        </q-card>
      </q-card-section>
    </q-card>

    <!-- Debt Payoff Planner -->
    <q-card>
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Debt Payoff Planner</div>
          <q-btn
            flat
            size="sm"
            color="primary"
            label="Add Debt"
            icon="add"
            @click="showAddDebtDialog = true"
          />
        </div>

        <div v-if="debts.length === 0" class="text-center text-grey-6 q-pa-lg">
          <q-icon name="money_off" size="64px" class="q-mb-md" />
          <div class="text-h6">No Debts Tracked</div>
          <div class="text-caption">Add your debts to create a payoff plan</div>
        </div>

        <div v-for="debt in debts" :key="debt.id" class="debt-card q-mb-md">
          <q-card flat bordered class="q-pa-md">
            <div class="row items-center q-mb-md">
              <q-avatar size="40px" color="red" text-color="white" class="q-mr-md">
                <q-icon name="credit_card" />
              </q-avatar>
              <div class="col">
                <div class="text-subtitle1 text-weight-medium">{{ debt.name }}</div>
                <div class="text-caption text-grey-6">
                  {{ debt.type }} • {{ debt.interestRate }}% APR
                </div>
              </div>
              <div class="text-right">
                <div class="text-h6 text-weight-bold">{{ formatCurrency(debt.balance) }}</div>
                <div class="text-caption text-grey-6">
                  Min: {{ formatCurrency(debt.minPayment) }}
                </div>
              </div>
            </div>

            <q-linear-progress
              :value="1 - debt.balance / debt.originalBalance"
              color="green"
              size="8px"
              rounded
              class="q-mb-sm"
            />

            <div class="row items-center justify-between">
              <div class="text-caption text-grey-6">
                {{ Math.round((1 - debt.balance / debt.originalBalance) * 100) }}% paid off
              </div>
              <div class="text-caption text-grey-6">{{ debt.payoffMonths }} months remaining</div>
            </div>
          </q-card>
        </div>
      </q-card-section>
    </q-card>

    <!-- Add Goal Dialog -->
    <q-dialog v-model="showAddGoalDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add Financial Goal</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="q-gutter-md">
            <q-input v-model="newGoal.name" label="Goal Name" required />

            <q-input v-model="newGoal.description" label="Description" type="textarea" rows="2" />

            <q-input
              v-model.number="newGoal.targetAmount"
              label="Target Amount"
              type="number"
              step="1000"
              required
              prefix="₱"
            />

            <q-input v-model="newGoal.targetDate" label="Target Date" type="date" required />

            <q-select v-model="newGoal.icon" :options="goalIcons" label="Icon" required />

            <q-select v-model="newGoal.color" :options="goalColors" label="Color" required />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="showAddGoalDialog = false" />
          <q-btn label="Add Goal" color="primary" @click="addGoal" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add Debt Dialog -->
    <q-dialog v-model="showAddDebtDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add Debt</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="q-gutter-md">
            <q-input v-model="newDebt.name" label="Debt Name" required />

            <q-select v-model="newDebt.type" :options="debtTypes" label="Debt Type" required />

            <q-input
              v-model.number="newDebt.balance"
              label="Current Balance"
              type="number"
              step="1000"
              required
              prefix="₱"
            />

            <q-input
              v-model.number="newDebt.interestRate"
              label="Interest Rate"
              type="number"
              step="0.1"
              required
              suffix="%"
            />

            <q-input
              v-model.number="newDebt.minPayment"
              label="Minimum Payment"
              type="number"
              step="100"
              required
              prefix="₱"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="showAddDebtDialog = false" />
          <q-btn label="Add Debt" color="primary" @click="addDebt" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

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

const showAddGoalDialog = ref(false);
const showAddDebtDialog = ref(false);

const newGoal = ref({
  name: '',
  description: '',
  targetAmount: null,
  targetDate: new Date().toISOString().split('T')[0],
  icon: 'savings',
  color: 'blue',
});

const newDebt = ref({
  name: '',
  type: 'Credit Card',
  balance: null,
  interestRate: null,
  minPayment: null,
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount);
};

const getDaysRemaining = (targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const getProgressColor = (progress) => {
  if (progress >= 0.8) return 'green';
  if (progress >= 0.5) return 'orange';
  return 'red';
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
    targetAmount: parseFloat(newGoal.value.targetAmount),
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

  showAddGoalDialog.value = false;

  $q.notify({
    color: 'positive',
    message: 'Goal added successfully',
    icon: 'check',
  });
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
    balance: parseFloat(newDebt.value.balance),
    originalBalance: parseFloat(newDebt.value.balance),
    interestRate: parseFloat(newDebt.value.interestRate),
    minPayment: parseFloat(newDebt.value.minPayment),
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

  showAddDebtDialog.value = false;

  $q.notify({
    color: 'positive',
    message: 'Debt added successfully',
    icon: 'check',
  });
};

const calculatePayoffMonths = (balance, interestRate, minPayment) => {
  const monthlyRate = interestRate / 100 / 12;
  if (monthlyRate === 0) return Math.ceil(balance / minPayment);

  const months = Math.log(1 + (balance * monthlyRate) / minPayment) / Math.log(1 + monthlyRate);
  return Math.ceil(months);
};

const addMoney = (goal) => {
  // This would open a dialog to add money to the goal
  console.log('Add money to goal:', goal);
};

const editGoal = (goal) => {
  // This would open an edit dialog
  console.log('Edit goal:', goal);
};

const viewGoalDetails = (goal) => {
  // This would show detailed goal information
  console.log('View goal details:', goal);
};

onMounted(() => {
  calculateEmergencyFund();
});
</script>

<style scoped>
.financial-goals-container {
  max-width: 1000px;
  margin: 0 auto;
}

.goals-overview-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.goal-card,
.debt-card {
  transition: transform 0.2s ease;
}

.goal-card:hover,
.debt-card:hover {
  transform: translateY(-2px);
}
</style>
