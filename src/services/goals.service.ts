import { api } from 'src/boot/axios';
import {
  ContributionData,
  CreateGoalData,
  GoalFilters,
  GoalResponse,
  GoalsResponse,
  UpdateGoalData,
} from 'src/types/goal.types';

const BASE = '/goals';

export const goalsService = {
  async getGoals(filters?: GoalFilters): Promise<GoalsResponse> {
    const r = await api.get(BASE, { params: filters });
    return r.data;
  },

  async getGoal(goalId: number): Promise<GoalResponse> {
    const r = await api.get(`${BASE}/${goalId}`);
    return r.data;
  },

  async createGoal(goalData: CreateGoalData): Promise<GoalResponse> {
    const r = await api.post(BASE, goalData);
    return r.data;
  },

  async updateGoal(goalId: number, goalData: UpdateGoalData): Promise<GoalResponse> {
    const r = await api.put(`${BASE}/${goalId}`, goalData);
    return r.data;
  },

  async deleteGoal(goalId: number): Promise<{ success: boolean; message: string }> {
    const r = await api.delete(`${BASE}/${goalId}`);
    return r.data;
  },

  async addContribution(goalId: number, contributionData: ContributionData): Promise<GoalResponse> {
    const r = await api.post(`${BASE}/${goalId}/contribute`, contributionData);
    return r.data;
  },

  async getGoalProgress(goalId: number, period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
    const r = await api.get(`${BASE}/${goalId}/progress`, { params: { period } });
    return r.data;
  },

  async completeGoal(goalId: number): Promise<GoalResponse> {
    const r = await api.post(`${BASE}/${goalId}/complete`);
    return r.data;
  },

  async pauseGoal(goalId: number): Promise<GoalResponse> {
    const r = await api.put(`${BASE}/${goalId}`, { status: 'paused' });
    return r.data;
  },

  async resumeGoal(goalId: number): Promise<GoalResponse> {
    const r = await api.put(`${BASE}/${goalId}`, { status: 'active' });
    return r.data;
  },

  async cancelGoal(goalId: number): Promise<GoalResponse> {
    const r = await api.put(`${BASE}/${goalId}`, { status: 'cancelled' });
    return r.data;
  },
};
