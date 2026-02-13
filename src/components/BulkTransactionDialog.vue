<!-- src/components/BulkTransactionDialog.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { format } from 'date-fns';
import { useTransactionsStore } from 'src/stores/transactions';
import { useSettingsStore } from 'src/stores/settings';
import { CreateTransactionDto } from 'src/types/transaction.types';

// shadcn-vue
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Card, CardContent } from 'src/components/ui/card';
import { Separator } from 'src/components/ui/separator';
import { Checkbox } from 'src/components/ui/checkbox';
import { ScrollArea } from 'src/components/ui/scroll-area';
import { Textarea } from 'src/components/ui/textarea';
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

// Lucide icons
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  Receipt,
  ChevronDown,
  ChevronUp,
} from 'lucide-vue-next';

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
const transactionsStore = useTransactionsStore();
const settingsStore = useSettingsStore();

// Types
interface TransactionEntry extends CreateTransactionDto {
  id: string;
  expanded?: boolean;
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

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

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
  expanded: false,
});

const addEntry = () => {
  if (transactionEntries.value.length >= 20) return;
  transactionEntries.value.push(createEmptyEntry());
};

const removeEntry = (index: number) => {
  if (transactionEntries.value.length > 1) {
    transactionEntries.value.splice(index, 1);
  }
};

const toggleExpanded = (index: number) => {
  transactionEntries.value[index].expanded = !transactionEntries.value[index].expanded;
};

const clearAll = () => {
  if (confirm('Are you sure you want to clear all transaction entries?')) {
    transactionEntries.value = [createEmptyEntry()];
  }
};

const formatCurrencyValue = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: settingsStore.settings.currency || 'PHP',
  }).format(amount);
};

const saveAll = async () => {
  if (!isValid.value) return;

  loading.value = true;
  try {
    const transactions = transactionEntries.value.map(({ id, expanded, ...rest }) => rest);
    await transactionsStore.bulkCreateTransactions({ transactions });
    emit('saved', transactions.length);
    emit('update:modelValue', false);
    transactionEntries.value = [createEmptyEntry()];
  } catch (error: any) {
    console.error('Error creating bulk transactions:', error);
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

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent side="bottom" class="h-[95vh] rounded-t-2xl">
      <SheetHeader class="pb-2">
        <div class="flex items-center justify-between">
          <div>
            <SheetTitle class="text-xl font-bold">Bulk Add Transactions</SheetTitle>
            <SheetDescription class="text-sm text-muted-foreground">
              {{ transactionEntries.length }} entries
            </SheetDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            @click="addEntry"
            :disabled="transactionEntries.length >= 20"
          >
            <Plus class="w-4 h-4 mr-1" />
            Add Entry
          </Button>
        </div>
      </SheetHeader>

      <ScrollArea class="h-[calc(95vh-260px)]">
        <div class="space-y-3 pr-4 pb-4">
          <!-- Transaction Entries -->
          <Card v-for="(entry, index) in transactionEntries" :key="entry.id">
            <CardContent class="p-3">
              <!-- Entry Header -->
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-muted-foreground">
                  Transaction #{{ index + 1 }}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-7 w-7 text-destructive"
                  :disabled="transactionEntries.length <= 1"
                  @click="removeEntry(index)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </Button>
              </div>

              <!-- Compact Fields -->
              <div class="grid grid-cols-3 gap-2 mb-2">
                <Select v-model="entry.type">
                  <SelectTrigger class="h-9 text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="opt in transactionTypeOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select v-model="entry.account_id">
                  <SelectTrigger class="h-9 text-xs">
                    <SelectValue placeholder="Account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="acc in accounts" :key="acc.id" :value="acc.id">
                      {{ acc.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select v-model="entry.category_id">
                  <SelectTrigger class="h-9 text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="cat in filteredCategories(entry.type)" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="relative">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                    {{ currencySymbol }}
                  </span>
                  <Input
                    v-model.number="entry.amount"
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    class="h-9 text-xs pl-6"
                  />
                </div>
                <Input v-model="entry.date" type="date" class="h-9 text-xs" />
                <Input v-model="entry.description" placeholder="Description" class="h-9 text-xs" />
              </div>

              <!-- Expandable More Options -->
              <button
                class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                @click="toggleExpanded(index)"
              >
                <component :is="entry.expanded ? ChevronUp : ChevronDown" class="w-3 h-3" />
                More options
              </button>

              <div v-if="entry.expanded" class="mt-2 space-y-2">
                <Textarea v-model="entry.notes" placeholder="Notes" rows="2" class="text-xs" />
                <div class="flex items-center gap-2">
                  <Checkbox
                    :checked="entry.is_recurring"
                    @update:checked="entry.is_recurring = $event"
                  />
                  <Label class="text-xs">Recurring transaction</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Empty State -->
          <div v-if="transactionEntries.length === 0" class="flex flex-col items-center py-12 space-y-3">
            <Receipt class="w-12 h-12 text-muted-foreground/40" />
            <p class="text-sm text-muted-foreground">No transaction entries yet</p>
            <Button variant="outline" @click="addEntry">
              <Plus class="w-4 h-4 mr-2" />
              Add First Entry
            </Button>
          </div>
        </div>
      </ScrollArea>

      <!-- Summary -->
      <div v-if="transactionEntries.length > 0" class="py-3 border-t">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-xs text-muted-foreground">Income</p>
            <p class="text-sm font-medium text-green-600">+{{ formatCurrencyValue(totalIncome) }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Expenses</p>
            <p class="text-sm font-medium text-red-600">-{{ formatCurrencyValue(totalExpenses) }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Net</p>
            <p
              class="text-sm font-medium"
              :class="netAmount >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ netAmount >= 0 ? '+' : '' }}{{ formatCurrencyValue(netAmount) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between pt-3 border-t">
        <div class="flex gap-2">
          <Button variant="outline" @click="isOpen = false">Cancel</Button>
          <Button variant="ghost" class="text-destructive" @click="clearAll">Clear All</Button>
        </div>
        <Button
          @click="saveAll"
          :disabled="!isValid || transactionEntries.length === 0 || loading"
        >
          <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
          <Save v-else class="w-4 h-4 mr-2" />
          Save All
        </Button>
      </div>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
/* All styles are now handled by Tailwind CSS classes */
</style>
