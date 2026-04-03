<!-- src/pages/AccountsPage.vue -->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  useAccounts,
  useAccountsSummary,
  useAccountTypes,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  initializeAccounts,
} from 'src/composables/useAccounts';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency } from 'src/utilities/currency';
import { Account, CreateAccountDto, UpdateAccountDto } from 'src/types/account.types';
import AccountCard from 'src/components/Accountcard.vue';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Separator } from 'src/components/ui/separator';
import { ScrollArea } from 'src/components/ui/scroll-area';
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
  Plus,
  Loader2,
  Wallet,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Banknote,
  Bitcoin,
  BarChart3,
  BookOpen,
  FileSignature,
  Users,
  Upload,
  ChevronRight,
} from 'lucide-vue-next';

const router = useRouter();
const settingsStore = useSettingsStore();

// Composables
const { data: accountsData, isLoading: accountsLoading } = useAccounts();
const { data: accountsSummary } = useAccountsSummary();
const { data: accountTypesData } = useAccountTypes();
const createAccountMutation = useCreateAccount();
const updateAccountMutation = useUpdateAccount();
const deleteAccountMutation = useDeleteAccount();

onMounted(async () => {
  await initializeAccounts();
});

// Local state
const addModalDialog = ref(false);
const showIconDialog = ref(false);
const selectedIcon = ref('img:account-category-icon/piggy-bank.png');
const uploadedIcon = ref<File | null>(null);

const showAdjustBalanceDialog = ref(false);
const showAccountDialog = ref(false);
const selectedAccount = ref<Account | null>(null);
const accountForm = ref<CreateAccountDto & { id?: number }>({
  name: '',
  type: 'cash',
  balance: 0,
  currency: settingsStore.settings.currency,
  color: '#FF0000',
  icon: 'img:account-category-icon/piggy-bank.png',
  account_number: '',
});

const adjustBalanceForm = ref({
  new_balance: 0,
  reason: '',
});

// Icon options
const iconOptions = [
  { name: 'img:account-category-icon/paypal.png', category: 'financial' },
  { name: 'img:account-category-icon/bitcoin.png', category: 'crypto' },
  { name: 'img:account-category-icon/piggy-bank.png', category: 'savings' },
  { name: 'img:account-category-icon/credit-card.png', category: 'financial' }
];

// Account category items for the add modal
const debitAccounts = [
  { label: 'Debit Card', icon: CreditCard, type: 'bank' },
  { label: 'Cash', icon: Banknote, type: 'cash' },
  { label: 'Paypal', icon: Wallet, type: 'ewallet' },
  { label: 'Other Debit Account', icon: PiggyBank, type: 'cash' },
];

const creditAccounts = [
  { label: 'Credit Card', icon: CreditCard, type: 'credit_card' },
  { label: 'Other Credit Card', icon: CreditCard, type: 'credit_card' },
];

const borrowLendAccounts = [
  { label: 'Lend', icon: Users, type: 'bank' },
  { label: 'Borrowed', icon: BookOpen, type: 'bank' },
  { label: 'Loan', icon: FileSignature, type: 'bank' },
];

const investAccounts = [
  { label: 'Stock', icon: BarChart3, type: 'investment' },
  { label: 'Fund', icon: TrendingUp, type: 'investment' },
  { label: 'Crypto Currencies', icon: Bitcoin, type: 'investment' },
];

// Computed properties
const loading = computed(() =>
  accountsLoading.value ||
  createAccountMutation.isPending.value ||
  updateAccountMutation.isPending.value ||
  deleteAccountMutation.isPending.value
);

const accounts = computed(() => accountsData.value || []);

const totalAssets = computed(() => accountsSummary.value?.total_balance || 0);

