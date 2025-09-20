<!-- src/pages/AccountsPage.vue -->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import {
  useAccounts,
  useAccountsSummary,
  useAccountTypes,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount
} from 'src/composables/useAccounts';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency } from 'src/utils/currency';
import type { Account, CreateAccountDto, UpdateAccountDto } from 'src/services/accounts.service';

const $q = useQuasar();
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
const maximizedToggle = ref(true)

const showAccountDialog = ref(false);
const selectedAccount = ref<Account | null>(null);
const accountForm = ref<CreateAccountDto & { id?: number }>({
  name: '',
  type: 'cash',
  initial_balance: 0,
  currency: settingsStore.settings.currency,
  color: '#FF0000',
  icon: 'account_balance',
  account_number: '',
});

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

const accountStatistics = computed(() => {
  const accountsList = accounts.value;
  const totalBalance = accountsSummary.value?.total_balance || 0;
  return {
    totalAccounts: accountsList.length,
    averageBalance: accountsList.length > 0 ? totalBalance / accountsList.length : 0,
  };
});

const accountTypeOptions = computed(() => {
  if (!accountTypesData.value) {
    return [
      { label: 'Cash', value: 'cash' },
      { label: 'Checking', value: 'checking' },
      { label: 'Savings', value: 'savings' },
      { label: 'Credit Card', value: 'credit_card' },
      { label: 'Investment', value: 'investment' },
      { label: 'E-Wallet', value: 'e_wallet' },
      { label: 'Loan', value: 'loan' },
    ];
  }

  return Object.entries(accountTypesData.value).map(([key, data]) => ({
    label: data.name,
    value: key
  }));
});

const colorOptions = computed(() => [
  { label: 'Blue', value: 'blue' },
  { label: 'Green', value: 'green' },
  { label: 'Orange', value: 'orange' },
  { label: 'Red', value: 'red' },
  { label: 'Purple', value: 'purple' },
  { label: 'Teal', value: 'teal' },
  { label: 'Pink', value: 'pink' },
  { label: 'Grey', value: 'grey' },
]);

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
const formatAccountBalance = (balance: number) => {
  return settingsStore.settings.showBalances
    ? formatCurrency(balance, settingsStore.settings.currency)
    : `${settingsStore.settings.currencySymbol}****`;
};

const getAccountIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    cash: 'account_balance_wallet',
    checking: 'account_balance',
    savings: 'savings',
    credit_card: 'credit_card',
    investment: 'trending_up',
    e_wallet: 'phone_android',
    loan: 'money_off',
  };
  return iconMap[type] || 'account_balance';
};

const selectAccount = (account: Account) => {
  // Handle account selection (e.g., navigate to detail view)
  console.log('Selected account:', account);
};

const openAccountDialog = (account?: Account) => {
  if (account) {
    selectedAccount.value = account;
    accountForm.value = {
      id: account.id,
      name: account.name,
      type: account.type,
      initial_balance: account.initial_balance,
      currency: account.currency,
      color: account.color || '#FF0000',
      icon: account.icon || getAccountIcon(account.type),
      account_number: account.account_number || '',
    };
  } else {
    selectedAccount.value = null;
    accountForm.value = {
      name: '',
      type: 'cash',
      initial_balance: 0,
      currency: settingsStore.settings.currency,
      color: '#FF0000',
      icon: 'account_balance',
      account_number: '',
    };
  }
  showAccountDialog.value = true;
  addModalDialog.value = false;
};

const closeAccountDialog = () => {
  showAccountDialog.value = false;
  selectedAccount.value = null;
};

const saveAccount = async () => {
  try {
    if (accountForm.value.id) {
      // Update existing account
      const { id, ...updateData } = accountForm.value;
      await updateAccountMutation.mutateAsync({
        id,
        data: updateData as UpdateAccountDto
      });
    } else {
      // Create new account
      const createData = { ...accountForm.value, type: accountForm.value.type };
      delete createData.id;

      await createAccountMutation.mutateAsync(createData as CreateAccountDto);
    }
    closeAccountDialog();
  } catch (error) {
    console.error('Failed to save account:', error);
  }
};

