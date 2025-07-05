// src/composables/useAccounts.ts
import { computed, ref } from 'vue';
import { useAccountsStore } from 'src/stores/accounts';
import { useSettingsStore } from 'src/stores/settings';
import { formatCurrency } from 'src/utils/currency';
import { validateAccount } from 'src/utils/validators';
import { useQuasar } from 'quasar';

export const useAccounts = () => {
  const accountsStore = useAccountsStore();
  const settingsStore = useSettingsStore();
  const $q = useQuasar();

  // State for account operations
  const loading = ref(false);
  const selectedAccount = ref(null);
  const showAccountDialog = ref(false);
  const accountForm = ref({
    name: '',
    type: 'bank',
    balance: 0,
    number: '',
    color: 'blue',
    icon: 'account_balance',
  });

  // Computed properties
  const accounts = computed(() => accountsStore.accounts);
  const totalAssets = computed(() => accountsStore.totalAssets);
  const accountsByType = computed(() => accountsStore.accountsByType);

  const formattedTotalAssets = computed(() => {
    return formatCurrency(totalAssets.value, settingsStore.settings.currency);
  });

  const accountTypeOptions = computed(() => [
    { label: 'Cash', value: 'cash', icon: 'account_balance_wallet' },
    { label: 'Bank Account', value: 'bank', icon: 'account_balance' },
    { label: 'E-Wallet', value: 'ewallet', icon: 'phone_android' },
    { label: 'Investment', value: 'investment', icon: 'trending_up' },
    { label: 'Credit Card', value: 'credit', icon: 'credit_card' },
  ]);

  const colorOptions = computed(() => [
    { label: 'Blue', value: 'blue' },
    { label: 'Red', value: 'red' },
    { label: 'Green', value: 'green' },
    { label: 'Orange', value: 'orange' },
    { label: 'Purple', value: 'purple' },
    { label: 'Cyan', value: 'cyan' },
    { label: 'Pink', value: 'pink' },
    { label: 'Teal', value: 'teal' },
  ]);

  // Methods
  const formatAccountBalance = (balance: number) => {
    if (!settingsStore.settings.showBalances) {
      return `${settingsStore.settings.currencySymbol}****`;
    }
    return formatCurrency(balance, settingsStore.settings.currency);
  };

  const selectAccount = (account: any) => {
    selectedAccount.value = account;
    // Could emit event or perform other actions
  };

  const openAccountDialog = (account: any = null) => {
    if (account) {
      // Edit mode
      accountForm.value = {
        name: account.name,
        type: account.type,
        balance: account.balance,
        number: account.number || '',
        color: account.color,
        icon: account.icon,
      };
      selectedAccount.value = account;
    } else {
      // Add mode
      resetAccountForm();
      selectedAccount.value = null;
    }
    showAccountDialog.value = true;
  };

  const closeAccountDialog = () => {
    showAccountDialog.value = false;
    selectedAccount.value = null;
    resetAccountForm();
  };

  const resetAccountForm = () => {
    accountForm.value = {
      name: '',
      type: 'bank',
      balance: 0,
      number: '',
      color: 'blue',
      icon: 'account_balance',
    };
  };

  const validateAccountForm = () => {
    return validateAccount({
      name: accountForm.value.name,
      type: accountForm.value.type,
      balance: accountForm.value.balance,
      number: accountForm.value.number,
    });
  };

  const saveAccount = async () => {
    loading.value = true;

    try {
      const validation = validateAccountForm();
      if (!validation.isValid) {
        $q.notify({
          type: 'negative',
          message: validation.errors.join(', '),
          position: 'top',
        });
        return;
      }

      if (selectedAccount.value) {
        // Update existing account
        accountsStore.updateAccount(selectedAccount.value.id, accountForm.value);
        $q.notify({
          type: 'positive',
          message: 'Account updated successfully',
          position: 'top',
        });
      } else {
        // Add new account
        accountsStore.addAccount(accountForm.value);
        $q.notify({
          type: 'positive',
          message: 'Account added successfully',
          position: 'top',
        });
      }

      closeAccountDialog();
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to save account',
        position: 'top',
      });
    } finally {
      loading.value = false;
    }
  };

  const deleteAccount = async (accountId: number) => {
    try {
      const success = accountsStore.deleteAccount(accountId);
      if (success) {
        $q.notify({
          type: 'positive',
          message: 'Account deleted successfully',
          position: 'top',
        });
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to delete account',
        position: 'top',
      });
    }
  };

  const confirmDeleteAccount = (account: any) => {
    $q.dialog({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete "${account.name}"?`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      deleteAccount(account.id);
    });
  };

  const updateAccountBalance = (accountName: string, amount: number, type: 'add' | 'subtract') => {
    accountsStore.updateBalance(accountName, amount, type);
  };

  const getAccountIcon = (type: string) => {
    const typeOption = accountTypeOptions.value.find((option) => option.value === type);
    return typeOption ? typeOption.icon : 'account_balance';
  };

  const getAccountsByType = (type: string) => {
    return accounts.value.filter((account) => account.type === type);
  };

  const searchAccounts = (query: string) => {
    if (!query.trim()) return accounts.value;

    const searchTerm = query.toLowerCase();
    return accounts.value.filter(
      (account) =>
        account.name.toLowerCase().includes(searchTerm) ||
        (account.number && account.number.toLowerCase().includes(searchTerm)) ||
        account.type.toLowerCase().includes(searchTerm),
    );
  };

  // Account statistics
  const accountStatistics = computed(() => {
    const stats = {
      totalAccounts: accounts.value.length,
      totalBalance: totalAssets.value,
      averageBalance: accounts.value.length > 0 ? totalAssets.value / accounts.value.length : 0,
      highestBalance: Math.max(...accounts.value.map((acc) => acc.balance)),
      lowestBalance: Math.min(...accounts.value.map((acc) => acc.balance)),
      accountsByType: {} as Record<string, number>,
    };

    // Count accounts by type
    accounts.value.forEach((account) => {
      stats.accountsByType[account.type] = (stats.accountsByType[account.type] || 0) + 1;
    });

    return stats;
  });

  return {
    // State
    loading,
    selectedAccount,
    showAccountDialog,
    accountForm,

    // Computed
    accounts,
    totalAssets,
    accountsByType,
    formattedTotalAssets,
    accountTypeOptions,
    colorOptions,
    accountStatistics,

    // Methods
    formatAccountBalance,
    selectAccount,
    openAccountDialog,
    closeAccountDialog,
    resetAccountForm,
    validateAccountForm,
    saveAccount,
    deleteAccount,
    confirmDeleteAccount,
    updateAccountBalance,
    getAccountIcon,
    getAccountsByType,
    searchAccounts,
  };
};
