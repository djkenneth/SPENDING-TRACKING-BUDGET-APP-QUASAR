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
  // type: Account['type'];
  type: string;
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
