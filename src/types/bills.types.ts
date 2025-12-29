export interface Bill {
  id: number;
  user_id: number;
  name: string;
  amount: number;
  due_date: number;
  frequency: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';
  category_id: number;
  account_id?: number;
  is_auto_pay: boolean;
  is_active: boolean;
  reminder_days?: number;
  website?: string;
  account_number?: string;
  notes?: string;
  last_paid_date?: string;
  next_due_date: string;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
    icon: string;
    color: string;
  };
}

export interface CreateBillDto {
  name: string;
  amount: number;
  due_date: number;
  frequency: Bill['frequency'];
  category_id: number;
  account_id?: number;
  is_auto_pay?: boolean;
  reminder_days?: number;
  website?: string;
  account_number?: string;
  notes?: string;
}

export interface UpdateBillDto extends Partial<CreateBillDto> {
  is_active?: boolean;
}

export interface BillPayment {
  id: number;
  bill_id: number;
  amount: number;
  date: string;
  transaction_id?: number;
  notes?: string;
  created_at: string;
}

export interface UpcomingBill {
  bill: Bill;
  due_date: string;
  days_until_due: number;
  is_overdue: boolean;
  amount: number;
}
