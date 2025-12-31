<!-- src/components/transactions/BulkTransactionDialog.vue -->
<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent
    :maximized="$q.screen.lt.md" transition-show="slide-up" transition-hide="slide-down">
    <q-card :style="$q.screen.gt.sm ? 'width: 900px; max-width: 95vw;' : ''">
      <!-- Header -->
      <q-bar class="bg-primary text-white">
        <q-icon name="playlist_add" />
        <div class="text-weight-bold">Bulk Add Transactions</div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>Close</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section class="q-pb-none">
        <div class="row items-center justify-between">
          <div class="text-subtitle1 text-grey-7">
            Add multiple transactions at once ({{ transactionEntries.length }} entries)
          </div>
          <q-btn flat dense color="primary" icon="add" label="Add Entry" @click="addEntry"
            :disable="transactionEntries.length >= 20" />
        </div>
      </q-card-section>

      <q-card-section class="q-pt-sm" style="max-height: 60vh; overflow-y: auto;">
        <!-- Transaction Entries -->
        <div v-for="(entry, index) in transactionEntries" :key="entry.id" class="q-mb-md">
          <q-card flat bordered>
            <q-card-section class="q-py-sm">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-grey-8">
                  Transaction #{{ index + 1 }}
                </div>
                <q-btn flat dense round icon="delete" color="negative" size="sm" @click="removeEntry(index)"
                  :disable="transactionEntries.length <= 1">
                  <q-tooltip>Remove entry</q-tooltip>
                </q-btn>
              </div>

              <div class="row q-col-gutter-sm">
                <!-- Type -->
                <div class="col-12 col-sm-4 col-md-2">
                  <q-select v-model="entry.type" :options="transactionTypeOptions" label="Type" outlined dense
                    emit-value map-options :rules="[requiredRule]" />
                </div>

                <!-- Account -->
                <div class="col-12 col-sm-4 col-md-2">
                  <q-select v-model="entry.account_id" :options="accountOptions" label="Account" outlined dense
                    emit-value map-options option-value="id" option-label="name" :rules="[requiredRule]" />
                </div>

                <!-- Category -->
                <div class="col-12 col-sm-4 col-md-2">
                  <q-select v-model="entry.category_id" :options="filteredCategories(entry.type)" label="Category"
                    outlined dense emit-value map-options option-value="id" option-label="name"
                    :rules="[requiredRule]" />
                </div>

                <!-- Amount -->
                <div class="col-6 col-sm-4 col-md-2">
                  <q-input v-model.number="entry.amount" type="number" label="Amount" outlined dense min="0.01"
                    step="0.01" :rules="[requiredRule, positiveRule]">
                    <template v-slot:prepend>
                      <span class="text-grey-6">{{ currencySymbol }}</span>
                    </template>
                  </q-input>
                </div>

                <!-- Date -->
                <div class="col-6 col-sm-4 col-md-2">
                  <q-input v-model="entry.date" type="date" label="Date" outlined dense :rules="[requiredRule]" />
                </div>

                <!-- Description -->
                <div class="col-12 col-sm-4 col-md-2">
                  <q-input v-model="entry.description" label="Description" outlined dense :rules="[requiredRule]" />
                </div>
              </div>

              <!-- Optional Fields (collapsible) -->
              <q-expansion-item dense dense-toggle expand-separator icon="more_horiz" label="More options"
                class="q-mt-sm">
                <div class="row q-col-gutter-sm q-pt-sm">
                  <!-- Notes -->
                  <div class="col-12 col-sm-6">
                    <q-input v-model="entry.notes" label="Notes" outlined dense type="textarea" rows="2" />
                  </div>

                  <!-- Tags -->
                  <div class="col-12 col-sm-6">
                    <q-select v-model="entry.tags" label="Tags" outlined dense use-chips multiple use-input
                      new-value-mode="add-unique" input-debounce="0" />
                  </div>

                  <!-- Is Recurring -->
                  <div class="col-12">
                    <q-checkbox v-model="entry.is_recurring" label="Recurring transaction" dense />
                  </div>
                </div>
              </q-expansion-item>
            </q-card-section>
          </q-card>
        </div>

        <!-- Empty state -->
        <div v-if="transactionEntries.length === 0" class="text-center text-grey-6 q-py-xl">
          <q-icon name="receipt_long" size="48px" class="q-mb-md" />
          <div>No transaction entries yet</div>
          <q-btn flat color="primary" label="Add First Entry" icon="add" class="q-mt-md" @click="addEntry" />
        </div>
      </q-card-section>

      <!-- Summary -->
      <q-card-section v-if="transactionEntries.length > 0" class="q-pt-none">
        <q-separator class="q-mb-md" />
        <div class="row q-col-gutter-md text-center">
          <div class="col-4">
            <div class="text-caption text-grey-6">Total Income</div>
            <div class="text-subtitle1 text-positive text-weight-medium">
              +{{ formatCurrency(totalIncome) }}
            </div>
          </div>
          <div class="col-4">
            <div class="text-caption text-grey-6">Total Expenses</div>
            <div class="text-subtitle1 text-negative text-weight-medium">
              -{{ formatCurrency(totalExpenses) }}
            </div>
          </div>
          <div class="col-4">
            <div class="text-caption text-grey-6">Net Amount</div>
            <div class="text-subtitle1 text-weight-medium" :class="netAmount >= 0 ? 'text-positive' : 'text-negative'">
              {{ netAmount >= 0 ? '+' : '' }}{{ formatCurrency(netAmount) }}
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Actions -->
      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancel" color="grey-7" v-close-popup />
        <q-btn flat label="Clear All" color="negative" @click="clearAll" />
        <q-btn label="Save All" color="primary" icon="save" :loading="loading"
          :disable="!isValid || transactionEntries.length === 0" @click="saveAll" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { format } from 'date-fns';
