export interface AnalyticsParams {
  days?: number
  granularity?: 'hour' | 'day' | 'week' | 'month'
  endpoint_id?: number
  start_date?: string
  end_date?: string
}

export interface ComparisonParams {
  current_start: string
  current_end: string
  previous_start: string
  previous_end: string
}

export interface ExportParams {
  format?: 'json' | 'csv'
  start_date?: string
  end_date?: string
  limit?: number
}

export interface DashboardData {
  period: { days: number; start_date: string; end_date: string }
  totals: { projects: number; total_requests: number; total_errors: number; error_rate: number }
  projects: Array<{ id: number; name: string; request_count: number; error_count: number; endpoint_count: number }>
}

export interface ProjectSummary {
  project: { id: number; name: string }
  period: { days: number; start_date: string; end_date: string }
  summary: {
    total_requests: number
    successful_requests: number
    error_requests: number
    success_rate: number
    avg_response_time_ms: number
  }
  status_breakdown: Record<string, number>
  top_endpoints: Array<{ id: number; path: string; method: string; request_count: number }>
  daily_trend: Array<{ date: string; count: number }>
}

export interface TimeSeriesResponse {
  project: { id: number; name: string }
  endpoint: { id: number; path: string } | null
  period: { granularity: string; days: number; start_date: string; end_date: string }
  data: TimeSeriesPoint[]
}

export interface TimeSeriesPoint {
  timestamp: string
  request_count: number
  success_count: number
  error_count: number
  avg_response_time: number
  p50_response_time: number
  p95_response_time: number
  p99_response_time: number
  status_2xx: number
  status_3xx: number
  status_4xx: number
  status_5xx: number
  error_rate: number
}

export interface RequestsPerEndpointResponse {
  project: { id: number; name: string }
  period: { days: number; start_date: string; end_date: string }
  total_endpoints: number
  total_requests: number
  endpoints: EndpointStats[]
}

export interface EndpointStats {
  id: number
  path: string
  method: string
  name: string
  total_requests: number
  success_count: number
  error_count: number
  success_rate: number
  avg_response_time_ms: number
}

export interface SlowEndpointsResponse {
  project: { id: number; name: string }
  threshold_ms: number
  period: { days: number; start_date: string; end_date: string }
  slow_endpoints: SlowEndpoint[]
  total_slow_endpoints: number
}

export interface SlowEndpoint {
  id: number
  path: string
  method: string
  avg_response_time_ms: number
  request_count: number
  slow_request_count: number
  slow_percent: number
}

export interface ErrorClustersResponse {
  project: { id: number; name: string }
  period: { days: number; start_date: string; end_date: string }
  total_errors: number
  by_status_code: Array<{ status_code: number; count: number }>
  by_endpoint: Array<{ endpoint_id: number; path: string; method: string; error_count: number; status_4xx: number; status_5xx: number }>
  common_error_messages: Array<{ error_message: string; count: number }>
}

export interface UserAgentBreakdownResponse {
  project: { id: number; name: string }
  period: { days: number; start_date: string; end_date: string }
  total_requests: number
  user_agents: Array<{ name: string; count: number }>
}

export interface ComparisonData {
  project: { id: number; name: string }
  current_period: {
    start: string
    end: string
    metrics: { request_count: number; error_count: number; error_rate: number; avg_response_time: number }
  }
  previous_period: {
    start: string
    end: string
    metrics: { request_count: number; error_count: number; error_rate: number; avg_response_time: number }
  }
  changes: Record<string, { absolute: number; percent: number }>
}

export interface EndpointMetrics {
  endpoint: { id: number; path: string; method: string; name: string }
  period: { days: number; start_date: string; end_date: string }
  summary: {
    total_requests: number
    avg_response_time_ms: number
    min_response_time_ms: number
    max_response_time_ms: number
    total_request_size_bytes: number
    total_response_size_bytes: number
  }
  percentiles: { p50: number; p90: number; p95: number; p99: number }
  status_distribution: Array<{ status_code: number; count: number }>
  hourly_distribution: Array<{ hour: string; count: number; avg_response_time: number }>
  recent_errors: Array<{ id: number; status_code: number; error_message: string; timestamp: string; ip_address: string }>
}
