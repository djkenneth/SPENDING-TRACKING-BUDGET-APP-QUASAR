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

const showIconDialog = ref(false);
const selectedIcon = ref('img:account-category-icon/piggy-bank.png');
const uploadedIcon = ref<File | null>(null);

const showAccountDialog = ref(false);
const selectedAccount = ref<Account | null>(null);
const accountForm = ref<CreateAccountDto & { id?: number }>({
  name: '',
  type: 'cash',
  initial_balance: 0,
  currency: settingsStore.settings.currency,
  color: '#FF0000',
  icon: 'img:account-category-icon/piggy-bank.png',
  account_number: '',
});

// Icon options based on your image
const iconOptions = [
  // Financial Services Row 1
  { name: 'img:account-category-icon/paypal.png', category: 'financial' },
  // { name: 'img:account-category-icon/dollar.png', category: 'financial' },
  // { name: 'img:account-category-icon/mastercard.png', category: 'financial' },
  // { name: 'img:account-category-icon/visa.png', category: 'financial' },
  // { name: 'img:account-category-icon/american-express.png', category: 'financial' },

  // Row 2
  // { name: 'img:account-category-icon/cash.png', category: 'financial' },
  // { name: 'img:account-category-icon/facetime.png', category: 'financial' },
  // { name: 'img:account-category-icon/security.png', category: 'security' },
  { name: 'img:account-category-icon/bitcoin.png', category: 'crypto' },
  { name: 'img:account-category-icon/piggy-bank.png', category: 'savings' },

  // Row 3
  // { name: 'img:account-category-icon/home.png', category: 'property' },
  // { name: 'img:account-category-icon/chart.png', category: 'analytics' },
  // { name: 'img:account-category-icon/crown.png', category: 'premium' },
  // { name: 'img:account-category-icon/email.png', category: 'communication' },
  // { name: 'img:account-category-icon/money.png', category: 'financial' },

  // Row 4
  // { name: 'img:account-category-icon/warning.png', category: 'alert' },
  // { name: 'img:account-category-icon/coins.png', category: 'financial' },
  // { name: 'img:account-category-icon/star.png', category: 'premium' },
  // { name: 'img:account-category-icon/textsnow.png', category: 'communication' },
  // { name: 'img:account-category-icon/badge.png', category: 'achievement' },

  // Row 5
  { name: 'img:account-category-icon/credit-card.png', category: 'financial' },
  // { name: 'img:account-category-icon/bank.png', category: 'financial' },
  // { name: 'img:account-category-icon/dollar-circle.png', category: 'financial' },
  // { name: 'img:account-category-icon/whatsapp.png', category: 'communication' },
  // { name: 'img:account-category-icon/card.png', category: 'financial' },

  // Row 6 - Banks/Financial Institutions
  // { name: 'img:account-category-icon/citi.png', category: 'bank' },
  // { name: 'img:account-category-icon/hsbc.png', category: 'bank' },
  // { name: 'img:account-category-icon/coca-cola.png', category: 'brand' },
  // { name: 'img:account-category-icon/teamviewer.png', category: 'tech' },
  // { name: 'img:account-category-icon/infuse.png', category: 'tech' },

  // Row 7
  // { name: 'img:account-category-icon/target.png', category: 'retail' },
  // { name: 'img:account-category-icon/unity.png', category: 'tech' },
  // { name: 'img:account-category-icon/network.png', category: 'tech' },
  // { name: 'img:account-category-icon/bp.png', category: 'energy' },
  // { name: 'img:account-category-icon/spotify.png', category: 'entertainment' },

  // Row 8
  // { name: 'img:account-category-icon/kbc.png', category: 'bank' },
  // { name: 'img:account-category-icon/twitter.png', category: 'social' },
  // { name: 'img:account-category-icon/s-planner.png', category: 'productivity' },
  // { name: 'img:account-category-icon/uc-browser.png', category: 'tech' },
  // { name: 'img:account-category-icon/freelancer.png', category: 'work' }
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
      icon: account.icon || 'img:account-category-icon/piggy-bank.png',
      account_number: account.account_number || '',
    };
    selectedIcon.value = account.icon || 'img:account-category-icon/piggy-bank.png';
  } else {
    selectedAccount.value = null;
    accountForm.value = {
      name: '',
      type: 'cash',
      initial_balance: 0,
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

// Methods for icon selection
const openIconDialog = () => {
  showIconDialog.value = true;
};

const selectIcon = (iconName: string) => {
  selectedIcon.value = iconName;
  accountForm.value.icon = iconName;
  showIconDialog.value = false;
};

const handleImageUpload = (file: File) => {
  if (file) {
    uploadedIcon.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      selectedIcon.value = result; // This will be a data URL
      accountForm.value.icon = result;
    };
    reader.readAsDataURL(file);
    showIconDialog.value = false;
  }
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
              <!-- <q-icon :name="getAccountIcon(account.type)" size="24px" :style="{ color: account.color }" /> -->
              <q-icon :name="account.icon" size="32px" class="q-mb-sm" />
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
            <div class="text-h6 row justify-between q-pb-md cursor-pointer">
              <span>Icon</span>
              <q-icon name="img:account-category-icon/piggy-bank.png" size="sm" @click="openIconDialog" />
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

    <!-- Icon Selection Dialog -->
    <q-dialog v-model="showIconDialog" persistent transition-show="slide-up" transition-hide="slide-down">
      <q-card style="width: 700px; max-width: 100vw;">
        <q-card-section class="row justify-center q-mb-lg">
          <q-icon name="close" size="md" class="absolute-left cursor-pointer" style="top: 15px; left: 15px"
            @click="showIconDialog = false" />
          <div class="text-h5 text-weight-bold">Choose Icon</div>
        </q-card-section>

        <q-card-section class="q-pt-none q-px-lg">
          <!-- Upload Image Option -->
          <div class="text-center q-mb-lg">
            <q-btn unelevated color="primary" icon="cloud_upload" label="Upload Custom Image" class="q-mb-md">
              <q-popup-proxy>
                <q-file v-model="uploadedIcon" accept="image/*" @update:model-value="handleImageUpload"
                  style="display: none;" ref="fileInput" />
              </q-popup-proxy>
              <input type="file" accept="image/*" @change="(e) => handleImageUpload(e.target.files[0])"
                style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer;" />
            </q-btn>
          </div>

          <q-separator class="q-my-lg" />

          <!-- Icon Grid -->
          <div class="text-h6 text-grey-8 q-mb-md text-center">Select from Available Icons</div>
          <div class="icon-grid">
            <div v-for="icon in iconOptions" :key="icon.name" class="icon-item"
              :class="{ 'selected': selectedIcon === icon.name }" @click="selectIcon(icon.name)">
              <q-icon :name="icon.name" size="32px" />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn flat label="Cancel" color="grey-7" @click="showIconDialog = false" />
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

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 12px;
  padding: 16px 0;
  max-height: 400px;
  overflow-y: auto;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f5f5f5;

  &:hover {
    background-color: #e3f2fd;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    border-color: #1976d2;
    background-color: #e3f2fd;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  }
}

// Make the icon section clickable
.cursor-pointer {
  cursor: pointer;

  // &:hover {
  //   background-color: rgba(0, 0, 0, 0.04);
  //   border-radius: 4px;
  //   padding: 4px;
  // }
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
