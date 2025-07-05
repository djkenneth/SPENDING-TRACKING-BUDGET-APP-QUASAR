<template>
  <div class="multi-currency-container">
    <!-- Currency Selector -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Currency Settings</div>
          <q-btn flat size="sm" icon="refresh" @click="refreshRates" :loading="loadingRates" />
        </div>

        <q-select
          v-model="selectedBaseCurrency"
          :options="currencies"
          option-label="name"
          option-value="code"
          label="Base Currency"
          emit-value
          map-options
          @update:model-value="updateBaseCurrency"
        >
          <template #option="{ itemProps, opt }">
            <q-item v-bind="itemProps">
              <q-item-section avatar>
                <q-avatar size="24px" class="currency-flag">
                  {{ opt.flag }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ opt.name }}</q-item-label>
                <q-item-label caption>{{ opt.code }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>
    </q-card>

    <!-- Exchange Rates -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">Exchange Rates</div>
        <div class="text-caption text-grey-6 q-mb-md">
          Last updated: {{ formatDateTime(lastUpdated) }}
        </div>

        <div class="row q-gutter-md">
          <div v-for="rate in displayRates" :key="rate.code" class="col-12 col-sm-6 col-md-4">
            <q-card flat bordered class="q-pa-md text-center">
              <div class="text-h6">{{ rate.flag }}</div>
              <div class="text-subtitle2">{{ rate.code }}</div>
              <div class="text-h6 text-weight-bold">
                {{ formatRate(rate.rate) }}
              </div>
              <div class="text-caption text-grey-6">
                {{ rate.change > 0 ? '+' : '' }}{{ rate.change.toFixed(4) }}
              </div>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Currency Converter -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">Currency Converter</div>

        <div class="row q-gutter-md">
          <div class="col">
            <q-input
              v-model.number="converterAmount"
              type="number"
              label="Amount"
              step="0.01"
              @update:model-value="convertCurrency"
            />
            <q-select
              v-model="converterFrom"
              :options="currencies"
              option-label="name"
              option-value="code"
              label="From"
              emit-value
              map-options
              @update:model-value="convertCurrency"
            />
          </div>

          <div class="col-auto self-center">
            <q-btn flat round icon="swap_horiz" @click="swapCurrencies" size="lg" />
          </div>

          <div class="col">
            <q-input
              v-model="convertedAmount"
              type="number"
              label="Converted Amount"
              readonly
              filled
            />
            <q-select
              v-model="converterTo"
              :options="currencies"
              option-label="name"
              option-value="code"
              label="To"
              emit-value
              map-options
              @update:model-value="convertCurrency"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

// Static data for future backend integration
const currencies = ref([
  { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭', symbol: '₱' },
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', symbol: '¥' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', symbol: 'C$' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰', symbol: 'HK$' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', symbol: '¥' },
]);

// Static exchange rates (PHP as base)
const exchangeRates = ref({
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

const formatRate = (rate) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(rate);
};

const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

const updateBaseCurrency = (newCurrency) => {
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

  $q.notify({
    color: 'positive',
    message: 'Exchange rates updated',
    icon: 'check',
  });
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
  convertedAmount.value = (baseAmount * toRate).toFixed(2);
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

<style scoped>
.currency-flag {
  font-size: 18px;
}
.multi-currency-container {
  max-width: 800px;
  margin: 0 auto;
}
</style>
