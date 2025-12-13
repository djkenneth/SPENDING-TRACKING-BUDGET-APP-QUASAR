<!-- src/pages/TransactionsPage.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useCreateTransaction, useDeleteTransaction, useTransactions, useTransactionStatistics, useUpdateTransaction } from 'src/composables/useTransactions';
import { useAccounts } from 'src/composables/useAccounts';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency } from 'src/utils/currency';
import { format } from 'date-fns';
import { CreateTransactionDto, Transaction, TransactionFilters } from 'src/services';
import { useCategories } from 'src/composables/useCategories';

const $q = useQuasar();
const settingsStore = useSettingsStore();

// Reactive filters
const filters = ref<TransactionFilters>({
  sort_by: 'date',
  sort_direction: 'desc',
  per_page: 100,
});

// Composables
const { data: transactionsData, isLoading: transactionsLoading } = useTransactions(filters);
const { data: statisticsData } = useTransactionStatistics(filters);
const { data: accountsData } = useAccounts();
const { data: categoriesData } = useCategories();
const createTransactionMutation = useCreateTransaction();
const updateTransactionMutation = useUpdateTransaction();
const deleteTransactionMutation = useDeleteTransaction();

// Local state
const showTransactionDialog = ref(false);
const showFilterDialog = ref(false);
const showSearchDialog = ref(false);
const selectedTransaction = ref<Transaction | null>(null);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(20);
const selectedQuickFilter = ref('all');
const maximizedToggle = ref(true)

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
});

// Computed
const settings = computed(() => settingsStore.settings);

const loading = computed(() =>
  transactionsLoading.value ||
  createTransactionMutation.isPending.value ||
  updateTransactionMutation.isPending.value ||
  deleteTransactionMutation.isPending.value
);

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredTransactions.value.slice(start, end);
});

const transactions = computed(() => transactionsData.value?.data || []);
const accounts = computed(() => accountsData.value || []);
const categories = computed(() => categoriesData.value || []);

const totalIncome = computed(() => statisticsData.value?.total_income || 0);
const totalExpenses = computed(() => statisticsData.value?.total_expenses || 0);

const totalPages = computed(() => transactionsData.value?.meta?.last_page || 1);
const totalTransactions = computed(() => transactionsData.value?.meta?.total || 0);

const hasActiveFilters = computed(() => {
  return !!(
    filters.value.type ||
    filters.value.category_id ||
    filters.value.account_id ||
    filters.value.start_date ||
    filters.value.end_date ||
    filters.value.min_amount ||
    filters.value.max_amount ||
    filters.value.is_recurring ||
    filters.value.is_cleared ||
    filters.value.search
  );
});

const transactionStatistics = computed(() => ({
  totalTransactions: statisticsData.value?.transaction_count || 0,
  averageTransaction: statisticsData.value?.average_transaction || 0,
  netAmount: statisticsData.value?.net_amount || 0,
}));

const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.value.type) count++;
  if (filters.value.category_id) count++;
  if (filters.value.account_id) count++;
  if (filters.value.start_date) count++;
  if (filters.value.end_date) count++;
  if (filters.value.min_amount) count++;
  if (filters.value.max_amount) count++;
  if (filters.value.is_recurring) count++;
  if (filters.value.is_cleared) count++;
  if (filters.value.search) count++;
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

const quickFilters = computed(() => [
  { label: 'All', value: 'all' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'Income', value: 'income' },
  { label: 'Expenses', value: 'expenses' },
  { label: 'Recurring', value: 'recurring' },
]);

// Methods
const formatTransactionAmount = (amount: number, type: string) => {
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
      amount: transaction.amount,
      type: transaction.type,
      date: transaction.date,
      description: transaction.description || '',
      notes: transaction.notes || '',
      tags: transaction.tags || [],
      is_recurring: transaction.is_recurring || false,
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
    };
  }
  showTransactionDialog.value = true;
};

const closeTransactionDialog = () => {
  showTransactionDialog.value = false;
  selectedTransaction.value = null;
  resetTransactionForm();
};

const resetTransactionForm = () => {
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
  };
};

const saveTransaction = async () => {
  try {
    if (transactionForm.value.id) {
      // Update existing transaction
      await updateTransactionMutation.mutateAsync({
        id: transactionForm.value.id,
        data: transactionForm.value,
      });
    } else {
      // Create new transaction
      await createTransactionMutation.mutateAsync(transactionForm.value);
    }

    showTransactionDialog.value = false;
    resetTransactionForm();
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
};

const confirmDeleteTransaction = (transaction: Transaction) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete this transaction for ${formatCurrency(transaction.amount, settingsStore.settings.currency)}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteTransactionMutation.mutateAsync(transaction.id);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  });
};

