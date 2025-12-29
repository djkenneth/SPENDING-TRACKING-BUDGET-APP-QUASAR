export interface Debt {
  id: number;
  user_id: number;
  name: string;
  type: 'credit_card' | 'personal_loan' | 'mortgage' | 'auto_loan' | 'student_loan' | 'other';
  original_amount: number;
  current_balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_date?: number;
  lender?: string;
  account_number?: string;
  status: 'active' | 'paid_off' | 'defaulted';
  notes?: string;
  created_at: string;
  updated_at: string;
  paid_off_date?: string;
  total_paid?: number;
  remaining_payments?: number;
  payoff_date?: string;
}

export interface CreateDebtDto {
  name: string;
  type: Debt['type'];
  original_amount: number;
  current_balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_date?: number;
  lender?: string;
  account_number?: string;
  notes?: string;
}

export interface UpdateDebtDto extends Partial<CreateDebtDto> {
  status?: Debt['status'];
}

export interface DebtPayment {
  id: number;
  debt_id: number;
  amount: number;
  principal_amount: number;
  interest_amount: number;
  date: string;
  notes?: string;
  created_at: string;
}

export interface DebtPayoffSchedule {
  debt: Debt;
  schedule: Array<{
    payment_number: number;
    date: string;
    payment_amount: number;
    principal: number;
    interest: number;
    remaining_balance: number;
  }>;
  total_interest: number;
  total_payments: number;
  payoff_date: string;
}

export interface DebtSummary {
  total_debt: number;
  total_original: number;
  total_paid: number;
  active_debts: number;
  paid_off_debts: number;
  average_interest_rate: number;
  monthly_payment_total: number;
  highest_interest_debt: Debt | null;
  debt_by_type: Record<
    string,
    {
      count: number;
      total_balance: number;
      average_rate: number;
    }
  >;
}
