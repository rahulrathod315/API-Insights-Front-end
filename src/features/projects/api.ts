import { apiClient } from '@/lib/api/client'
import type { Project, ProjectDetail, CreateProjectRequest, UpdateProjectRequest } from './types'

export async function listProjects(): Promise<Project[]> {
  const response = await apiClient.get<Project[]>('/api/v1/projects/')
  return response.data
}

export async function getProject(id: string): Promise<ProjectDetail> {
  const response = await apiClient.get<ProjectDetail>(`/api/v1/projects/${id}/`)
  return response.data
}

export async function createProject(data: CreateProjectRequest): Promise<Project> {
  const response = await apiClient.post<Project>('/api/v1/projects/', data)
  return response.data
}

export async function updateProject(id: string, data: UpdateProjectRequest): Promise<ProjectDetail> {
  const response = await apiClient.patch<ProjectDetail>(`/api/v1/projects/${id}/`, data)
  return response.data
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/projects/${id}/`)
}

export async function regenerateKey(id: string): Promise<{ api_key: string }> {
  const response = await apiClient.post<{ api_key: string }>(`/api/v1/projects/${id}/regenerate-key/`, { confirm: true })
  return response.data
}
