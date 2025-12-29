<template>
  <q-card class="account-card" :class="getAccountTypeClass(account.type)" flat>
    <q-card-section class="q-pa-none">
      <!-- Header with Icon, Name and Actions -->
      <div class="row items-start justify-between q-mb-md">
        <div class="row items-center q-gutter-sm">
          <q-icon :name="getAccountIcon(account.type)" size="28px" :color="getIconColor(account.type)" />
          <div>
            <div class="text-h6 text-weight-bold q-mb-none account-name">
              {{ account.name }}
            </div>
            <div class="text-caption text-grey-7">
              {{ account.institution || getAccountTypeName(account.type) }}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="row q-gutter-xs">
          <q-btn flat dense round size="md" icon="edit" @click.stop="$emit('edit', account)">
            <q-tooltip>Edit Account</q-tooltip>
          </q-btn>
          <q-btn flat dense round size="md" icon="delete" @click.stop="$emit('delete', account)">
            <q-tooltip>Delete Account</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Balance -->
      <div class="q-mb-md">
        <div class="text-caption text-grey-7 q-mb-xs">Current Balance</div>
        <div class="text-h5 text-weight-bold" :class="getBalanceColorClass(account.balance, account.type)">
          {{ formatBalance(account.balance) }}
        </div>
      </div>

      <!-- Account Details -->
      <div class="row justify-between items-center q-mb-md">
        <div>
          <div class="text-caption text-grey-7">Account Type</div>
          <div class="text-body2 text-weight-medium">
            {{ getAccountTypeName(account.type) }}
          </div>
        </div>
        <div class="text-right">
          <div class="text-caption text-grey-7">Last Updated</div>
          <div class="text-body2 text-weight-medium">
            {{ formatDate(account.updated_at) }}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="row q-gutter-sm">
        <q-btn outline no-caps color="primary" label="Transactions" size="md" class="col"
          @click.stop="$emit('view-transactions', account)" />
        <q-btn outline no-caps color="primary" label="Adjust Balance" size="md" class="col"
          @click.stop="$emit('adjust-balance', account)" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { format } from 'date-fns';
import { formatCurrency } from 'src/utils/currency';
import { useSettingsStore } from 'src/stores/settings';
import type { Account } from 'src/services/accounts.service';

// Props
interface Props {
  account: Account;
}

const props = defineProps<Props>();

// Emits
defineEmits<{
  edit: [account: Account];
  delete: [account: Account];
  viewTransactions: [account: Account];
  adjustBalance: [account: Account];
}>();

// Store
const settingsStore = useSettingsStore();

// Computed
const formatBalance = computed(() => {
  return (balance: number) => {
    if (settingsStore.settings.showBalances) {
      return formatCurrency(balance, settingsStore.settings.currency);
    }
    return `${settingsStore.settings.currencySymbol}****`;
  };
});

// Methods
const getAccountIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    checking: 'account_balance',
    savings: 'savings',
    credit_card: 'credit_card',
    investment: 'trending_up',
    loan: 'money_off',
    cash: 'payments',
    e_wallet: 'account_balance_wallet',
    other: 'account_balance_wallet',
  };
  return iconMap[type] || 'account_balance_wallet';
};

const getIconColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    checking: 'primary',
    savings: 'positive',
    credit_card: 'deep-orange',
    investment: 'purple',
    loan: 'negative',
    cash: 'amber',
    e_wallet: 'teal',
    other: 'grey-7',
  };
  return colorMap[type] || 'grey-7';
};

const getAccountTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    checking: 'Checking',
    savings: 'Savings',
    credit_card: 'Credit Card',
    investment: 'Investment',
    loan: 'Loan',
    cash: 'Cash',
    e_wallet: 'E-Wallet',
    other: 'Other',
  };
  return typeMap[type] || type;
};

const getAccountTypeClass = (type: string): string => {
  return `account-card--${type}`;
};

const getBalanceColorClass = (balance: number, type: string): string => {
  // Credit cards show negative balance as red
  if (type === 'credit_card' && balance < 0) {
    return 'text-negative';
  }
  // Loans show positive balance as red (debt)
  if (type === 'loan' && balance > 0) {
    return 'text-negative';
  }
  // Other accounts show positive as green, negative as red
  if (balance < 0) {
    return 'text-negative';
  }
  return 'text-positive';
};

const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy, hh:mm a');
};
</script>

<style scoped lang="scss">
.account-card {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e0e0e0;
  background: white;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    transition: background-color 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: currentColor;
  }

  // Type-specific accent colors
  // &--checking::before {
  //   background: linear-gradient(90deg, #2196F3, #1976D2);
  // }

  // &--savings::before {
  //   background: linear-gradient(90deg, #4CAF50, #388E3C);
  // }

  // &--credit_card::before {
  //   background: linear-gradient(90deg, #FF5722, #E64A19);
  // }

  // &--investment::before {
  //   background: linear-gradient(90deg, #9C27B0, #7B1FA2);
  // }

  // &--loan::before {
  //   background: linear-gradient(90deg, #F44336, #D32F2F);
  // }

  // &--cash::before {
  //   background: linear-gradient(90deg, #FFC107, #FFA000);
  // }

  // &--e_wallet::before {
  //   background: linear-gradient(90deg, #009688, #00796B);
  // }

  // &--other::before {
  //   background: linear-gradient(90deg, #607D8B, #455A64);
  // }
}

.account-name {
  font-size: 1.125rem;
  line-height: 1.4;
  color: #1a1a1a;
}

// Responsive adjustments
@media (max-width: 768px) {
  .account-name {
    font-size: 1rem;
  }

  .text-h5 {
    font-size: 1.5rem !important;
  }
}

@media (max-width: 425px) {
  .account-card {
    .row.q-gutter-sm {
      flex-direction: column;
      gap: 0.5rem !important;

      .q-btn {
        width: 100%;
      }
    }
  }
}
</style>
