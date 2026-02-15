import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ProtectedRoute, PublicRoute } from '@/lib/auth/auth-guard'
import { AnimateIn } from '@/components/animation'

// Lazy loaded pages
const LoginPage = lazy(() => import('@/features/auth/pages/login-page'))
const RegisterPage = lazy(() => import('@/features/auth/pages/register-page'))
const TwoFactorPage = lazy(() => import('@/features/auth/pages/two-factor-page'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/forgot-password-page'))
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/reset-password-page'))
const VerifyEmailPage = lazy(() => import('@/features/auth/pages/verify-email-page'))

const ProjectsPage = lazy(() => import('@/features/projects/pages/projects-page'))
const ProjectSettingsPage = lazy(() => import('@/features/projects/pages/project-settings-page'))

const DashboardPage = lazy(() => import('@/features/analytics/pages/dashboard-page'))
const AnalyticsPage = lazy(() => import('@/features/analytics/pages/analytics-page'))
const TrafficAnalyticsPage = lazy(() => import('@/features/analytics/pages/traffic-analytics-page'))
const PerformanceAnalyticsPage = lazy(() => import('@/features/analytics/pages/performance-analytics-page'))
const ErrorAnalyticsPage = lazy(() => import('@/features/analytics/pages/error-analytics-page'))
const GeoAnalyticsPage = lazy(() => import('@/features/analytics/pages/geo-analytics-page'))
const EndpointAnalyticsPage = lazy(() => import('@/features/analytics/pages/endpoint-analytics-page'))

const EndpointsPage = lazy(() => import('@/features/endpoints/pages/endpoints-page'))

const AlertsPage = lazy(() => import('@/features/alerts/pages/alerts-page'))

const SlaPage = lazy(() => import('@/features/sla/pages/sla-page'))

const TeamPage = lazy(() => import('@/features/team/pages/team-page'))

const SettingsPage = lazy(() => import('@/features/settings/pages/settings-page'))

const AuditLogsPage = lazy(() => import('@/features/audit/pages/audit-logs-page'))

// Layout
const DashboardLayout = lazy(() => import('@/components/layout/dashboard-layout'))

// Project context wrapper
const ProjectContextWrapper = lazy(() => import('@/features/projects/project-context').then(m => ({ default: m.ProjectProvider })))

// Analytics params wrapper
const AnalyticsParamsWrapper = lazy(() => import('@/features/analytics/analytics-params-context').then(m => ({ default: m.AnalyticsParamsProvider })))

function PageLoader() {
  return (
    <AnimateIn variant="fadeIn" duration={0.2} delay={0.15}>
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    </AnimateIn>
  )
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/two-factor" element={<TwoFactorPage />} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

        {/* Protected routes */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <ProjectsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <DashboardLayout />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route index element={<SettingsPage />} />
        </Route>

        {/* Project-scoped routes */}
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <ProjectContextWrapper>
                  <AnalyticsParamsWrapper>
                    <DashboardLayout />
                  </AnalyticsParamsWrapper>
                </ProjectContextWrapper>
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="analytics/traffic" element={<TrafficAnalyticsPage />} />
          <Route path="analytics/performance" element={<PerformanceAnalyticsPage />} />
          <Route path="analytics/errors" element={<ErrorAnalyticsPage />} />
          <Route path="analytics/geo" element={<GeoAnalyticsPage />} />
          <Route path="analytics/endpoints/:endpointId" element={<EndpointAnalyticsPage />} />
          <Route path="endpoints" element={<EndpointsPage />} />
          <Route path="sla" element={<SlaPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="settings" element={<ProjectSettingsPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </Suspense>
  )
}
