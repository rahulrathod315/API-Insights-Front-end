import { useLocation, useParams, Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  LayoutDashboard,
  Globe,
  BarChart3,
  Bell,
  Users,
  FileText,
  Settings,
  PanelLeftClose,
  PanelLeft,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ProjectSwitcher } from '@/components/layout/project-switcher'

interface NavItem {
  label: string
  icon: ReactNode
  path: string
}

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
  projects?: Array<{ id: string; name: string }>
  currentProjectId?: string
}

function getNavItems(projectId: string): NavItem[] {
  return [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: `/projects/${projectId}/dashboard`,
    },
    {
      label: 'Endpoints',
      icon: <Globe className="h-5 w-5" />,
      path: `/projects/${projectId}/endpoints`,
    },
    {
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      path: `/projects/${projectId}/dashboard`,
    },
    {
      label: 'Alerts',
      icon: <Bell className="h-5 w-5" />,
      path: `/projects/${projectId}/alerts`,
    },
    {
      label: 'Team',
      icon: <Users className="h-5 w-5" />,
      path: `/projects/${projectId}/team`,
    },
    {
      label: 'Audit Logs',
      icon: <FileText className="h-5 w-5" />,
      path: `/projects/${projectId}/audit-logs`,
    },
    {
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: `/projects/${projectId}/settings`,
    },
  ]
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
  projects = [],
  currentProjectId,
}: SidebarProps) {
  const location = useLocation()
  const { projectId } = useParams<{ projectId: string }>()
  const resolvedProjectId = currentProjectId ?? projectId ?? ''
  const navItems = getNavItems(resolvedProjectId)

  function isActive(path: string): boolean {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand / Logo */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-sidebar-border px-4',
          collapsed ? 'justify-center' : 'gap-3'
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          AI
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold text-sidebar-foreground">
            API Insights
          </span>
        )}
      </div>

      {/* Project Switcher */}
      <div className="px-3 py-3">
        <ProjectSwitcher
          projects={projects}
          currentProjectId={resolvedProjectId}
          collapsed={collapsed}
        />
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <TooltipProvider delayDuration={0}>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isActive(item.path)
              const linkContent = (
                <Link
                  to={item.path}
                  onClick={onMobileClose}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )

              if (collapsed) {
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return <div key={item.path}>{linkContent}</div>
            })}
          </nav>
        </TooltipProvider>
      </ScrollArea>

      {/* Collapse Toggle (desktop only) */}
      <div className="hidden border-t border-sidebar-border p-3 md:block">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className={cn(
            'h-9 w-9 text-sidebar-foreground/70 hover:text-sidebar-foreground',
            !collapsed && 'ml-auto'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
          // Desktop sizing
          collapsed ? 'md:w-16' : 'md:w-64',
          // Mobile: overlay mode
          'w-64 -translate-x-full md:translate-x-0',
          mobileOpen && 'translate-x-0'
        )}
      >
        {/* Mobile close button */}
        {mobileOpen && (
          <button
            onClick={onMobileClose}
            className="absolute right-2 top-4 z-10 rounded-md p-1 text-sidebar-foreground/70 hover:text-sidebar-foreground md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {sidebarContent}
      </aside>
    </>
  )
}
