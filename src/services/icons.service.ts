import { api } from 'src/boot/axios';
import { ApiResponse } from 'src/types/api-client.types';
import { Icon } from 'src/types/icon.types';

const BASE = '/icons';

export const iconsService = {
  async getIcons(): Promise<ApiResponse<Icon[]>> {
    const r = await api.get(BASE);
    return r.data;
  },

  async uploadIcon(file: File, name: string): Promise<ApiResponse<Icon>> {
    const formData = new FormData();
    formData.append('icon', file);
    formData.append('name', name);
    const r = await api.post(BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return r.data;
  },
};
