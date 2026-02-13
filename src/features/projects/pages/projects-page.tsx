import { useState } from 'react'
import { FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProjects } from '../hooks'
import { ProjectCard } from '../components/project-card'
import { CreateProjectDialog } from '../components/create-project-dialog'

const DEFAULT_PAGE_SIZE = 9
const PAGE_SIZE_OPTIONS = [9, 18, 36] as const

export default function ProjectsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const { data, isLoading } = useProjects({ page, page_size: pageSize })
  const projects = data?.results ?? []
  const pagination = data?.pagination

  const totalPages = pagination?.total_pages ?? 1

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and monitor your API projects.
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-lg border p-6">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="ml-auto h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && projects.length === 0 && (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FolderOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Get started by creating your first project to begin monitoring your APIs.
          </p>
          <div className="mt-6">
            <CreateProjectDialog />
          </div>
        </div>
      )}

      {/* Project Grid */}
      {!isLoading && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Showing{' '}
              {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, pagination.count)}{' '}
              of {pagination.count} projects
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => { setPageSize(Number(value)); setPage(1) }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
