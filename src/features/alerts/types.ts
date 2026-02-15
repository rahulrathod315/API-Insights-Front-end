export interface Alert {
  id: number
  name: string
  description: string
  metric: 'error_rate' | 'avg_response_time' | 'p95_response_time' | 'p99_response_time' | 'request_count' | 'error_count'
  metric_display: string
  comparison: 'gt' | 'lt' | 'gte' | 'lte'
  comparison_display: string
  threshold: number
  evaluation_window_minutes: number
  is_enabled: boolean
  status: 'active' | 'triggered' | 'resolved'
  status_display: string
  notify_on_trigger: boolean
  notify_on_resolve: boolean
  cooldown_minutes: number
  last_triggered_at: string | null
  last_resolved_at: string | null
  last_evaluated_at: string | null
  created_at: string
  endpoint: { id: number; path: string; method: string } | null
  slack_webhook_url: string | null
}

export interface AlertHistory {
  id: number
  event_type: 'triggered' | 'resolved' | 'acknowledged' | 'created' | 'updated' | 'disabled' | 'enabled'
  metric_value: number | null
  threshold_value: number | null
  message: string
  created_at: string
}

export interface CreateAlertRequest {
  name: string
  description?: string
  metric: string
  comparison: string
  threshold: number
  evaluation_window_minutes?: number
  is_enabled?: boolean
  notify_on_trigger?: boolean
  notify_on_resolve?: boolean
  cooldown_minutes?: number
  endpoint_id?: number
  slack_webhook_url?: string
}

export interface UpdateAlertRequest {
  name?: string
  description?: string
  metric?: string
  comparison?: string
  threshold?: number
  evaluation_window_minutes?: number
  is_enabled?: boolean
  notify_on_trigger?: boolean
  notify_on_resolve?: boolean
  cooldown_minutes?: number
  endpoint_id?: number | null
  slack_webhook_url?: string | null
}
