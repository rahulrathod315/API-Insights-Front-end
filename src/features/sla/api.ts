import { apiClient } from '@/lib/api/client'
import type {
  SLAConfig,
  DashboardResponse,
  ComplianceResponse,
  TimelineResponse,
  IncidentsResponse,
  CreateSLARequest,
  UpdateSLARequest,
} from './types'

export async function listSLAs(projectId: string): Promise<SLAConfig[]> {
  const response = await apiClient.get<SLAConfig[]>(
    `/api/v1/analytics/projects/${projectId}/sla/`
  )
  return response.data
}

export async function createSLA(projectId: string, data: CreateSLARequest): Promise<SLAConfig> {
  const response = await apiClient.post<SLAConfig>(
    `/api/v1/analytics/projects/${projectId}/sla/`,
    data
  )
  return response.data
}

export async function getSLA(projectId: string, slaId: string): Promise<SLAConfig> {
  const response = await apiClient.get<SLAConfig>(
    `/api/v1/analytics/projects/${projectId}/sla/${slaId}/`
  )
  return response.data
}

export async function updateSLA(
  projectId: string,
  slaId: string,
  data: UpdateSLARequest
): Promise<SLAConfig> {
  const response = await apiClient.put<SLAConfig>(
    `/api/v1/analytics/projects/${projectId}/sla/${slaId}/`,
    data
  )
  return response.data
}

export async function deleteSLA(projectId: string, slaId: string): Promise<void> {
  await apiClient.delete(`/api/v1/analytics/projects/${projectId}/sla/${slaId}/`)
}

export async function getSLADashboard(
  projectId: string,
  params?: Record<string, string>
): Promise<DashboardResponse> {
  const response = await apiClient.get<DashboardResponse>(
    `/api/v1/analytics/projects/${projectId}/sla/dashboard/`,
    { params }
  )
  return response.data
}

export async function getSLACompliance(
  projectId: string,
  slaId: string,
  params?: Record<string, string>
): Promise<ComplianceResponse> {
  const response = await apiClient.get<ComplianceResponse>(
    `/api/v1/analytics/projects/${projectId}/sla/${slaId}/compliance/`,
    { params }
  )
  return response.data
}

export async function getSLATimeline(
  projectId: string,
  slaId: string,
  params?: Record<string, string>
): Promise<TimelineResponse> {
  const response = await apiClient.get<TimelineResponse>(
    `/api/v1/analytics/projects/${projectId}/sla/${slaId}/timeline/`,
    { params }
  )
  return response.data
}

export async function getSLAIncidents(
  projectId: string,
  slaId: string,
  params?: Record<string, string>
): Promise<IncidentsResponse> {
  const response = await apiClient.get<IncidentsResponse>(
    `/api/v1/analytics/projects/${projectId}/sla/${slaId}/incidents/`,
    { params }
  )
  return response.data
}
