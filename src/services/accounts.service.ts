import {
  ApiClient,
  type ApiResponse,
  type PaginatedResponse,
  type QueryParams,
} from './api-client';

// Types
export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: 'cash' | 'savings' | 'checking' | 'credit_card' | 'loan' | 'investment' | 'e_wallet';
  balance: number;
  initial_balance: number;
  currency: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  is_included_in_total: boolean;
  credit_limit?: number;
  description?: string;
  institution?: string;
  account_number?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountDto {
  name: string;
  type: Account['type'];
  initial_balance: number;
  currency?: string;
  color?: string;
  icon?: string;
  is_included_in_total?: boolean;
  credit_limit?: number;
  description?: string;
  institution?: string;
  account_number?: string;
}

export interface UpdateAccountDto extends Partial<CreateAccountDto> {
  balance?: number;
  is_active?: boolean;
}

export interface AccountTransaction {
  id: number;
  account_id: number;
  category_id: number;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  date: string;
  description?: string;
  category?: {
    id: number;
    name: string;
    icon: string;
    color: string;
  };
}

export interface AccountBalanceHistory {
  id: number;
  account_id: number;
  balance: number;
  date: string;
  change_type: 'transaction' | 'adjustment' | 'sync';
  change_amount?: number;
  created_at: string;
}

export interface AccountSummary {
  total_balance: number;
  total_income: number;
  total_expenses: number;
  net_worth: number;
  accounts_by_type: Record<
    string,
    {
      count: number;
      total_balance: number;
    }
  >;
}

export interface AccountType {
  value: string;
  label: string;
  icon: string;
  color: string;
}

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
export { QueryParams };