const confirmDeleteAccount = (account: Account) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteAccountMutation.mutateAsync(account.id);
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  });
};
</script>

<template>
  <div class="accounts-page">
    <!-- Header with total assets -->
    <div class="q-pa-md">
      <!-- Add Account Button -->
      <div class="q-mb-sm row justify-end q-my-md">
        <q-btn color="primary" icon="add" round @click="addModalDialog = true" size="sm" />
      </div>

      <q-card class="total-assets-card q-pa-lg q-mb-md">
        <div class="row items-center justify-center">
          <div class="text-center">
            <div class="text-h6">Net Worth</div>
            <div class="text-h4 text-weight-bold q-mt-xs">
              {{ formattedNetWorth }}
            </div>
          </div>
        </div>
        <div class="row q-mt-md">
          <div class="col text-center">
            <div class="text-caption opacity-80">Assets</div>
            <div class="text-h6">
              {{ formattedTotalAssets }}
            </div>
          </div>
          <div class="col text-center">
            <div class="text-caption opacity-80">Liabilities</div>
            <div class="text-h6">
              {{ formattedTotalLiabilities }}
            </div>
          </div>
        </div>
      </q-card>

      <!-- Account Statistics -->
      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h6">{{ accountStatistics.totalAccounts }}</div>
              <div class="text-caption">Total Accounts</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h6">
                {{ formatAccountBalance(accountStatistics.averageBalance) }}
              </div>
              <div class="text-caption">Average Balance</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Account Grid -->
      <div class="account-grid">
        <q-card v-for="account in accounts" :key="account.id" class="account-card cursor-pointer"
          @click="selectAccount(account)">
          <div class="fit column justify-between">
            <div class="q-mb-sm">
              <q-avatar :style="{ 'background-color': account.color }" text-color="white" class="q-mb-sm" size="xl">
                <!-- <q-icon :name="getAccountIcon(account.type)" size="24px" :style="{ color: account.color }" /> -->
                <q-icon name="img:account-category-icon/paypal.png" />
              </q-avatar>
              <div style="font-size: 1.175rem; font-weight: bold;">{{ account.name }}</div>
              <div class="text-grey-6" style="font-size: 1.075rem;">{{ account.type }}</div>
              <div v-if="account.account_number" class="text-caption text-grey-6 q-mb-sm">
                {{ account.account_number }}
              </div>
            </div>
            <div class="text-weight-bold" style="font-size: 1.175rem;">
              {{ formatAccountBalance(account.balance) }}
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="addModalDialog" persistent :maximized="maximizedToggle" transition-show="slide-up"
      transition-hide="slide-down">
      <q-card class="bg-white text-black">
        <q-card-section class="row justify-center">
          <q-icon name="close" size="md" class="absolute-left" style="top: 15px; left: 15px"
            @click="addModalDialog = false" />
          <div class="text-h5 text-weight-bold">Add Account</div>
        </q-card-section>
        <q-card-section>
          <div>
            <div class="text-h6 text-grey-8 q-mb-md">Debit</div>
            <div class="account-wrapper">
              <div class="text-h6 account-item">
                <q-icon name="img:account-category-icon/credit-card.png" size="sm" />
                <span>Debit Card</span>
              </div>
              <div class="text-h6 account-item">
                <q-icon name="img:account-category-icon/philippine-peso.png" size="sm" />
                <span>Cash</span>
              </div>
              <div class="text-h6 account-item">
                <q-icon name="img:account-category-icon/paypal.png" size="sm" />
                <span>Paypal</span>
              </div>
              <div class="text-h6 account-item" @click="openAccountDialog()">
                <q-icon name="img:account-category-icon/piggy-bank.png" size="sm" />
                <span>Other Debit Account</span>
              </div>
            </div>
          </div>
          <q-separator class="q-my-lg" />
          <div>
            <div class="text-h6 text-grey-8 q-mb-md">Credit</div>
            <div class="account-wrapper">
              <div class="text-h6 account-item">
                <q-icon name="img:account-category-icon/credit-card.png" size="sm" />
                <span>Credit Card</span>
              </div>
              <div class="text-h6 account-item">
                <q-icon name="img:account-category-icon/atm-card.png" size="sm" />
                <span>Other Credit Card</span>
              </div>
            </div>
          </div>
          <q-separator class="q-my-lg" />
          <div>
            <div class="text-h6 text-grey-8 q-mb-md">Borrow / Lend</div>
            <div class="account-wrapper">
              <div class="text-h6 account-item">
                <q-icon name="img:account-category-icon/peer-to-peer.png" size="sm" />
                <span>Lend</span>
              </div>
              <div class="text-h6 account-item">
                <q-icon name="img:account-category-icon/book.png" size="sm" />
                <span>Borrowed</span>
              </div>
              <div class="text-h6 account-item">
                <q-icon name="img:account-category-icon/signing.png" size="sm" />
                <span>loan</span>
              </div>
            </div>
          </div>
          <q-separator class="q-my-lg" />
          <div>
            <div class="text-h6 text-grey-8 q-mb-md">Invest</div>
            <div class="account-wrapper">
              <div class="text-h6 account-item">
                <q-icon name="img:account-category-icon/stock-market.png" size="sm" />
                <span>Stock</span>
              </div>
              <div class="text-h6 account-item">
                <q-icon name="img:account-category-icon/forex.png" size="sm" />
                <span>Fund</span>
              </div>
              <div class="text-h6 account-item">
                <q-icon name="img:account-category-icon/bitcoin.png" size="sm" />
                <span>Crypto Currencies</span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Account Dialog -->
    <q-dialog v-model="showAccountDialog" persistent :maximized="maximizedToggle" transition-show="slide-up"
      transition-hide="slide-down">
      <q-card>
        <q-card-section class="row justify-center q-mb-xl">
          <q-icon name="close" size="md" class="absolute-left" style="top: 15px; left: 15px"
            @click="showAccountDialog = false" />
          <div class="text-h5 text-weight-bold">
            {{ selectedAccount ? 'Edit Account' : 'Add Account' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none q-px-lg">
          <q-form class="q-gutter-md">
            <div class="text-h6 row justify-between q-pb-md">
              <span>Icon</span>
              <q-icon name="img:account-category-icon/piggy-bank.png" size="sm" />
            </div>
            <q-input filled v-model="accountForm.name" label="Name" required
              :rules="[(val) => (val && val.length > 0) || 'Name is required']" />

            <q-select filled v-model="accountForm.type" :options="accountTypeOptions" option-label="label"
              option-value="value" emit-value map-options label="Account Type" required
              :rules="[(val) => (val && val.length > 0) || 'Type is required']" />

            <q-input filled v-model.number="accountForm.balance" label="Initial Balance" type="number" step="0.01"
              :prefix="settingsStore.settings.currencySymbol" required
              :rules="[(val) => (val && val > 0) || 'Initial Balance is required']" />

            <q-input filled v-model="accountForm.number" label="Account Number (Optional)" class="q-pb-md" />

            <q-select filled v-model="accountForm.color" :options="colorOptions" option-label="label"
              option-value="value" label="Color" />

            <div class="row items-center q-gutter-md">
              <div class="text-subtitle2">Icon Preview:</div>
              <q-avatar size="32px" :color="accountForm.color" text-color="white">
                <q-icon :name="getAccountIcon(accountForm.type)" size="18px" />
              </q-avatar>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="closeAccountDialog" />
          <q-btn label="Save" color="primary" @click="saveAccount" :loading="loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped lang="scss">
.accounts-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.total-assets-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
}

.stat-card {
  border-radius: 12px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 8px;
}

.account-card {
  border-radius: 12px;
  padding: 16px;
  position: relative;
  transition: all 0.2s ease;
  min-height: 140px;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.account-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.account-card:hover .account-actions {
  opacity: 1;
}

.account-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.account-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-left: 0.475rem;
  padding-block: 0.475rem;
  cursor: pointer;
}

.account-item:hover {
  background-color: #e0e0e0;
}

@media (max-width: 768px) {
  .account-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media (max-width: 425px) {
  .account-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
</style>