const applyQuickFilter = (filterValue: string) => {
  selectedQuickFilter.value = filterValue;
  clearFilters();

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  switch (filterValue) {
    case 'all':
      break;

    case 'thisMonth':
      filters.value.start_date = thisMonth.toISOString().split('T')[0];
      filters.value.end_date = now.toISOString().split('T')[0];
      break;

    case 'lastMonth':
      filters.value.start_date = lastMonth.toISOString().split('T')[0];
      filters.value.end_date = lastMonthEnd.toISOString().split('T')[0];
      break;

    case 'income':
      filters.value.type = 'income';
      break;

    case 'expenses':
      filters.value.type = 'expense';
      break;

    case 'recurring':
      filters.value.is_recurring = true;
      break;
  }

  currentPage.value = 1;
};

const duplicateTransaction = (transaction: Transaction) => {
  transactionForm.value = {
    account_id: transaction.account_id,
    category_id: transaction.category_id,
    amount: transaction.amount,
    type: transaction.type,
    date: format(new Date(), 'yyyy-MM-dd'),
    description: `Copy of ${transaction.description}`,
    notes: transaction.notes || '',
    tags: transaction.tags || [],
    is_recurring: false,
  };
  selectedTransaction.value = null;
  showTransactionDialog.value = true;
};

const clearFilters = () => {
  filters.value = {
    sort_by: 'date',
    sort_direction: 'desc',
    limit: 100,
  };
  selectedQuickFilter.value = 'all';
  currentPage.value = 1;
};

const clearSearch = () => {
  searchQuery.value = '';
};

