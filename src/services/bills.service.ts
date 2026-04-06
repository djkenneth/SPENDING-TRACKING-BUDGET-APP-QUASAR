import { api } from 'src/boot/axios';
import { ApiResponse, QueryParams } from 'src/types/api-client.types';
import {
  Bill,
  BillPayment,
  CreateBillDto,
  UpcomingBill,
  UpdateBillDto,
} from 'src/types/bills.types';

const BASE = '/bills';

export const billsService = {
  async getBills(params?: QueryParams): Promise<ApiResponse<Bill[]>> {
    const r = await api.get(BASE, { params });
    return r.data;
  },

  async getBill(id: number): Promise<ApiResponse<Bill>> {
    const r = await api.get(`${BASE}/${id}`);
    return r.data;
  },

  async createBill(data: CreateBillDto): Promise<ApiResponse<Bill>> {
    const r = await api.post(BASE, data);
    return r.data;
  },

  async updateBill(id: number, data: UpdateBillDto): Promise<ApiResponse<Bill>> {
    const r = await api.put(`${BASE}/${id}`, data);
    return r.data;
  },

  async deleteBill(id: number): Promise<ApiResponse<void>> {
    const r = await api.delete(`${BASE}/${id}`);
    return r.data;
  },

  async payBill(id: number, data: {
    amount?: number;
    date?: string;
    account_id?: number;
    notes?: string;
  }): Promise<ApiResponse<BillPayment>> {
    const r = await api.post(`${BASE}/${id}/pay`, data);
    return r.data;
  },

  async getUpcomingBills(params?: { days?: number; limit?: number }): Promise<ApiResponse<UpcomingBill[]>> {
    const r = await api.get(`${BASE}/status/upcoming`, { params });
    return r.data;
  },

  async getOverdueBills(): Promise<ApiResponse<UpcomingBill[]>> {
    const r = await api.get(`${BASE}/status/overdue`);
    return r.data;
  },

  async getBillPayments(id: number, params?: QueryParams): Promise<ApiResponse<BillPayment[]>> {
    const r = await api.get(`${BASE}/${id}/payments`, { params });
    return r.data;
  },

  async skipPayment(id: number, data: { reason?: string }): Promise<ApiResponse<Bill>> {
    const r = await api.post(`${BASE}/${id}/skip`, data);
    return r.data;
  },

  async getBillsCalendar(params?: { month?: number; year?: number }): Promise<ApiResponse<Array<{
    date: string;
    bills: UpcomingBill[];
    total_amount: number;
  }>>> {
    const r = await api.get(`${BASE}/calendar`, { params });
    return r.data;
  },

  async getBillsSummary(): Promise<ApiResponse<{
    total_monthly: number;
    total_yearly: number;
    upcoming_count: number;
    overdue_count: number;
    auto_pay_count: number;
    next_week_total: number;
    this_month_total: number;
  }>> {
    const r = await api.get(`${BASE}/summary`);
    return r.data;
  },
};
