<template>
  <div class="max-w-[800px] mx-auto">
    <!-- Currency Selector -->
    <Card class="mb-4">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="text-lg">Currency Settings</CardTitle>
          <Button variant="ghost" size="icon-sm" :disabled="loadingRates" @click="refreshRates">
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loadingRates }" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <Label for="base-currency">Base Currency</Label>
          <Select
            :model-value="selectedBaseCurrency"
            @update:model-value="updateBaseCurrency"
          >
            <SelectTrigger id="base-currency">
              <SelectValue placeholder="Select base currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="currency in currencies"
                :key="currency.code"
                :value="currency.code"
              >
                <span class="inline-flex items-center gap-2">
                  <span class="text-base">{{ currency.flag }}</span>
                  <span>{{ currency.name }}</span>
                  <span class="text-muted-foreground">{{ currency.code }}</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Exchange Rates -->
    <Card class="mb-4">
      <CardHeader>
        <CardTitle class="text-lg">Exchange Rates</CardTitle>
        <p class="text-xs text-muted-foreground">
          Last updated: {{ formatDateTime(lastUpdated) }}
        </p>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card v-for="rate in displayRates" :key="rate.code" class="border text-center p-4">
            <div class="text-2xl mb-1">{{ rate.flag }}</div>
            <div class="text-sm font-medium text-muted-foreground">{{ rate.code }}</div>
            <div class="text-lg font-bold">
              {{ formatRate(rate.rate) }}
            </div>
            <div
              class="text-xs"
              :class="rate.change > 0 ? 'text-green-500' : rate.change < 0 ? 'text-red-500' : 'text-muted-foreground'"
            >
              {{ rate.change > 0 ? '+' : '' }}{{ rate.change.toFixed(4) }}
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- Currency Converter -->
    <Card>
      <CardHeader>
        <CardTitle class="text-lg">Currency Converter</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
          <!-- From column -->
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="converter-amount">Amount</Label>
              <Input
                id="converter-amount"
                v-model.number="converterAmount"
                type="number"
                step="0.01"
                @update:model-value="convertCurrency"
              />
            </div>
            <div class="space-y-2">
              <Label for="converter-from">From</Label>
              <Select
                :model-value="converterFrom"
                @update:model-value="(val) => { converterFrom = val; convertCurrency(); }"
              >
                <SelectTrigger id="converter-from">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="currency in currencies"
                    :key="currency.code"
                    :value="currency.code"
                  >
                    <span class="inline-flex items-center gap-2">
                      <span class="text-base">{{ currency.flag }}</span>
                      <span>{{ currency.name }}</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Swap button -->
          <div class="flex items-center justify-center pt-8">
            <Button variant="ghost" size="icon" @click="swapCurrencies">
              <ArrowLeftRight class="w-5 h-5" />
            </Button>
          </div>

          <!-- To column -->
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="converted-amount">Converted Amount</Label>
              <Input
                id="converted-amount"
                :model-value="convertedAmount"
                type="number"
                readonly
                class="bg-muted"
              />
            </div>
            <div class="space-y-2">
              <Label for="converter-to">To</Label>
              <Select
                :model-value="converterTo"
                @update:model-value="(val) => { converterTo = val; convertCurrency(); }"
              >
                <SelectTrigger id="converter-to">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="currency in currencies"
                    :key="currency.code"
                    :value="currency.code"
                  >
                    <span class="inline-flex items-center gap-2">
                      <span class="text-base">{{ currency.flag }}</span>
                      <span>{{ currency.name }}</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { toast } from 'vue-sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { RefreshCw, ArrowLeftRight } from 'lucide-vue-next';

