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
      <q-card class="total-assets-card q-mb-md">
        <q-card-section>
          <div class="text-center">
            <div class="text-h4 text-weight-bold">{{ formattedTotalAssets }}</div>
            <div class="text-subtitle1 text-grey-6">Total Assets</div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Add Account Button -->
      <div class="q-mb-md">
        <q-btn color="primary" icon="add" label="Add Account" @click="openAccountDialog()" class="full-width" />
      </div>

      <!-- Account Statistics -->
      <div class="row q-gutter-md q-mb-md">
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
        <q-card v-for="account in accounts" :key="account.id" class="account-card q-pa-md cursor-pointer"
          @click="selectAccount(account)">
          <div class="text-center">
            <q-avatar size="48px" :color="account.color" text-color="white" class="q-mb-sm">
              <q-icon :name="getAccountIcon(account.type)" size="24px" :style="{ color: account.color }" />
            </q-avatar>
            <div class="text-subtitle2 q-mb-xs">{{ account.name }}</div>
            <div v-if="account.account_number" class="text-caption text-grey-6 q-mb-sm">
              {{ account.account_number }}
            </div>
            <div class="text-h6 text-weight-bold">
              {{ formatAccountBalance(account.balance) }}
            </div>
            <div class="text-caption text-grey-6">{{ account.type }}</div>
          </div>

          <!-- Account Actions -->
          <div class="account-actions q-mt-sm">
            <q-btn flat size="sm" icon="edit" @click.stop="openAccountDialog(account)" />
            <q-btn flat size="sm" icon="delete" @click.stop="confirmDeleteAccount(account)" />
          </div>
        </q-card>
      </div>
    </div>

    <!-- Account Dialog -->
    <q-dialog v-model="showAccountDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ selectedAccount ? 'Edit Account' : 'Add Account' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="q-gutter-md">
            <q-input v-model="accountForm.name" label="Account Name" required
              :rules="[(val) => (val && val.length > 0) || 'Account name is required']" />

            <q-select v-model="accountForm.type" :options="accountTypeOptions" option-label="label" option-value="value"
              emit-value map-options label="Account Type" required />

            <q-input v-model.number="accountForm.balance" label="Initial Balance" type="number" step="0.01"
              :prefix="settingsStore.settings.currencySymbol" required />

            <q-input v-model="accountForm.number" label="Account Number (Optional)" />

            <q-select v-model="accountForm.color" :options="colorOptions" option-label="label" option-value="value"
              label="Color" />

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

<style scoped>
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
  gap: 16px;
}

.account-card {
  border-radius: 12px;
  position: relative;
  transition: all 0.2s ease;
  min-height: 160px;
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

@media (max-width: 768px) {
  .account-grid {
    grid-template-columns: 1fr;
  }
}
</style>
