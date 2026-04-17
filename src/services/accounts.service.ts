import { api } from 'src/boot/axios';
import {
  Account,
  AccountBalanceHistory,
  AccountSummary,
  AccountTransaction,
  AccountTypesMap,
  CreateAccountDto,
  UpdateAccountDto,
} from 'src/types/account.types';
import { ApiResponse, PaginatedResponse, QueryParams } from 'src/types/api-client.types';

const BASE = '/accounts';

export const accountsService = {
  async getAccounts(params?: QueryParams): Promise<ApiResponse<Account[]>> {
    const r = await api.get(BASE, { params });
    return r.data;
  },

  async getAccountsPaginated(params?: QueryParams): Promise<PaginatedResponse<Account>> {
    const r = await api.get(BASE, { params });
    const d = r.data;
    if (d.success !== undefined) {
      return {
        data: d.data,
        meta: { ...d.meta, links: [], path: '' },
        links: { first: '', last: '', prev: null, next: null },
      };
    }
    return d;
  },

  async getAccount(id: number): Promise<ApiResponse<Account>> {
    const r = await api.get(`${BASE}/${id}`);
    return r.data;
  },

  async createAccount(data: CreateAccountDto): Promise<ApiResponse<Account>> {
    const r = await api.post(BASE, data);
    return r.data;
  },

  async updateAccount(id: number, data: UpdateAccountDto): Promise<ApiResponse<Account>> {
    const r = await api.put(`${BASE}/${id}`, data);
    return r.data;
  },

  async deleteAccount(id: number): Promise<ApiResponse<void>> {
    const r = await api.delete(`${BASE}/${id}`);
    return r.data;
  },

  async getAccountTransactions(
    id: number,
    params?: QueryParams,
  ): Promise<PaginatedResponse<AccountTransaction>> {
    const r = await api.get(`${BASE}/${id}/transactions`, { params });
    const d = r.data;
    if (d.success !== undefined) {
      return {
        data: d.data,
        meta: { ...d.meta, links: [], path: '' },
        links: { first: '', last: '', prev: null, next: null },
      };
    }
    return d;
  },

  async getAccountBalanceHistory(
    id: number,
    params?: QueryParams,
  ): Promise<ApiResponse<AccountBalanceHistory[]>> {
    const r = await api.get(`${BASE}/${id}/balance-history`, { params });
    return r.data;
  },

  async getAccountTypes(): Promise<ApiResponse<AccountTypesMap>> {
    const r = await api.get(`${BASE}/types`);
    return r.data;
  },

  async getAccountsSummary(): Promise<ApiResponse<AccountSummary>> {
    const r = await api.get(`${BASE}/summary`);
    return r.data;
  },

  async bulkUpdateAccounts(
    accounts: Array<{ id: number } & UpdateAccountDto>,
  ): Promise<ApiResponse<Account[]>> {
    const r = await api.put(`${BASE}/bulk/update`, { accounts });
    return r.data;
  },

  async transfer(data: {
    from_account_id: number;
    to_account_id: number;
    amount: number;
    description: string;
    transaction_fee?: number;
    date?: string;
    notes?: string;
    reference_number?: string;
  }): Promise<ApiResponse<void>> {
    const r = await api.post(`${BASE}/transfer`, data);
    return r.data;
  },

  async reconcileAccount(
    id: number,
    data: { balance: number; date?: string; notes?: string },
  ): Promise<ApiResponse<Account>> {
    const r = await api.post(`${BASE}/${id}/reconcile`, data);
    return r.data;
  },
};
