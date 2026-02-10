import { apiClient } from '@/lib/api/client'
import type {
  AnalyticsParams,
  ComparisonParams,
  ComparisonData,
  DashboardData,
  EndpointMetrics,
  ErrorClustersResponse,
  ExportParams,
  ProjectSummary,
  RequestsPerEndpointResponse,
  SlowEndpointsResponse,
  TimeSeriesResponse,
} from './types'

export async function getDashboard(params?: AnalyticsParams): Promise<DashboardData> {
  const response = await apiClient.get<DashboardData>('/api/v1/analytics/dashboard/', { params })
  return response.data
}

export async function getSummary(projectId: string, params?: AnalyticsParams): Promise<ProjectSummary> {
  const response = await apiClient.get<ProjectSummary>(`/api/v1/analytics/projects/${projectId}/`, { params })
  return response.data
}

export async function getTimeSeries(projectId: string, params?: AnalyticsParams): Promise<TimeSeriesResponse> {
  const response = await apiClient.get<TimeSeriesResponse>(`/api/v1/analytics/projects/${projectId}/time-series/`, { params })
  return response.data
}

export async function getRequestsPerEndpoint(projectId: string, params?: AnalyticsParams): Promise<RequestsPerEndpointResponse> {
  const response = await apiClient.get<RequestsPerEndpointResponse>(`/api/v1/analytics/projects/${projectId}/requests-per-endpoint/`, { params })
  return response.data
}

export async function getSlowEndpoints(projectId: string, params?: AnalyticsParams): Promise<SlowEndpointsResponse> {
  const response = await apiClient.get<SlowEndpointsResponse>(`/api/v1/analytics/projects/${projectId}/slow-endpoints/`, { params })
  return response.data
}

export async function getErrorClusters(projectId: string, params?: AnalyticsParams): Promise<ErrorClustersResponse> {
  const response = await apiClient.get<ErrorClustersResponse>(`/api/v1/analytics/projects/${projectId}/error-clusters/`, { params })
  return response.data
}

export async function getComparison(projectId: string, params: ComparisonParams): Promise<ComparisonData> {
  const response = await apiClient.get<ComparisonData>(`/api/v1/analytics/projects/${projectId}/comparison/`, { params })
  return response.data
}

export async function exportData(projectId: string, params?: ExportParams): Promise<Blob> {
  const response = await apiClient.get<Blob>(`/api/v1/analytics/projects/${projectId}/export/`, { params, responseType: 'blob' })
  return response.data
}

export async function getEndpointMetrics(projectId: string, endpointId: string, params?: AnalyticsParams): Promise<EndpointMetrics> {
  const response = await apiClient.get<EndpointMetrics>(`/api/v1/analytics/projects/${projectId}/endpoints/${endpointId}/`, { params })
  return response.data
}
