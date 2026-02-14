import { apiClient } from '@/lib/api/client'
import { tokenManager } from '@/lib/auth/token-manager'
import type { AxiosResponse } from 'axios'
import type {
  AnalyticsParams,
  ComparisonParams,
  ComparisonData,
  CountryDetailResponse,
  DashboardData,
  EndpointMetrics,
  ErrorClustersResponse,
  ExportParams,
  GeoISPResponse,
  GeoMapResponse,
  GeoOverviewResponse,
  GeoPerformanceResponse,
  GeoTimeSeriesResponse,
  ProjectSummary,
  RequestsPerEndpointResponse,
  SlowEndpointsResponse,
  TimeSeriesResponse,
  UserAgentBreakdownResponse,
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

export async function getUserAgentBreakdown(projectId: string, params?: AnalyticsParams): Promise<UserAgentBreakdownResponse> {
  const response = await apiClient.get<UserAgentBreakdownResponse>(`/api/v1/analytics/projects/${projectId}/user-agents/`, { params })
  return response.data
}

export async function getComparison(projectId: string, params: ComparisonParams): Promise<ComparisonData> {
  const response = await apiClient.get<ComparisonData>(`/api/v1/analytics/projects/${projectId}/comparison/`, { params })
  return response.data
}

export async function exportData(
  projectId: string,
  params?: ExportParams
): Promise<AxiosResponse<Blob>> {
  const token = tokenManager.getAccessToken()
  const response = await apiClient.get<Blob>(
    `/api/v1/analytics/projects/${projectId}/export/`,
    {
      params,
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  )
  return response
}

export async function getEndpointMetrics(projectId: string, endpointId: string, params?: AnalyticsParams): Promise<EndpointMetrics> {
  const response = await apiClient.get<EndpointMetrics>(`/api/v1/analytics/projects/${projectId}/endpoints/${endpointId}/`, { params })
  return response.data
}

// Geo-Analytics API

export async function getGeoOverview(projectId: string, params?: AnalyticsParams): Promise<GeoOverviewResponse> {
  const response = await apiClient.get<GeoOverviewResponse>(`/api/v1/analytics/projects/${projectId}/geo/`, { params })
  return response.data
}

export async function getGeoMap(projectId: string, params?: AnalyticsParams): Promise<GeoMapResponse> {
  const response = await apiClient.get<GeoMapResponse>(`/api/v1/analytics/projects/${projectId}/geo/map/`, { params })
  return response.data
}

export async function getCountryDetail(projectId: string, countryCode: string, params?: AnalyticsParams): Promise<CountryDetailResponse> {
  const response = await apiClient.get<CountryDetailResponse>(`/api/v1/analytics/projects/${projectId}/geo/countries/${countryCode}/`, { params })
  return response.data
}

export async function getGeoTimeSeries(projectId: string, params?: AnalyticsParams): Promise<GeoTimeSeriesResponse> {
  const response = await apiClient.get<GeoTimeSeriesResponse>(`/api/v1/analytics/projects/${projectId}/geo/time-series/`, { params })
  return response.data
}

export async function getGeoPerformance(projectId: string, params?: AnalyticsParams): Promise<GeoPerformanceResponse> {
  const response = await apiClient.get<GeoPerformanceResponse>(`/api/v1/analytics/projects/${projectId}/geo/performance/`, { params })
  return response.data
}

export async function getGeoISPs(projectId: string, params?: AnalyticsParams): Promise<GeoISPResponse> {
  const response = await apiClient.get<GeoISPResponse>(`/api/v1/analytics/projects/${projectId}/geo/isps/`, { params })
  return response.data
}