// Static data for future backend integration
const currencies = ref([
  { code: 'PHP', name: 'Philippine Peso', flag: '\u{1F1F5}\u{1F1ED}', symbol: '\u20B1' },
  { code: 'USD', name: 'US Dollar', flag: '\u{1F1FA}\u{1F1F8}', symbol: '$' },
  { code: 'EUR', name: 'Euro', flag: '\u{1F1EA}\u{1F1FA}', symbol: '\u20AC' },
  { code: 'JPY', name: 'Japanese Yen', flag: '\u{1F1EF}\u{1F1F5}', symbol: '\u00A5' },
  { code: 'GBP', name: 'British Pound', flag: '\u{1F1EC}\u{1F1E7}', symbol: '\u00A3' },
  { code: 'AUD', name: 'Australian Dollar', flag: '\u{1F1E6}\u{1F1FA}', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '\u{1F1E8}\u{1F1E6}', symbol: 'C$' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '\u{1F1F8}\u{1F1EC}', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', flag: '\u{1F1ED}\u{1F1F0}', symbol: 'HK$' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '\u{1F1E8}\u{1F1F3}', symbol: '\u00A5' },
]);

// Static exchange rates (PHP as base)
const exchangeRates = ref<Record<string, { rate: number; change: number }>>({
  PHP: { rate: 1.0, change: 0.0 },
  USD: { rate: 0.0178, change: 0.0002 },
  EUR: { rate: 0.0164, change: -0.0001 },
  JPY: { rate: 2.689, change: 0.015 },
  GBP: { rate: 0.0141, change: -0.0001 },
  AUD: { rate: 0.0273, change: 0.0003 },
  CAD: { rate: 0.0244, change: 0.0001 },
  SGD: { rate: 0.0239, change: 0.0002 },
  HKD: { rate: 0.139, change: 0.0012 },
  CNY: { rate: 0.1289, change: 0.0008 },
});

const selectedBaseCurrency = ref('PHP');
const lastUpdated = ref(new Date());
const loadingRates = ref(false);

// Currency Converter
const converterAmount = ref(100);
const converterFrom = ref('PHP');
const converterTo = ref('USD');
const convertedAmount = ref(0);

const displayRates = computed(() => {
  return currencies.value
    .filter((c) => c.code !== selectedBaseCurrency.value)
    .map((currency) => ({
      ...currency,
      rate: exchangeRates.value[currency.code]?.rate || 0,
      change: exchangeRates.value[currency.code]?.change || 0,
    }))
    .slice(0, 6); // Show top 6 rates
});

const formatRate = (rate: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(rate);
};

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

const updateBaseCurrency = (newCurrency: string) => {
  // In real app, this would trigger API call to get rates for new base currency
  console.log('Base currency updated to:', newCurrency);
  selectedBaseCurrency.value = newCurrency;
  refreshRates();
};

const refreshRates = async () => {
  loadingRates.value = true;

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Update rates with small random changes
  Object.keys(exchangeRates.value).forEach((code) => {
    if (code !== selectedBaseCurrency.value) {
      const currentRate = exchangeRates.value[code].rate;
      const change = (Math.random() - 0.5) * 0.01 * currentRate;
      exchangeRates.value[code] = {
        rate: currentRate + change,
        change: change,
      };
    }
  });

  lastUpdated.value = new Date();
  loadingRates.value = false;

  toast.success('Exchange rates updated');
};

const convertCurrency = () => {
  if (!converterAmount.value || !converterFrom.value || !converterTo.value) {
    convertedAmount.value = 0;
    return;
  }

  const fromRate = exchangeRates.value[converterFrom.value]?.rate || 1;
  const toRate = exchangeRates.value[converterTo.value]?.rate || 1;

  // Convert to base currency first, then to target currency
  const baseAmount = converterAmount.value / fromRate;
  convertedAmount.value = parseFloat((baseAmount * toRate).toFixed(2));
};

const swapCurrencies = () => {
  const temp = converterFrom.value;
  converterFrom.value = converterTo.value;
  converterTo.value = temp;
  convertCurrency();
};

onMounted(() => {
  convertCurrency();
});
</script>
