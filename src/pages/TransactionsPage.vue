<!-- src/pages/TransactionsPage.vue -->
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useAccounts } from 'src/composables/useAccounts';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency } from 'src/utilities/currency';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, startOfYear, endOfYear } from 'date-fns';
import { CreateTransactionDto, Transaction, TransactionFilters, TransactionType } from 'src/types/transaction.types';
import { useCategories } from 'src/composables/useCategories';
import { useTransactionsStore } from 'src/stores/transactions';
import BulkTransactionDialog from 'src/components/BulkTransactionDialog.vue';

// shadcn-vue
import { Card, CardContent } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Separator } from 'src/components/ui/separator';
import { Badge } from 'src/components/ui/badge';
import { Checkbox } from 'src/components/ui/checkbox';
import { Textarea } from 'src/components/ui/textarea';
import { ScrollArea, ScrollBar } from 'src/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from 'src/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from 'src/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';

// Lucide icons
import {
  Plus,
  Search,
  Filter,
  Loader2,
  Receipt,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  List,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  History,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  CheckCircle,
  Clock,
  Info,
} from 'lucide-vue-next';

const settingsStore = useSettingsStore();

// Reactive filters
const filters = ref<TransactionFilters>({
  sort_by: 'date',
  sort_direction: 'desc',
  per_page: 100,
});

// Store
const transactionsStore = useTransactionsStore();

// Composables
const { data: accountsData } = useAccounts();
const { data: categoriesData } = useCategories();

// Local state
const showTransactionDialog = ref(false);
const showBulkTransactionDialog = ref(false);
const showFilterDialog = ref(false);
const showSearchDialog = ref(false);
const selectedTransaction = ref<Transaction | null>(null);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(20);
const selectedQuickFilter = ref('all');

// Filter form
const filterForm = ref({
  type: null as 'income' | 'expense' | 'transfer' | null,
  account_id: null as number | null,
  category_id: null as number | null,
  start_date: null as string | null,
  end_date: null as string | null,
  min_amount: null as number | null,
  max_amount: null as number | null,
  is_recurring: null as boolean | null,
  is_cleared: null as boolean | null,
  search: '',
  tags: [] as string[],
});

// Transaction form
const transactionForm = ref<CreateTransactionDto & { id?: number }>({
  account_id: 0,
  category_id: 0,
  amount: 0,
  type: 'expense',
  date: format(new Date(), 'yyyy-MM-dd'),
  description: '',
  notes: '',
  tags: [],
  is_recurring: false,
  recurring_type: null,
  recurring_interval: 1,
  recurring_end_date: null,
});

// Computed
const settings = computed(() => settingsStore.settings);

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredTransactions.value.slice(start, end);
});

const transactions = computed(() => transactionsStore.transactions || []);
const accounts = computed(() => accountsData.value || []);
const categories = computed(() => categoriesData.value || []);
const totalTransactions = computed(() => transactionsStore.meta?.total || 0);
const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / itemsPerPage.value));

const hasActiveFilters = computed(() => {
  return !!(
    filters.value.type ||
    filters.value.category_id ||
    filters.value.account_id ||
    filters.value.start_date ||
    filters.value.end_date ||
    filters.value.min_amount ||
    filters.value.max_amount ||
    filters.value.is_recurring !== undefined ||
    filters.value.is_cleared !== undefined ||
    filters.value.search
  );
});

const filteredTransactions = computed(() => {
  let result = [...transactions.value];
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(t =>
      t.description?.toLowerCase().includes(query) ||
      t.notes?.toLowerCase().includes(query) ||
      t.category?.name.toLowerCase().includes(query)
    );
  }
  return result;
});

const transactionTypeOptions = [
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
  { label: 'Transfer', value: 'transfer' },
];

const accountOptions = computed(() =>
  accounts.value.map(a => ({ label: a.name, value: a.id }))
);

const categoryOptions = computed(() =>
  categories.value.map(c => ({ label: c.name, value: c.id }))
);

