# API Insights — Frontend Architecture Reference

> **Last updated:** 2026-02-19
> **Version:** 2.0 (Full Redesign)
> **Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · TanStack Query v5 · Recharts · Radix UI

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Design System](#3-design-system)
4. [Directory Structure](#4-directory-structure)
5. [Routing & Navigation](#5-routing--navigation)
6. [Authentication Flow](#6-authentication-flow)
7. [State Management](#7-state-management)
8. [API Layer](#8-api-layer)
9. [Backend API Reference](#9-backend-api-reference)
10. [Data Models](#10-data-models)
11. [Page Inventory](#11-page-inventory)
12. [Component Library](#12-component-library)
13. [Charts & Visualizations](#13-charts--visualizations)
14. [Design Principles](#14-design-principles)
15. [Engineering Conventions](#15-engineering-conventions)

---

## 1. Project Overview

**API Insights** is an enterprise-grade API observability and monitoring platform. It lets development teams:

- Track real-time API traffic across multiple projects
- Analyze request volumes, response times, and error rates
- Monitor SLA compliance and detect downtime incidents
- Set threshold-based alerts on key metrics
- Inspect geographic traffic distribution
- Manage team members with role-based access
- Audit all mutations through an immutable audit trail

### User Personas

| Persona | Primary Goal | Key Pages |
|---------|-------------|-----------|
| **Platform Admin** | Global health view | Dashboard, Projects |
| **Backend Developer** | Endpoint performance, error diagnosis | Analytics, Endpoints |
| **DevOps / SRE** | SLA compliance, incident response | SLA, Alerts |
| **Engineering Manager** | Traffic trends, team access | Dashboard, Team, Audit |
| **Security Auditor** | Change tracking | Audit Logs |

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19 |
| Language | TypeScript | ~5.9 |
| Build tool | Vite | 7 |
| Styling | Tailwind CSS | 4 |
| Components | Radix UI Primitives | latest |
| Data fetching | TanStack Query | 5 |
| HTTP client | Axios | 1 |
| Routing | React Router DOM | 6 |
| Charts | Recharts | 3 |
| World Map | react-simple-maps | 3 |
| Animations | Framer Motion | 12 |
| Forms | React Hook Form + Zod | 7 / 4 |
| Date handling | date-fns | 4 |
| Icons | Lucide React | latest |

---

## 3. Design System

### 3.1 Color Tokens

All tokens are defined as CSS custom properties in `src/index.css`.

#### Brand Colors (immutable)

```
Primary / CTA:   #F97316   (Orange)
Destructive:     #EF4444   (Red)
Success:         #10B981   (Emerald)
Warning:         #FACC15   (Yellow)
Chart Pink:      #F472B6
Muted Text:      #8C8FA3   (Fog)
```

#### Light Mode Surface Scale

```
Background:  #FFFFFF
Surface-1:   #F4F5F7   (card, muted, secondary, accent)
Surface-2:   #FFFFFF   (popover, input)
Foreground:  #1F2037   (Midnight)
Border:      rgba(40, 42, 66, 0.12)
```

#### Dark Mode Surface Scale

```
Background:  #1F2037   (Midnight)
Surface-1:   #282A42   (Slate)  — cards, menus, inputs
Surface-2:   #33354D   (Storm)  — borders, hover states
Foreground:  #FFFFFF
Border:      #33354D
```

#### Semantic Color Usage

| Token | Usage |
|-------|-------|
| `--primary` | CTAs, active nav indicators, interactive accents |
| `--destructive` | Errors, delete actions, 5xx, critical alerts |
| `--success` | 2xx, resolved state, uptime OK, SLA compliant |
| `--warning` | 3xx, degraded state, SLA at risk, moderate errors |
| `--chart-1..5` | Chart series colors (Orange, Red, Emerald, Pink, Yellow) |
| `--muted-foreground` | Secondary text, labels, placeholders |

### 3.2 Typography Scale

```
Display:    text-3xl / font-bold        — Page titles
Heading:    text-xl / font-semibold     — Card titles, section headers
Subheading: text-base / font-medium     — Table headers, sub-sections
Body:       text-sm / font-normal       — Default content
Caption:    text-xs / font-medium       — Labels, badges, metadata
Mono:       font-mono / tabular-nums    — Numbers, IDs, code
```

### 3.3 Spacing System

Uses Tailwind's default 4px base unit. Key scales:

```
Component padding:  p-4 (16px) for cards, p-6 (24px) for sections
Section gaps:       gap-4 (16px) between cards, gap-6 (24px) between sections
Page padding:       p-6 (24px) desktop, p-4 (16px) mobile
Card inner:         p-5 / p-6
Stat row gap:       gap-3 between icon and value
```

### 3.4 Border Radius

```
--radius:           0.625rem (10px) — base
--radius-sm:        calc(base - 4px) = 6px
--radius-md:        calc(base - 2px) = 8px
--radius-lg:        base = 10px
--radius-xl:        calc(base + 4px) = 14px

Usage:
  Buttons, inputs, badges: rounded-md (8px)
  Cards:                   rounded-xl (14px)
  Popups, dialogs:         rounded-2xl (16px)
  Icons/avatars (small):   rounded-lg (10px)
```

### 3.5 Shadow System

```
Card default:   shadow-sm ring-1 ring-border
Card hover:     shadow-md
Dialog/popup:   shadow-xl
Elevated card:  shadow-lg ring-1 ring-border
```

### 3.6 Chart Color System

Always use in order for multi-series charts:

```
Series 1: var(--chart-1)  #F97316  Orange
Series 2: var(--chart-2)  #EF4444  Red
Series 3: var(--chart-3)  #10B981  Emerald
Series 4: var(--chart-4)  #F472B6  Pink
Series 5: var(--chart-5)  #FACC15  Yellow
```

For single-metric charts (line/area): use `--chart-1` (orange) with `opacity-20` fill.
For status/health: use semantic colors (success/destructive/warning).

### 3.7 Animation Tokens

Defined in `src/lib/animation/constants.ts`:

```ts
DURATION: { instant: 0.1, fast: 0.15, normal: 0.2, moderate: 0.3, slow: 0.5 }
EASING:   { easeOut, easeIn, easeInOut }
VARIANTS: { fadeIn, fadeSlideUp, fadeSlideDown, scaleIn }
```

Rules:
- Page transitions: `fadeSlideUp` with `duration.moderate` (0.3s)
- Card stagger: `StaggerGroup` / `StaggerItem` with 50ms delay increment
- Number counters: `AnimatedNumber` with 600ms spring
- Charts: `animationDuration: 400ms, easing: ease-out`
- Never animate layout (avoid layout thrash)

---

## 4. Directory Structure

```
src/
├── app/
│   ├── app.tsx              # Root component
│   ├── providers.tsx        # QueryClient, AuthProvider, ThemeProvider
│   └── router.tsx           # All route definitions
│
├── components/
│   ├── animation/           # AnimateIn, AnimatedNumber, StaggerGroup, PageTransition
│   ├── layout/              # DashboardLayout, Sidebar, Header, ThemeToggle, ProjectSwitcher
│   ├── shared/              # StatCard, DataTable, PageHeader, EmptyState, LoadingSkeleton,
│   │                        # ConfirmDialog, StatusBadge, ErrorBoundary, PageErrorFallback,
│   │                        # PaginationControls
│   └── ui/                  # Radix-based primitives: Button, Card, Badge, Input, Select,
│                            # Dialog, Tabs, Tooltip, Switch, Checkbox, Avatar, Popover, etc.
│
├── features/
│   ├── auth/                # Login, Register, TwoFactor, ForgotPassword, ResetPassword, VerifyEmail
│   ├── projects/            # ProjectsPage, ProjectSettingsPage, CreateProjectDialog, ProjectCard
│   ├── analytics/           # DashboardPage, AnalyticsPage, EndpointAnalyticsPage
│   │   ├── components/      # All analytics chart components
│   │   ├── hooks/           # useDashboard, useProjectAnalytics, useTimeSeries, etc.
│   │   ├── types.ts         # Analytics type definitions
│   │   └── analytics-params-context.tsx
│   ├── endpoints/           # EndpointsPage, EndpointDetailPanel, EndpointTable, etc.
│   ├── sla/                 # SlaPage, SLA components
│   ├── alerts/              # AlertsPage, AlertTable, AlertHistory, CreateAlertDialog
│   ├── team/                # TeamPage, MembersTable, InviteMemberDialog
│   ├── audit/               # AuditLogsPage, AuditLogTable
│   └── settings/            # SettingsPage (profile, password, 2FA, sessions, notifications)
│
├── lib/
│   ├── animation/           # Constants, hooks
│   ├── api/                 # apiClient (axios), types
│   ├── auth/                # AuthContext, AuthGuard, TokenManager
│   ├── hooks/               # useTimezone, shared hooks
│   └── utils/               # cn(), format.ts (formatNumber, formatPercent, formatDate)
│
└── index.css                # Tailwind v4 + CSS custom properties (design tokens)
```

---

## 5. Routing & Navigation

### Route Structure

```
/                                    → redirect to /projects
/login                               → LoginPage (public)
/register                            → RegisterPage (public)
/two-factor                          → TwoFactorPage
/forgot-password                     → ForgotPasswordPage (public)
/reset-password/:token               → ResetPasswordPage (public)
/verify-email                        → VerifyEmailPage
/verify-email/:token                 → VerifyEmailPage

/projects                            → ProjectsPage (protected, no layout)
/settings                            → SettingsPage (DashboardLayout, no project context)

/projects/:projectId                 → DashboardLayout + ProjectContext + AnalyticsParamsContext
  /projects/:projectId/dashboard     → DashboardPage
  /projects/:projectId/analytics     → AnalyticsPage
  /projects/:projectId/analytics/endpoints/:endpointId → EndpointAnalyticsPage
  /projects/:projectId/endpoints     → EndpointsPage
  /projects/:projectId/sla           → SlaPage
  /projects/:projectId/alerts        → AlertsPage
  /projects/:projectId/team          → TeamPage
  /projects/:projectId/audit-logs    → AuditLogsPage
  /projects/:projectId/settings      → ProjectSettingsPage
```

### Sidebar Navigation Order

1. Dashboard (`/dashboard`)
2. Endpoints (`/endpoints`)
3. Analytics (`/analytics`)
4. SLA (`/sla`)
5. Alerts (`/alerts`)
6. Team (`/team`)
7. Audit Logs (`/audit-logs`)
8. Settings (`/settings`)

---

## 6. Authentication Flow

### JWT Authentication

- **Access token**: stored in memory (tokenManager, non-persisted)
- **Refresh token**: stored in localStorage (`api_insights_refresh`)
- **Token refresh**: automatic via Axios interceptor on 401 response

### Auth States

```
Unauthenticated → /login
Authenticated (no 2FA) → /projects
Authenticated (2FA pending) → /two-factor
Email unverified → shown banner, can still use app
```

### Auth API Endpoints

```
POST /api/v1/auth/register/          → { email, password, first_name, last_name }
POST /api/v1/auth/login/             → { email, password } → tokens or 2FA challenge
POST /api/v1/auth/logout/            → invalidates refresh token
POST /api/v1/auth/token/refresh/     → { refresh } → { access }
GET  /api/v1/auth/profile/           → User object
PUT  /api/v1/auth/profile/           → Update profile
POST /api/v1/auth/change-password/   → { current_password, new_password }
POST /api/v1/auth/verify-email/      → { token }
POST /api/v1/auth/verify-email/resend/ → {}
POST /api/v1/auth/password-reset/    → { email }
POST /api/v1/auth/password-reset/confirm/ → { token, password }
POST /api/v1/auth/2fa/setup/         → {} → { qr_code, secret }
POST /api/v1/auth/2fa/verify-setup/  → { code }
GET  /api/v1/auth/2fa/status/        → { is_enabled }
POST /api/v1/auth/2fa/disable/       → { code }
POST /api/v1/auth/2fa/challenge/     → { challenge_token, code }
POST /api/v1/auth/2fa/recovery-codes/regenerate/
GET  /api/v1/auth/sessions/          → list of active sessions
DELETE /api/v1/auth/sessions/:jti/   → revoke session
POST /api/v1/auth/sessions/revoke-all/
GET  /api/v1/auth/notifications/     → notification preferences
PUT  /api/v1/auth/notifications/     → update preferences
GET  /api/v1/auth/security-events/   → security event log
POST /api/v1/auth/social/google/     → { token }
POST /api/v1/auth/social/apple/      → { token }
POST /api/v1/auth/account/deactivate/
POST /api/v1/auth/account/request-data-export/
POST /api/v1/auth/account/request-deletion/
```

---

## 7. State Management

### Server State — TanStack Query

All remote data is managed via TanStack Query v5. Each feature has dedicated hook files.

**Query key conventions:**

```ts
// Projects
['projects']
['project', projectId]

// Analytics
['dashboard', { days }]
['project-analytics', projectId, { days }]
['time-series', projectId, { granularity, days, endpoint_id }]
['comparison', projectId, { current_start, current_end, previous_start, previous_end }]
['slow-endpoints', projectId, { threshold_ms, days }]
['error-clusters', projectId, { days }]
['requests-per-endpoint', projectId, { days }]

// Endpoints
['endpoints', projectId]
['endpoint', projectId, endpointId]
['endpoint-analytics', projectId, endpointId, { days }]

// Alerts
['alerts', projectId, { page, page_size }]
['alert', projectId, alertId]
['alert-history', projectId, alertId, { limit }]

// SLA
['slas', projectId]
['sla', projectId, slaId]
['sla-dashboard', projectId, { days }]
['sla-compliance', projectId, slaId, { days }]
['sla-timeline', projectId, slaId, { days }]
['sla-incidents', projectId, slaId, { days }]

// Geo
['geo-overview', projectId, { days }]
['geo-map', projectId, { days }]
['geo-time-series', projectId, { days, granularity }]
['geo-performance', projectId, { days }]
['geo-isps', projectId, { days }]
['geo-country', projectId, countryCode, { days }]

// Audit
['audit-logs', projectId, { page, page_size }]

// Team
['members', projectId]
```

**Stale time defaults:**

```ts
Analytics:    staleTime: 60_000 (1 min)
Dashboard:    staleTime: 30_000 (30s)
Projects:     staleTime: 120_000 (2 min)
Static data:  staleTime: 300_000 (5 min)
```

### Client State

| State | Location | Mechanism |
|-------|----------|-----------|
| Theme (dark/light) | localStorage `theme` | React context |
| Auth user | AuthContext | React context + useState |
| Sidebar collapsed | DashboardLayout | useState + localStorage |
| Analytics params | AnalyticsParamsContext | React context + URL sync |
| Project context | ProjectContext | React context |
| Dialog open states | local components | useState |
| Pagination | local page components | useState |

---

## 8. API Layer

### Client Configuration (`src/lib/api/client.ts`)

- **Base URL**: `VITE_API_BASE_URL` env variable (defaults to same origin)
- **Auth**: Bearer token injected by request interceptor
- **Response unwrapping**: Response interceptor unwraps `{ success, data }` envelope
- **Pagination**: Paginated responses unwrapped to `{ results, pagination }`
- **Token refresh**: Automatic 401 retry with refresh token, queue for concurrent requests

### Axios Instance Usage

```ts
// GET
const { data } = await apiClient.get('/api/v1/analytics/dashboard/?days=7')

// POST
const { data } = await apiClient.post('/api/v1/projects/', { name, description })

// PUT/PATCH
const { data } = await apiClient.patch(`/api/v1/projects/${id}/`, payload)

// DELETE
await apiClient.delete(`/api/v1/projects/${id}/`)
```

### Error Handling

Backend error shape:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": { "field": ["error"] },
    "request_id": "uuid"
  }
}
```

Extract with: `error.response?.data?.error?.message`

---

## 9. Backend API Reference

### Base URL: `http://localhost:8000`

### Auth Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register/` | Create account |
| POST | `/api/v1/auth/login/` | Login (returns tokens or 2FA challenge) |
| POST | `/api/v1/auth/logout/` | Invalidate refresh token |
| POST | `/api/v1/auth/token/refresh/` | Refresh access token |
| GET/PUT | `/api/v1/auth/profile/` | User profile |
| POST | `/api/v1/auth/change-password/` | Change password |
| POST | `/api/v1/auth/verify-email/` | Verify email with token |
| POST | `/api/v1/auth/verify-email/resend/` | Resend verification email |
| POST | `/api/v1/auth/password-reset/` | Request password reset |
| POST | `/api/v1/auth/password-reset/confirm/` | Confirm password reset |
| GET/PUT | `/api/v1/auth/notifications/` | Notification preferences |
| GET | `/api/v1/auth/sessions/` | List active sessions |
| DELETE | `/api/v1/auth/sessions/:jti/` | Revoke session |
| POST | `/api/v1/auth/sessions/revoke-all/` | Revoke all sessions |
| GET | `/api/v1/auth/security-events/` | Security event log |
| POST | `/api/v1/auth/2fa/setup/` | Start 2FA setup |
| POST | `/api/v1/auth/2fa/verify-setup/` | Confirm 2FA setup |
| GET | `/api/v1/auth/2fa/status/` | 2FA status |
| POST | `/api/v1/auth/2fa/disable/` | Disable 2FA |
| POST | `/api/v1/auth/2fa/challenge/` | Complete 2FA login |
| POST | `/api/v1/auth/2fa/recovery-codes/regenerate/` | Regenerate backup codes |
| POST | `/api/v1/auth/social/google/` | Google OAuth login |
| POST | `/api/v1/auth/account/deactivate/` | Deactivate account |
| POST | `/api/v1/auth/account/request-data-export/` | Request data export |
| POST | `/api/v1/auth/account/request-deletion/` | Request account deletion |

### Project Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/projects/` | List user's projects |
| POST | `/api/v1/projects/` | Create project |
| GET | `/api/v1/projects/:id/` | Project detail |
| PUT/PATCH | `/api/v1/projects/:id/` | Update project |
| DELETE | `/api/v1/projects/:id/` | Delete project |
| POST | `/api/v1/projects/:id/regenerate-key/` | Regenerate API key |
| GET | `/api/v1/projects/:id/endpoints/` | List endpoints |
| POST | `/api/v1/projects/:id/endpoints/` | Create endpoint |
| GET | `/api/v1/projects/:id/endpoints/:eid/` | Endpoint detail |
| PUT/PATCH | `/api/v1/projects/:id/endpoints/:eid/` | Update endpoint |
| DELETE | `/api/v1/projects/:id/endpoints/:eid/` | Delete endpoint |
| GET | `/api/v1/projects/:id/members/` | List members |
| POST | `/api/v1/projects/:id/members/` | Invite member |
| PUT/PATCH | `/api/v1/projects/:id/members/:mid/` | Update member role |
| DELETE | `/api/v1/projects/:id/members/:mid/` | Remove member |
| POST | `/api/v1/projects/:id/leave/` | Leave project |
| POST | `/api/v1/projects/:id/transfer-ownership/` | Transfer ownership |
| GET | `/api/v1/projects/:id/audit-logs/` | Project audit log |

### Analytics Endpoints

All analytics endpoints require `?days=N` (default 30). `N` = 1, 7, 14, 30, 60, 90.

| Method | Path | Description | Key Params |
|--------|------|-------------|-----------|
| GET | `/api/v1/analytics/dashboard/` | Cross-project overview | `days` |
| GET | `/api/v1/analytics/projects/:id/` | Project analytics summary | `days` |
| GET | `/api/v1/analytics/projects/:id/time-series/` | Time-series metrics | `granularity`, `days`, `endpoint_id` |
| GET | `/api/v1/analytics/projects/:id/comparison/` | Period comparison | `current_start/end`, `previous_start/end` |
| GET | `/api/v1/analytics/projects/:id/requests-per-endpoint/` | Requests per endpoint | `days` |
| GET | `/api/v1/analytics/projects/:id/slow-endpoints/` | Slow endpoint report | `threshold_ms`, `days` |
| GET | `/api/v1/analytics/projects/:id/error-clusters/` | Error grouping | `days` |
| GET | `/api/v1/analytics/projects/:id/user-agents/` | User agent breakdown | `days` |
| GET | `/api/v1/analytics/projects/:id/export/` | Export data | `export_format`, `start_date`, `end_date`, `limit` |
| GET | `/api/v1/analytics/projects/:id/endpoints/:eid/` | Endpoint analytics | `days` |

### Alert Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/analytics/projects/:id/alerts/` | List alerts (paginated) |
| POST | `/api/v1/analytics/projects/:id/alerts/` | Create alert |
| GET | `/api/v1/analytics/projects/:id/alerts/:aid/` | Alert detail |
| PUT/PATCH | `/api/v1/analytics/projects/:id/alerts/:aid/` | Update alert |
| DELETE | `/api/v1/analytics/projects/:id/alerts/:aid/` | Delete alert |
| GET | `/api/v1/analytics/projects/:id/alerts/:aid/history/` | Alert history |

### SLA Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/analytics/projects/:id/sla/` | List SLAs |
| POST | `/api/v1/analytics/projects/:id/sla/` | Create SLA |
| GET | `/api/v1/analytics/projects/:id/sla/dashboard/` | SLA dashboard summary |
| GET | `/api/v1/analytics/projects/:id/sla/:sid/` | SLA detail |
| PUT | `/api/v1/analytics/projects/:id/sla/:sid/` | Update SLA |
| DELETE | `/api/v1/analytics/projects/:id/sla/:sid/` | Delete SLA |
| GET | `/api/v1/analytics/projects/:id/sla/:sid/compliance/` | Compliance data |
| GET | `/api/v1/analytics/projects/:id/sla/:sid/timeline/` | Uptime timeline |
| GET | `/api/v1/analytics/projects/:id/sla/:sid/incidents/` | Downtime incidents |

### Geo Analytics Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/analytics/projects/:id/geo/` | Geographic overview |
| GET | `/api/v1/analytics/projects/:id/geo/map/` | Map heatmap data |
| GET | `/api/v1/analytics/projects/:id/geo/time-series/` | Geo time series |
| GET | `/api/v1/analytics/projects/:id/geo/performance/` | Performance by region |
| GET | `/api/v1/analytics/projects/:id/geo/isps/` | Top ISPs |
| GET | `/api/v1/analytics/projects/:id/geo/countries/:cc/` | Country detail |

### Tracking Endpoints (SDK)

```
POST /api/v1/track/        → Single request tracking (API key auth)
POST /api/v1/track/batch/  → Batch request tracking (API key auth)
```

---

## 10. Data Models

### User

```ts
interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  company_name: string
  display_name: string | null
  is_email_verified: boolean
  is_two_factor_enabled: boolean
  timezone: string | null          // e.g. "America/New_York"
  locale: string | null            // e.g. "en-us"
  default_landing_page: string | null
  avatar_url: string | null
  date_joined: string              // ISO 8601
  updated_at: string
}
```

### Project

```ts
interface Project {
  id: number
  name: string
  description: string
  api_key: string                  // "ai_xxxxx"
  is_active: boolean
  created_at: string
  updated_at: string
  role?: 'owner' | 'admin' | 'member' | 'viewer'
}
```

### APIEndpoint

```ts
interface APIEndpoint {
  id: number
  project: number
  path: string                     // e.g. "/api/users/:id"
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
  name: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}
```

### ProjectMembership

```ts
interface ProjectMembership {
  id: number
  project: number
  user: number
  user_email: string
  user_name: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  invited_by: number | null
  created_at: string
}
```

### APIRequest (tracking)

```ts
interface APIRequest {
  id: number
  endpoint: number
  timestamp: string
  response_time_ms: number
  status_code: number
  status_category: 'success' | 'redirect' | 'client_error' | 'server_error' | 'informational'
  response_time_category: 'fast' | 'normal' | 'slow' | 'very_slow'
  ip_address: string | null
  user_agent: string
  request_body_size: number
  response_body_size: number
  error_message: string
  created_at: string
}
```

### TimeSeriesMetric

```ts
interface TimeSeriesMetric {
  timestamp: string
  granularity: 'hour' | 'day' | 'week' | 'month'
  request_count: number
  success_count: number
  error_count: number
  avg_response_time: number
  min_response_time: number
  max_response_time: number
  p50_response_time: number
  p95_response_time: number
  p99_response_time: number
  status_2xx: number
  status_3xx: number
  status_4xx: number
  status_5xx: number
  error_rate: number               // computed property
  success_rate: number             // computed property
}
```

### Alert

```ts
interface Alert {
  id: number
  project: number
  endpoint: number | null
  name: string
  description: string
  metric: 'error_rate' | 'avg_response_time' | 'p95_response_time' | 'p99_response_time' | 'request_count' | 'error_count'
  comparison: 'gt' | 'lt' | 'gte' | 'lte'
  threshold: number
  evaluation_window_minutes: number
  is_enabled: boolean
  status: 'active' | 'triggered' | 'resolved'
  last_triggered_at: string | null
  last_resolved_at: string | null
  last_evaluated_at: string | null
  notify_on_trigger: boolean
  notify_on_resolve: boolean
  cooldown_minutes: number
  created_at: string
  updated_at: string
}
```

### AlertHistory

```ts
interface AlertHistoryEntry {
  id: number
  alert: number
  event_type: 'triggered' | 'resolved' | 'acknowledged' | 'created' | 'updated' | 'disabled' | 'enabled'
  metric_value: number | null
  threshold_value: number | null
  message: string
  acknowledged_by: number | null
  context: Record<string, unknown>
  created_at: string
}
```

### SLAConfig

```ts
interface SLAConfig {
  id: number
  project: number
  endpoint: number | null
  name: string
  uptime_target_percent: number    // e.g. 99.9
  response_time_target_ms: number | null
  response_time_percentile: 'p50' | 'p95' | 'p99'
  error_rate_target_percent: number | null
  evaluation_period: 'weekly' | 'monthly' | 'quarterly'
  downtime_threshold_error_rate: number
  downtime_threshold_no_traffic_minutes: number
  is_active: boolean
  created_at: string
  updated_at: string
}
```

### DowntimeIncident

```ts
interface DowntimeIncident {
  id: number
  sla_config: number
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  affected_endpoints: string[]
  root_cause: 'high_error_rate' | 'no_traffic' | 'high_response_time'
  error_codes: Record<string, number>
  avg_error_rate: number
  avg_response_time: number
  is_resolved: boolean
  created_at: string
}
```

### AuditLog

```ts
interface AuditLog {
  id: number
  actor_email: string
  action: string                   // 'create' | 'update' | 'delete' | 'login' | 'logout' | ...
  resource_type: string            // 'project' | 'endpoint' | 'member' | 'alert' | ...
  resource_id: string
  description: string
  project: number | null
  changes: Record<string, unknown>
  ip_address: string | null
  user_agent: string
  correlation_id: string
  created_at: string
}
```

### GeoMetric

```ts
interface GeoMetric {
  country_code: string             // ISO 3166-1 alpha-2
  country: string
  request_count: number
  error_count: number
  avg_response_time: number
  unique_ips: number
  error_rate: number               // computed
}
```

### DashboardData

```ts
interface DashboardData {
  totals: {
    projects: number
    total_requests: number
    total_errors: number
    error_rate: number
  }
  projects: Array<{
    id: number
    name: string
    endpoint_count: number
    request_count: number
    error_count: number
    avg_response_time: number
  }>
  period: {
    start_date: string
    end_date: string
    days: number
  }
}
```

---

## 11. Page Inventory

### Auth Pages (no layout)

| Page | Route | Description |
|------|-------|-------------|
| LoginPage | `/login` | Email + password login, Google auth, forgot password link |
| RegisterPage | `/register` | Account creation form |
| TwoFactorPage | `/two-factor` | TOTP or recovery code entry |
| ForgotPasswordPage | `/forgot-password` | Password reset request |
| ResetPasswordPage | `/reset-password/:token` | New password entry |
| VerifyEmailPage | `/verify-email/:token?` | Email verification |

### Projects Page (no sidebar)

| Page | Route | Description |
|------|-------|-------------|
| ProjectsPage | `/projects` | Project card grid, create project |

### Project Pages (sidebar layout)

| Page | Route | Primary Data |
|------|-------|-------------|
| DashboardPage | `/:pid/dashboard` | Cross-project overview stats, top projects, charts |
| AnalyticsPage | `/:pid/analytics` | Full analytics: time series, status breakdown, response times, geo, errors |
| EndpointAnalyticsPage | `/:pid/analytics/endpoints/:eid` | Single endpoint deep-dive |
| EndpointsPage | `/:pid/endpoints` | Endpoint table + detail panel |
| SlaPage | `/:pid/sla` | SLA cards, compliance gauges, uptime timeline, incidents |
| AlertsPage | `/:pid/alerts` | Alert list, create/edit, history |
| TeamPage | `/:pid/team` | Members table, invite, role management |
| AuditLogsPage | `/:pid/audit-logs` | Audit log table with filters |
| ProjectSettingsPage | `/:pid/settings` | Project name, API key, danger zone |

### Settings Page

| Page | Route | Sections |
|------|-------|---------|
| SettingsPage | `/settings` | Profile, Password, 2FA, Sessions, Notifications, Danger Zone |

---

## 12. Component Library

### Layout Components

#### `DashboardLayout`
- Manages sidebar collapse state (persisted to localStorage)
- Renders `Sidebar`, `Header`, and `<Outlet />`
- Responsive: sidebar is overlay on mobile

#### `Sidebar`
- Props: `collapsed`, `onToggleCollapse`, `mobileOpen`, `onMobileClose`
- Features: logo, ProjectSwitcher, nav links, collapse toggle
- Active state: left border indicator (`bg-primary`) + background highlight

#### `Header`
- Shows: breadcrumb/page title, mobile menu trigger, ThemeToggle, user avatar dropdown
- User menu: profile link, settings link, logout

#### `ProjectSwitcher`
- Dropdown showing all user projects, allows quick switching
- Shows current project name or icon when collapsed

### Shared Components

#### `StatCard`
Props: `title`, `value`, `icon`, `iconClassName`, `trend`, `subtitle`, `className`

```tsx
<StatCard
  title="Total Requests"
  value={<AnimatedNumber value={42000} formatter={formatNumber} />}
  icon={Activity}
  iconClassName="bg-primary/10 text-primary"
  trend={{ value: 12.4, direction: 'up' }}  // optional
  subtitle="vs last period"                  // optional
/>
```

#### `DataTable`
Props: `columns`, `data`, `isLoading`, `pagination`, `onPageChange`, `onPageSizeChange`, `rowKey`, `onRowClick`, `emptyState`

Column definition:
```ts
interface Column<T> {
  header: string
  accessor: keyof T | string
  cell?: (row: T) => ReactNode
  className?: string
  sortable?: boolean
}
```

#### `PageHeader`
Props: `title`, `description`, `actions`, `breadcrumbs`, `className`

#### `EmptyState`
Props: `icon`, `title`, `description`, `action`

#### `LoadingSkeleton`
Various skeleton shapes for charts, tables, cards.

#### `StatusBadge`
Props: `status`, `size`
Statuses: `'success' | 'error' | 'warning' | 'info' | 'pending'`

#### `ConfirmDialog`
Props: `open`, `onOpenChange`, `title`, `description`, `onConfirm`, `variant`, `loading`

#### `PaginationControls`
Props: `page`, `pageSize`, `total`, `onPageChange`, `onPageSizeChange`

### UI Primitives (Radix-based)

All follow shadcn/ui patterns with custom theme tokens:

| Component | Source | Usage |
|-----------|--------|-------|
| `Button` | Radix Slot | All CTAs and actions |
| `Card`, `CardHeader`, `CardContent`, `CardFooter` | Custom | Containers |
| `Badge` | Custom | Status labels, HTTP methods |
| `Input` | Custom | Form inputs |
| `Select` | Radix Select | Dropdowns |
| `Dialog` | Radix Dialog | Modals |
| `Tabs` | Radix Tabs | Page sections |
| `Tooltip` | Radix Tooltip | Help text |
| `Switch` | Radix Switch | Toggle settings |
| `Checkbox` | Radix Checkbox | Multi-select |
| `Avatar` | Radix Avatar | User avatars |
| `Popover` | Radix Popover | Floating panels |
| `DropdownMenu` | Radix DropdownMenu | Context menus |
| `AlertDialog` | Radix AlertDialog | Confirmation dialogs |
| `ScrollArea` | Radix ScrollArea | Custom scrollbars |
| `Separator` | Radix Separator | Dividers |
| `Skeleton` | Custom | Loading placeholders |
| `Calendar` | react-day-picker | Date picker |

### Animation Components

#### `AnimateIn`
Wraps content with entrance animation.
```tsx
<AnimateIn variant="fadeSlideUp" duration={0.3} delay={0.1}>
  <content />
</AnimateIn>
```

#### `StaggerGroup` + `StaggerItem`
Staggers children animations.
```tsx
<StaggerGroup>
  {items.map(item => <StaggerItem key={item.id}><Card /></StaggerItem>)}
</StaggerGroup>
```

#### `AnimatedNumber`
Smoothly animates number transitions.
```tsx
<AnimatedNumber value={42000} formatter={formatNumber} />
```

---

## 13. Charts & Visualizations

All charts use **Recharts** with consistent configuration.

### Chart Component Inventory

| Component | Chart Type | Data Source | Usage |
|-----------|-----------|-------------|-------|
| `RequestVolumeChart` | Area/Line | time-series | Requests over time |
| `ResponseTimeChart` | Line (multi) | time-series | P50/P95/P99 over time |
| `ErrorRateChart` | Area | time-series | Error rate % over time |
| `StatusBreakdown` | Pie/Donut | project-analytics | 2xx/3xx/4xx/5xx counts |
| `ResponseTimeDistribution` | Bar | endpoint-analytics | Response time buckets |
| `ResponseTimeCategories` | Donut | project-analytics | fast/normal/slow/very_slow |
| `PeakHoursHeatmap` | Grid heatmap | custom | Hour × day traffic density |
| `HourlyDistribution` | Bar | time-series | Requests by hour of day |
| `SlowEndpointsTable` | Table | slow-endpoints | P95 response time table |
| `GeoWorldMap` | World map | geo-map | Traffic by country |
| `GeoTimeSeriesChart` | Line (multi) | geo-time-series | Country traffic over time |
| `PayloadSizeAnalytics` | Bar | project-analytics | Request/response sizes |
| `ProjectDistributionChart` | Donut | dashboard | Requests per project |
| `ProjectPerformanceChart` | Bar (grouped) | dashboard | Requests + error rate |
| `SLAMiniTrend` | Sparkline | sla-timeline | Uptime trend |
| `EndpointMiniChart` | Sparkline | time-series | Endpoint traffic preview |

### Chart Configuration Rules

```tsx
// Standard chart wrapper
<ResponsiveContainer width="100%" height={280}>
  <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
    <XAxis
      dataKey="timestamp"
      tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
      axisLine={false}
      tickLine={false}
    />
    <YAxis
      tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
      axisLine={false}
      tickLine={false}
      width={50}
    />
    <Tooltip content={<CustomTooltip />} />
    <Area
      type="monotone"
      dataKey="value"
      stroke="var(--chart-1)"
      fill="var(--chart-1)"
      fillOpacity={0.12}
      strokeWidth={2}
      dot={false}
      {...useChartAnimation()}
    />
  </AreaChart>
</ResponsiveContainer>
```

### Custom Tooltip Pattern

```tsx
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-foreground">{formatNumber(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}
```

---

## 14. Design Principles

### Visual Hierarchy

1. **Page title** — largest, boldest element
2. **Stat cards** — high contrast numbers, colored icons
3. **Charts** — full-width, generous height (260–320px)
4. **Tables** — clean, alternating or bordered rows
5. **Empty/loading states** — occupy same space as content (no layout jump)

### Data Density

- **Dashboard**: High-level overview, 4 stats + 2 charts + 2 lists + 1 table
- **Analytics**: Dense, tabbed sections with multiple chart types
- **Endpoints**: Split panel (list + detail)
- **SLA/Alerts**: Card-based with inline sparklines

### Consistency Rules

- All cards use identical shadow: `shadow-sm ring-1 ring-border`
- All section headers: `text-base font-semibold`
- All tables: consistent cell padding `py-3 px-4`
- Chart heights: 260px (compact), 280px (standard), 320px (featured)
- All loading states: skeleton with same dimensions as loaded content
- All empty states: icon + title + description + optional CTA button
- Status colors: always use semantic tokens, never arbitrary colors

### Responsiveness

- Sidebar: fixed 256px (expanded), 64px (collapsed), overlay on mobile
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` for stat cards
- Charts: `ResponsiveContainer width="100%"` always
- Tables: horizontal scroll on mobile with `overflow-x-auto`
- Detail panels: bottom sheet on mobile, right panel on desktop

---

## 15. Engineering Conventions

### File Naming

```
PascalCase:  React components (MyComponent.tsx)
camelCase:   Hooks (useMyHook.ts), utilities (formatNumber.ts)
kebab-case:  Files (my-component.tsx) — preferred for file names
```

### Component Structure

```tsx
// 1. Imports (React first, then external, then internal)
// 2. Types/interfaces
// 3. Helper functions (small, pure)
// 4. Main component
// 5. Subcomponents (below main, if file-specific)

// Component signature
export function MyComponent({ prop1, prop2 }: Props) {
  // hooks first
  // derived state
  // handlers
  // render
}
```

### No Magic Numbers

Always use design tokens or named constants:
```ts
// ✅ Good
const CHART_HEIGHT = 280
const PAGE_SIZE_OPTIONS = [10, 20, 50]

// ❌ Bad
height={280}  // without explanation
```

### Query Key Factory Pattern

```ts
// In feature/hooks/query-keys.ts
export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: (days?: number) => [...analyticsKeys.all, 'dashboard', { days }] as const,
  timeSeries: (projectId: number, params: TimeSeriesParams) =>
    [...analyticsKeys.all, 'time-series', projectId, params] as const,
}
```

### Error Boundary Strategy

- One `ErrorBoundary` per project route group
- Shows `PageErrorFallback` (retry + home button)
- Don't wrap individual cards (use loading/error states inline)

### Performance Guidelines

- Lazy load all pages (React.lazy + Suspense)
- Memoize expensive computations with `useMemo`
- Use `useCallback` for stable handler references passed to children
- Prefer `select` in TanStack Query to shape data at fetch layer
- Virtualize long lists (>100 rows) with `react-window` if needed

### TypeScript Rules

- No `any` — use `unknown` if type is truly unknown
- Explicit return types on public-facing functions
- Prefer `interface` for object shapes, `type` for unions
- Export types from feature `types.ts` file

---

## Appendix: Environment Variables

```bash
VITE_API_BASE_URL=http://localhost:8000   # Backend base URL
```

---

*This document is auto-maintained alongside the codebase. Update this file whenever API contracts, data models, or architectural decisions change.*
