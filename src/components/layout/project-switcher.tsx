import { useNavigate } from 'react-router-dom'
import { ChevronsUpDown, FolderOpen } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils/cn'

interface Project {
  id: string
  name: string
}

interface ProjectSwitcherProps {
  projects: Project[]
  currentProjectId: string
  collapsed?: boolean
}

export function ProjectSwitcher({
  projects,
  currentProjectId,
  collapsed = false,
}: ProjectSwitcherProps) {
  const navigate = useNavigate()
  const currentProject = projects.find((p) => p.id === currentProjectId)

  function handleSelectProject(projectId: string) {
    navigate(`/projects/${projectId}/dashboard`)
  }

  function handleViewAllProjects() {
    navigate('/projects')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex w-full items-center gap-2 rounded-md border border-sidebar-border bg-sidebar px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          collapsed && 'justify-center px-2'
        )}
      >
        <FolderOpen className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left">
              {currentProject?.name ?? 'Select Project'}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Projects</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => handleSelectProject(project.id)}
            className={cn(
              'cursor-pointer',
              project.id === currentProjectId && 'bg-accent font-medium'
            )}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            <span className="truncate">{project.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleViewAllProjects}
          className="cursor-pointer"
        >
          All Projects
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
