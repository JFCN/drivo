import { apiRequest } from '@/lib/api-client';
import type { CrlvExtraction, Vehicle, VehicleInput, VehicleList } from './types';

export type VehicleListParams = {
  search: string;
  offset: number;
  limit: number;
};

export const vehiclesApi = {
  list: ({ search, offset, limit }: VehicleListParams, signal?: AbortSignal) => {
    const query = new URLSearchParams({ offset: String(offset), limit: String(limit) });
    if (search) {
      query.set('search', search);
    }
    return apiRequest<VehicleList>(`/vehicles?${query}`, { signal });
  },
  get: (id: string, signal?: AbortSignal) => apiRequest<Vehicle>(`/vehicles/${id}`, { signal }),
  create: (input: VehicleInput) => apiRequest<Vehicle>('/vehicles', { method: 'POST', body: input }),
  update: (id: string, input: VehicleInput) => apiRequest<Vehicle>(`/vehicles/${id}`, { method: 'PATCH', body: input }),
  remove: (id: string) => apiRequest<void>(`/vehicles/${id}`, { method: 'DELETE' }),
  extractCrlv: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiRequest<CrlvExtraction>('/crlv/extract', { method: 'POST', body: form });
  },
};
