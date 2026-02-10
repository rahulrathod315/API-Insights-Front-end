import { useState, useEffect, useCallback } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils/cn'
import { ScrollArea } from '@/components/ui/scroll-area'
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
      const response = await apiClient.get<Array<{ id: number; name: string }>>('/api/v1/projects/')
      return response.data
    },
  })
  const projects = (projectList ?? []).map((p) => ({ id: String(p.id), name: p.name }))
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
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [])

  const handleMobileMenuToggle = useCallback(() => {
    setMobileOpen((prev) => !prev)
  }, [])

  const handleMobileClose = useCallback(() => {
    setMobileOpen(false)
  }, [])

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
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
          'flex flex-1 flex-col transition-all duration-300',
          // Offset for sidebar width on desktop
          collapsed ? 'md:ml-16' : 'md:ml-64'
        )}
      >
        <Header onMobileMenuToggle={handleMobileMenuToggle} />

        <ScrollArea className="flex-1">
          <main className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </ScrollArea>
      </div>
    </div>
  )
}
