<!-- src/pages/DebtsPage.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  useDebts,
  useDebtsSummary,
  useCreateDebt,
  useUpdateDebt,
  useDeleteDebt,
  useRecordDebtPayment,
  useMarkDebtPaidOff,
  initializeDebts,
} from 'src/composables/useDebts';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency } from 'src/utilities/currency';
import type { Debt, CreateDebtDto } from 'src/types/debt.types';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Badge } from 'src/components/ui/badge';
import { ScrollArea } from 'src/components/ui/scroll-area';
import { Textarea } from 'src/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from 'src/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from 'src/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import {
  Plus,
  Loader2,
  CreditCard,
  Banknote,
  Home,
  Car,
  BookOpen,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  TrendingDown,
  CircleDollarSign,
  CalendarDays,
  Percent,
} from 'lucide-vue-next';

const settingsStore = useSettingsStore();

const { data: debtsData, isLoading: debtsLoading } = useDebts();
const { data: summaryData } = useDebtsSummary();
const createMutation = useCreateDebt();
const updateMutation = useUpdateDebt();
const deleteMutation = useDeleteDebt();
const paymentMutation = useRecordDebtPayment();
const paidOffMutation = useMarkDebtPaidOff();

onMounted(async () => {
  await initializeDebts();
});

// ── Sheet / Dialog state ───────────────────────────────────────────────────────

const showDebtSheet = ref(false);
const showDeleteDialog = ref(false);
const showPaymentDialog = ref(false);
const selectedDebt = ref<Debt | null>(null);

const emptyDebtForm = (): CreateDebtDto => ({
  name: '',
  type: 'personal_loan',
  original_balance: 0,
  current_balance: 0,
  interest_rate: 0,
  minimum_payment: 0,
  due_date: '',
  payment_frequency: 'monthly',
  status: 'active',
  notes: '',
});

const debtForm = ref<CreateDebtDto>(emptyDebtForm());

const paymentForm = ref({
  amount: 0,
  date: '',
  notes: '',
});

const isEditing = computed(() => selectedDebt.value !== null);

// ── Loading state ─────────────────────────────────────────────────────────────

const loading = computed(() =>
  debtsLoading.value ||
  createMutation.isPending.value ||
  updateMutation.isPending.value ||
  deleteMutation.isPending.value ||
  paymentMutation.isPending.value ||
  paidOffMutation.isPending.value,
);

const showBalances = computed(() => settingsStore.settings.showBalances);

// ── Debt type config ───────────────────────────────────────────────────────────

