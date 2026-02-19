import type { ReactNode } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { Menu, LogOut, FolderOpen, ChevronRight, Settings } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { cn } from '@/lib/utils/cn'

interface HeaderProps {
  onMobileMenuToggle: () => void
  children?: ReactNode
}

// Map route segments to human-readable labels
const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  endpoints: 'Endpoints',
  sla: 'SLA',
  alerts: 'Alerts',
  team: 'Team',
  'audit-logs': 'Audit Logs',
  settings: 'Settings',
  projects: 'Projects',
}

function Breadcrumb() {
  const location = useLocation()
  const { projectId } = useParams<{ projectId: string }>()

  // Parse path segments, skip projectId and 'projects' for project routes
  const segments = location.pathname.split('/').filter(Boolean)

  const crumbs: { label: string; path?: string }[] = []

  if (projectId) {
    // Project-scoped: find the page segment (after projectId)
    const projectIdx = segments.indexOf(projectId)
    const pageSegments = segments.slice(projectIdx + 1)

    if (pageSegments.length > 0) {
      const pageLabel = ROUTE_LABELS[pageSegments[0]] ?? pageSegments[0]
      crumbs.push({ label: pageLabel })

      // Sub-page (e.g. endpoint detail)
      if (pageSegments.length > 1 && pageSegments[1] !== projectId) {
        const subLabel = ROUTE_LABELS[pageSegments[1]] ?? `#${pageSegments[1]}`
        crumbs.push({ label: subLabel })
      }
    }
  } else {
    // Non-project routes
    const last = segments[segments.length - 1]
    if (last && ROUTE_LABELS[last]) {
      crumbs.push({ label: ROUTE_LABELS[last] })
    }
  }

  if (crumbs.length === 0) return null

  return (
    <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
      {crumbs.map((crumb, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          )}
          <span
            className={cn(
              index === crumbs.length - 1
                ? 'font-semibold text-foreground'
                : 'text-muted-foreground'
            )}
          >
            {crumb.label}
          </span>
        </span>
      ))}
    </nav>
  )
}

export function Header({ onMobileMenuToggle, children }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const userInitials = user
    ? [user.first_name.charAt(0), user.last_name.charAt(0)]
        .filter(Boolean)
        .join('')
        .toUpperCase() || user.email.charAt(0).toUpperCase()
    : '?'

  const userDisplayName = user
    ? user.display_name || `${user.first_name} ${user.last_name}`.trim() || user.email
    : 'Unknown'

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      {/* Mobile menu trigger */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMobileMenuToggle}
        className="h-8 w-8 md:hidden"
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Breadcrumb / page title */}
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <Breadcrumb />
        {children}
      </div>

      {/* Right actions */}
      <div className="flex shrink-0 items-center gap-1.5">
        <ThemeToggle />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 rounded-full p-0 ring-2 ring-transparent transition-all hover:ring-primary/20 focus-visible:ring-primary/30"
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="p-3 font-normal">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {userDisplayName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email ?? ''}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => navigate('/settings')}
              className="cursor-pointer gap-3 px-3 py-2"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Profile & Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/projects')}
              className="cursor-pointer gap-3 px-3 py-2"
            >
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span>All Projects</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer gap-3 px-3 py-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
