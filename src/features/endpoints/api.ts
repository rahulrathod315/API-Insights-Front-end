import { apiClient } from '@/lib/api/client'
import type { PaginatedResponse } from '@/lib/api/types'
import type { Endpoint, CreateEndpointRequest, UpdateEndpointRequest, EndpointFilters } from './types'

export async function listEndpoints(
  projectId: string,
  filters?: EndpointFilters
): Promise<PaginatedResponse<Endpoint>> {
  const response = await apiClient.get<PaginatedResponse<Endpoint>>(
    `/api/v1/projects/${projectId}/endpoints/`,
    { params: filters }
  )
  return response.data
}

export async function getEndpoint(
  projectId: string,
  endpointId: string
): Promise<Endpoint> {
  const response = await apiClient.get<Endpoint>(
    `/api/v1/projects/${projectId}/endpoints/${endpointId}/`
  )
  return response.data
}

export async function createEndpoint(
  projectId: string,
  data: CreateEndpointRequest
): Promise<Endpoint> {
  const response = await apiClient.post<Endpoint>(
    `/api/v1/projects/${projectId}/endpoints/`,
    data
  )
  return response.data
}

export async function updateEndpoint(
  projectId: string,
  endpointId: string,
  data: UpdateEndpointRequest
): Promise<Endpoint> {
  const response = await apiClient.patch<Endpoint>(
    `/api/v1/projects/${projectId}/endpoints/${endpointId}/`,
    data
  )
  return response.data
}

export async function deleteEndpoint(
  projectId: string,
  endpointId: string
): Promise<void> {
  await apiClient.delete(`/api/v1/projects/${projectId}/endpoints/${endpointId}/`)
}
