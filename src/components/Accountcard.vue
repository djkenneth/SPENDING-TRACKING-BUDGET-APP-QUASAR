<script setup lang="ts">
import { computed } from 'vue';
import { format } from 'date-fns';
import { formatCurrency } from 'src/utilities/currency';
import { useSettingsStore } from 'src/stores/settings';
import { Account } from 'src/types/account.types';
import { Card, CardContent } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/components/ui/tooltip';
import {
  Landmark,
  PiggyBank,
  CreditCard,
  TrendingUp,
  HandCoins,
  Banknote,
  Wallet,
  CircleDollarSign,
  Pencil,
  Trash2,
  type LucideIcon,
} from 'lucide-vue-next';

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

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  checking: Landmark,
  savings: PiggyBank,
  credit_card: CreditCard,
  investment: TrendingUp,
  loan: HandCoins,
  cash: Banknote,
  e_wallet: Wallet,
  other: CircleDollarSign,
};

const getAccountIcon = (type: string): LucideIcon => {
  return iconMap[type] || CircleDollarSign;
};

const iconColorMap: Record<string, string> = {
  checking: 'text-blue-500',
  savings: 'text-green-500',
  credit_card: 'text-orange-500',
  investment: 'text-purple-500',
  loan: 'text-red-500',
  cash: 'text-amber-500',
  e_wallet: 'text-teal-500',
  other: 'text-gray-500',
};

const getIconColorClass = (type: string): string => {
  return iconColorMap[type] || 'text-gray-500';
};

const iconBgMap: Record<string, string> = {
  checking: 'bg-blue-100',
  savings: 'bg-green-100',
  credit_card: 'bg-orange-100',
  investment: 'bg-purple-100',
  loan: 'bg-red-100',
  cash: 'bg-amber-100',
  e_wallet: 'bg-teal-100',
  other: 'bg-gray-100',
};

const getIconBgClass = (type: string): string => {
  return iconBgMap[type] || 'bg-gray-100';
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

const getBalanceColorClass = (balance: number, type: string): string => {
  if (type === 'credit_card' && balance < 0) return 'text-red-600';
  if (type === 'loan' && balance > 0) return 'text-red-600';
  if (balance < 0) return 'text-red-600';
  return 'text-green-600';
};

const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy, hh:mm a');
};
</script>

<template>
  <Card
    class="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
  >
    <CardContent class="p-4">
      <!-- Header with Icon, Name and Actions -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-3">
          <div
            :class="[
              'flex items-center justify-center w-10 h-10 rounded-full',
              getIconBgClass(account.type),
            ]"
          >
            <component
              :is="getAccountIcon(account.type)"
              :class="['w-5 h-5', getIconColorClass(account.type)]"
            />
          </div>
          <div>
            <div class="font-bold text-foreground leading-tight">
              {{ account.name }}
            </div>
            <div class="text-xs text-muted-foreground">
              {{ account.institution || getAccountTypeName(account.type) }}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  @click.stop="$emit('edit', account)"
                >
                  <Pencil class="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Account</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-destructive hover:text-destructive"
                  @click.stop="$emit('delete', account)"
                >
                  <Trash2 class="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Account</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <!-- Balance -->
      <div class="mb-3">
        <div class="text-xs text-muted-foreground mb-1">Current Balance</div>
        <div
          class="text-xl font-bold"
          :class="getBalanceColorClass(account.balance, account.type)"
        >
          {{ formatBalance(account.balance) }}
        </div>
      </div>

      <!-- Account Details -->
      <div class="flex justify-between items-center">
        <div>
          <div class="text-xs text-muted-foreground">Account Type</div>
          <div class="text-sm font-medium">
            {{ getAccountTypeName(account.type) }}
          </div>
        </div>
        <div class="text-right">
          <div class="text-xs text-muted-foreground">Last Updated</div>
          <div class="text-sm font-medium">
            {{ formatDate(account.updated_at) }}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped>
/* All styles are now handled by Tailwind CSS classes */
</style>