const formattedTotalAssets = computed(() => {
  const total = accountsSummary.value?.total_balance || 0;
  return settingsStore.settings.showBalances
    ? formatCurrency(total, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
});

const accountTypeOptions = computed(() => {
  if (!accountTypesData.value || typeof accountTypesData.value !== 'object') {
    return [
      { label: 'Cash', value: 'cash' },
      { label: 'Bank', value: 'bank' },
      { label: 'Credit Card', value: 'credit_card' },
      { label: 'Investment', value: 'investment' },
      { label: 'E-Wallet', value: 'ewallet' },
    ];
  }
  return Object.entries(accountTypesData.value).map(([key, data]) => ({
    label: data.name,
    value: key,
  }));
});

const colorOptions = [
  { label: 'Blue', value: '#2196F3' },
  { label: 'Green', value: '#4CAF50' },
  { label: 'Orange', value: '#FF9800' },
  { label: 'Red', value: '#F44336' },
  { label: 'Purple', value: '#9C27B0' },
  { label: 'Teal', value: '#009688' },
  { label: 'Pink', value: '#E91E63' },
  { label: 'Grey', value: '#9E9E9E' },
];

const formattedNetWorth = computed(() => {
  return settingsStore.settings.showBalances
    ? formatCurrency(totalAssets.value, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
});

const formattedTotalLiabilities = computed(() => {
  return settingsStore.settings.showBalances
    ? formatCurrency(0, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
});

// Methods
const openAccountDialog = (account?: Account) => {
  if (account) {
    selectedAccount.value = account;
    accountForm.value = {
      id: account.id,
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      color: account.color || '#FF0000',
      icon: account.icon || 'img:account-category-icon/piggy-bank.png',
      account_number: account.account_number || '',
    };
    selectedIcon.value = account.icon || 'img:account-category-icon/piggy-bank.png';
  } else {
    selectedAccount.value = null;
    accountForm.value = {
      name: '',
      type: 'cash',
      balance: 0,
      currency: settingsStore.settings.currency,
      color: '#FF0000',
      icon: 'img:account-category-icon/piggy-bank.png',
      account_number: '',
    };
    selectedIcon.value = 'img:account-category-icon/piggy-bank.png';
  }
  showAccountDialog.value = true;
  addModalDialog.value = false;
};

const handleSelectCategory = (type: string) => {
  accountForm.value.type = type;
  openAccountDialog();
};

const handleEditAccount = (account: Account) => {
  selectedAccount.value = account;
  accountForm.value = {
    id: account.id,
    name: account.name,
    type: account.type,
    balance: account.balance,
    currency: account.currency,
    color: account.color || '#2196F3',
    icon: account.icon || 'account_balance_wallet',
    account_number: account.account_number || '',
    institution: account.institution || '',
  };
  selectedIcon.value = account.icon || 'account_balance_wallet';
  showAccountDialog.value = true;
};

const closeAccountDialog = () => {
  showAccountDialog.value = false;
  selectedAccount.value = null;
  accountForm.value = {
    name: '',
    type: 'cash',
    balance: 0,
    currency: settingsStore.settings.currency,
    color: '#2196F3',
    icon: 'account_balance_wallet',
    account_number: '',
    institution: '',
  };
};

const saveAccount = async () => {
  try {
    if (accountForm.value.id) {
      const { id, ...updateData } = accountForm.value;
      await updateAccountMutation.mutateAsync({
        id,
        data: updateData as UpdateAccountDto
      });
    } else {
      const createData = { ...accountForm.value, type: accountForm.value.type };
      delete createData.id;
      await createAccountMutation.mutateAsync(createData as CreateAccountDto);
    }
    closeAccountDialog();
  } catch (error) {
    console.error('Failed to save account:', error);
  }
};

const handleDeleteAccount = (account: Account) => {
  // Using native confirm since we're moving away from Quasar dialogs
  if (confirm(`Are you sure you want to delete "${account.name}"? This action cannot be undone.`)) {
    deleteAccountMutation.mutateAsync(account.id).catch((error) => {
      console.error('Failed to delete account:', error);
    });
  }
};

const handleViewTransactions = (account: Account) => {
  router.push({
    name: 'transactions',
    query: { account_id: account.id },
  });
};

const handleAdjustBalance = (account: Account) => {
  selectedAccount.value = account;
  adjustBalanceForm.value = {
    new_balance: account.balance,
    reason: '',
  };
  showAdjustBalanceDialog.value = true;
};

const handleSaveAdjustBalance = async () => {
  if (!selectedAccount.value) return;

  try {
    await updateAccountMutation.mutateAsync({
      id: selectedAccount.value.id,
      data: {
        name: selectedAccount.value.name,
        type: selectedAccount.value.type,
        balance: adjustBalanceForm.value.new_balance,
        currency: selectedAccount.value.currency,
      } as UpdateAccountDto,
    });

    showAdjustBalanceDialog.value = false;
    selectedAccount.value = null;
  } catch (error) {
    console.error('Failed to adjust balance:', error);
  }
};

const openIconDialog = () => {
  showIconDialog.value = true;
};

const selectIcon = (iconName: string) => {
  selectedIcon.value = iconName;
  accountForm.value.icon = iconName;
  showIconDialog.value = false;
};

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    uploadedIcon.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      selectedIcon.value = result;
      accountForm.value.icon = result;
    };
    reader.readAsDataURL(file);
    showIconDialog.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-muted/30">
    <div class="p-4 space-y-4">
      <!-- Add Account Button -->
      <div class="flex justify-end">
        <Button @click="addModalDialog = true">
          <Plus class="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      <!-- Net Worth Card -->
      <div class="relative overflow-hidden rounded-xl bg-linear-to-br from-indigo-500 via-violet-600 to-indigo-700 text-white p-6 shadow-lg">
        <!-- subtle dot pattern -->
        <div class="absolute inset-0 opacity-10"
          style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 20px 20px;" />
        <!-- indigo glow -->
        <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div class="relative text-center mb-4">
          <div class="text-sm font-medium opacity-80 mb-1 uppercase tracking-widest">Net Worth</div>
          <div class="text-4xl font-bold tracking-tight">{{ formattedNetWorth }}</div>
        </div>
        <div class="relative grid grid-cols-2 gap-4">
          <div class="text-center rounded-lg bg-white/10 py-3">
            <div class="text-xs opacity-70 mb-1 uppercase tracking-wide">Assets</div>
            <div class="text-lg font-semibold">{{ formattedTotalAssets }}</div>
          </div>
          <div class="text-center rounded-lg bg-white/10 py-3">
            <div class="text-xs opacity-70 mb-1 uppercase tracking-wide">Liabilities</div>
            <div class="text-lg font-semibold">{{ formattedTotalLiabilities }}</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="accountsLoading" class="flex justify-center py-16">
        <Loader2 class="w-12 h-12 text-primary animate-spin" />
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Empty State -->
        <div v-if="!accounts || accounts.length === 0" class="text-center py-16 space-y-4">
          <Wallet class="w-20 h-20 mx-auto text-muted-foreground/50" />
          <div class="text-lg font-medium text-muted-foreground">No accounts yet</div>
          <p class="text-sm text-muted-foreground">
            Add your first account to start tracking your finances
          </p>
          <Button @click="addModalDialog = true">
            <Plus class="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>

        <!-- Account Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AccountCard v-for="account in accounts" :key="account.id" :account="account" @edit="handleEditAccount"
            @delete="handleDeleteAccount" @view-transactions="handleViewTransactions"
            @adjust-balance="handleAdjustBalance" />
        </div>
      </div>
    </div>

    <!-- Add Account Category Sheet -->
    <Sheet v-model:open="addModalDialog">
      <SheetContent side="bottom" class="h-[90vh] rounded-t-2xl bg-background p-0 flex flex-col">

        <!-- Drag handle -->
        <div class="flex justify-center pt-3 pb-1 shrink-0">
          <div class="w-10 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        <!-- Header -->
        <SheetHeader class="px-5 pt-2 pb-4 border-b border-border shrink-0">
          <SheetTitle class="text-lg font-bold text-gray-900 dark:text-white">Add Account</SheetTitle>
          <SheetDescription class="text-sm text-muted-foreground">Choose a category to get started</SheetDescription>
        </SheetHeader>

        <ScrollArea class="flex-1 overflow-y-auto">
          <div class="px-4 py-4 space-y-5">

            <!-- Debit Section -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <div class="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <Banknote class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span class="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Debit</span>
              </div>
              <div class="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                <button v-for="item in debitAccounts" :key="item.label"
                  class="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-muted/60 dark:hover:bg-white/5 transition-colors text-left group"
                  @click="handleSelectCategory(item.type)">
                  <div class="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <component :is="item.icon" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span class="text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white">{{ item.label }}</span>
                  <ChevronRight class="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            <!-- Credit Section -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <div class="w-5 h-5 rounded-md bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                  <CreditCard class="w-3 h-3 text-rose-600 dark:text-rose-400" />
                </div>
                <span class="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Credit</span>
              </div>
              <div class="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                <button v-for="item in creditAccounts" :key="item.label"
                  class="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-muted/60 dark:hover:bg-white/5 transition-colors text-left group"
                  @click="handleSelectCategory(item.type)">
                  <div class="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                    <component :is="item.icon" class="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  </div>
                  <span class="text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white">{{ item.label }}</span>
                  <ChevronRight class="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            <!-- Borrow / Lend Section -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <div class="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <Users class="w-3 h-3 text-amber-600 dark:text-amber-400" />
                </div>
                <span class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Borrow / Lend</span>
              </div>
              <div class="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                <button v-for="item in borrowLendAccounts" :key="item.label"
                  class="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-muted/60 dark:hover:bg-white/5 transition-colors text-left group"
                  @click="handleSelectCategory(item.type)">
                  <div class="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <component :is="item.icon" class="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span class="text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white">{{ item.label }}</span>
                  <ChevronRight class="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            <!-- Invest Section -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <div class="w-5 h-5 rounded-md bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                  <TrendingUp class="w-3 h-3 text-violet-600 dark:text-violet-400" />
                </div>
                <span class="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">Invest</span>
              </div>
              <div class="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                <button v-for="item in investAccounts" :key="item.label"
                  class="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-muted/60 dark:hover:bg-white/5 transition-colors text-left group"
                  @click="handleSelectCategory(item.type)">
                  <div class="w-9 h-9 rounded-full bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                    <component :is="item.icon" class="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <span class="text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white">{{ item.label }}</span>
                  <ChevronRight class="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>

    <!-- Account Form Sheet -->
    <Sheet v-model:open="showAccountDialog">
      <SheetContent side="bottom" class="h-[92vh] rounded-t-2xl bg-background p-0 flex flex-col">

        <!-- Drag handle -->
        <div class="flex justify-center pt-3 pb-1 shrink-0">
          <div class="w-10 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        <!-- Header -->
        <SheetHeader class="px-5 pt-2 pb-4 border-b border-border shrink-0">
          <SheetTitle class="text-lg font-bold text-gray-900 dark:text-white">
            {{ selectedAccount ? 'Edit Account' : 'New Account' }}
          </SheetTitle>
          <SheetDescription class="text-sm text-muted-foreground">
            {{ selectedAccount ? 'Update your account details' : 'Fill in the details for your new account' }}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea class="flex-1 overflow-y-auto">
          <div class="px-5 py-5 space-y-5">

            <!-- Icon + Name row -->
            <div class="flex items-center gap-4">
              <!-- Icon picker -->
              <button
                class="w-14 h-14 rounded-2xl border-2 border-dashed border-border bg-muted/40 dark:bg-muted/20 flex items-center justify-center shrink-0 hover:border-primary hover:bg-primary/5 transition-colors"
                @click="openIconDialog">
                <img v-if="selectedIcon.startsWith('img:') || selectedIcon.startsWith('data:')"
                  :src="selectedIcon.startsWith('img:') ? selectedIcon.replace('img:', '') : selectedIcon"
                  class="w-8 h-8 rounded-lg" alt="Account icon" />
                <PiggyBank v-else class="w-7 h-7 text-muted-foreground" />
              </button>
              <!-- Name field -->
              <div class="flex-1 space-y-1.5">
                <Label for="account-name" class="text-sm font-medium text-gray-700 dark:text-gray-300">Account Name</Label>
                <Input
                  id="account-name"
                  v-model="accountForm.name"
                  placeholder="e.g. My Savings"
                  class="bg-muted/30 dark:bg-muted/20 border-border" />
              </div>
            </div>

            <!-- Account Type -->
            <div class="space-y-1.5">
              <Label class="text-sm font-medium text-gray-700 dark:text-gray-300">Account Type</Label>
              <Select v-model="accountForm.type">
                <SelectTrigger class="bg-muted/30 dark:bg-muted/20 border-border text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in accountTypeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Initial Balance -->
            <div class="space-y-1.5">
              <Label for="account-balance" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ selectedAccount ? 'Current Balance' : 'Initial Balance' }}
              </Label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  {{ settingsStore.settings.currencySymbol }}
                </span>
                <Input
                  id="account-balance"
                  v-model.number="accountForm.balance"
                  type="number"
                  step="0.01"
                  class="pl-8 bg-muted/30 dark:bg-muted/20 border-border text-gray-900 dark:text-gray-100"
                  placeholder="0.00" />
              </div>
            </div>

            <!-- Account Number -->
            <div class="space-y-1.5">
              <Label for="account-number" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Account Number
                <span class="text-muted-foreground font-normal ml-1">(Optional)</span>
              </Label>
              <Input
                id="account-number"
                v-model="accountForm.account_number"
                placeholder="e.g. **** 4242"
                class="bg-muted/30 dark:bg-muted/20 border-border text-gray-900 dark:text-gray-100" />
            </div>

            <!-- Color Swatches -->
            <div class="space-y-2">
              <Label class="text-sm font-medium text-gray-700 dark:text-gray-300">Account Color</Label>
              <div class="flex flex-wrap gap-2.5">
                <button
                  v-for="option in colorOptions"
                  :key="option.value"
                  :title="option.label"
                  :style="{ backgroundColor: option.value }"
                  :class="[
                    'w-8 h-8 rounded-full transition-all',
                    accountForm.color === option.value
                      ? 'ring-2 ring-offset-2 ring-offset-background ring-gray-700 dark:ring-gray-200 scale-110'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  ]"
                  @click="accountForm.color = option.value"
                />
              </div>
            </div>

          </div>
        </ScrollArea>

        <!-- Footer -->
        <div class="px-5 py-4 border-t border-border shrink-0 flex items-center gap-3">
          <Button variant="outline" class="flex-1 border-border text-gray-700 dark:text-gray-300 hover:bg-muted/60" @click="closeAccountDialog">
            Cancel
          </Button>
          <Button class="flex-1" @click="saveAccount" :disabled="loading">
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            {{ selectedAccount ? 'Save Changes' : 'Create Account' }}
          </Button>
        </div>
      </SheetContent>
    </Sheet>

    <!-- Adjust Balance Dialog -->
    <Dialog v-model:open="showAdjustBalanceDialog">
      <DialogContent class="sm:max-w-sm bg-background border-border">
        <DialogHeader class="pb-2">
          <DialogTitle class="text-lg font-bold text-gray-900 dark:text-white">Adjust Balance</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground">
            Correct the balance for <span class="font-medium text-gray-800 dark:text-gray-200">{{ selectedAccount?.name }}</span>
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-2">
          <!-- Current balance chip -->
          <div class="flex items-center justify-between rounded-lg bg-muted/40 dark:bg-muted/20 px-4 py-3 border border-border">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current Balance</span>
            <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {{ settingsStore.settings.currencySymbol }}{{ selectedAccount?.balance?.toFixed(2) ?? '0.00' }}
            </span>
          </div>

          <!-- New balance input -->
          <div class="space-y-1.5">
            <Label for="new-balance" class="text-sm font-medium text-gray-700 dark:text-gray-300">New Balance</Label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                {{ settingsStore.settings.currencySymbol }}
              </span>
              <Input
                id="new-balance"
                v-model.number="adjustBalanceForm.new_balance"
                type="number"
                step="0.01"
                class="pl-8 bg-muted/30 dark:bg-muted/20 border-border text-gray-900 dark:text-gray-100 text-base font-semibold" />
            </div>
          </div>

          <!-- Reason input -->
          <div class="space-y-1.5">
            <Label for="adjust-reason" class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Reason
              <span class="text-muted-foreground font-normal ml-1">(Optional)</span>
            </Label>
            <Input
              id="adjust-reason"
              v-model="adjustBalanceForm.reason"
              placeholder="e.g. Bank statement correction"
              class="bg-muted/30 dark:bg-muted/20 border-border text-gray-900 dark:text-gray-100" />
          </div>
        </div>

        <DialogFooter class="gap-2 pt-2">
          <Button variant="outline" class="flex-1 border-border text-gray-700 dark:text-gray-300 hover:bg-muted/60" @click="showAdjustBalanceDialog = false">
            Cancel
          </Button>
          <Button class="flex-1" @click="handleSaveAdjustBalance" :disabled="loading">
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            Update Balance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Icon Selection Dialog -->
    <Dialog v-model:open="showIconDialog">
      <DialogContent class="sm:max-w-sm bg-background border-border">
        <DialogHeader class="pb-2">
          <DialogTitle class="text-lg font-bold text-gray-900 dark:text-white">Choose Icon</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground">Pick an icon or upload your own</DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-2">
          <!-- Upload Custom Image -->
          <Button variant="outline" class="relative w-full border-dashed border-border text-gray-700 dark:text-gray-300 hover:bg-muted/60">
            <Upload class="w-4 h-4 mr-2" />
            Upload Custom Image
            <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer"
              @change="handleImageUpload" />
          </Button>

          <Separator class="bg-border" />

          <!-- Icon Grid -->
          <div>
            <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Available Icons</p>
            <div class="grid grid-cols-4 gap-3">
              <button v-for="icon in iconOptions" :key="icon.name" :class="[
                'flex items-center justify-center w-full aspect-square rounded-xl border-2 transition-all',
                selectedIcon === icon.name
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-transparent bg-muted/50 dark:bg-muted/20 hover:bg-muted dark:hover:bg-muted/40 hover:-translate-y-0.5 hover:shadow-md'
              ]" @click="selectIcon(icon.name)">
                <img :src="icon.name.replace('img:', '')" class="w-9 h-9" :alt="icon.category" />
              </button>
            </div>
          </div>
        </div>

        <DialogFooter class="pt-2">
          <Button variant="outline" class="w-full border-border text-gray-700 dark:text-gray-300 hover:bg-muted/60" @click="showIconDialog = false">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
/* All styles are now handled by Tailwind CSS classes */
</style>
