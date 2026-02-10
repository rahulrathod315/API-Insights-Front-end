import { useNavigate } from 'react-router-dom'
import { Copy, Activity, Globe, Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { formatDate } from '@/lib/utils/format'
import type { Project } from '../types'

interface ProjectCardProps {
  project: Project
  className?: string
}

const roleBadgeVariant: Record<Project['my_role'], 'default' | 'secondary' | 'outline'> = {
  owner: 'default',
  admin: 'secondary',
  member: 'outline',
  viewer: 'outline',
}

function ProjectCard({ project, className }: ProjectCardProps) {
  const navigate = useNavigate()

  const apiKeyDisplay = project.api_key
    ? `${project.api_key.slice(0, 12)}...`
    : '—'

  function handleCopyApiKey(event: React.MouseEvent) {
    event.stopPropagation()
    if (project.api_key) {
      navigator.clipboard.writeText(project.api_key)
    }
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-shadow hover:shadow-md',
        className
      )}
      onClick={() => navigate(`/projects/${project.id}/dashboard`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-lg">{project.name}</CardTitle>
            {project.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {project.description}
              </CardDescription>
            )}
          </div>
          <Badge variant={roleBadgeVariant[project.my_role]} className="ml-2 shrink-0">
            {project.my_role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1 rounded-md bg-muted px-3 py-2 text-sm font-mono">
          <span className="truncate text-muted-foreground">
            {apiKeyDisplay}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-6 w-6 shrink-0"
            onClick={handleCopyApiKey}
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="sr-only">Copy API key</span>
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <div className="flex w-full items-center gap-4">
          <div className="flex items-center gap-1">
            <Activity className="h-3.5 w-3.5" />
            <span>{project.total_requests.toLocaleString()} reqs</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe className="h-3.5 w-3.5" />
            <span>{project.endpoints_count} endpoints</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(project.created_at)}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export { ProjectCard }
