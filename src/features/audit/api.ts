import { apiClient } from '@/lib/api/client'
import type { PaginatedResponse } from '@/lib/api/types'
import type { AuditLog, AuditLogFilters } from './types'

export async function listAuditLogs(
  projectId: string,
  filters?: AuditLogFilters
): Promise<PaginatedResponse<AuditLog>> {
  const response = await apiClient.get<PaginatedResponse<AuditLog>>(
    `/api/v1/projects/${projectId}/audit-logs/`,
    { params: filters }
  )
  return response.data
}
