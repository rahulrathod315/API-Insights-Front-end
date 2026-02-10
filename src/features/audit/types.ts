export interface AuditLog {
  id: number
  actor: number
  actor_email: string
  action: string
  resource_type: string
  resource_id: string
  description: string
  project: number | null
  changes: Record<string, unknown> | null
  ip_address: string
  user_agent: string
  correlation_id: string
  created_at: string
}

export interface AuditLogFilters {
  action?: string
  resource_type?: string
  actor?: number
  date_from?: string
  date_to?: string
  page?: number
  page_size?: number
}
