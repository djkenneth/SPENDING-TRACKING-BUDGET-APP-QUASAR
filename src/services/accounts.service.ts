import { ApiClient } from 'src/services/api-client';
import {
  Account,
  AccountBalanceHistory,
  AccountSummary,
  AccountTransaction,
  AccountType,
  CreateAccountDto,
  UpdateAccountDto,
} from 'src/types/account.types';
import { ApiResponse, PaginatedResponse, QueryParams } from 'src/types/api-client.types';

class AccountsService extends ApiClient {
  constructor() {
    super('/accounts');
  }

  // Get all accounts
  async getAccounts(params?: QueryParams): Promise<ApiResponse<Account[]>> {
    return this.get('', params);
  }

  // Get paginated accounts
  async getAccountsPaginated(params?: QueryParams): Promise<PaginatedResponse<Account>> {
    return this.getPaginated('', params);
  }

  // Get single account
  async getAccount(id: number): Promise<ApiResponse<Account>> {
    return this.get(`/${id}`);
  }

  // Create account
  async createAccount(data: CreateAccountDto): Promise<ApiResponse<Account>> {
    return this.post('', data);
  }

  // Update account
  async updateAccount(id: number, data: UpdateAccountDto): Promise<ApiResponse<Account>> {
    return this.put(`/${id}`, data);
  }

  // Delete account
  async deleteAccount(id: number): Promise<ApiResponse<void>> {
    return this.delete(`/${id}`);
  }

  // Get account transactions
  async getAccountTransactions(
    id: number,
    params?: QueryParams,
  ): Promise<PaginatedResponse<AccountTransaction>> {
    return this.getPaginated(`/${id}/transactions`, params);
  }

  // Get account balance history
  async getAccountBalanceHistory(
    id: number,
    params?: QueryParams,
  ): Promise<ApiResponse<AccountBalanceHistory[]>> {
    return this.get(`/${id}/balance-history`, params);
  }

  // Get account types
  async getAccountTypes(): Promise<ApiResponse<AccountType[]>> {
    return this.get('/types');
  }

  // Get accounts summary
  async getAccountsSummary(): Promise<ApiResponse<AccountSummary>> {
    return this.get('/summary');
  }

  // Bulk update accounts
  async bulkUpdateAccounts(
    accounts: Array<{ id: number } & UpdateAccountDto>,
  ): Promise<ApiResponse<Account[]>> {
    return this.put('/bulk/update', { accounts });
  }

  // Transfer between accounts
  async transfer(data: {
    from_account_id: number;
    to_account_id: number;
    amount: number;
    description?: string;
    date?: string;
  }): Promise<ApiResponse<void>> {
    return this.post('/transfer', data);
  }

  // Reconcile account
  async reconcileAccount(
    id: number,
    data: {
      balance: number;
      date?: string;
      notes?: string;
    },
  ): Promise<ApiResponse<Account>> {
    return this.post(`/${id}/reconcile`, data);
  }
}

export const accountsService = new AccountsService();
