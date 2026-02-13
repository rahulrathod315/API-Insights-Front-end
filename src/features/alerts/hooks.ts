import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listAlerts, createAlert, updateAlert, deleteAlert, getAlertHistory } from './api'
import type { PaginationParams } from '@/lib/api/types'
import type { CreateAlertRequest, UpdateAlertRequest } from './types'

const alertKeys = {
  all: (projectId: string) => ['alerts', projectId] as const,
  list: (projectId: string, params?: PaginationParams) =>
    ['alerts', projectId, params] as const,
  history: (projectId: string, alertId: string) =>
    ['alerts', projectId, alertId, 'history'] as const,
}

export function useAlerts(projectId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: alertKeys.list(projectId, params),
    queryFn: () => listAlerts(projectId, params),
    enabled: !!projectId,
  })
}

export function useCreateAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: CreateAlertRequest }) =>
      createAlert(projectId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all(variables.projectId) })
    },
  })
}

export function useUpdateAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      alertId,
      data,
    }: {
      projectId: string
      alertId: string
      data: UpdateAlertRequest
    }) => updateAlert(projectId, alertId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all(variables.projectId) })
    },
  })
}

export function useDeleteAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, alertId }: { projectId: string; alertId: string }) =>
      deleteAlert(projectId, alertId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all(variables.projectId) })
    },
  })
}

export function useAlertHistory(projectId: string, alertId: string) {
  return useQuery({
    queryKey: alertKeys.history(projectId, alertId),
    queryFn: () => getAlertHistory(projectId, alertId),
    enabled: !!projectId && !!alertId,
  })
}
