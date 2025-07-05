<!-- src/pages/AccountsPage.vue -->
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
        <q-btn
          color="primary"
          icon="add"
          label="Add Account"
          @click="openAccountDialog()"
          class="full-width"
        />
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
        <q-card
          v-for="account in accounts"
          :key="account.id"
          class="account-card q-pa-md cursor-pointer"
          @click="selectAccount(account)"
        >
          <div class="text-center">
            <q-avatar size="48px" :color="account.color" text-color="white" class="q-mb-sm">
              <q-icon :name="account.icon" size="24px" />
            </q-avatar>
            <div class="text-subtitle2 q-mb-xs">{{ account.name }}</div>
            <div v-if="account.number" class="text-caption text-grey-6 q-mb-sm">
              {{ account.number }}
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
          <q-form @submit="saveAccount" class="q-gutter-md">
            <q-input
              v-model="accountForm.name"
              label="Account Name"
              required
              :rules="[(val) => (val && val.length > 0) || 'Account name is required']"
            />

            <q-select
              v-model="accountForm.type"
              :options="accountTypeOptions"
              option-label="label"
              option-value="value"
              label="Account Type"
              required
            />

            <q-input
              v-model.number="accountForm.balance"
              label="Initial Balance"
              type="number"
              step="0.01"
              :prefix="settingsStore.settings.currencySymbol"
              required
            />

            <q-input v-model="accountForm.number" label="Account Number (Optional)" />

            <q-select
              v-model="accountForm.color"
              :options="colorOptions"
              option-label="label"
              option-value="value"
              label="Color"
            />

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

<script setup lang="ts">
import { useAccounts } from 'src/composables/useAccounts';
import { useSettingsStore } from 'src/stores/settings';

const settingsStore = useSettingsStore();

// Use the accounts composable
const {
  // State
  loading,
  selectedAccount,
  showAccountDialog,
  accountForm,

  // Computed
  accounts,
  formattedTotalAssets,
  accountTypeOptions,
  colorOptions,
  accountStatistics,

  // Methods
  formatAccountBalance,
  selectAccount,
  openAccountDialog,
  closeAccountDialog,
  saveAccount,
  confirmDeleteAccount,
  getAccountIcon,
} = useAccounts();
</script>

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
