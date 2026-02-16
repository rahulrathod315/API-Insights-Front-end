import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listEndpoints,
  getEndpoint,
  createEndpoint,
  updateEndpoint,
  deleteEndpoint,
  getEndpointMetrics,
  getEndpointTimeSeries,
} from './api'
import type {
  CreateEndpointRequest,
  UpdateEndpointRequest,
  EndpointFilters,
} from './types'
import type { AnalyticsParams } from '@/features/analytics/types'

const endpointKeys = {
  all: (projectId: string) => ['endpoints', projectId] as const,
  list: (projectId: string, filters?: EndpointFilters) =>
    ['endpoints', projectId, filters] as const,
  detail: (projectId: string, endpointId: string) =>
    ['endpoints', projectId, endpointId] as const,
  metrics: (projectId: string, endpointId: string, params?: AnalyticsParams) =>
    ['endpoint-metrics', projectId, endpointId, params] as const,
  timeSeries: (projectId: string, endpointId: string, params?: AnalyticsParams) =>
    ['endpoint-time-series', projectId, endpointId, params] as const,
}

export function useEndpoints(projectId: string, filters?: EndpointFilters) {
  return useQuery({
    queryKey: endpointKeys.list(projectId, filters),
    queryFn: () => listEndpoints(projectId, filters),
    enabled: !!projectId,
  })
}

export function useEndpoint(projectId: string, endpointId: string) {
  return useQuery({
    queryKey: endpointKeys.detail(projectId, endpointId),
    queryFn: () => getEndpoint(projectId, endpointId),
    enabled: !!projectId && !!endpointId,
  })
}

export function useEndpointMetrics(
  projectId: string,
  endpointId: string,
  params?: AnalyticsParams
) {
  return useQuery({
    queryKey: endpointKeys.metrics(projectId, endpointId, params),
    queryFn: () => getEndpointMetrics(projectId, endpointId, params),
    enabled: !!projectId && !!endpointId,
  })
}

export function useEndpointTimeSeries(
  projectId: string,
  endpointId: string,
  params?: AnalyticsParams
) {
  return useQuery({
    queryKey: endpointKeys.timeSeries(projectId, endpointId, params),
    queryFn: () => getEndpointTimeSeries(projectId, endpointId, params),
    enabled: !!projectId && !!endpointId,
  })
}

export function useCreateEndpoint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string
      data: CreateEndpointRequest
    }) => createEndpoint(projectId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: endpointKeys.all(variables.projectId),
      })
    },
  })
}

export function useUpdateEndpoint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      endpointId,
      data,
    }: {
      projectId: string
      endpointId: string
      data: UpdateEndpointRequest
    }) => updateEndpoint(projectId, endpointId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: endpointKeys.detail(variables.projectId, variables.endpointId),
      })
      queryClient.invalidateQueries({
        queryKey: endpointKeys.all(variables.projectId),
      })
    },
  })
}

export function useDeleteEndpoint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      endpointId,
    }: {
      projectId: string
      endpointId: string
    }) => deleteEndpoint(projectId, endpointId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: endpointKeys.all(variables.projectId),
      })
    },
  })
}
