import { useQuery } from '@tanstack/react-query'
import { listAuditLogs } from './api'
import type { AuditLogFilters } from './types'

const auditLogKeys = {
  all: (projectId: string) => ['audit-logs', projectId] as const,
  list: (projectId: string, filters?: AuditLogFilters) =>
    ['audit-logs', projectId, filters] as const,
}

export function useAuditLogs(projectId: string, filters?: AuditLogFilters) {
  return useQuery({
    queryKey: auditLogKeys.list(projectId, filters),
    queryFn: () => listAuditLogs(projectId, filters),
    enabled: !!projectId,
  })
}
