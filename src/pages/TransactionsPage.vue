<!-- src/pages/TransactionsPage.vue -->
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAccounts } from 'src/composables/useAccounts';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency } from 'src/utils/currency';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, startOfYear, endOfYear } from 'date-fns';
import { CreateTransactionDto, Transaction, TransactionFilters, TransactionType } from 'src/types/transaction.types';
import { useCategories } from 'src/composables/useCategories';
import { useTransactionsStore } from 'src/stores/transactions';

import BulkTransactionDialog from 'src/components/BulkTransactionDialog.vue';

const $q = useQuasar();
const settingsStore = useSettingsStore();

// Reactive filters with all available options
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
const maximizedToggle = ref(false);

// Filter form for dialog
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

// Recurring type options
const recurringTypeOptions = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
];

// Recurring interval options (1-12)
const recurringIntervalOptions = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}`,
  value: i + 1,
}));

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

const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.value.type) count++;
  if (filters.value.category_id) count++;
  if (filters.value.account_id) count++;
  if (filters.value.start_date) count++;
  if (filters.value.end_date) count++;
  if (filters.value.min_amount) count++;
  if (filters.value.max_amount) count++;
  if (filters.value.is_recurring !== undefined) count++;
  if (filters.value.is_cleared !== undefined) count++;
  if (filters.value.search) count++;
  if (filters.value.tags && filters.value.tags.length > 0) count++;
  return count;
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

const transactionTypeOptions = computed(() => [
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
  { label: 'Transfer', value: 'transfer' },
]);

const accountOptions = computed(() =>
  accounts.value.map(a => ({ label: a.name, value: a.id }))
);

const categoryOptions = computed(() =>
  categories.value.map(c => ({ label: c.name, value: c.id }))
);

const quickFilters = computed(() => [
  { label: 'All', value: 'all', icon: 'list' },
  { label: 'Today', value: 'today', icon: 'today' },
  { label: 'This Week', value: 'thisWeek', icon: 'date_range' },
  { label: 'This Month', value: 'thisMonth', icon: 'calendar_month' },
  { label: 'Last Month', value: 'lastMonth', icon: 'history' },
  { label: 'This Year', value: 'thisYear', icon: 'calendar_today' },
  { label: 'Income', value: 'income', icon: 'arrow_downward', color: 'positive' },
  { label: 'Expenses', value: 'expenses', icon: 'arrow_upward', color: 'negative' },
  { label: 'Recurring', value: 'recurring', icon: 'repeat' },
  { label: 'Cleared', value: 'cleared', icon: 'check_circle' },
  { label: 'Uncleared', value: 'uncleared', icon: 'schedule' },
]);

// Get interval label based on recurring type
const getIntervalLabel = computed(() => {
  switch (transactionForm.value.recurring_type) {
    case 'weekly':
      return 'Week(s)';
    case 'monthly':
      return 'Month(s)';
    case 'quarterly':
      return 'Quarter(s)';
    case 'yearly':
      return 'Year(s)';
    default:
      return 'Interval';
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
  // Validate recurring fields if is_recurring is true
  if (transactionForm.value.is_recurring) {
    if (!transactionForm.value.recurring_type) {
      $q.notify({
        type: 'negative',
        message: 'Please select a recurring frequency',
      });
      return;
    }
    if (!transactionForm.value.recurring_interval || transactionForm.value.recurring_interval < 1) {
      $q.notify({
        type: 'negative',
        message: 'Please select a valid recurring interval',
      });
      return;
    }
  }

  try {
    // Prepare data - clear recurring fields if not recurring
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

    $q.notify({
      type: 'positive',
      message: selectedTransaction.value ? 'Transaction updated successfully' : 'Transaction created successfully',
    });
  } catch (error) {
    console.error('Error saving transaction:', error);
    $q.notify({
      type: 'negative',
      message: 'Error saving transaction',
    });
  }
};

const deleteTransaction = async (transaction: Transaction) => {
  $q.dialog({
    title: 'Delete Transaction',
    message: `Are you sure you want to delete "${transaction.description}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await transactionsStore.deleteTransaction(transaction.id);
  });
};

const duplicateTransaction = (transaction: Transaction) => {
  openTransactionDialog({
    ...transaction,
    id: 0,
    description: `${transaction.description} (Copy)`,
  } as Transaction);
};

