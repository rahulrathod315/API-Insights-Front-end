import type { ReactNode } from 'react'
import { Zap, TrendingDown, TrendingUp, Minus } from 'lucide-react'

interface AuthShellProps {
  children: ReactNode
  title?: string
  subtitle?: string
}

const METRICS = [
  { label: 'P95 Latency', value: '248ms', trend: '-12%', direction: 'down' as const, good: true },
  { label: 'Success Rate', value: '99.4%', trend: '+0.6%', direction: 'up' as const, good: true },
  { label: 'Active Endpoints', value: '128', trend: 'stable', direction: 'flat' as const, good: true },
  { label: 'Active Alerts', value: '4', trend: 'last 24h', direction: 'flat' as const, good: false },
]

const FEATURE_BULLETS = [
  'Real-time request volume & latency monitoring',
  'P50 / P95 / P99 percentile tracking',
  'Geographic traffic distribution & ISP analytics',
  'Threshold-based alerts with history',
  'SLA compliance tracking & incident detection',
]

function TrendIcon({ direction, good }: { direction: 'up' | 'down' | 'flat'; good: boolean }) {
  if (direction === 'flat') return <Minus className="h-3 w-3 text-muted-foreground" />
  if (direction === 'down')
    return <TrendingDown className={`h-3 w-3 ${good ? 'text-success' : 'text-destructive'}`} />
  return <TrendingUp className={`h-3 w-3 ${good ? 'text-success' : 'text-destructive'}`} />
}

function AuthShell({
  children,
  title = 'Welcome back.',
  subtitle = 'Monitor and analyze your APIs with clarity.',
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow accents */}
      <div className="pointer-events-none absolute -top-40 left-0 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/6 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        {/* Left panel — branding & feature preview */}
        <div className="hidden flex-1 flex-col justify-between px-12 py-16 lg:flex xl:px-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/40">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight">API Insights</span>
          </div>

          {/* Hero copy */}
          <div className="space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                API Observability Platform
              </p>
              <h1 className="mt-4 text-[2.6rem] font-bold leading-[1.15] tracking-tight">
                See every request,<br />every signal,<br />in real time.
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Turn raw API traffic into actionable intelligence with latency, error,
                and usage analytics that update live as your users do.
              </p>
            </div>

            {/* Live metric preview cards */}
            <div className="grid grid-cols-2 gap-3">
              {METRICS.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm"
                >
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {m.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                    {m.value}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1">
                    <TrendIcon direction={m.direction} good={m.good} />
                    <span className="text-[11px] text-muted-foreground">{m.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature list */}
            <ul className="space-y-2.5">
              {FEATURE_BULLETS.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <p className="text-[11px] text-muted-foreground/50">
            © {new Date().getFullYear()} API Insights. All rights reserved.
          </p>
        </div>

        {/* Vertical divider */}
        <div className="hidden w-px bg-border/50 lg:block" />

        {/* Right panel — auth form */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 md:px-10 lg:max-w-[480px] lg:px-12 xl:px-16">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold">API Insights</span>
          </div>

          {/* Form header */}
          <div className="mb-8 w-full text-left">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {/* Form content */}
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  )
}

export { AuthShell }
export type { AuthShellProps }
