// src/services/goalsService.ts
import { api } from 'src/boot/axios';

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

class GoalsService {
  /**
   * Get all financial goals
   */
  async getGoals(filters?: GoalFilters): Promise<GoalsResponse> {
    const response = await api.get<GoalsResponse>('/goals', { params: filters });
    return response.data;
  }

  /**
   * Get a specific financial goal
   */
  async getGoal(goalId: number): Promise<GoalResponse> {
    const response = await api.get<GoalResponse>(`/goals/${goalId}`);
    return response.data;
  }

  /**
   * Create a new financial goal
   */
  async createGoal(goalData: CreateGoalData): Promise<GoalResponse> {
    const response = await api.post<GoalResponse>('/goals', goalData);
    return response.data;
  }

  /**
   * Update a financial goal
   */
  async updateGoal(goalId: number, goalData: UpdateGoalData): Promise<GoalResponse> {
    const response = await api.put<GoalResponse>(`/goals/${goalId}`, goalData);
    return response.data;
  }

  /**
   * Delete a financial goal
   */
  async deleteGoal(goalId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/goals/${goalId}`);
    return response.data;
  }

  /**
   * Add a contribution to a goal
   */
  async addContribution(goalId: number, contributionData: ContributionData): Promise<GoalResponse> {
    const response = await api.post<GoalResponse>(`/goals/${goalId}/contribute`, contributionData);
    return response.data;
  }

  /**
   * Get goal progress details
   */
  async getGoalProgress(goalId: number, period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
    const response = await api.get(`/goals/${goalId}/progress`, { params: { period } });
    return response.data;
  }

  /**
   * Mark goal as completed
   */
  async completeGoal(goalId: number): Promise<GoalResponse> {
    const response = await api.post<GoalResponse>(`/goals/${goalId}/complete`);
    return response.data;
  }

  /**
   * Pause a goal
   */
  async pauseGoal(goalId: number): Promise<GoalResponse> {
    return this.updateGoal(goalId, { status: 'paused' });
  }

  /**
   * Resume a goal
   */
  async resumeGoal(goalId: number): Promise<GoalResponse> {
    return this.updateGoal(goalId, { status: 'active' });
  }

  /**
   * Cancel a goal
   */
  async cancelGoal(goalId: number): Promise<GoalResponse> {
    return this.updateGoal(goalId, { status: 'cancelled' });
  }
}

export default new GoalsService();