import { useTransactionsStore } from 'src/stores/transactions';
import { useSettingsStore } from 'src/stores/settings';
import { CreateTransactionDto } from 'src/types/transaction.types';

// Props & Emits
interface Props {
  modelValue: boolean;
  accounts: Array<{ id: number; name: string; type: string }>;
  categories: Array<{ id: number; name: string; type: string; icon?: string; color?: string }>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'saved', count: number): void;
}>();

// Composables
const $q = useQuasar();
const transactionsStore = useTransactionsStore();
const settingsStore = useSettingsStore();

// Types
interface TransactionEntry extends CreateTransactionDto {
  id: string; // Local unique ID for v-for key
}

// State
const transactionEntries = ref<TransactionEntry[]>([]);
const loading = ref(false);

// Options
const transactionTypeOptions = [
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
  { label: 'Transfer', value: 'transfer' },
];

// Computed
const currencySymbol = computed(() => settingsStore.settings.currencySymbol || '₱');

const accountOptions = computed(() => props.accounts || []);

const filteredCategories = (type: string) => {
  if (!props.categories) return [];
  if (type === 'transfer') return props.categories;
  return props.categories.filter((c) => c.type === type || c.type === 'both');
};

const totalIncome = computed(() =>
  transactionEntries.value
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + (e.amount || 0), 0)
);

const totalExpenses = computed(() =>
  transactionEntries.value
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + (e.amount || 0), 0)
);

const netAmount = computed(() => totalIncome.value - totalExpenses.value);

const isValid = computed(() => {
  return transactionEntries.value.every(
    (entry) =>
      entry.account_id &&
      entry.category_id &&
      entry.amount > 0 &&
      entry.date &&
      entry.description?.trim()
  );
});

// Validation rules
const requiredRule = (val: any) => !!val || 'Required';
const positiveRule = (val: number) => val > 0 || 'Must be greater than 0';

// Methods
const generateId = () => Math.random().toString(36).substring(2, 9);

const createEmptyEntry = (): TransactionEntry => ({
  id: generateId(),
  account_id: props.accounts?.[0]?.id || 0,
  category_id: props.categories?.[0]?.id || 0,
  amount: 0,
  type: 'expense',
  date: format(new Date(), 'yyyy-MM-dd'),
  description: '',
  notes: '',
  tags: [],
  is_recurring: false,
});

const addEntry = () => {
  if (transactionEntries.value.length >= 20) {
    $q.notify({
      type: 'warning',
      message: 'Maximum 20 entries allowed at once',
    });
    return;
  }
  transactionEntries.value.push(createEmptyEntry());
};

const removeEntry = (index: number) => {
  if (transactionEntries.value.length > 1) {
    transactionEntries.value.splice(index, 1);
  }
};

const clearAll = () => {
  $q.dialog({
    title: 'Clear All Entries',
    message: 'Are you sure you want to clear all transaction entries?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    transactionEntries.value = [createEmptyEntry()];
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: settingsStore.settings.currency || 'PHP',
  }).format(amount);
};

const saveAll = async () => {
  if (!isValid.value) {
    $q.notify({
      type: 'warning',
      message: 'Please fill in all required fields',
    });
    return;
  }

  loading.value = true;

  try {
    // Prepare transactions data (remove local id)
    const transactions = transactionEntries.value.map(({ id, ...rest }) => rest);

    // Call store method
    await transactionsStore.bulkCreateTransactions({ transactions });

    $q.notify({
      type: 'positive',
      message: `Successfully created ${transactions.length} transactions`,
      icon: 'check_circle',
    });

    // Emit success event
    emit('saved', transactions.length);

    // Close dialog
    emit('update:modelValue', false);

    // Reset form
    transactionEntries.value = [createEmptyEntry()];
  } catch (error: any) {
    console.error('Error creating bulk transactions:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to create transactions',
      icon: 'error',
    });
  } finally {
    loading.value = false;
  }
};

// Initialize with one empty entry when dialog opens
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && transactionEntries.value.length === 0) {
      transactionEntries.value = [createEmptyEntry()];
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.q-expansion-item {
  :deep(.q-expansion-item__toggle-icon) {
    font-size: 18px;
  }
}
</style>
