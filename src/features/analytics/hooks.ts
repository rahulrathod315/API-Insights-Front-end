import { useQuery } from '@tanstack/react-query'
import {
  getComparison,
  getDashboard,
  getEndpointMetrics,
  getErrorClusters,
  getUserAgentBreakdown,
  getRequestsPerEndpoint,
  getSlowEndpoints,
  getSummary,
  getTimeSeries,
} from './api'
import type { AnalyticsParams, ComparisonParams } from './types'

export function useDashboard(params?: AnalyticsParams) {
  return useQuery({
    queryKey: ['analytics', 'dashboard', params],
    queryFn: () => getDashboard(params),
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  })
}

export function useSummary(projectId: string, params?: AnalyticsParams) {
  return useQuery({
    queryKey: ['analytics', 'summary', projectId, params],
    queryFn: () => getSummary(projectId, params),
    enabled: !!projectId,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  })
}

export function useTimeSeries(projectId: string, params?: AnalyticsParams) {
  return useQuery({
    queryKey: ['analytics', 'time-series', projectId, params],
    queryFn: () => getTimeSeries(projectId, params),
    enabled: !!projectId,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  })
}

export function useRequestsPerEndpoint(
  projectId: string,
  params?: AnalyticsParams
) {
  return useQuery({
    queryKey: ['analytics', 'requests-per-endpoint', projectId, params],
    queryFn: () => getRequestsPerEndpoint(projectId, params),
    enabled: !!projectId,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  })
}

export function useSlowEndpoints(
  projectId: string,
  params?: AnalyticsParams
) {
  return useQuery({
    queryKey: ['analytics', 'slow-endpoints', projectId, params],
    queryFn: () => getSlowEndpoints(projectId, params),
    enabled: !!projectId,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  })
}

export function useErrorClusters(
  projectId: string,
  params?: AnalyticsParams
) {
  return useQuery({
    queryKey: ['analytics', 'error-clusters', projectId, params],
    queryFn: () => getErrorClusters(projectId, params),
    enabled: !!projectId,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  })
}

export function useUserAgentBreakdown(
  projectId: string,
  params?: AnalyticsParams
) {
  return useQuery({
    queryKey: ['analytics', 'user-agents', projectId, params],
    queryFn: () => getUserAgentBreakdown(projectId, params),
    enabled: !!projectId,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  })
}

export function useComparison(projectId: string, params?: ComparisonParams) {
  return useQuery({
    queryKey: ['analytics', 'comparison', projectId, params],
    queryFn: () => getComparison(projectId, params!),
    enabled: !!projectId && !!params,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  })
}

export function useEndpointMetrics(
  projectId: string,
  endpointId: string,
  params?: AnalyticsParams
) {
  return useQuery({
    queryKey: ['analytics', 'endpoint-metrics', projectId, endpointId, params],
    queryFn: () => getEndpointMetrics(projectId, endpointId, params),
    enabled: !!projectId && !!endpointId,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  })
}