const onBulkTransactionsSaved = (count: number) => {
  // Refresh transactions after bulk create
  transactionsStore.fetchTransactions();
};

const openFilterDialog = () => {
  // Load current filters into form
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
    type: null,
    account_id: null,
    category_id: null,
    start_date: null,
    end_date: null,
    min_amount: null,
    max_amount: null,
    is_recurring: null,
    is_cleared: null,
    search: '',
    tags: [],
  };
  filters.value = {
    sort_by: 'date',
    sort_direction: 'desc',
    per_page: 100,
  };
  selectedQuickFilter.value = 'all';
  showFilterDialog.value = false;
  transactionsStore.fetchTransactions(filters.value);
};

const applyQuickFilter = (filterValue: string) => {

  selectedQuickFilter.value = filterValue;

  const today = new Date();

  switch (filterValue) {
    case 'all':
      clearFilters();
      break;

    case 'today':
      filters.value = {
        ...filters.value,
        start_date: undefined,
        end_date: undefined,
        type: undefined,
        is_recurring: undefined,
        is_cleared: undefined,
      };
      break;

    case 'thisWeek':
      filters.value = {
        ...filters.value,
        start_date: format(startOfWeek(today), 'yyyy-MM-dd'),
        end_date: format(endOfWeek(today), 'yyyy-MM-dd'),
        type: undefined,
        is_recurring: undefined,
        is_cleared: undefined,
      };
      break;

    case 'thisMonth':
      filters.value = {
        ...filters.value,
        start_date: format(startOfMonth(today), 'yyyy-MM-dd'),
        end_date: format(endOfMonth(today), 'yyyy-MM-dd'),
        type: undefined,
        is_recurring: undefined,
        is_cleared: undefined,
      };
      break;

    case 'lastMonth':
      const lastMonth = subMonths(today, 1);
      filters.value = {
        ...filters.value,
        start_date: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
        end_date: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
        type: undefined,
        is_recurring: undefined,
        is_cleared: undefined,
      };
      break;

    case 'thisYear':
      filters.value = {
        ...filters.value,
        start_date: format(startOfYear(today), 'yyyy-MM-dd'),
        end_date: format(endOfYear(today), 'yyyy-MM-dd'),
        type: undefined,
        is_recurring: undefined,
        is_cleared: undefined,
      };
      break;

    case 'income':
      filters.value = {
        ...filters.value,
        type: 'income',
        is_recurring: undefined,
        is_cleared: undefined,
      };
      break;

    case 'expenses':
      filters.value = {
        ...filters.value,
        type: 'expense',
        is_recurring: undefined,
        is_cleared: undefined,
      };
      break;

    case 'recurring':
      filters.value = {
        ...filters.value,
        is_recurring: true,
        type: undefined,
        is_cleared: undefined,
      };
      break;

    case 'cleared':
      filters.value = {
        ...filters.value,
        is_cleared: true,
        type: undefined,
        is_recurring: undefined,
      };
      break;

    case 'uncleared':
      filters.value = {
        ...filters.value,
        is_cleared: false,
        type: undefined,
        is_recurring: undefined,
      };
      break;
  }
  transactionsStore.fetchTransactions(filters.value);
};

const applySearch = () => {
  filters.value = {
    ...filters.value,
    search: searchQuery.value || undefined,
  };
  showSearchDialog.value = false;
  transactionsStore.fetchTransactions(filters.value);
};

const clearSearch = () => {
  searchQuery.value = '';
  filters.value = {
    ...filters.value,
    search: undefined,
  };
  showSearchDialog.value = false;
  transactionsStore.fetchTransactions(filters.value);
};

// Watch for recurring checkbox changes to reset fields
watch(
  () => transactionForm.value.is_recurring,
  (isRecurring) => {
    if (!isRecurring) {
      transactionForm.value.recurring_type = null;
      transactionForm.value.recurring_interval = 1;
      transactionForm.value.recurring_end_date = null;
    } else {
      // Set default values when enabling recurring
      if (!transactionForm.value.recurring_type) {
        transactionForm.value.recurring_type = 'monthly';
      }
      if (!transactionForm.value.recurring_interval) {
        transactionForm.value.recurring_interval = 1;
      }
    }
  }
);

