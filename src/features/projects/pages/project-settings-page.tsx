import { Navigate } from 'react-router-dom'
import { useProjectContext } from '../project-context'
import { ProjectSettingsForm } from '../components/project-settings-form'

export default function ProjectSettingsPage() {
  const { project } = useProjectContext()

  const canAccessSettings = project.my_role === 'owner' || project.my_role === 'admin'

  if (!canAccessSettings) {
    return <Navigate to={`/projects/${project.id}/dashboard`} replace />
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Settings</h1>
        <p className="text-muted-foreground">
          Manage settings for {project.name}.
        </p>
      </div>
      <ProjectSettingsForm project={project} />
    </div>
  )
}
