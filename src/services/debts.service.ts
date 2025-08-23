import { ApiClient, type ApiResponse, type QueryParams } from './api-client';

// Types
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

class DebtsService extends ApiClient {
  constructor() {
    super('/debts');
  }

  // Get all debts
  async getDebts(params?: QueryParams): Promise<ApiResponse<Debt[]>> {
    return this.get('', params);
  }

  // Get single debt
  async getDebt(id: number): Promise<ApiResponse<Debt>> {
    return this.get(`/${id}`);
  }

  // Create debt
  async createDebt(data: CreateDebtDto): Promise<ApiResponse<Debt>> {
    return this.post('', data);
  }

  // Update debt
  async updateDebt(id: number, data: UpdateDebtDto): Promise<ApiResponse<Debt>> {
    return this.put(`/${id}`, data);
  }

  // Delete debt
  async deleteDebt(id: number): Promise<ApiResponse<void>> {
    return this.delete(`/${id}`);
  }

  // Record debt payment
  async recordPayment(
    id: number,
    data: {
      amount: number;
      date?: string;
      notes?: string;
    },
  ): Promise<ApiResponse<DebtPayment>> {
    return this.post(`/${id}/payment`, data);
  }

  // Get debt payoff schedule
  async getPayoffSchedule(
    id: number,
    params?: {
      extra_payment?: number;
      payment_frequency?: 'monthly' | 'bi-weekly' | 'weekly';
    },
  ): Promise<ApiResponse<DebtPayoffSchedule>> {
    return this.get(`/${id}/payoff-schedule`, params);
  }

  // Get debt summary
  async getDebtSummary(): Promise<ApiResponse<DebtSummary>> {
    return this.get('/summary');
  }

  // Get debt payments
  async getDebtPayments(id: number, params?: QueryParams): Promise<ApiResponse<DebtPayment[]>> {
    return this.get(`/${id}/payments`, params);
  }

  // Calculate payoff strategies
  async calculatePayoffStrategies(params?: {
    extra_payment?: number;
    strategy?: 'avalanche' | 'snowball';
  }): Promise<
    ApiResponse<{
      avalanche: {
        total_interest: number;
        payoff_date: string;
        order: Debt[];
      };
      snowball: {
        total_interest: number;
        payoff_date: string;
        order: Debt[];
      };
      current: {
        total_interest: number;
        payoff_date: string;
      };
    }>
  > {
    return this.get('/payoff-strategies', params);
  }

  // Mark debt as paid off
  async markAsPaidOff(id: number): Promise<ApiResponse<Debt>> {
    return this.post(`/${id}/paid-off`);
  }
}

export const debtsService = new DebtsService();
