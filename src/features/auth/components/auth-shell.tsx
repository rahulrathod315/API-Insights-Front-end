import type { ReactNode } from 'react'

interface AuthShellProps {
  children: ReactNode
}

function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="auth-screen relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-12 text-foreground">
      <div className="pointer-events-none absolute -top-32 left-10 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.06),_transparent_55%)]" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden flex-col gap-6 lg:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">API INSIGHTS</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight">
              See every request, every signal, in real time.
            </h1>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Turn raw traffic into clarity with latency, error, and usage analytics that update as your users do.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Latency p95', value: '248ms', trend: 'down 12%' },
              { label: 'Success Rate', value: '99.4%', trend: 'up 0.6%' },
              { label: 'Active Endpoints', value: '128', trend: 'stable' },
              { label: 'Alerts Triggered', value: '4', trend: 'last 24h' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur"
              >
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.trend}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Live Signal</p>
            <p className="mt-3 text-sm text-foreground">
              Deploy with confidence. Track edge spikes, client mix, and error clusters without digging through logs.
            </p>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-col gap-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">API INSIGHTS</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Welcome back.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Monitor and analyze your APIs with clarity.
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}

export { AuthShell }
export type { AuthShellProps }