// Watch for filter changes to reset pagination
watch(filters, () => {
  currentPage.value = 1;
}, { deep: true });

onMounted(async () => {
  // Initial data fetch
  await transactionsStore.fetchTransactions(filters.value);
});
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Header Section -->
      <div class="col-12">
        <div class="row items-center justify-between">
          <div>
            <h4 class="q-ma-none text-weight-bold">Transactions</h4>
            <p class="text-grey-7 q-mb-none">
              {{ totalTransactions }} transactions found
            </p>
          </div>
          <div class="row q-gutter-sm">
            <q-btn outline color="primary" icon="search" @click="showSearchDialog = true">
              <q-tooltip>Search</q-tooltip>
            </q-btn>
            <q-btn outline color="primary" icon="filter_list" @click="openFilterDialog">
              <q-badge v-if="hasActiveFilters" color="red" floating rounded />
              <q-tooltip>Filter</q-tooltip>
            </q-btn>
            <q-btn color="primary" icon="add" label="Add Transaction" @click="openTransactionDialog()" />
          </div>
        </div>
      </div>

      <!-- Quick Filters -->
      <div class="col-12">
        <q-scroll-area style="height: 50px">
          <div class="row q-gutter-sm no-wrap">
            <q-chip v-for="filter in quickFilters" :key="filter.value" :flat="selectedQuickFilter !== filter.value"
              :color="selectedQuickFilter === filter.value ? filter.color || 'primary' : 'grey-3'"
              :text-color="selectedQuickFilter === filter.value ? 'white' : 'grey-8'" :icon="filter.icon" clickable
              @click="applyQuickFilter(filter.value)">{{ filter.label
              }}</q-chip>
          </div>
        </q-scroll-area>
      </div>

      <!-- Transactions List -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <!-- Transaction List -->
            <div v-if="transactionsStore.loading" class="text-center q-pa-xl">
              <q-spinner-dots color="primary" size="64px" />
              <div class="q-mt-sm text-grey-7">Loading transactions...</div>
            </div>

            <div v-else-if="filteredTransactions.length === 0" class="text-center text-grey-6 q-pa-xl">
              <q-icon name="receipt_long" size="64px" />
              <div class="text-h6 q-mt-md">No transactions found</div>
              <div class="text-body2 q-mb-md">
                {{
                  hasActiveFilters
                    ? 'Try adjusting your filters'
                    : 'Start by adding your first transaction'
                }}
              </div>
              <q-btn v-if="!hasActiveFilters" color="primary" @click="openTransactionDialog()">
                Add Transaction
              </q-btn>
            </div>

            <q-list v-else separator>
              <q-item v-for="transaction in paginatedTransactions" :key="transaction.id" class="transaction-item">
                <q-item-section avatar>
                  <q-avatar size="48px" :style="'background-color: ' + (transaction.category.color || 'blue-10')"
                    text-color="white">
                    <q-icon :name="transaction.category.icon" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ transaction.description }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ transaction.category.name }} • {{ transaction.account?.name }}
                  </q-item-label>
                  <q-item-label caption class="text-grey-6">
                    {{ formatTransactionDate(transaction.date) }}
                    <q-chip v-if="transaction.is_recurring" size="sm" color="blue" text-color="white" icon="repeat">
                      Recurring
                    </q-chip>
                    <q-chip v-if="transaction.is_cleared" size="sm" color="positive" text-color="white"
                      icon="check_circle">
                      Cleared
                    </q-chip>
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="text-right">
                    <div class="text-h6 text-weight-bold"
                      :class="transaction.type === 'income' ? 'text-positive' : 'text-negative'">
                      {{ formatTransactionAmount(transaction.amount, transaction.type) }}
                    </div>
                  </div>
                  <div class="q-mt-sm">
                    <q-btn flat dense round icon="more_vert" size="sm">
                      <q-menu>
                        <q-list>
                          <q-item clickable v-close-popup @click="openTransactionDialog(transaction)">
                            <q-item-section avatar>
                              <q-icon name="edit" />
                            </q-item-section>
                            <q-item-section>Edit</q-item-section>
                          </q-item>
                          <q-item clickable v-close-popup @click="duplicateTransaction(transaction)">
                            <q-item-section avatar>
                              <q-icon name="content_copy" />
                            </q-item-section>
                            <q-item-section>Duplicate</q-item-section>
                          </q-item>
                          <q-separator />
                          <q-item clickable v-close-popup @click="deleteTransaction(transaction)">
                            <q-item-section avatar>
                              <q-icon name="delete" color="negative" />
                            </q-item-section>
                            <q-item-section class="text-negative">Delete</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>

            <!-- Pagination -->
            <div v-if="filteredTransactions.length > 0" class="q-mt-md flex flex-center">
              <q-pagination v-model="currentPage" :max="Math.ceil(filteredTransactions.length / itemsPerPage)"
                :max-pages="7" direction-links boundary-links color="primary" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Transaction Dialog -->
    <q-dialog v-model="showTransactionDialog" :maximized="maximizedToggle" persistent transition-show="slide-up"
      transition-hide="slide-down">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-bar class="bg-primary text-white">
          <q-icon name="receipt" />
          <div class="text-weight-bold">
            {{ selectedTransaction ? 'Edit Transaction' : 'New Transaction' }}
          </div>
          <q-space />
          <q-btn dense flat icon="minimize" @click="maximizedToggle = false" :disable="!maximizedToggle">
            <q-tooltip v-if="maximizedToggle">Minimize</q-tooltip>
          </q-btn>
          <q-btn dense flat icon="crop_square" @click="maximizedToggle = true" :disable="maximizedToggle">
            <q-tooltip v-if="!maximizedToggle">Maximize</q-tooltip>
          </q-btn>
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section>
          <q-form>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-select v-model="transactionForm.account_id" :options="accountOptions" label="Account" outlined
                  emit-value map-options :rules="[(val) => !!val || 'Account is required']" />
              </div>

              <div class="col-12 col-sm-6">
                <q-select v-model="transactionForm.category_id" :options="categoryOptions" label="Category" outlined
                  emit-value map-options :rules="[(val) => !!val || 'Category is required']" />
              </div>

              <div class="col-12 col-sm-6">
                <q-input v-model.number="transactionForm.amount" label="Amount" outlined type="number" step="0.01"
                  :prefix="settings.currencySymbol" :rules="[(val) => val > 0 || 'Amount must be greater than 0']" />
              </div>

              <div class="col-12 col-sm-6">
                <q-select v-model="transactionForm.type" :options="transactionTypeOptions" label="Type" outlined
                  emit-value map-options :rules="[(val) => !!val || 'Type is required']" />
              </div>

              <div class="col-12 col-sm-6">
                <q-input v-model="transactionForm.date" label="Date" outlined type="date"
                  :rules="[(val) => !!val || 'Date is required']" />
              </div>

              <div class="col-12">
                <q-input v-model="transactionForm.description" label="Description" outlined
                  :rules="[(val) => !!val || 'Description is required']" />
              </div>

              <div class="col-12">
                <q-input v-model="transactionForm.notes" label="Notes" outlined type="textarea" rows="3" />
              </div>

              <!-- Recurring Transaction Section -->
              <div class="col-12">
                <q-separator class="q-my-sm" />
                <q-checkbox v-model="transactionForm.is_recurring" label="Recurring Transaction" />
              </div>

              <!-- Recurring Fields - Only shown when is_recurring is true -->
              <template v-if="transactionForm.is_recurring">
                <div class="col-12">
                  <q-banner class="bg-blue-1 text-blue-9 q-mb-md" rounded>
                    <template v-slot:avatar>
                      <q-icon name="info" color="blue" />
                    </template>
                    This transaction will automatically repeat based on the settings below.
                  </q-banner>
                </div>

                <div class="col-12 col-sm-6">
                  <q-select v-model="transactionForm.recurring_type" :options="recurringTypeOptions" label="Frequency *"
                    outlined emit-value map-options
                    :rules="[(val) => !!val || 'Frequency is required for recurring transactions']">
                    <template v-slot:prepend>
                      <q-icon name="event_repeat" />
                    </template>
                  </q-select>
                </div>

                <div class="col-12 col-sm-6">
                  <q-input v-model.number="transactionForm.recurring_interval" label="Every *" outlined type="number"
                    min="1" max="12" :rules="[
                      (val) => !!val || 'Interval is required',
                      (val) => (val >= 1 && val <= 12) || 'Interval must be between 1 and 12',
                    ]">
                    <template v-slot:prepend>
                      <q-icon name="repeat" />
                    </template>
                    <template v-slot:append>
                      <span class="text-grey-7">{{ getIntervalLabel }}</span>
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-sm-6">
                  <q-input v-model="transactionForm.recurring_end_date" label="End Date (Optional)" outlined type="date"
                    clearable hint="Leave empty for no end date">
                    <template v-slot:prepend>
                      <q-icon name="event" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-sm-6">
                  <q-card flat bordered class="bg-grey-1">
                    <q-card-section class="q-pa-sm">
                      <div class="text-caption text-grey-7">Summary</div>
                      <div class="text-body2">
                        Repeats every
                        <strong>{{ transactionForm.recurring_interval }}</strong>
                        <strong>{{ getIntervalLabel.toLowerCase() }}</strong>
                        <span v-if="transactionForm.recurring_end_date">
                          until <strong>{{ format(new Date(transactionForm.recurring_end_date), 'MMM dd, yyyy')
                            }}</strong>
                        </span>
                        <span v-else> indefinitely</span>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </template>
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn label="Save" color="primary" @click="saveTransaction" :loading="transactionsStore.loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Bulk Transaction Dialog -->
    <BulkTransactionDialog v-model="showBulkTransactionDialog" :accounts="accounts" :categories="categories"
      @saved="onBulkTransactionsSaved" />

    <!-- Filter Dialog -->
    <q-dialog v-model="showFilterDialog" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Filter Transactions</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- Type Filter -->
            <div class="col-12 col-sm-6">
              <q-select v-model="filterForm.type" :options="transactionTypeOptions" label="Transaction Type" outlined
                clearable emit-value map-options />
            </div>

            <!-- Account Filter -->
            <div class="col-12 col-sm-6">
              <q-select v-model="filterForm.account_id" :options="accountOptions" label="Account" outlined clearable
                emit-value map-options />
            </div>

            <!-- Category Filter -->
            <div class="col-12 col-sm-6">
              <q-select v-model="filterForm.category_id" :options="categoryOptions" label="Category" outlined clearable
                emit-value map-options />
            </div>

            <!-- Date Range -->
            <div class="col-12 col-sm-6">
              <q-input v-model="filterForm.start_date" type="date" label="Start Date" outlined clearable />
            </div>

            <div class="col-12 col-sm-6">
              <q-input v-model="filterForm.end_date" type="date" label="End Date" outlined clearable />
            </div>

            <!-- Amount Range -->
            <div class="col-12 col-sm-6">
              <q-input v-model.number="filterForm.min_amount" type="number" label="Minimum Amount" outlined clearable
                step="0.01" :prefix="settings.currencySymbol" />
            </div>

            <div class="col-12 col-sm-6">
              <q-input v-model.number="filterForm.max_amount" type="number" label="Maximum Amount" outlined clearable
                step="0.01" :prefix="settings.currencySymbol" />
            </div>

            <!-- Boolean Filters -->
            <div class="col-12">
              <div class="text-subtitle2 q-mb-sm">Options</div>
              <q-option-group v-model="filterForm.is_recurring" :options="[
                { label: 'All Transactions', value: null },
                { label: 'Recurring Only', value: true },
                { label: 'Non-Recurring Only', value: false },
              ]" type="radio" inline />
            </div>

            <div class="col-12">
              <q-option-group v-model="filterForm.is_cleared" :options="[
                { label: 'All Status', value: null },
                { label: 'Cleared Only', value: true },
                { label: 'Uncleared Only', value: false },
              ]" type="radio" inline />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Clear All" color="grey-7" @click="clearFilters" />
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn label="Apply Filters" color="primary" @click="applyFilters" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Search Dialog -->
    <q-dialog v-model="showSearchDialog" persistent>
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Search Transactions</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="searchQuery" label="Search" outlined autofocus
            placeholder="Search by description, notes, or category..." @keyup.enter="applySearch">
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-icon v-if="searchQuery" name="close" class="cursor-pointer" @click="searchQuery = ''" />
            </template>
          </q-input>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Clear" color="grey-7" @click="clearSearch" />
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn label="Search" color="primary" @click="applySearch" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped lang="scss">
.transaction-item {
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
}
</style>
