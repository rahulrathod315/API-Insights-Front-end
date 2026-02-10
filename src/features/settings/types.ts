export interface Profile {
  id: number
  email: string
  first_name: string
  last_name: string
  company_name: string
  is_email_verified: boolean
  is_two_factor_enabled: boolean
  display_name: string | null
  timezone: string | null
  locale: string | null
  default_landing_page: string | null
  avatar_url: string | null
  date_joined: string
}

export interface UpdateProfileRequest {
  first_name?: string
  last_name?: string
  company_name?: string
  display_name?: string
  timezone?: string
  locale?: string
  default_landing_page?: string
  avatar_url?: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  new_password_confirm: string
}

export interface TwoFactorSetupResponse {
  secret: string
  qr_code: string
  provisioning_uri: string
}

export interface TwoFactorVerifyResponse {
  enabled: boolean
  recovery_codes: string[]
}

export interface TwoFactorStatus {
  is_enabled: boolean
  verified_at: string | null
  recovery_codes_remaining: number
}

export interface Session {
  jti: string
  ip_address: string
  user_agent: string
  created_at: string
  expires_at: string
  is_current: boolean
}

export interface SecurityEvents {
  last_login: string | null
  last_password_change_at: string | null
  last_email_verification_at: string | null
  is_email_verified: boolean
  failed_login_count: number
  is_locked: boolean
  locked_until: string | null
  active_session_count: number
  is_two_factor_enabled: boolean
  two_factor_verified_at: string | null
}

export interface NotificationPreferences {
  email_notifications_enabled: boolean
  security_email_notifications_enabled: boolean
  marketing_emails_opt_in: boolean
  alert_trigger_notifications_enabled: boolean
  alert_resolve_notifications_enabled: boolean
  updated_at?: string
}