const quickFilters = [
  { label: 'All', value: 'all', icon: List },
  { label: 'Today', value: 'today', icon: CalendarDays },
  { label: 'This Week', value: 'thisWeek', icon: CalendarRange },
  { label: 'This Month', value: 'thisMonth', icon: CalendarClock },
  { label: 'Last Month', value: 'lastMonth', icon: History },
  { label: 'This Year', value: 'thisYear', icon: Calendar },
  { label: 'Income', value: 'income', icon: ArrowDownLeft },
  { label: 'Expenses', value: 'expenses', icon: ArrowUpRight },
  { label: 'Recurring', value: 'recurring', icon: Repeat },
  { label: 'Cleared', value: 'cleared', icon: CheckCircle },
  { label: 'Uncleared', value: 'uncleared', icon: Clock },
];

const getIntervalLabel = computed(() => {
  switch (transactionForm.value.recurring_type) {
    case 'weekly': return 'Week(s)';
    case 'monthly': return 'Month(s)';
    case 'quarterly': return 'Quarter(s)';
    case 'yearly': return 'Year(s)';
    default: return 'Interval';
  }
});

// Methods
const formatTransactionAmount = (amount: number, type: TransactionType) => {
  const prefix = type === 'income' ? '+' : '-';
  if (settingsStore.settings.showBalances) {
    return `${prefix}${formatCurrency(Math.abs(amount), settingsStore.settings.currency)}`;
  }
  return `${prefix}${settingsStore.settings.currencySymbol}****`;
};

const formatTransactionDate = (date: string) => {
  return format(new Date(date), 'MMM dd, yyyy');
};

const openTransactionDialog = (transaction?: Transaction) => {
  if (transaction) {
    selectedTransaction.value = transaction;
    transactionForm.value = {
      id: transaction.id,
      account_id: transaction.account_id,
      category_id: transaction.category_id,
      amount: Math.abs(transaction.amount),
      type: transaction.type,
      date: transaction.date,
      description: transaction.description || '',
      notes: transaction.notes || '',
      tags: transaction.tags || [],
      is_recurring: transaction.is_recurring,
      recurring_type: transaction.recurring_type || null,
      recurring_interval: transaction.recurring_interval || 1,
      recurring_end_date: transaction.recurring_end_date || null,
    };
  } else {
    selectedTransaction.value = null;
    transactionForm.value = {
      account_id: accounts.value[0]?.id || 0,
      category_id: categories.value[0]?.id || 0,
      amount: 0,
      type: 'expense',
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      notes: '',
      tags: [],
      is_recurring: false,
      recurring_type: null,
      recurring_interval: 1,
      recurring_end_date: null,
    };
  }
  showTransactionDialog.value = true;
};

