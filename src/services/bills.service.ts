import { ApiResponse, QueryParams } from 'src/types/api-client.types';
import { ApiClient } from 'src/services/api-client';
import {
  Bill,
  BillPayment,
  CreateBillDto,
  UpcomingBill,
  UpdateBillDto,
} from 'src/types/bills.types';

class BillsService extends ApiClient {
  constructor() {
    super('/bills');
  }

  // Get all bills
  async getBills(params?: QueryParams): Promise<ApiResponse<Bill[]>> {
    return this.get('', params);
  }

  // Get single bill
  async getBill(id: number): Promise<ApiResponse<Bill>> {
    return this.get(`/${id}`);
  }

  // Create bill
  async createBill(data: CreateBillDto): Promise<ApiResponse<Bill>> {
    return this.post('', data);
  }

  // Update bill
  async updateBill(id: number, data: UpdateBillDto): Promise<ApiResponse<Bill>> {
    return this.put(`/${id}`, data);
  }

  // Delete bill
  async deleteBill(id: number): Promise<ApiResponse<void>> {
    return this.delete(`/${id}`);
  }

  // Mark bill as paid
  async payBill(
    id: number,
    data: {
      amount?: number;
      date?: string;
      account_id?: number;
      notes?: string;
    },
  ): Promise<ApiResponse<BillPayment>> {
    return this.post(`/${id}/pay`, data);
  }

  // Get upcoming bills
  async getUpcomingBills(params?: {
    days?: number;
    limit?: number;
  }): Promise<ApiResponse<UpcomingBill[]>> {
    return this.get('/status/upcoming', params);
  }

  // Get overdue bills
  async getOverdueBills(): Promise<ApiResponse<UpcomingBill[]>> {
    return this.get('/status/overdue');
  }

  // Get bill payments
  async getBillPayments(id: number, params?: QueryParams): Promise<ApiResponse<BillPayment[]>> {
    return this.get(`/${id}/payments`, params);
  }

  // Skip bill payment
  async skipPayment(
    id: number,
    data: {
      reason?: string;
    },
  ): Promise<ApiResponse<Bill>> {
    return this.post(`/${id}/skip`, data);
  }

  // Get bills calendar
  async getBillsCalendar(params?: { month?: number; year?: number }): Promise<
    ApiResponse<
      Array<{
        date: string;
        bills: UpcomingBill[];
        total_amount: number;
      }>
    >
  > {
    return this.get('/calendar', params);
  }

  // Get bills summary
  async getBillsSummary(): Promise<
    ApiResponse<{
      total_monthly: number;
      total_yearly: number;
      upcoming_count: number;
      overdue_count: number;
      auto_pay_count: number;
      next_week_total: number;
      this_month_total: number;
    }>
  > {
    return this.get('/summary');
  }
}

export const billsService = new BillsService();
