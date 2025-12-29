// src/services/goalsService.ts
import { api } from 'src/boot/axios';
import {
  ContributionData,
  CreateGoalData,
  GoalFilters,
  GoalResponse,
  GoalsResponse,
  UpdateGoalData,
} from 'src/types/goal.types';

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

export const goalsService = new GoalsService();
