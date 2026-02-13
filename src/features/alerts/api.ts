import { apiClient } from '@/lib/api/client'
import type { PaginatedResponse, PaginationParams } from '@/lib/api/types'
import type { Alert, AlertHistory, CreateAlertRequest, UpdateAlertRequest } from './types'

export async function listAlerts(projectId: string, params?: PaginationParams): Promise<PaginatedResponse<Alert>> {
  const response = await apiClient.get<PaginatedResponse<Alert>>(
    `/api/v1/analytics/projects/${projectId}/alerts/`,
    { params }
  )
  return response.data
}

export async function getAlert(projectId: string, alertId: string): Promise<Alert> {
  const response = await apiClient.get<Alert>(`/api/v1/analytics/projects/${projectId}/alerts/${alertId}/`)
  return response.data
}

export async function createAlert(projectId: string, data: CreateAlertRequest): Promise<Alert> {
  const response = await apiClient.post<Alert>(`/api/v1/analytics/projects/${projectId}/alerts/`, data)
  return response.data
}

export async function updateAlert(
  projectId: string,
  alertId: string,
  data: UpdateAlertRequest
): Promise<Alert> {
  const response = await apiClient.patch<Alert>(
    `/api/v1/analytics/projects/${projectId}/alerts/${alertId}/`,
    data
  )
  return response.data
}

export async function deleteAlert(projectId: string, alertId: string): Promise<void> {
  await apiClient.delete(`/api/v1/analytics/projects/${projectId}/alerts/${alertId}/`)
}

export async function getAlertHistory(
  projectId: string,
  alertId: string
): Promise<AlertHistory[]> {
  const response = await apiClient.get<{ history: AlertHistory[] }>(
    `/api/v1/analytics/projects/${projectId}/alerts/${alertId}/history/`
  )
  return response.data.history
}
