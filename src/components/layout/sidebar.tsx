import { useLocation, useParams, NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Globe,
  BarChart3,
  ShieldCheck,
  Bell,
  Users,
  ScrollText,
  Settings,
  PanelLeftClose,
  PanelLeft,
  X,
  Zap,
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
import { ProjectSwitcher } from '@/components/layout/project-switcher'

interface NavItem {
  label: string
  icon: ReactNode
  path: string
  badge?: string
}

interface NavSection {
  label: string
  items: NavItem[]
}

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
  projects?: Array<{ id: string; name: string }>
  currentProjectId?: string
}

function getNavSections(projectId: string): NavSection[] {
  return [
    {
      label: 'Overview',
      items: [
        {
          label: 'Dashboard',
          icon: <LayoutDashboard className="h-4 w-4" />,
          path: `/projects/${projectId}/dashboard`,
        },
        {
          label: 'Endpoints',
          icon: <Globe className="h-4 w-4" />,
          path: `/projects/${projectId}/endpoints`,
        },
      ],
    },
    {
      label: 'Analytics',
      items: [
        {
          label: 'Analytics',
          icon: <BarChart3 className="h-4 w-4" />,
          path: `/projects/${projectId}/analytics`,
        },
        {
          label: 'SLA',
          icon: <ShieldCheck className="h-4 w-4" />,
          path: `/projects/${projectId}/sla`,
        },
        {
          label: 'Alerts',
          icon: <Bell className="h-4 w-4" />,
          path: `/projects/${projectId}/alerts`,
        },
      ],
    },
    {
      label: 'Management',
      items: [
        {
          label: 'Team',
          icon: <Users className="h-4 w-4" />,
          path: `/projects/${projectId}/team`,
        },
        {
          label: 'Audit Logs',
          icon: <ScrollText className="h-4 w-4" />,
          path: `/projects/${projectId}/audit-logs`,
        },
        {
          label: 'Settings',
          icon: <Settings className="h-4 w-4" />,
          path: `/projects/${projectId}/settings`,
        },
      ],
    },
  ]
}

function NavItemLink({
  item,
  collapsed,
  onMobileClose,
}: {
  item: NavItem
  collapsed: boolean
  onMobileClose?: () => void
}) {
  const location = useLocation()
  const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/')

  const linkContent = (
    <NavLink
      to={item.path}
      onClick={onMobileClose}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
        active
          ? 'bg-primary/10 text-primary dark:bg-primary/15'
          : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
        collapsed && 'justify-center px-2.5'
      )}
    >
      {/* Active left indicator */}
      {active && (
        <motion.span
          layoutId="nav-active-indicator"
          className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}

      {/* Icon */}
      <span
        className={cn(
          'shrink-0 transition-colors',
          active ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground'
        )}
      >
        {item.icon}
      </span>

      {/* Label */}
      {!collapsed && (
        <span className="flex-1 truncate">{item.label}</span>
      )}

      {/* Badge */}
      {!collapsed && item.badge && (
        <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          {item.badge}
        </span>
      )}
    </NavLink>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {item.badge && (
            <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              {item.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}

function SidebarContent({
  collapsed,
  onToggleCollapse,
  onMobileClose,
  projects,
  currentProjectId,
}: SidebarProps) {
  const { projectId } = useParams<{ projectId: string }>()
  const resolvedProjectId = currentProjectId ?? projectId ?? ''
  const navSections = getNavSections(resolvedProjectId)

  return (
    <div className="flex h-full flex-col">
      {/* Brand Header */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b border-sidebar-border px-4',
          collapsed ? 'justify-center px-3' : 'gap-3'
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/30">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              API Insights
            </span>
          </div>
        )}
      </div>

      {/* Project Switcher */}
      <div className={cn('px-3 py-2.5', collapsed && 'px-2')}>
        <ProjectSwitcher
          projects={projects ?? []}
          currentProjectId={resolvedProjectId}
          collapsed={collapsed}
        />
      </div>

      {/* Nav divider */}
      <div className="mx-3 border-t border-sidebar-border" />

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <TooltipProvider delayDuration={0}>
          <nav className="space-y-4 px-2 py-1">
            {navSections.map((section) => (
              <div key={section.label}>
                {/* Section label */}
                {!collapsed && (
                  <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35">
                    {section.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <NavItemLink
                      key={item.path}
                      item={item}
                      collapsed={collapsed}
                      onMobileClose={onMobileClose}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </TooltipProvider>
      </ScrollArea>

      {/* Collapse Toggle */}
      <div className={cn('shrink-0 border-t border-sidebar-border p-2', collapsed ? 'flex justify-center' : 'flex justify-end')}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="hidden h-8 w-8 text-sidebar-foreground/40 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground md:flex"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
  projects = [],
  currentProjectId,
}: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
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
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-in-out',
          collapsed ? 'md:w-[60px]' : 'md:w-[220px]',
          'w-[220px] -translate-x-full md:translate-x-0',
          mobileOpen && 'translate-x-0'
        )}
      >
        {/* Mobile close button */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="absolute right-2 top-3.5 z-10 flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/50 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>

        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          mobileOpen={mobileOpen}
          onMobileClose={onMobileClose}
          projects={projects}
          currentProjectId={currentProjectId}
        />
      </aside>
    </>
  )
}
