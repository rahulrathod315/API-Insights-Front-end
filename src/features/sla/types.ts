export interface SLAEndpoint {
  id: number
  path: string
  method: string
}

export interface SLAConfig {
  id: number
  name: string
  uptime_target_percent: number
  response_time_target_ms: number | null
  response_time_percentile: 'p50' | 'p95' | 'p99'
  error_rate_target_percent: number | null
  evaluation_period: 'weekly' | 'monthly' | 'quarterly'
  evaluation_period_display: string
  downtime_threshold_error_rate: number
  downtime_threshold_no_traffic_minutes: number
  is_active: boolean
  created_at: string
  endpoint: SLAEndpoint | null
}

export interface ErrorBudget {
  total_allowed_hours: number
  used_hours: number
  remaining_hours: number
  consumed_percent: number
}

export interface ResponseTimeCompliance {
  target_ms: number
  percentile: string
  current_ms: number
  is_compliant: boolean
}

export interface ErrorRateCompliance {
  target_percent: number
  current_percent: number
  is_compliant: boolean
}

export interface Compliance {
  is_meeting_sla: boolean
  uptime_percent: number
  uptime_target: number
  is_meeting_uptime: boolean
  total_hours: number
  up_hours: number
  down_hours: number
  error_budget: ErrorBudget
  response_time: ResponseTimeCompliance
  error_rate: ErrorRateCompliance
}

export interface SLAWithCompliance extends SLAConfig {
  compliance: Compliance
}

export interface DashboardResponse {
  project: { id: number; name: string }
  total_slas: number
  meeting_sla: number
  breaching_sla: number
  slas: SLAWithCompliance[]
}

export interface DailyTrend {
  date: string
  uptime_percent: number
  total_hours: number
  up_hours: number
  down_hours: number
}

export interface ComplianceResponse {
  sla: SLAConfig
  period: { start: string; end: string }
  compliance: Compliance
  daily_trend: DailyTrend[]
  recent_incidents: DowntimeIncident[]
}

export interface TimelineEntry {
  timestamp: string
  is_up: boolean
  request_count: number
  error_count: number
  error_rate: number
  avg_response_time: number
  downtime_reason: string | null
}

export interface TimelineResponse {
  sla: SLAConfig
  period: { days: number; start: string; end: string }
  summary: {
    total_hours: number
    up_hours: number
    down_hours: number
    uptime_percent: number
  }
  timeline: TimelineEntry[]
}

export interface DowntimeIncident {
  id: number
  started_at: string
  ended_at: string | null
  duration_seconds: number
  root_cause: string
  root_cause_display: string
  affected_endpoints: string[]
  error_codes: Record<string, number>
  avg_error_rate: number
  avg_response_time: number
  is_resolved: boolean
}

export interface IncidentsResponse {
  sla: SLAConfig
  total_incidents: number
  incidents: DowntimeIncident[]
}

export interface CreateSLARequest {
  name: string
  uptime_target_percent: number
  response_time_target_ms?: number | null
  response_time_percentile?: 'p50' | 'p95' | 'p99'
  error_rate_target_percent?: number | null
  evaluation_period: 'weekly' | 'monthly' | 'quarterly'
  endpoint_id?: number | null
}

export interface UpdateSLARequest extends Partial<CreateSLARequest> {
  is_active?: boolean
}
