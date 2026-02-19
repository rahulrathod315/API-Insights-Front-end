import { useState } from 'react'
import { FolderOpen, Plus, Zap } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useProjects } from '../hooks'
import { ProjectCard } from '../components/project-card'
import { CreateProjectDialog } from '../components/create-project-dialog'
import { PaginationControls } from '@/components/shared/pagination-controls'
import { ThemeToggle } from '@/components/layout/theme-toggle'

const DEFAULT_PAGE_SIZE = 9

export default function ProjectsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const { data, isLoading } = useProjects({ page, page_size: pageSize })
  const projects = data?.results ?? []
  const pagination = data?.pagination

  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="relative min-h-screen bg-background">
      {/* Subtle gradient bg */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/5 to-transparent" />

      {/* Top nav bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/30">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">API Insights</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Project
          </Button>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-screen-xl px-6 py-10">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Select a project to view analytics, manage endpoints, and configure alerts.
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4 rounded-xl border border-border p-5">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-5 w-3/5" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-full rounded-lg" />
                <div className="flex gap-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="ml-auto h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && projects.length === 0 && (
          <div className="flex min-h-[460px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FolderOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Create your first project to start monitoring your APIs with real-time analytics.
            </p>
            <Button className="mt-6" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Create your first project
            </Button>
          </div>
        )}

        {/* Project grid */}
        {!isLoading && projects.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && pagination && pagination.count > pageSize && (
          <div className="mt-8">
            <PaginationControls
              page={page}
              pageSize={pageSize}
              total={pagination.count}
              onPageChange={setPage}
              onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
              itemLabel="projects"
            />
          </div>
        )}
      </main>

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  )
}
