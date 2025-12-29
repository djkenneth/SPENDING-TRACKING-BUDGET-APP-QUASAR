export interface FinancialGoal {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  target_amount: string;
  current_amount: string;
  remaining_amount: number;
  target_date: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  color: string;
  icon: string;
  monthly_target: number;
  required_monthly_contribution: number;
  milestone_settings: {
    milestones: number[];
    notifications_enabled: boolean;
  };
  current_milestone: number | null;
  next_milestone: number | null;
  is_on_track: boolean;
  projected_completion_date: string | null;
  progress_percentage: number;
  days_remaining: number;
  is_overdue: boolean;
  is_completed: boolean;
  completed_at: string | null;
  latest_contribution: GoalContribution | null;
  contributions_summary: {
    total_contributions: number;
    total_amount: number;
    average_contribution: number;
    largest_contribution: number;
    this_month_total: number;
    last_month_total: number;
  };
  contributions: GoalContribution[];
  created_at: string;
  updated_at: string;
}

export interface GoalContribution {
  id: number;
  financial_goal_id: number;
  transaction_id: number | null;
  amount: string;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalsMeta {
  total: number;
  active_goals: number;
  completed_goals: number;
  total_target_amount: number;
  total_current_amount: number;
  overall_progress: number;
  currency: string;
  currency_symbol: string;
}

export interface GoalsResponse {
  success: boolean;
  data: FinancialGoal[];
  meta: GoalsMeta;
}

export interface GoalResponse {
  success: boolean;
  message?: string;
  data: FinancialGoal;
}

export interface CreateGoalData {
  name: string;
  description?: string;
  target_amount: number;
  target_date: string;
  priority: 'high' | 'medium' | 'low';
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  color?: string;
  icon?: string;
  monthly_target?: number;
  milestone_settings?: {
    milestones?: number[];
    notifications_enabled?: boolean;
  };
}

export interface UpdateGoalData extends Partial<CreateGoalData> {
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
}

export interface ContributionData {
  amount: number;
  date?: string;
  transaction_id?: number;
  notes?: string;
}

export interface GoalFilters {
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  priority?: 'high' | 'medium' | 'low';
  sort_by?:
    | 'name'
    | 'target_amount'
    | 'current_amount'
    | 'target_date'
    | 'priority'
    | 'created_at'
    | 'progress_percentage';
  sort_order?: 'asc' | 'desc';
}
