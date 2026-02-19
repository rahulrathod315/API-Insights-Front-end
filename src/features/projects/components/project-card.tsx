import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Check, Activity, Globe, ArrowUpRight, Key } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { formatDate } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import type { Project } from '../types'

interface ProjectCardProps {
  project: Project
  className?: string
}

const ROLE_CONFIG = {
  owner: { label: 'Owner', variant: 'default' as const },
  admin: { label: 'Admin', variant: 'ghost' as const },
  member: { label: 'Member', variant: 'ghost' as const },
  viewer: { label: 'Viewer', variant: 'ghost' as const },
}

// Stable color per project name (first letter)
function getProjectAccent(name: string): string {
  const colors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
    '#3B82F6',
    '#8B5CF6',
    '#14B8A6',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

function ProjectCard({ project, className }: ProjectCardProps) {
  const navigate = useNavigate()
  const tz = useTimezone()
  const [copied, setCopied] = useState(false)

  const accent = getProjectAccent(project.name)
  const roleConfig = ROLE_CONFIG[project.my_role]
  const apiKeyDisplay = project.api_key ? `${project.api_key.slice(0, 14)}···` : '—'

  function handleCopyApiKey(e: React.MouseEvent) {
    e.stopPropagation()
    if (!project.api_key) return
    navigator.clipboard.writeText(project.api_key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-border/80',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        className
      )}
      onClick={() => navigate(`/projects/${project.id}/dashboard`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') navigate(`/projects/${project.id}/dashboard`)
      }}
    >
      {/* Top accent bar */}
      <div className="h-[3px] w-full rounded-t-xl" style={{ background: accent }} />

      <div className="flex flex-1 flex-col p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                {project.name}
              </h3>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            {project.description ? (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {project.description}
              </p>
            ) : (
              <p className="mt-1 text-xs italic text-muted-foreground/50">No description</p>
            )}
          </div>
          <Badge variant={roleConfig.variant} className="shrink-0 capitalize">
            {roleConfig.label}
          </Badge>
        </div>

        {/* API Key */}
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
          <Key className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
          <code className="flex-1 truncate text-[11px] font-mono text-muted-foreground">
            {apiKeyDisplay}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 rounded-md"
            onClick={handleCopyApiKey}
            aria-label={copied ? 'Copied!' : 'Copy API key'}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </Button>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            <span>
              <span className="font-semibold text-foreground">
                {(project.total_requests ?? 0).toLocaleString()}
              </span>
              {' '}reqs
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            <span>
              <span className="font-semibold text-foreground">{project.endpoints_count ?? 0}</span>
              {' '}endpoints
            </span>
          </div>
          <div className="ml-auto shrink-0">
            Created {formatDate(project.created_at, tz)}
          </div>
        </div>
      </div>
    </div>
  )
}

export { ProjectCard }
