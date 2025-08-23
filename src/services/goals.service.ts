import { ApiClient, type ApiResponse, type QueryParams } from './api-client';

// Types
export interface FinancialGoal {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: 'emergency' | 'savings' | 'investment' | 'purchase' | 'debt_payoff' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  icon?: string;
  color?: string;
  auto_contribute?: boolean;
  contribution_amount?: number;
  contribution_frequency?: 'daily' | 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
  completed_at?: string;
  progress_percentage?: number;
  days_remaining?: number;
  monthly_target?: number;
  is_on_track?: boolean;
}

export interface CreateGoalDto {
  name: string;
  description?: string;
  target_amount: number;
  current_amount?: number;
  target_date: string;
  category: FinancialGoal['category'];
  priority?: FinancialGoal['priority'];
  icon?: string;
  color?: string;
  auto_contribute?: boolean;
  contribution_amount?: number;
  contribution_frequency?: FinancialGoal['contribution_frequency'];
}

export interface UpdateGoalDto extends Partial<CreateGoalDto> {
  status?: FinancialGoal['status'];
}

export interface GoalContribution {
  id: number;
  goal_id: number;
  amount: number;
  date: string;
  notes?: string;
  created_at: string;
}

export interface GoalProgress {
  goal: FinancialGoal;
  current_amount: number;
  target_amount: number;
  progress_percentage: number;
  amount_remaining: number;
  days_elapsed: number;
  days_remaining: number;
  total_days: number;
  average_daily_contribution: number;
  required_daily_contribution: number;
  projected_completion_date: string;
  is_on_track: boolean;
  contributions: GoalContribution[];
  milestones: Array<{
    percentage: number;
    amount: number;
    reached: boolean;
    reached_date?: string;
  }>;
}

class GoalsService extends ApiClient {
  constructor() {
    super('/goals');
  }

  // Get all goals
  async getGoals(params?: QueryParams): Promise<ApiResponse<FinancialGoal[]>> {
    return this.get('', params);
  }

  // Get single goal
  async getGoal(id: number): Promise<ApiResponse<FinancialGoal>> {
    return this.get(`/${id}`);
  }

  // Create goal
  async createGoal(data: CreateGoalDto): Promise<ApiResponse<FinancialGoal>> {
    return this.post('', data);
  }

  // Update goal
  async updateGoal(id: number, data: UpdateGoalDto): Promise<ApiResponse<FinancialGoal>> {
    return this.put(`/${id}`, data);
  }

  // Delete goal
  async deleteGoal(id: number): Promise<ApiResponse<void>> {
    return this.delete(`/${id}`);
  }

  // Add contribution to goal
  async contribute(
    id: number,
    data: {
      amount: number;
      date?: string;
      notes?: string;
    },
  ): Promise<ApiResponse<GoalContribution>> {
    return this.post(`/${id}/contribute`, data);
  }

  // Get goal progress
  async getGoalProgress(id: number): Promise<ApiResponse<GoalProgress>> {
    return this.get(`/${id}/progress`);
  }

  // Mark goal as completed
  async completeGoal(id: number): Promise<ApiResponse<FinancialGoal>> {
    return this.post(`/${id}/complete`);
  }

  // Pause goal
  async pauseGoal(id: number): Promise<ApiResponse<FinancialGoal>> {
    return this.post(`/${id}/pause`);
  }

  // Resume goal
  async resumeGoal(id: number): Promise<ApiResponse<FinancialGoal>> {
    return this.post(`/${id}/resume`);
  }

  // Get goal contributions
  async getContributions(
    id: number,
    params?: QueryParams,
  ): Promise<ApiResponse<GoalContribution[]>> {
    return this.get(`/${id}/contributions`, params);
  }

  // Delete contribution
  async deleteContribution(goalId: number, contributionId: number): Promise<ApiResponse<void>> {
    return this.delete(`/${goalId}/contributions/${contributionId}`);
  }

  // Get goals summary
  async getGoalsSummary(): Promise<
    ApiResponse<{
      total_goals: number;
      active_goals: number;
      completed_goals: number;
      total_target: number;
      total_saved: number;
      overall_progress: number;
      on_track_count: number;
      behind_schedule_count: number;
    }>
  > {
    return this.get('/summary');
  }

  // Get goal recommendations
  async getRecommendations(): Promise<
    ApiResponse<
      Array<{
        type: string;
        title: string;
        description: string;
        suggested_amount: number;
        priority: string;
        reason: string;
      }>
    >
  > {
    return this.get('/recommendations');
  }

  // Calculate goal projections
  async calculateProjection(data: {
    target_amount: number;
    current_amount: number;
    monthly_contribution: number;
    target_date?: string;
  }): Promise<
    ApiResponse<{
      months_to_goal: number;
      projected_date: string;
      total_contributions_needed: number;
      interest_earned?: number;
    }>
  > {
    return this.post('/calculate-projection', data);
  }

  // Bulk update goals
  async bulkUpdateGoals(
    goals: Array<{ id: number } & UpdateGoalDto>,
  ): Promise<ApiResponse<FinancialGoal[]>> {
    return this.put('/bulk/update', { goals });
  }
}

export const goalsService = new GoalsService();
