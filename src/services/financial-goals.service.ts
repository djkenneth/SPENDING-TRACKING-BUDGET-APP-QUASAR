// src/services/financial-goals.service.ts

import { api } from '../boot/axios';
import type { AxiosResponse } from 'axios';

import {
  ApiClient,
  type ApiResponse,
  type PaginatedResponse,
  type QueryParams,
} from './api-client';

export class FinancialGoalService {
  async getGoals(params?: QueryParams) {
    return api.get('/goals', { params });
  }

  async contribute(goalId: number, data: any) {
    return api.post(`/goals/${goalId}/contribute`, data);
  }

  async getProgress(goalId: number) {
    return api.get(`/goals/${goalId}/progress`);
  }

  async complete(goalId: number) {
    return api.post(`/goals/${goalId}/complete`);
  }
}
