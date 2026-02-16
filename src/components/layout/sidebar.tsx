import { useLocation, useParams, Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Globe,
  BarChart3,
  Shield,
  Bell,
  Users,
  FileText,
  Settings,
  PanelLeftClose,
  PanelLeft,
  X,
  ChevronDown,
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

interface NavGroup {
  label: string
  icon: ReactNode
  basePath: string
  children: NavItem[]
}

type NavEntry = NavItem | NavGroup

function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry
}

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
  projects?: Array<{ id: string; name: string }>
  currentProjectId?: string
}

function getNavEntries(projectId: string): NavEntry[] {
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
      path: `/projects/${projectId}/analytics`,
    },
    {
      label: 'SLA',
      icon: <Shield className="h-5 w-5" />,
      path: `/projects/${projectId}/sla`,
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
  const navEntries = getNavEntries(resolvedProjectId)

  function isActive(path: string): boolean {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  function isGroupActive(group: NavGroup): boolean {
    return location.pathname.startsWith(group.basePath)
  }

  function isExactActive(path: string, group: NavGroup): boolean {
    // For the Overview item, only match exact path (not children)
    if (path === group.basePath) {
      return location.pathname === path
    }
    return isActive(path)
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
            {navEntries.map((entry) => {
              if (isNavGroup(entry)) {
                return (
                  <NavGroupItem
                    key={entry.basePath}
                    group={entry}
                    collapsed={collapsed}
                    isOpen={isGroupActive(entry)}
                    onToggle={() => {}}
                    isActive={isActive}
                    isExactActive={(path) => isExactActive(path, entry)}
                    isGroupActive={isGroupActive(entry)}
                    onMobileClose={onMobileClose}
                  />
                )
              }

              const active = isActive(entry.path)
              const linkContent = (
                <Link
                  to={entry.path}
                  onClick={onMobileClose}
                  className={cn(
                    'relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  {active && (
                    <span className="sidebar-active-indicator absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-primary" />
                  )}
                  <span className="shrink-0">{entry.icon}</span>
                  {!collapsed && <span>{entry.label}</span>}
                </Link>
              )

              if (collapsed) {
                return (
                  <Tooltip key={entry.path}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">
                      {entry.label}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return <div key={entry.path}>{linkContent}</div>
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
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={onMobileClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

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

function NavGroupItem({
  group,
  collapsed,
  isOpen,
  onToggle,
  isExactActive,
  isGroupActive,
  onMobileClose,
}: {
  group: NavGroup
  collapsed: boolean
  isOpen: boolean
  onToggle: () => void
  isActive: (path: string) => boolean
  isExactActive: (path: string) => boolean
  isGroupActive: boolean
  onMobileClose?: () => void
}) {
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={group.basePath}
            onClick={onMobileClose}
            className={cn(
              'relative flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
              isGroupActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            )}
          >
            {isGroupActive && (
              <span className="sidebar-active-indicator absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-primary" />
            )}
            <span className="shrink-0">{group.icon}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{group.label}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div>
      {/* Group header */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isGroupActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
        )}
      >
        {isGroupActive && (
          <span className="sidebar-active-indicator absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-primary" />
        )}
        <span className="shrink-0">{group.icon}</span>
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Children */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-sidebar-border pl-3">
              {group.children.map((child) => {
                const active = isExactActive(child.path)
                return (
                  <Link
                    key={child.path}
                    to={child.path}
                    onClick={onMobileClose}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors',
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )}
                  >
                    <span className="shrink-0">{child.icon}</span>
                    <span>{child.label}</span>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
