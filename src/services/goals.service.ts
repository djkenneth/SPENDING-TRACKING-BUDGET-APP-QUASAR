import { ApiClient } from 'src/services/api-client';
import {
  ContributionData,
  CreateGoalData,
  GoalFilters,
  GoalResponse,
  GoalsResponse,
  UpdateGoalData,
} from 'src/types/goal.types';

class GoalsService extends ApiClient {
  constructor() {
    super('/goals');
  }

  async getGoals(filters?: GoalFilters): Promise<GoalsResponse> {
    return await this.get('', filters);
  }

  async getGoal(goalId: number): Promise<GoalResponse> {
    return await this.get(`/${goalId}`);
  }

  async createGoal(goalData: CreateGoalData): Promise<GoalResponse> {
    return await this.post('', goalData);
  }

  async updateGoal(goalId: number, goalData: UpdateGoalData): Promise<GoalResponse> {
    return await this.put(`/${goalId}`, goalData);
  }

  async deleteGoal(goalId: number): Promise<{ success: boolean; message: string }> {
    return await this.delete(`/${goalId}`);
  }

  async addContribution(goalId: number, contributionData: ContributionData): Promise<GoalResponse> {
    return await this.post(`/${goalId}/contribute`, contributionData);
  }

  async getGoalProgress(goalId: number, period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
    return await this.get(`/${goalId}/progress`, { period });
  }

  async completeGoal(goalId: number): Promise<GoalResponse> {
    return await this.post(`/${goalId}/complete`);
  }

  async pauseGoal(goalId: number): Promise<GoalResponse> {
    return await this.updateGoal(goalId, { status: 'paused' });
  }

  async resumeGoal(goalId: number): Promise<GoalResponse> {
    return await this.updateGoal(goalId, { status: 'active' });
  }

  async cancelGoal(goalId: number): Promise<GoalResponse> {
    return await this.updateGoal(goalId, { status: 'cancelled' });
  }
}

export const goalsService = new GoalsService();
