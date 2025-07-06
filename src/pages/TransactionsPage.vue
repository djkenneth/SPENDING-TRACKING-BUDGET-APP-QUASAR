<!-- src/pages/TransactionsPage.vue -->
<template>
  <div class="transactions-page">
    <div class="q-pa-md">
      <!-- Header Stats -->
      <div class="row q-gutter-md q-mb-lg">
        <div class="col">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h4 text-weight-bold text-positive">
                {{ formatCurrency(totalIncome) }}
              </div>
              <div class="text-subtitle2">Total Income</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h4 text-weight-bold text-negative">
                {{ formatCurrency(totalExpenses) }}
              </div>
              <div class="text-subtitle2">Total Expenses</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h4 text-weight-bold text-primary">
                {{ formatCurrency(totalIncome - totalExpenses) }}
              </div>
              <div class="text-subtitle2">Net Income</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h4 text-weight-bold text-info">
                {{ transactionStatistics.totalTransactions }}
              </div>
              <div class="text-subtitle2">Total Transactions</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="row items-center justify-between q-mb-lg">
        <div class="row q-gutter-md">
          <q-btn
            color="primary"
            icon="add"
            label="Add Transaction"
            @click="openTransactionDialog()"
          />
          <q-btn
            color="secondary"
            icon="file_download"
            label="Export"
            @click="exportTransactions"
          />
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            flat
            icon="filter_list"
            @click="showFilterDialog = true"
            :color="hasActiveFilters ? 'primary' : 'grey-7'"
          >
            <q-badge v-if="hasActiveFilters" color="red" floating>{{ activeFiltersCount }}</q-badge>
          </q-btn>
          <q-btn
            flat
            icon="search"
            @click="showSearchDialog = true"
            :color="searchQuery ? 'primary' : 'grey-7'"
          />
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
            <q-chip
              v-for="filter in quickFilters"
              :key="filter.value"
              :color="selectedQuickFilter === filter.value ? 'primary' : 'grey-3'"
              :text-color="selectedQuickFilter === filter.value ? 'white' : 'grey-8'"
              clickable
              @click="applyQuickFilter(filter.value)"
            >
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
            <q-item
              v-for="transaction in paginatedTransactions"
              :key="transaction.id"
              class="transaction-item"
            >
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
                  <q-chip
                    v-if="transaction.recurring"
                    size="sm"
                    color="blue"
                    text-color="white"
                    icon="repeat"
                  >
                    Recurring
                  </q-chip>
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="text-right">
                  <div
                    class="text-h6 text-weight-bold"
                    :class="transaction.type === 'income' ? 'text-positive' : 'text-negative'"
                  >
                    {{ formatTransactionAmount(transaction.amount, transaction.type) }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ transaction.type }}
                  </div>
                </div>
              </q-item-section>

              <q-item-section side>
                <q-btn-dropdown flat round icon="more_vert" size="sm">
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
            <q-pagination
              v-model="currentPage"
              :max="totalPages"
              :max-pages="5"
              boundary-links
              direction-links
              color="primary"
              size="sm"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Transaction Dialog -->
    <q-dialog v-model="showTransactionDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ selectedTransaction ? 'Edit Transaction' : 'Add New Transaction' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveTransaction" class="q-gutter-md">
            <q-input
              v-model="transactionForm.description"
              label="Description"
              required
              :rules="[(val) => (val && val.length > 0) || 'Description is required']"
            />

            <q-input
              v-model.number="transactionForm.amount"
              label="Amount"
              type="number"
              step="0.01"
              required
              :prefix="settings.currencySymbol"
              :rules="[(val) => val > 0 || 'Amount must be greater than 0']"
            />

            <q-select
              v-model="transactionForm.type"
              :options="transactionTypeOptions"
              option-label="label"
              option-value="value"
              label="Type"
              required
            />

            <q-select
              v-model="transactionForm.category"
              :options="categories"
              option-label="name"
              option-value="id"
              label="Category"
              required
            />

            <q-select
              v-model="transactionForm.account"
              :options="accounts"
              option-label="name"
              option-value="name"
              label="Account"
              required
            />

            <q-input v-model="transactionForm.date" label="Date" type="date" required />

            <q-toggle v-model="transactionForm.recurring" label="Recurring Transaction" />
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
            <q-select
              v-model="filters.type"
              :options="transactionTypeOptions"
              option-label="label"
              option-value="value"
              label="Type"
              clearable
            />

            <q-select
              v-model="filters.category"
              :options="categories"
              option-label="name"
              option-value="name"
              label="Category"
              clearable
            />

            <q-select
              v-model="filters.account"
              :options="accounts"
              option-label="name"
              option-value="name"
              label="Account"
              clearable
            />

            <q-input v-model="filters.dateFrom" label="From Date" type="date" clearable />

            <q-input v-model="filters.dateTo" label="To Date" type="date" clearable />

            <q-input
              v-model.number="filters.amountMin"
              label="Min Amount"
              type="number"
              step="0.01"
              :prefix="settings.currencySymbol"
              clearable
            />

            <q-input
              v-model.number="filters.amountMax"
              label="Max Amount"
              type="number"
              step="0.01"
              :prefix="settings.currencySymbol"
              clearable
            />
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
          <q-input
            v-model="searchQuery"
            label="Search"
            placeholder="Search by description, category, or account..."
            clearable
            autofocus
          >
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

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTransactions } from 'src/composables/useTransactions';
import { useAccounts } from 'src/composables/useAccounts';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency } from 'src/utils/currency';