const debtTypeConfig: Record<Debt['type'], { label: string; icon: typeof CreditCard; color: string }> = {
  credit_card: { label: 'Credit Card', icon: CreditCard, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
  personal_loan: { label: 'Personal Loan', icon: Banknote, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  mortgage: { label: 'Mortgage', icon: Home, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
  auto_loan: { label: 'Auto Loan', icon: Car, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  student_loan: { label: 'Student Loan', icon: BookOpen, color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
};

const debtTypeOptions = Object.entries(debtTypeConfig).map(([value, cfg]) => ({
  value: value as Debt['type'],
  label: cfg.label,
}));

const paymentFrequencyOptions = [
  { value: 'monthly' as const, label: 'Monthly' },
  { value: 'weekly' as const, label: 'Weekly' },
  { value: 'bi-weekly' as const, label: 'Bi-Weekly' },
];

// ── Computed helpers ──────────────────────────────────────────────────────────

const activeDebts = computed(() => (debtsData.value ?? []).filter(d => d.status === 'active'));
const closedDebts = computed(() => (debtsData.value ?? []).filter(d => d.status === 'paid_off' || d.status === 'closed'));

function paidPercent(debt: Debt): number {
  if (!debt.original_balance) return 0;
  const paid = debt.original_balance - debt.current_balance;
  return Math.min(100, Math.max(0, Math.round((paid / debt.original_balance) * 100)));
}

// ── Handlers ──────────────────────────────────────────────────────────────────

function openAddSheet() {
  selectedDebt.value = null;
  debtForm.value = emptyDebtForm();
  showDebtSheet.value = true;
}

function openEditSheet(debt: Debt) {
  selectedDebt.value = debt;
  debtForm.value = {
    name: debt.name,
    type: debt.type,
    original_balance: debt.original_balance,
    current_balance: debt.current_balance,
    interest_rate: debt.interest_rate,
    minimum_payment: debt.minimum_payment,
    due_date: debt.due_date ?? '',
    payment_frequency: debt.payment_frequency ?? 'monthly',
    status: debt.status,
    notes: debt.notes ?? '',
  };
  showDebtSheet.value = true;
}

function openPaymentDialog(debt: Debt) {
  selectedDebt.value = debt;
  paymentForm.value = { amount: debt.minimum_payment, date: '', notes: '' };
  showPaymentDialog.value = true;
}

function openDeleteDialog(debt: Debt) {
  selectedDebt.value = debt;
  showDeleteDialog.value = true;
}

const isSaveDisabled = computed(() =>
  !debtForm.value.name ||
  !debtForm.value.original_balance ||
  !debtForm.value.due_date ||
  createMutation.isPending.value ||
  updateMutation.isPending.value,
);

async function handleSaveDebt() {
  if (isEditing.value && selectedDebt.value) {
    await updateMutation.mutate({ id: selectedDebt.value.id, data: { ...debtForm.value } });
  } else {
    await createMutation.mutate(debtForm.value);
  }
  showDebtSheet.value = false;
}

async function handleRecordPayment() {
  if (!selectedDebt.value) return;
  await paymentMutation.mutate({
    id: selectedDebt.value.id,
    data: {
      amount: paymentForm.value.amount,
      date: paymentForm.value.date || undefined,
      notes: paymentForm.value.notes || undefined,
    },
  });
  showPaymentDialog.value = false;
}

async function handleMarkPaidOff(debt: Debt) {
  await paidOffMutation.mutate(debt.id);
}

async function handleDelete() {
  if (!selectedDebt.value) return;
  await deleteMutation.mutate(selectedDebt.value.id);
  showDeleteDialog.value = false;
}

function maskValue(value: string): string {
  return showBalances.value ? value : '••••••';
}

function statusLabel(status: Debt['status']): string {
  return status === 'paid_off' ? 'Paid Off' : 'Closed';
}
</script>

<template>
  <div class="p-4 lg:p-6 space-y-6">

    <!-- Page Header -->
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Debts</h1>
        <p class="text-sm text-muted-foreground mt-0.5">Track and manage your debt payoff</p>
      </div>
      <Button @click="openAddSheet" :disabled="loading">
        <Plus class="w-4 h-4 mr-2" />
        Add Debt
      </Button>
    </div>

    <!-- Summary Banner -->
    <div v-if="summaryData" class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="col-span-2 lg:col-span-1 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white p-4">
        <div class="flex items-center gap-2 mb-1">
          <TrendingDown class="w-4 h-4 opacity-80" />
          <span class="text-xs font-medium opacity-80">Total Debt</span>
        </div>
        <p class="text-2xl font-bold tracking-tight">
          {{ maskValue(formatCurrency(summaryData.total_debt)) }}
        </p>
        <p class="text-xs opacity-70 mt-1">
          {{ summaryData.active_debts }} active {{ summaryData.active_debts === 1 ? 'debt' : 'debts' }}
        </p>
      </div>

      <div class="rounded-xl bg-card border border-border p-4">
        <div class="flex items-center gap-2 mb-1">
          <CircleDollarSign class="w-4 h-4 text-muted-foreground" />
          <span class="text-xs font-medium text-muted-foreground">Monthly Payment</span>
        </div>
        <p class="text-xl font-bold text-foreground">
          {{ maskValue(formatCurrency(summaryData.monthly_payment_total)) }}
        </p>
      </div>

      <div class="rounded-xl bg-card border border-border p-4">
        <div class="flex items-center gap-2 mb-1">
          <Percent class="w-4 h-4 text-muted-foreground" />
          <span class="text-xs font-medium text-muted-foreground">Avg. Rate</span>
        </div>
        <p class="text-xl font-bold text-foreground">
          {{ summaryData.average_interest_rate }}%
        </p>
      </div>

      <div class="rounded-xl bg-card border border-border p-4">
        <div class="flex items-center gap-2 mb-1">
          <CheckCircle2 class="w-4 h-4 text-muted-foreground" />
          <span class="text-xs font-medium text-muted-foreground">Paid Off</span>
        </div>
        <p class="text-xl font-bold text-foreground">{{ summaryData.paid_off_debts }}</p>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="debtsLoading && !debtsData" class="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 class="w-6 h-6 animate-spin mr-2" />
      Loading debts...
    </div>

    <!-- Empty state -->
    <div v-else-if="!debtsLoading && (debtsData ?? []).length === 0"
      class="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
      <TrendingDown class="w-12 h-12 opacity-30" />
      <p class="font-medium">No debts tracked yet</p>
      <p class="text-sm">Add your first debt to start tracking payoff progress.</p>
      <Button variant="outline" @click="openAddSheet">
        <Plus class="w-4 h-4 mr-2" />
        Add Debt
      </Button>
    </div>

    <!-- Debt list -->
    <div v-else class="space-y-4">

      <!-- Active Debts -->
      <h2 v-if="activeDebts.length" class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Active ({{ activeDebts.length }})
      </h2>

      <div v-for="debt in activeDebts" :key="debt.id"
        class="rounded-xl border border-border bg-card p-4 space-y-3 hover:shadow-sm transition-shadow">

        <!-- Card Header -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div
              :class="['w-10 h-10 rounded-lg flex items-center justify-center shrink-0', debtTypeConfig[debt.type].color]">
              <component :is="debtTypeConfig[debt.type].icon" class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-foreground truncate">{{ debt.name }}</p>
              <span class="text-xs text-muted-foreground">{{ debtTypeConfig[debt.type].label }}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon" class="shrink-0 -mr-1 -mt-1">
                <MoreVertical class="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="openEditSheet(debt)">
                <Pencil class="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem @click="handleMarkPaidOff(debt)">
                <CheckCircle2 class="w-4 h-4 mr-2" />
                Mark as Paid Off
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="text-destructive focus:text-destructive" @click="openDeleteDialog(debt)">
                <Trash2 class="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <!-- Progress bar -->
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-xs text-muted-foreground">Paid off</span>
            <span class="text-xs font-medium text-foreground">{{ paidPercent(debt) }}%</span>
          </div>
          <div class="w-full bg-muted rounded-full h-2">
            <div class="bg-linear-to-r from-red-500 to-rose-400 rounded-full h-2 transition-all"
              :style="{ width: paidPercent(debt) + '%' }" />
          </div>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="bg-muted/50 rounded-lg p-2">
            <p class="text-[10px] text-muted-foreground uppercase tracking-wide">Balance</p>
            <p class="text-sm font-semibold text-foreground mt-0.5">
              {{ maskValue(formatCurrency(debt.current_balance)) }}
            </p>
          </div>
          <div class="bg-muted/50 rounded-lg p-2">
            <p class="text-[10px] text-muted-foreground uppercase tracking-wide">Rate</p>
            <p class="text-sm font-semibold text-foreground mt-0.5">{{ debt.interest_rate }}%</p>
          </div>
          <div class="bg-muted/50 rounded-lg p-2">
            <p class="text-[10px] text-muted-foreground uppercase tracking-wide">Min Pay</p>
            <p class="text-sm font-semibold text-foreground mt-0.5">
              {{ maskValue(formatCurrency(debt.minimum_payment)) }}
            </p>
          </div>
        </div>

        <!-- Footer row -->
        <div class="flex items-center justify-between gap-2 pt-1">
          <div class="flex items-center gap-2 flex-wrap">
            <Badge v-if="debt.due_date" variant="outline" class="text-xs">
              <CalendarDays class="w-3 h-3 mr-1" />
              Due {{ debt.due_date }}
            </Badge>
            <Badge v-if="debt.payment_frequency" variant="secondary" class="text-xs capitalize">
              {{ debt.payment_frequency }}
            </Badge>
          </div>
          <Button size="sm" variant="outline" @click="openPaymentDialog(debt)" :disabled="loading">
            Record Payment
          </Button>
        </div>
      </div>

      <!-- Paid Off / Closed section -->
      <template v-if="closedDebts.length">
        <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider pt-2">
          Completed ({{ closedDebts.length }})
        </h2>
        <div v-for="debt in closedDebts" :key="debt.id"
          class="rounded-xl border border-border bg-card/50 p-4 opacity-60 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div
              :class="['w-9 h-9 rounded-lg flex items-center justify-center shrink-0', debtTypeConfig[debt.type].color]">
              <component :is="debtTypeConfig[debt.type].icon" class="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <p class="font-medium text-foreground truncate">{{ debt.name }}</p>
              <p class="text-xs text-muted-foreground">
                {{ debtTypeConfig[debt.type].label }}
                <span v-if="debt.paid_off_date"> · {{ debt.paid_off_date.slice(0, 10) }}</span>
              </p>
            </div>
          </div>
          <Badge variant="outline" class="shrink-0 text-green-600 border-green-200 dark:border-green-800">
            <CheckCircle2 class="w-3 h-3 mr-1" />
            {{ statusLabel(debt.status) }}
          </Badge>
        </div>
      </template>
    </div>

    <!-- ── Add / Edit Debt Sheet ─────────────────────────────────────────────── -->
    <Sheet v-model:open="showDebtSheet">
      <SheetContent side="bottom" class="h-[92dvh] p-0 flex flex-col gap-0">
        <SheetHeader class="shrink-0 px-6 pt-6 pb-4 border-b">
          <SheetTitle>{{ isEditing ? 'Edit Debt' : 'Add Debt' }}</SheetTitle>
          <SheetDescription class="sr-only">{{ isEditing ? 'Update debt details' : 'Track a new debt' }}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea class="flex-1 min-h-0 px-6">
          <div class="space-y-4 py-4">

            <!-- Name -->
            <div class="space-y-1.5">
              <Label>Debt Name <span class="text-destructive">*</span></Label>
              <Input v-model="debtForm.name" placeholder="e.g. Car Loan" />
            </div>

            <!-- Type + Payment Frequency -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <Label>Type <span class="text-destructive">*</span></Label>
                <Select v-model="debtForm.type">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="opt in debtTypeOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1.5">
                <Label>Frequency <span class="text-destructive">*</span></Label>
                <Select v-model="debtForm.payment_frequency">
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="opt in paymentFrequencyOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- Original Balance + Current Balance -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <Label>Original Balance <span class="text-destructive">*</span></Label>
                <Input type="number" v-model.number="debtForm.original_balance" min="0" step="0.01"
                  placeholder="0.00" />
              </div>
              <div class="space-y-1.5">
                <Label>Current Balance <span class="text-destructive">*</span></Label>
                <Input type="number" v-model.number="debtForm.current_balance" min="0" step="0.01" placeholder="0.00" />
              </div>
            </div>

            <!-- Interest Rate + Minimum Payment -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <Label>Interest Rate (%) <span class="text-destructive">*</span></Label>
                <Input type="number" v-model.number="debtForm.interest_rate" min="0" step="0.01" placeholder="0.00" />
              </div>
              <div class="space-y-1.5">
                <Label>Minimum Payment <span class="text-destructive">*</span></Label>
                <Input type="number" v-model.number="debtForm.minimum_payment" min="0" step="0.01" placeholder="0.00" />
              </div>
            </div>

            <!-- Due Date + Status -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <Label>Due Date <span class="text-destructive">*</span></Label>
                <Input type="date" v-model="debtForm.due_date" />
              </div>
              <div class="space-y-1.5">
                <Label>Status</Label>
                <Select v-model="debtForm.status">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paid_off">Paid Off</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- Notes -->
            <div class="space-y-1.5">
              <Label>Notes</Label>
              <Textarea v-model="debtForm.notes" placeholder="Optional notes" rows="3" />
            </div>

          </div>
        </ScrollArea>

        <!-- Footer -->
        <div class="shrink-0 px-6 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t flex gap-3">
          <Button variant="outline" class="flex-1" @click="showDebtSheet = false">Cancel</Button>
          <Button class="flex-1" :disabled="isSaveDisabled" @click="handleSaveDebt">
            <Loader2 v-if="createMutation.isPending.value || updateMutation.isPending.value"
              class="w-4 h-4 mr-2 animate-spin" />
            {{ isEditing ? 'Save Changes' : 'Add Debt' }}
          </Button>
        </div>
      </SheetContent>
    </Sheet>

    <!-- ── Record Payment Dialog ─────────────────────────────────────────────── -->
    <Dialog v-model:open="showPaymentDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            {{ selectedDebt?.name }}
            <span v-if="selectedDebt" class="ml-1 text-muted-foreground">
              — Balance: {{ formatCurrency(selectedDebt.current_balance) }}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 pt-2">
          <div class="space-y-1.5">
            <Label>Amount <span class="text-destructive">*</span></Label>
            <Input type="number" v-model.number="paymentForm.amount" min="0.01" step="0.01" placeholder="0.00" />
          </div>
          <div class="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" v-model="paymentForm.date" />
          </div>
          <div class="space-y-1.5">
            <Label>Notes</Label>
            <Textarea v-model="paymentForm.notes" placeholder="Optional notes" rows="2" />
          </div>
        </div>

        <DialogFooter class="gap-2">
          <Button variant="outline" @click="showPaymentDialog = false">Cancel</Button>
          <Button :disabled="!paymentForm.amount || paymentMutation.isPending.value" @click="handleRecordPayment">
            <Loader2 v-if="paymentMutation.isPending.value" class="w-4 h-4 mr-2 animate-spin" />
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- ── Delete Confirm Dialog ─────────────────────────────────────────────── -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Debt</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{{ selectedDebt?.name }}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button variant="outline" @click="showDeleteDialog = false">Cancel</Button>
          <Button variant="destructive" :disabled="deleteMutation.isPending.value" @click="handleDelete">
            <Loader2 v-if="deleteMutation.isPending.value" class="w-4 h-4 mr-2 animate-spin" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  </div>
</template>
