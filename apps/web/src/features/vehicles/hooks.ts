'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi, type VehicleListParams } from './api';
import type { Vehicle, VehicleInput } from './types';

export const VEHICLES_QUERY_KEY = ['vehicles'] as const;

export const useVehicles = (params: VehicleListParams) =>
  useQuery({
    queryKey: [...VEHICLES_QUERY_KEY, 'list', params],
    queryFn: ({ signal }) => vehiclesApi.list(params, signal),
    placeholderData: keepPreviousData,
  });

export const useVehicle = (id: string) =>
  useQuery({
    queryKey: [...VEHICLES_QUERY_KEY, 'detail', id],
    queryFn: ({ signal }) => vehiclesApi.get(id, signal),
  });

export const useSaveVehicle = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VehicleInput) => (id ? vehiclesApi.update(id, input) : vehiclesApi.create(input)),
    onSuccess: (vehicle: Vehicle) => {
      queryClient.setQueryData([...VEHICLES_QUERY_KEY, 'detail', vehicle.id], vehicle);
      return queryClient.invalidateQueries({ queryKey: [...VEHICLES_QUERY_KEY, 'list'] });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehiclesApi.remove(id),
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: [...VEHICLES_QUERY_KEY, 'detail', id] });
      return queryClient.invalidateQueries({ queryKey: [...VEHICLES_QUERY_KEY, 'list'] });
    },
  });
};

export const useExtractCrlv = () =>
  useMutation({
    mutationFn: (file: File) => vehiclesApi.extractCrlv(file),
  });
