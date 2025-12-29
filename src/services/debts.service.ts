import { ApiClient } from 'src/services/api-client';
import { ApiResponse, QueryParams } from 'src/types/api-client.types';
import {
  CreateDebtDto,
  Debt,
  DebtPayment,
  DebtPayoffSchedule,
  DebtSummary,
  UpdateDebtDto,
} from 'src/types/debt.types';

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
