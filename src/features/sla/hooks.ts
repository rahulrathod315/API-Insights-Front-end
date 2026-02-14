import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listSLAs,
  createSLA,
  updateSLA,
  deleteSLA,
  getSLADashboard,
  getSLACompliance,
  getSLATimeline,
  getSLAIncidents,
} from './api'
import type { CreateSLARequest, UpdateSLARequest } from './types'

const slaKeys = {
  all: (projectId: string) => ['sla', projectId] as const,
  list: (projectId: string) => ['sla', projectId, 'list'] as const,
  dashboard: (projectId: string, params?: Record<string, string>) =>
    ['sla', projectId, 'dashboard', params] as const,
  compliance: (projectId: string, slaId: string, params?: Record<string, string>) =>
    ['sla', projectId, slaId, 'compliance', params] as const,
  timeline: (projectId: string, slaId: string, params?: Record<string, string>) =>
    ['sla', projectId, slaId, 'timeline', params] as const,
  incidents: (projectId: string, slaId: string, params?: Record<string, string>) =>
    ['sla', projectId, slaId, 'incidents', params] as const,
}

export function useSLAs(projectId: string) {
  return useQuery({
    queryKey: slaKeys.list(projectId),
    queryFn: () => listSLAs(projectId),
    enabled: !!projectId,
  })
}

export function useSLADashboard(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: slaKeys.dashboard(projectId, params),
    queryFn: () => getSLADashboard(projectId, params),
    enabled: !!projectId,
  })
}

export function useSLACompliance(
  projectId: string,
  slaId: string,
  params?: Record<string, string>
) {
  return useQuery({
    queryKey: slaKeys.compliance(projectId, slaId, params),
    queryFn: () => getSLACompliance(projectId, slaId, params),
    enabled: !!projectId && !!slaId,
  })
}

export function useSLATimeline(
  projectId: string,
  slaId: string,
  params?: Record<string, string>
) {
  return useQuery({
    queryKey: slaKeys.timeline(projectId, slaId, params),
    queryFn: () => getSLATimeline(projectId, slaId, params),
    enabled: !!projectId && !!slaId,
  })
}

export function useSLAIncidents(
  projectId: string,
  slaId: string,
  params?: Record<string, string>
) {
  return useQuery({
    queryKey: slaKeys.incidents(projectId, slaId, params),
    queryFn: () => getSLAIncidents(projectId, slaId, params),
    enabled: !!projectId && !!slaId,
  })
}

export function useCreateSLA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: CreateSLARequest }) =>
      createSLA(projectId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: slaKeys.all(variables.projectId) })
    },
  })
}

export function useUpdateSLA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      slaId,
      data,
    }: {
      projectId: string
      slaId: string
      data: UpdateSLARequest
    }) => updateSLA(projectId, slaId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: slaKeys.all(variables.projectId) })
    },
  })
}

export function useDeleteSLA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, slaId }: { projectId: string; slaId: string }) =>
      deleteSLA(projectId, slaId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: slaKeys.all(variables.projectId) })
    },
  })
}
