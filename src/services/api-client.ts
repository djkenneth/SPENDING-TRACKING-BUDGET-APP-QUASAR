import { api } from '../boot/axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { QueryParams, PaginatedResponse } from 'src/types/api-client.types';

// Base API client class
export class ApiClient {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  // GET request
  async get<T = any>(
    path: string = '',
    params?: QueryParams,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await api.get(`${this.endpoint}${path}`, {
      params,
      ...config,
    });
    return response.data;
  }

  // GET paginated request
  async getPaginated<T = any>(
    path: string = '',
    params?: QueryParams,
    config?: AxiosRequestConfig,
  ): Promise<PaginatedResponse<T>> {
    const response: AxiosResponse<PaginatedResponse<T>> = await api.get(`${this.endpoint}${path}`, {
      params,
      ...config,
    });

    if (response.data.success !== undefined) {
      return {
        data: response.data.data,
        meta: response.data.meta,
        links: {
          first: '',
          last: '',
          prev: null,
          next: null,
        },
      };
    }

    return response.data;
  }

  // POST request
  async post<T = any>(path: string = '', data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await api.post(`${this.endpoint}${path}`, data, config);
    return response.data;
  }

  // PUT request
  async put<T = any>(path: string = '', data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await api.put(`${this.endpoint}${path}`, data, config);
    return response.data;
  }

  // PATCH request
  async patch<T = any>(path: string = '', data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await api.patch(`${this.endpoint}${path}`, data, config);
    return response.data;
  }

  // DELETE request
  async delete<T = any>(path: string = '', config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await api.delete(`${this.endpoint}${path}`, config);
    return response.data;
  }

  // File upload
  async upload<T = any>(
    path: string = '',
    file: File,
    additionalData?: Record<string, any>,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });
    }

    const response: AxiosResponse<T> = await api.post(`${this.endpoint}${path}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    });
    return response.data;
  }
}
