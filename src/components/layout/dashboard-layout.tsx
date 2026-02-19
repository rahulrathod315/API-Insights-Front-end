import { useState, useEffect, useCallback } from 'react'
import { useParams, Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils/cn'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { apiClient } from '@/lib/api/client'

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed'

function getInitialCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
}

export default function DashboardLayout() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: projectList } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Array<{ id: number; name: string }> }>('/api/v1/projects/')
      return response.data
    },
    staleTime: 120_000,
  })

  const projects = (Array.isArray(projectList) ? projectList : []).map((p) => ({
    id: String(p.id),
    name: p.name,
  }))

  const currentProjectId = projectId ?? ''
  const [collapsed, setCollapsed] = useState(getInitialCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
  }, [collapsed])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const handleToggleCollapse = useCallback(() => setCollapsed((p) => !p), [])
  const handleMobileMenuToggle = useCallback(() => setMobileOpen((p) => !p), [])
  const handleMobileClose = useCallback(() => setMobileOpen(false), [])

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
        projects={projects}
        currentProjectId={currentProjectId}
      />

      {/* Main content area */}
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-300 ease-in-out',
          collapsed ? 'md:ml-[60px]' : 'md:ml-[220px]'
        )}
      >
        <Header onMobileMenuToggle={handleMobileMenuToggle} />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
