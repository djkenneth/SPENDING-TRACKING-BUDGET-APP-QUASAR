<!-- src/pages/AccountsPage.vue -->

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  useAccounts,
  useAccountsSummary,
  useAccountTypes,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount
} from 'src/composables/useAccounts';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency } from 'src/utilities/currency';
import { Account, CreateAccountDto, UpdateAccountDto } from 'src/types/account.types';
import AccountCard from 'src/components/Accountcard.vue';
import { Card, CardContent } from 'src/components/ui/card';
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
  if (!accountTypesData.value) {
    return [
      { label: 'Cash', value: 'cash' },
      { label: 'Bank', value: 'bank' },
      { label: 'Credit Card', value: 'credit_card' },
      { label: 'Investment', value: 'investment' },
      { label: 'E-Wallet', value: 'ewallet' },
    ];
  }

  return Object.entries(accountTypesData.value).map(([key, data]) => ({
    label: data.label,
    value: key
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
      <Card class="bg-gradient-to-br from-purple-600 to-purple-800 text-white border-0">
        <CardContent class="!p-6">
          <div class="text-center">
            <div class="text-sm opacity-80 mb-1">Net Worth</div>
            <div class="text-4xl font-bold mb-4">{{ formattedNetWorth }}</div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <div class="text-xs opacity-80 mb-1">Assets</div>
              <div class="text-lg font-semibold">{{ formattedTotalAssets }}</div>
            </div>
            <div class="text-center">
              <div class="text-xs opacity-80 mb-1">Liabilities</div>
              <div class="text-lg font-semibold">{{ formattedTotalLiabilities }}</div>
            </div>
          </div>
        </CardContent>
      </Card>

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

    <!-- Add Account Category Sheet (Full screen on mobile) -->
    <Sheet v-model:open="addModalDialog">
      <SheetContent side="bottom" class="h-[90vh] rounded-t-2xl">
        <SheetHeader class="text-center pb-4">
          <SheetTitle class="text-xl font-bold">Add Account</SheetTitle>
          <SheetDescription class="sr-only">Choose account type to add</SheetDescription>
        </SheetHeader>

        <ScrollArea class="h-[calc(90vh-100px)] pr-4">
          <div class="space-y-6 pb-6">
            <!-- Debit Section -->
            <div>
              <h3 class="text-base font-semibold text-muted-foreground mb-3">Debit</h3>
              <div class="space-y-1">
                <button v-for="item in debitAccounts" :key="item.label"
                  class="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-muted transition-colors text-left"
                  @click="handleSelectCategory(item.type)">
                  <component :is="item.icon" class="w-5 h-5 text-muted-foreground" />
                  <span class="text-base font-medium">{{ item.label }}</span>
                </button>
              </div>
            </div>

            <Separator />

            <!-- Credit Section -->
            <div>
              <h3 class="text-base font-semibold text-muted-foreground mb-3">Credit</h3>
              <div class="space-y-1">
                <button v-for="item in creditAccounts" :key="item.label"
                  class="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-muted transition-colors text-left"
                  @click="handleSelectCategory(item.type)">
                  <component :is="item.icon" class="w-5 h-5 text-muted-foreground" />
                  <span class="text-base font-medium">{{ item.label }}</span>
                </button>
              </div>
            </div>

            <Separator />

            <!-- Borrow / Lend Section -->
            <div>
              <h3 class="text-base font-semibold text-muted-foreground mb-3">Borrow / Lend</h3>
              <div class="space-y-1">
                <button v-for="item in borrowLendAccounts" :key="item.label"
                  class="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-muted transition-colors text-left"
                  @click="handleSelectCategory(item.type)">
                  <component :is="item.icon" class="w-5 h-5 text-muted-foreground" />
                  <span class="text-base font-medium">{{ item.label }}</span>
                </button>
              </div>
            </div>

            <Separator />

            <!-- Invest Section -->
            <div>
              <h3 class="text-base font-semibold text-muted-foreground mb-3">Invest</h3>
              <div class="space-y-1">
                <button v-for="item in investAccounts" :key="item.label"
                  class="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-muted transition-colors text-left"
                  @click="handleSelectCategory(item.type)">
                  <component :is="item.icon" class="w-5 h-5 text-muted-foreground" />
                  <span class="text-base font-medium">{{ item.label }}</span>
                </button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>

    <!-- Account Form Dialog -->
    <Sheet v-model:open="showAccountDialog">
      <SheetContent side="bottom" class="h-[90vh] rounded-t-2xl">
        <SheetHeader class="text-center pb-4">
          <SheetTitle class="text-xl font-bold">
            {{ selectedAccount ? 'Edit Account' : 'Add Account' }}
          </SheetTitle>
          <SheetDescription class="sr-only">
            {{ selectedAccount ? 'Edit account details' : 'Fill in account details' }}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea class="h-[calc(90vh-160px)] pr-4">
          <div class="space-y-5 pb-6">
            <!-- Icon Selector -->
            <div class="flex items-center justify-between cursor-pointer" @click="openIconDialog">
              <Label class="text-base">Icon</Label>
              <img v-if="selectedIcon.startsWith('img:') || selectedIcon.startsWith('data:')"
                :src="selectedIcon.startsWith('img:') ? selectedIcon.replace('img:', '') : selectedIcon"
                class="w-8 h-8 rounded" alt="Account icon" />
              <PiggyBank v-else class="w-6 h-6 text-muted-foreground" />
            </div>

            <!-- Name -->
            <div class="space-y-2">
              <Label for="account-name">Name</Label>
              <Input id="account-name" v-model="accountForm.name" placeholder="Account name" />
            </div>

            <!-- Account Type -->
            <div class="space-y-2">
              <Label>Account Type</Label>
              <Select v-model="accountForm.type">
                <SelectTrigger>
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
            <div class="space-y-2">
              <Label for="account-balance">Initial Balance</Label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {{ settingsStore.settings.currencySymbol }}
                </span>
                <Input id="account-balance" v-model.number="accountForm.balance" type="number" step="0.01"
                  class="pl-8" placeholder="0.00" />
              </div>
            </div>

            <!-- Account Number -->
            <div class="space-y-2">
              <Label for="account-number">Account Number (Optional)</Label>
              <Input id="account-number" v-model="accountForm.account_number" placeholder="Account number" />
            </div>

            <!-- Color -->
            <div class="space-y-2">
              <Label>Color</Label>
              <Select v-model="accountForm.color">
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in colorOptions" :key="option.value" :value="option.value">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: option.value }" />
                      {{ option.label }}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" @click="closeAccountDialog">Cancel</Button>
          <Button @click="saveAccount" :disabled="loading">
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>

    <!-- Adjust Balance Dialog -->
    <Dialog v-model:open="showAdjustBalanceDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Balance</DialogTitle>
          <DialogDescription>
            Update the balance for {{ selectedAccount?.name }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="new-balance">New Balance</Label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {{ settingsStore.settings.currencySymbol }}
              </span>
              <Input id="new-balance" v-model.number="adjustBalanceForm.new_balance" type="number" step="0.01"
                class="pl-8" />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="adjust-reason">Reason (Optional)</Label>
            <Input id="adjust-reason" v-model="adjustBalanceForm.reason" placeholder="Reason for adjustment" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showAdjustBalanceDialog = false">Cancel</Button>
          <Button @click="handleSaveAdjustBalance" :disabled="loading">
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Icon Selection Dialog -->
    <Dialog v-model:open="showIconDialog">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose Icon</DialogTitle>
          <DialogDescription class="sr-only">Select an icon for your account</DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <!-- Upload Custom Image -->
          <div class="text-center">
            <Button variant="outline" class="relative">
              <Upload class="w-4 h-4 mr-2" />
              Upload Custom Image
              <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer"
                @change="handleImageUpload" />
            </Button>
          </div>

          <Separator />

          <!-- Icon Grid -->
          <div>
            <p class="text-sm font-medium text-muted-foreground text-center mb-3">
              Select from Available Icons
            </p>
            <div class="grid grid-cols-4 gap-3">
              <button v-for="icon in iconOptions" :key="icon.name" :class="[
                'flex items-center justify-center w-14 h-14 rounded-xl border-2 transition-all',
                selectedIcon === icon.name
                  ? 'border-primary bg-primary/10 -translate-y-0.5 shadow-md'
                  : 'border-transparent bg-muted hover:bg-accent hover:-translate-y-0.5 hover:shadow-md'
              ]" @click="selectIcon(icon.name)">
                <img :src="icon.name.replace('img:', '')" class="w-8 h-8" :alt="icon.category" />
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showIconDialog = false">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
/* All styles are now handled by Tailwind CSS classes */
</style>