const exportTransactions = () => {
  const data = filteredTransactions.value;
  const csv = [
    ['Date', 'Description', 'Category', 'Account', 'Type', 'Amount'],
    ...data.map(t => [
      t.date,
      t.description || '',
      t.category?.name || '',
      t.account?.name || '',
      t.type,
      t.amount.toString(),
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);

  $q.notify({
    type: 'positive',
    message: 'Transactions exported successfully',
  });
};

watch(filters, () => {
  currentPage.value = 1;
}, { deep: true });
</script>

<template>
  <div class="transactions-page">
    <div class="q-pa-md">
      <!-- Action Bar -->
      <div class="row items-center justify-end q-py-md">
        <div class="flex no-wrap q-gutter-x-md">
          <q-btn unelevated round size="sm" color="primary" icon="add" @click="openTransactionDialog()" />
          <q-btn unelevated round size="sm" color="primary" icon="file_download" @click="exportTransactions" />
          <q-btn unelevated round size="sm" icon="filter_list" @click="showFilterDialog = true"
            :color="hasActiveFilters ? 'primary' : 'grey-7'">
            <q-badge v-if="hasActiveFilters" color="red" floating>{{ activeFiltersCount }}</q-badge>
          </q-btn>
          <q-btn unelevated round size="sm" icon="search" @click="showSearchDialog = true"
            :color="searchQuery ? 'primary' : 'grey-7'" />
        </div>
      </div>

      <!-- Transactions List -->
      <q-card>
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">Transactions</div>
            <div class="text-caption text-grey-6">
              Showing {{ filteredTransactions.length }} of {{ transactions.length }} transactions
            </div>
          </div>

          <!-- Quick Filters -->
          <div class="row q-gutter-sm q-mb-md">
            <q-chip v-for="filter in quickFilters" :key="filter.value"
              :color="selectedQuickFilter === filter.value ? 'primary' : 'grey-3'"
              :text-color="selectedQuickFilter === filter.value ? 'white' : 'grey-8'" clickable
              @click="applyQuickFilter(filter.value)">
              {{ filter.label }}
            </q-chip>
          </div>

          <q-separator class="q-mb-md" />

          <!-- Transaction List -->
          <div v-if="filteredTransactions.length === 0" class="text-center text-grey-6 q-pa-xl">
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
                <q-avatar size="48px" :color="transaction.category.color" text-color="white">
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
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="text-right">
                  <div class="text-h6 text-weight-bold"
                    :class="transaction.type === 'income' ? 'text-positive' : 'text-negative'">
                    {{ formatTransactionAmount(transaction.amount, transaction.type) }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ transaction.type }}
                  </div>
                </div>
              </q-item-section>

              <q-item-section side>
                <q-btn-dropdown flat round size="sm">
                  <q-list>
                    <q-item clickable @click="openTransactionDialog(transaction)">
                      <q-item-section avatar>
                        <q-icon name="edit" />
                      </q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item clickable @click="duplicateTransaction(transaction)">
                      <q-item-section avatar>
                        <q-icon name="content_copy" />
                      </q-item-section>
                      <q-item-section>Duplicate</q-item-section>
                    </q-item>
                    <q-item clickable @click="confirmDeleteTransaction(transaction)">
                      <q-item-section avatar>
                        <q-icon name="delete" color="negative" />
                      </q-item-section>
                      <q-item-section>Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Pagination -->
          <div v-if="filteredTransactions.length > itemsPerPage" class="q-mt-md">
            <q-pagination v-model="currentPage" :max="totalPages" :max-pages="5" boundary-links direction-links
              color="primary" size="sm" />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Transaction Dialog -->
    <q-dialog v-model="showTransactionDialog" persistent :maximized="maximizedToggle" transition-show="slide-up"
      transition-hide="slide-down">
      <q-card style="min-width: 500px">
        <q-card-section class="row justify-center q-mb-lg">
          <q-icon name="close" size="md" class="absolute-left" style="top: 15px; left: 15px"
            @click="showTransactionDialog = false" />
          <div class="text-h6 text-weight-bold">
            {{ selectedTransaction ? 'Edit Transaction' : 'Add New Transaction' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-form class="q-gutter-md">
            <q-input filled v-model="transactionForm.description" label="Description" required
              :rules="[(val) => (val && val.length > 0) || 'Description is required']" />

            <q-input filled v-model.number="transactionForm.amount" label="Amount" type="number" step="0.01" required
              :prefix="settings.currencySymbol" :rules="[(val) => val > 0 || 'Amount must be greater than 0']" />

            <q-select filled v-model="transactionForm.type" :options="transactionTypeOptions" option-label="label"
              option-value="value" emit-value map-options label="Type" required />

            <q-select filled v-model="transactionForm.category_id" :options="categories" option-label="name"
              option-value="id" emit-value map-options label="Category" required />

            <q-select filled v-model="transactionForm.account_id" :options="accounts" option-label="name"
              option-value="id" emit-value map-options label="Account" required />

            <q-input filled v-model="transactionForm.date" label="Date" type="date" required />

            <q-toggle v-model="transactionForm.is_recurring" label="Recurring Transaction" />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeTransactionDialog" />
          <q-btn color="primary" label="Save" @click="saveTransaction" :loading="loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Filter Dialog -->
    <q-dialog v-model="showFilterDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Filter Transactions</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="q-gutter-md">
            <q-select v-model="filters.type" :options="transactionTypeOptions" option-label="label" option-value="value"
              label="Type" clearable />

            <q-select v-model="filters.category_id" :options="categories" option-label="name" option-value="id"
              label="Category" clearable />

            <q-select v-model="filters.account_id" :options="accounts" option-label="name" option-value="id"
              label="Account" clearable />

            <q-input v-model="filters.start_date" label="From Date" type="date" clearable />

            <q-input v-model="filters.end_date" label="To Date" type="date" clearable />

            <q-input v-model.number="filters.min_amount" label="Min Amount" type="number" step="0.01"
              :prefix="settings.currencySymbol" clearable />

            <q-input v-model.number="filters.max_amount" label="Max Amount" type="number" step="0.01"
              :prefix="settings.currencySymbol" clearable />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Clear All" @click="clearFilters" />
          <q-btn flat label="Close" @click="showFilterDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Search Dialog -->
    <q-dialog v-model="showSearchDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Search Transactions</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="searchQuery" label="Search" placeholder="Search by description, category, or account..."
            clearable autofocus>
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Clear" @click="clearSearch" />
          <q-btn flat label="Close" @click="showSearchDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.transactions-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.stat-card {
  border-radius: 12px;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.transaction-item {
  border-radius: 8px;
  margin-bottom: 8px;
  padding: 12px;
  transition: all 0.2s ease;
}

.transaction-item:hover {
  background-color: #f5f5f5;
  transform: translateX(4px);
}

.transaction-item .q-item-section {
  min-width: 0;
}

.q-chip {
  margin: 2px;
  transition: all 0.2s ease;
}

.q-chip:hover {
  transform: translateY(-1px);
}

.q-pagination {
  display: flex;
  justify-content: center;
}

.q-form .q-field {
  margin-bottom: 16px;
}

.q-dialog .q-card {
  border-radius: 12px;
}

.q-badge {
  font-size: 10px;
  min-width: 16px;
  height: 16px;
}

.q-avatar .q-icon {
  font-size: 24px;
}

@media (max-width: 768px) {
  .stat-card {
    min-height: 80px;
  }

  .text-h4 {
    font-size: 1.5rem;
  }

  .transaction-item {
    padding: 8px;
  }

  .q-item-section--side {
    padding-left: 8px;
  }
}

@media (max-width: 480px) {
  .row.q-gutter-md {
    flex-direction: column;
  }

  .q-btn {
    width: 100%;
  }

  .transaction-item .q-item-section {
    min-width: 0;
  }
}

.q-list {
  padding: 0;
}

.q-item {
  border-radius: 8px;
  margin-bottom: 4px;
}

.q-item:last-child {
  margin-bottom: 0;
}

.text-center {
  padding: 40px 20px;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.transaction-item {
  animation: slideInRight 0.3s ease-out;
}
</style>
