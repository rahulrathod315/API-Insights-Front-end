import { createContext, useContext, type ReactNode } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useProject } from './hooks'
import type { ProjectDetail } from './types'
import { Skeleton } from '@/components/ui/skeleton'

interface ProjectContextType {
  project: ProjectDetail
}

const ProjectContext = createContext<ProjectContextType | null>(null)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: project, isLoading, isError } = useProject(projectId ?? '')

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (isError || !project) {
    return <Navigate to="/projects" replace />
  }

  return (
    <ProjectContext.Provider value={{ project }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjectContext(): ProjectContextType {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider')
  }
  return context
}