const saveTransaction = async () => {
  if (transactionForm.value.is_recurring && !transactionForm.value.recurring_type) {
    return;
  }

  try {
    const formData = { ...transactionForm.value };
    if (!formData.is_recurring) {
      formData.recurring_type = null;
      formData.recurring_interval = null;
      formData.recurring_end_date = null;
    }

    if (selectedTransaction.value) {
      const { id, ...updateData } = formData;
      await transactionsStore.updateTransaction(id as number, updateData);
    } else {
      const { id, ...createData } = formData;
      await transactionsStore.createTransaction(createData);
    }
    showTransactionDialog.value = false;
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
};

const deleteTransaction = async (transaction: Transaction) => {
  if (confirm(`Are you sure you want to delete "${transaction.description}"?`)) {
    await transactionsStore.deleteTransaction(transaction.id);
  }
};

const duplicateTransaction = (transaction: Transaction) => {
  openTransactionDialog({
    ...transaction,
    id: 0,
    description: `${transaction.description} (Copy)`,
  } as Transaction);
};

const onBulkTransactionsSaved = () => {
  transactionsStore.fetchTransactions();
};

const openFilterDialog = () => {
  filterForm.value = {
    type: filters.value.type || null,
    account_id: filters.value.account_id || null,
    category_id: filters.value.category_id || null,
    start_date: filters.value.start_date || null,
    end_date: filters.value.end_date || null,
    min_amount: filters.value.min_amount || null,
    max_amount: filters.value.max_amount || null,
    is_recurring: filters.value.is_recurring ?? null,
    is_cleared: filters.value.is_cleared ?? null,
    search: filters.value.search || '',
    tags: filters.value.tags || [],
  };
  showFilterDialog.value = true;
};

const applyFilters = () => {
  filters.value = {
    ...filters.value,
    type: filterForm.value.type || undefined,
    account_id: filterForm.value.account_id || undefined,
    category_id: filterForm.value.category_id || undefined,
    start_date: filterForm.value.start_date || undefined,
    end_date: filterForm.value.end_date || undefined,
    min_amount: filterForm.value.min_amount || undefined,
    max_amount: filterForm.value.max_amount || undefined,
    is_recurring: filterForm.value.is_recurring ?? undefined,
    is_cleared: filterForm.value.is_cleared ?? undefined,
    search: filterForm.value.search || undefined,
  };
  showFilterDialog.value = false;
  transactionsStore.fetchTransactions(filters.value);
};

const clearFilters = () => {
  filterForm.value = {
    type: null, account_id: null, category_id: null,
    start_date: null, end_date: null, min_amount: null,
    max_amount: null, is_recurring: null, is_cleared: null,
    search: '', tags: [],
  };
  filters.value = { sort_by: 'date', sort_direction: 'desc', per_page: 100 };
  selectedQuickFilter.value = 'all';
  showFilterDialog.value = false;
  transactionsStore.fetchTransactions(filters.value);
};

const applyQuickFilter = (filterValue: string) => {
  selectedQuickFilter.value = filterValue;
  const today = new Date();

  switch (filterValue) {
    case 'all': clearFilters(); break;
    case 'today':
      filters.value = { ...filters.value, start_date: undefined, end_date: undefined, type: undefined, is_recurring: undefined, is_cleared: undefined };
      break;
    case 'thisWeek':
      filters.value = { ...filters.value, start_date: format(startOfWeek(today), 'yyyy-MM-dd'), end_date: format(endOfWeek(today), 'yyyy-MM-dd'), type: undefined, is_recurring: undefined, is_cleared: undefined };
      break;
    case 'thisMonth':
      filters.value = { ...filters.value, start_date: format(startOfMonth(today), 'yyyy-MM-dd'), end_date: format(endOfMonth(today), 'yyyy-MM-dd'), type: undefined, is_recurring: undefined, is_cleared: undefined };
      break;
    case 'lastMonth': {
      const lastMonth = subMonths(today, 1);
      filters.value = { ...filters.value, start_date: format(startOfMonth(lastMonth), 'yyyy-MM-dd'), end_date: format(endOfMonth(lastMonth), 'yyyy-MM-dd'), type: undefined, is_recurring: undefined, is_cleared: undefined };
      break;
    }
    case 'thisYear':
      filters.value = { ...filters.value, start_date: format(startOfYear(today), 'yyyy-MM-dd'), end_date: format(endOfYear(today), 'yyyy-MM-dd'), type: undefined, is_recurring: undefined, is_cleared: undefined };
      break;
    case 'income':
      filters.value = { ...filters.value, type: 'income', is_recurring: undefined, is_cleared: undefined };
      break;
    case 'expenses':
      filters.value = { ...filters.value, type: 'expense', is_recurring: undefined, is_cleared: undefined };
      break;
    case 'recurring':
      filters.value = { ...filters.value, is_recurring: true, type: undefined, is_cleared: undefined };
      break;
    case 'cleared':
      filters.value = { ...filters.value, is_cleared: true, type: undefined, is_recurring: undefined };
      break;
    case 'uncleared':
      filters.value = { ...filters.value, is_cleared: false, type: undefined, is_recurring: undefined };
      break;
  }
  transactionsStore.fetchTransactions(filters.value);
};

const applySearch = () => {
  filters.value = { ...filters.value, search: searchQuery.value || undefined };
  showSearchDialog.value = false;
  transactionsStore.fetchTransactions(filters.value);
};

const clearSearch = () => {
  searchQuery.value = '';
  filters.value = { ...filters.value, search: undefined };
  showSearchDialog.value = false;
  transactionsStore.fetchTransactions(filters.value);
};

// Watchers
watch(() => transactionForm.value.is_recurring, (isRecurring) => {
  if (!isRecurring) {
    transactionForm.value.recurring_type = null;
    transactionForm.value.recurring_interval = 1;
    transactionForm.value.recurring_end_date = null;
  } else {
    if (!transactionForm.value.recurring_type) transactionForm.value.recurring_type = 'monthly';
    if (!transactionForm.value.recurring_interval) transactionForm.value.recurring_interval = 1;
  }
});

watch(filters, () => { currentPage.value = 1; }, { deep: true });

onMounted(async () => {
  await transactionsStore.fetchTransactions(filters.value);
});
</script>

<template>
  <div class="min-h-screen bg-muted/30">
    <div class="p-4 space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold">Transactions</h2>
          <p class="text-sm text-muted-foreground">
            {{ totalTransactions }} transactions found
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="icon" @click="showSearchDialog = true">
            <Search class="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" class="relative" @click="openFilterDialog">
            <Filter class="w-4 h-4" />
            <span
              v-if="hasActiveFilters"
              class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"
            />
          </Button>
          <Button @click="openTransactionDialog()">
            <Plus class="w-4 h-4 mr-1" />
            <span class="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>

      <!-- Quick Filters -->
      <ScrollArea class="w-full whitespace-nowrap">
        <div class="flex gap-2 pb-2">
          <button
            v-for="qf in quickFilters"
            :key="qf.value"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0',
              selectedQuickFilter === qf.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            ]"
            @click="applyQuickFilter(qf.value)"
          >
            <component :is="qf.icon" class="w-3.5 h-3.5" />
            {{ qf.label }}
          </button>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <!-- Transaction List -->
      <Card>
        <CardContent class="p-0">
          <!-- Loading -->
          <div v-if="transactionsStore.loading" class="flex flex-col items-center justify-center py-16">
            <Loader2 class="w-12 h-12 text-primary animate-spin" />
            <p class="mt-3 text-sm text-muted-foreground">Loading transactions...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredTransactions.length === 0" class="flex flex-col items-center justify-center py-16 space-y-3">
            <Receipt class="w-16 h-16 text-muted-foreground/40" />
            <div class="text-lg font-medium text-muted-foreground">No transactions found</div>
            <p class="text-sm text-muted-foreground">
              {{ hasActiveFilters ? 'Try adjusting your filters' : 'Start by adding your first transaction' }}
            </p>
            <Button v-if="!hasActiveFilters" @click="openTransactionDialog()">
              <Plus class="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>

          <!-- Transaction Items -->
          <div v-else class="divide-y">
            <div
              v-for="transaction in paginatedTransactions"
              :key="transaction.id"
              class="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <!-- Category Avatar -->
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full shrink-0 text-white text-sm font-medium"
                :style="{ backgroundColor: transaction.category?.color || '#6366f1' }"
              >
                {{ (transaction.category?.name || '?').charAt(0).toUpperCase() }}
              </div>

              <!-- Details -->
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate text-sm">
                  {{ transaction.description }}
                </div>
                <div class="text-xs text-muted-foreground truncate">
                  {{ transaction.category?.name || 'Uncategorized' }} &bull; {{ transaction.account?.name }}
                </div>
                <div class="flex items-center gap-1 mt-0.5 flex-wrap">
                  <span class="text-xs text-muted-foreground">
                    {{ formatTransactionDate(transaction.date) }}
                  </span>
                  <Badge v-if="transaction.is_recurring" variant="secondary" class="text-[10px] px-1.5 py-0 h-4">
                    <Repeat class="w-2.5 h-2.5 mr-0.5" />
                    Recurring
                  </Badge>
                  <Badge v-if="transaction.is_cleared" variant="secondary" class="text-[10px] px-1.5 py-0 h-4 text-green-600">
                    <CheckCircle class="w-2.5 h-2.5 mr-0.5" />
                    Cleared
                  </Badge>
                </div>
              </div>

              <!-- Amount & Actions -->
              <div class="flex items-center gap-1 shrink-0">
                <span
                  :class="[
                    'text-sm font-bold',
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  ]"
                >
                  {{ formatTransactionAmount(transaction.amount, transaction.type) }}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="h-8 w-8">
                      <MoreVertical class="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="openTransactionDialog(transaction)">
                      <Pencil class="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="duplicateTransaction(transaction)">
                      <Copy class="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="text-destructive" @click="deleteTransaction(transaction)">
                      <Trash2 class="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="filteredTransactions.length > 0" class="flex items-center justify-center gap-2 p-4 border-t">
            <Button
              variant="outline"
              size="icon"
              class="h-8 w-8"
              :disabled="currentPage <= 1"
              @click="currentPage--"
            >
              <ChevronLeft class="w-4 h-4" />
            </Button>
            <span class="text-sm text-muted-foreground px-2">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <Button
              variant="outline"
              size="icon"
              class="h-8 w-8"
              :disabled="currentPage >= totalPages"
              @click="currentPage++"
            >
              <ChevronRight class="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Transaction Form Sheet -->
    <Sheet v-model:open="showTransactionDialog">
      <SheetContent side="bottom" class="h-[92vh] rounded-t-2xl">
        <SheetHeader class="text-center pb-2">
          <SheetTitle class="text-xl font-bold">
            {{ selectedTransaction ? 'Edit Transaction' : 'New Transaction' }}
          </SheetTitle>
          <SheetDescription class="sr-only">
            {{ selectedTransaction ? 'Edit transaction details' : 'Create a new transaction' }}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea class="h-[calc(92vh-140px)] pr-4">
          <div class="space-y-4 pb-6">
            <!-- Account & Category -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <Label class="text-xs">Account</Label>
                <Select v-model="transactionForm.account_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="opt in accountOptions"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1.5">
                <Label class="text-xs">Category</Label>
                <Select v-model="transactionForm.category_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="opt in categoryOptions"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- Amount & Type -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <Label class="text-xs">Amount</Label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {{ settings.currencySymbol }}
                  </span>
                  <Input
                    v-model.number="transactionForm.amount"
                    type="number"
                    step="0.01"
                    class="pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div class="space-y-1.5">
                <Label class="text-xs">Type</Label>
                <Select v-model="transactionForm.type">
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="opt in transactionTypeOptions"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- Date -->
            <div class="space-y-1.5">
              <Label class="text-xs">Date</Label>
              <Input v-model="transactionForm.date" type="date" />
            </div>

            <!-- Description -->
            <div class="space-y-1.5">
              <Label class="text-xs">Description</Label>
              <Input v-model="transactionForm.description" placeholder="What was this for?" />
            </div>

            <!-- Notes -->
            <div class="space-y-1.5">
              <Label class="text-xs">Notes</Label>
              <Textarea v-model="transactionForm.notes" placeholder="Additional notes..." rows="2" />
            </div>

            <Separator />

            <!-- Recurring Toggle -->
            <div class="flex items-center gap-2">
              <Checkbox
                :checked="transactionForm.is_recurring"
                @update:checked="transactionForm.is_recurring = $event"
              />
              <Label class="text-sm cursor-pointer" @click="transactionForm.is_recurring = !transactionForm.is_recurring">
                Recurring Transaction
              </Label>
            </div>

            <!-- Recurring Fields -->
            <template v-if="transactionForm.is_recurring">
              <div class="rounded-lg bg-blue-50 p-3 flex items-start gap-2">
                <Info class="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p class="text-xs text-blue-800">
                  This transaction will automatically repeat based on the settings below.
                </p>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <Label class="text-xs">Frequency</Label>
                  <Select v-model="transactionForm.recurring_type">
                    <SelectTrigger>
                      <SelectValue placeholder="Frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-1.5">
                  <Label class="text-xs">Every</Label>
                  <div class="relative">
                    <Input
                      v-model.number="transactionForm.recurring_interval"
                      type="number"
                      min="1"
                      max="12"
                      class="pr-16"
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {{ getIntervalLabel }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="space-y-1.5">
                <Label class="text-xs">End Date (Optional)</Label>
                <Input v-model="transactionForm.recurring_end_date" type="date" />
              </div>

              <!-- Summary Card -->
              <Card class="bg-muted/50">
                <CardContent class="p-3">
                  <p class="text-xs text-muted-foreground">Summary</p>
                  <p class="text-sm">
                    Repeats every
                    <strong>{{ transactionForm.recurring_interval }}</strong>
                    <strong>{{ getIntervalLabel.toLowerCase() }}</strong>
                    <span v-if="transactionForm.recurring_end_date">
                      until <strong>{{ format(new Date(transactionForm.recurring_end_date), 'MMM dd, yyyy') }}</strong>
                    </span>
                    <span v-else> indefinitely</span>
                  </p>
                </CardContent>
              </Card>
            </template>
          </div>
        </ScrollArea>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t">
          <Button variant="outline" @click="showTransactionDialog = false">Cancel</Button>
          <Button @click="saveTransaction" :disabled="transactionsStore.loading">
            <Loader2 v-if="transactionsStore.loading" class="w-4 h-4 mr-2 animate-spin" />
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>

    <!-- Bulk Transaction Dialog -->
    <BulkTransactionDialog
      v-model="showBulkTransactionDialog"
      :accounts="accounts"
      :categories="categories"
      @saved="onBulkTransactionsSaved"
    />

    <!-- Filter Sheet -->
    <Sheet v-model:open="showFilterDialog">
      <SheetContent side="bottom" class="h-[85vh] rounded-t-2xl">
        <SheetHeader class="text-center pb-2">
          <SheetTitle class="text-xl font-bold">Filter Transactions</SheetTitle>
          <SheetDescription class="sr-only">Set filters for transactions</SheetDescription>
        </SheetHeader>

        <ScrollArea class="h-[calc(85vh-140px)] pr-4">
          <div class="space-y-4 pb-6">
            <!-- Type & Account -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <Label class="text-xs">Transaction Type</Label>
                <Select v-model="filterForm.type">
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="opt in transactionTypeOptions"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1.5">
                <Label class="text-xs">Account</Label>
                <Select v-model="filterForm.account_id">
                  <SelectTrigger>
                    <SelectValue placeholder="All accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="opt in accountOptions"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- Category -->
            <div class="space-y-1.5">
              <Label class="text-xs">Category</Label>
              <Select v-model="filterForm.category_id">
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="opt in categoryOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Date Range -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <Label class="text-xs">Start Date</Label>
                <Input v-model="filterForm.start_date" type="date" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-xs">End Date</Label>
                <Input v-model="filterForm.end_date" type="date" />
              </div>
            </div>

            <!-- Amount Range -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <Label class="text-xs">Min Amount</Label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {{ settings.currencySymbol }}
                  </span>
                  <Input v-model.number="filterForm.min_amount" type="number" step="0.01" class="pl-8" />
                </div>
              </div>
              <div class="space-y-1.5">
                <Label class="text-xs">Max Amount</Label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {{ settings.currencySymbol }}
                  </span>
                  <Input v-model.number="filterForm.max_amount" type="number" step="0.01" class="pl-8" />
                </div>
              </div>
            </div>

            <Separator />

            <!-- Recurring Filter -->
            <div class="space-y-2">
              <Label class="text-xs font-medium">Recurring</Label>
              <div class="flex gap-2">
                <Button
                  size="sm"
                  :variant="filterForm.is_recurring === null ? 'default' : 'outline'"
                  @click="filterForm.is_recurring = null"
                >
                  All
                </Button>
                <Button
                  size="sm"
                  :variant="filterForm.is_recurring === true ? 'default' : 'outline'"
                  @click="filterForm.is_recurring = true"
                >
                  Yes
                </Button>
                <Button
                  size="sm"
                  :variant="filterForm.is_recurring === false ? 'default' : 'outline'"
                  @click="filterForm.is_recurring = false"
                >
                  No
                </Button>
              </div>
            </div>

            <!-- Cleared Filter -->
            <div class="space-y-2">
              <Label class="text-xs font-medium">Status</Label>
              <div class="flex gap-2">
                <Button
                  size="sm"
                  :variant="filterForm.is_cleared === null ? 'default' : 'outline'"
                  @click="filterForm.is_cleared = null"
                >
                  All
                </Button>
                <Button
                  size="sm"
                  :variant="filterForm.is_cleared === true ? 'default' : 'outline'"
                  @click="filterForm.is_cleared = true"
                >
                  Cleared
                </Button>
                <Button
                  size="sm"
                  :variant="filterForm.is_cleared === false ? 'default' : 'outline'"
                  @click="filterForm.is_cleared = false"
                >
                  Uncleared
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <!-- Footer -->
        <div class="flex items-center justify-between pt-3 border-t">
          <Button variant="ghost" class="text-muted-foreground" @click="clearFilters">Clear All</Button>
          <div class="flex gap-2">
            <Button variant="outline" @click="showFilterDialog = false">Cancel</Button>
            <Button @click="applyFilters">Apply Filters</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    <!-- Search Dialog -->
    <Dialog v-model:open="showSearchDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search Transactions</DialogTitle>
          <DialogDescription class="sr-only">Search by description, notes, or category</DialogDescription>
        </DialogHeader>

        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search by description, notes, or category..."
            class="pl-9 pr-9"
            @keyup.enter="applySearch"
          />
          <button
            v-if="searchQuery"
            class="absolute right-3 top-1/2 -translate-y-1/2"
            @click="searchQuery = ''"
          >
            <X class="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="outline" @click="clearSearch">Clear</Button>
          <Button @click="applySearch">Search</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
/* All styles are now handled by Tailwind CSS classes */
</style>
