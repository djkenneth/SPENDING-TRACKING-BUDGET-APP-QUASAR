// src/stores/accounts.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Account {
  id: number;
  name: string;
  number: string | null;
  balance: number;
  color: string;
  icon: string;
  type: 'cash' | 'bank' | 'ewallet' | 'investment';
}

export const useAccountsStore = defineStore('accounts', () => {
  // State
  const accounts = ref<Account[]>([
    {
      id: 1,
      name: 'My Wallet',
      number: null,
      balance: 15420.5,
      color: 'orange',
      icon: 'account_balance_wallet',
      type: 'cash',
    },
    {
      id: 2,
      name: 'Seabank',
      number: '921',
      balance: 45250.75,
      color: 'blue',
      icon: 'account_balance',
      type: 'bank',
    },
    {
      id: 3,
      name: 'GCash',
      number: '09166453412',
      balance: 8750.25,
      color: 'blue',
      icon: 'phone_android',
      type: 'ewallet',
    },
    {
      id: 4,
      name: 'Metrobank: ACDC',
      number: '002-3-00279546-0',
      balance: 125680.0,
      color: 'red',
      icon: 'account_balance',
      type: 'bank',
    },
    {
      id: 5,
      name: 'BPI: Sun Life',
      number: '9199363937',
      balance: 85420.3,
      color: 'red',
      icon: 'account_balance',
      type: 'investment',
    },
    {
      id: 6,
      name: 'EastWest',
      number: '200064021221',
      balance: 23750.8,
      color: 'green',
      icon: 'account_balance',
      type: 'bank',
    },
    {
      id: 7,
      name: 'Security Bank',
      number: '7976',
      balance: 65280.45,
      color: 'blue',
      icon: 'security',
      type: 'bank',
    },
    {
      id: 8,
      name: 'UnionBank PlayEveryday',
      number: '1096 5371 1141',
      balance: 42850.2,
      color: 'orange',
      icon: 'account_balance',
      type: 'bank',
    },
    {
      id: 9,
      name: 'GoTyme',
      number: '09166453412',
      balance: 12680.75,
      color: 'cyan',
      icon: 'account_balance',
      type: 'bank',
    },
    {
      id: 10,
      name: 'UNO Digital Bank',
      number: '3000 1241 3272 72',
      balance: 18920.6,
      color: 'purple',
      icon: 'account_balance',
      type: 'bank',
    },
    {
      id: 11,
      name: 'Maya Wallet',
      number: '09166453412',
      balance: 9840.35,
      color: 'green',
      icon: 'phone_android',
      type: 'ewallet',
    },
  ]);

  // Getters
  const totalAssets = computed(() => {
    return accounts.value.reduce((total, account) => total + account.balance, 0);
  });

  const accountsByType = computed(() => {
    return accounts.value.reduce(
      (groups, account) => {
        if (!groups[account.type]) {
          groups[account.type] = [];
        }
        groups[account.type].push(account);
        return groups;
      },
      {} as Record<string, Account[]>,
    );
  });

  const getAccountById = computed(() => {
    return (id: number) => accounts.value.find((account) => account.id === id);
  });

  const getAccountByName = computed(() => {
    return (name: string) => accounts.value.find((account) => account.name === name);
  });

  // Actions
  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...account,
      id: Date.now(),
    };
    accounts.value.push(newAccount);
    return newAccount;
  };

  const updateAccount = (id: number, updates: Partial<Account>) => {
    const index = accounts.value.findIndex((account) => account.id === id);
    if (index !== -1) {
      accounts.value[index] = { ...accounts.value[index], ...updates };
      return accounts.value[index];
    }
    return null;
  };

  const deleteAccount = (id: number) => {
    const index = accounts.value.findIndex((account) => account.id === id);
    if (index !== -1) {
      accounts.value.splice(index, 1);
      return true;
    }
    return false;
  };

  const updateBalance = (accountName: string, amount: number, type: 'add' | 'subtract') => {
    const account = accounts.value.find((acc) => acc.name === accountName);
    if (account) {
      if (type === 'add') {
        account.balance += amount;
      } else {
        account.balance -= amount;
      }
    }
  };

  return {
    // State
    accounts,
    // Getters
    totalAssets,
    accountsByType,
    getAccountById,
    getAccountByName,
    // Actions
    addAccount,
    updateAccount,
    deleteAccount,
    updateBalance,
  };
});
