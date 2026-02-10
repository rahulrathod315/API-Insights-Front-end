import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Copy, RefreshCw, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useUpdateProject, useRegenerateKey, useDeleteProject } from '../hooks'
import type { ProjectDetail } from '../types'

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
})

type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>

interface ProjectSettingsFormProps {
  project: ProjectDetail
}

function ProjectSettingsForm({ project }: ProjectSettingsFormProps) {
  const navigate = useNavigate()
  const updateProject = useUpdateProject()
  const regenerateKey = useRegenerateKey()
  const deleteProject = useDeleteProject()
  const [apiKeyCopied, setApiKeyCopied] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description || '',
    },
  })

  function onSubmit(values: UpdateProjectFormValues) {
    updateProject.mutate({
      id: String(project.id),
      data: {
        name: values.name,
        description: values.description || undefined,
      },
    })
  }

  function handleCopyApiKey() {
    navigator.clipboard.writeText(project.api_key)
    setApiKeyCopied(true)
    setTimeout(() => setApiKeyCopied(false), 2000)
  }

  function handleRegenerateKey() {
    regenerateKey.mutate(String(project.id))
  }

  function handleDeleteProject() {
    deleteProject.mutate(String(project.id), {
      onSuccess: () => {
        navigate('/projects', { replace: true })
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Update your project name and description.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings-name">Name</Label>
              <Input id="settings-name" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-description">Description</Label>
              <Input id="settings-description" {...register('description')} />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
            {updateProject.isError && (
              <p className="text-sm text-destructive">
                Failed to update project. Please try again.
              </p>
            )}
            {updateProject.isSuccess && (
              <p className="text-sm text-success">Project updated successfully.</p>
            )}
            <Button type="submit" disabled={!isDirty || updateProject.isPending}>
              {updateProject.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
          <CardDescription>
            Use this key to authenticate API requests for this project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-sm">
              {project.api_key}
            </div>
            <Button variant="outline" size="icon" onClick={handleCopyApiKey}>
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy API key</span>
            </Button>
          </div>
          {apiKeyCopied && (
            <p className="text-sm text-muted-foreground">Copied to clipboard.</p>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={regenerateKey.isPending}>
                {regenerateKey.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Regenerate Key
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Regenerate API Key?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will invalidate the current API key. All services using
                  the existing key will stop working until they are updated with
                  the new key.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRegenerateKey}>
                  Regenerate
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {regenerateKey.isSuccess && (
            <p className="text-sm text-success">API key regenerated successfully.</p>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions for this project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleteProject.isPending}>
                {deleteProject.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete Project
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  project "{project.name}", all its endpoints, analytics data,
                  and remove all member associations.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteProject}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Project
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {deleteProject.isError && (
            <p className="mt-2 text-sm text-destructive">
              Failed to delete project. Please try again.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { ProjectSettingsForm }