const settingsStore = useSettingsStore();

// Use composables
const {
  // State
  loading,
  selectedTransaction,
  showTransactionDialog,
  showFilterDialog,
  showSearchDialog,
  transactionForm,
  filters,
  searchQuery,

  // Computed
  transactions,
  categories,
  totalIncome,
  totalExpenses,
  transactionTypeOptions,
  filteredTransactions,
  transactionStatistics,

  // Methods
  formatTransactionAmount,
  formatTransactionDate,
  openTransactionDialog,
  closeTransactionDialog,
  resetTransactionForm,
  saveTransaction,
  deleteTransaction,
  confirmDeleteTransaction,
  clearFilters,
  clearSearch,
  exportTransactions,
} = useTransactions();

const { accounts } = useAccounts();

// Local state
const currentPage = ref(1);
const itemsPerPage = ref(20);
const selectedQuickFilter = ref('all');

// Computed
const settings = computed(() => settingsStore.settings);

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredTransactions.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage.value);
});

const hasActiveFilters = computed(() => {
  return !!(
    filters.value.type ||
    filters.value.category ||
    filters.value.account ||
    filters.value.dateFrom ||
    filters.value.dateTo ||
    filters.value.amountMin ||
    filters.value.amountMax ||
    searchQuery.value
  );
});

const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.value.type) count++;
  if (filters.value.category) count++;
  if (filters.value.account) count++;
  if (filters.value.dateFrom) count++;
  if (filters.value.dateTo) count++;
  if (filters.value.amountMin) count++;
  if (filters.value.amountMax) count++;
  if (searchQuery.value) count++;
  return count;
});

const quickFilters = computed(() => [
  { label: 'All', value: 'all' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'Income', value: 'income' },
  { label: 'Expenses', value: 'expenses' },
  { label: 'Recurring', value: 'recurring' },
]);

// Methods
const applyQuickFilter = (filterValue: string) => {
  selectedQuickFilter.value = filterValue;
  clearFilters();

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  switch (filterValue) {
    case 'thisMonth':
      filters.value.dateFrom = thisMonth.toISOString().split('T')[0];
      filters.value.dateTo = now.toISOString().split('T')[0];
      break;
    case 'lastMonth':
      filters.value.dateFrom = lastMonth.toISOString().split('T')[0];
      filters.value.dateTo = lastMonthEnd.toISOString().split('T')[0];
      break;
    case 'income':
      filters.value.type = 'income';
      break;
    case 'expenses':
      filters.value.type = 'expense';
      break;
    case 'recurring':
      // This would need to be implemented in the filtering logic
      break;
  }

  currentPage.value = 1;
};

const duplicateTransaction = (transaction: any) => {
  const duplicatedTransaction = {
    ...transaction,
    id: undefined,
    date: new Date(),
    description: `${transaction.description} (Copy)`,
  };

  // Open dialog with duplicated data
  transactionForm.value = {
    description: duplicatedTransaction.description,
    amount: duplicatedTransaction.amount,
    type: duplicatedTransaction.type,
    category: duplicatedTransaction.category,
    account: duplicatedTransaction.account,
    date: new Date().toISOString().split('T')[0],
    recurring: duplicatedTransaction.recurring,
  };

  selectedTransaction.value = null;
  showTransactionDialog.value = true;
};

// Watch for filter changes to reset pagination
import { watch } from 'vue';
watch([filteredTransactions, searchQuery], () => {
  currentPage.value = 1;
});
</script>

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

/* Quick filter chips */
.q-chip {
  margin: 2px;
  transition: all 0.2s ease;
}

.q-chip:hover {
  transform: translateY(-1px);
}

/* Pagination */
.q-pagination {
  display: flex;
  justify-content: center;
}

/* Form styling */
.q-form .q-field {
  margin-bottom: 16px;
}

.q-dialog .q-card {
  border-radius: 12px;
}

/* Button styling */
.q-btn {
  border-radius: 8px;
  font-weight: 500;
}

/* Badge styling */
.q-badge {
  font-size: 10px;
  min-width: 16px;
  height: 16px;
}

/* Icon styling */
.q-avatar .q-icon {
  font-size: 24px;
}

/* Responsive design */
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

/* List styling */
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

/* Empty state */
.text-center {
  padding: 40px 20px;
}

/* Animation for new transactions */
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
