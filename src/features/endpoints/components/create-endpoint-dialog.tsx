import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateEndpoint, useUpdateEndpoint } from '../hooks'
import { Loader2 } from 'lucide-react'
import type { Endpoint } from '../types'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const

const endpointSchema = z.object({
  method: z.string().min(1, 'Method is required'),
  path: z
    .string()
    .min(1, 'Path is required')
    .regex(/^\//, 'Path must start with /'),
  name: z.string().optional(),
  description: z.string().optional(),
})

type EndpointFormValues = z.infer<typeof endpointSchema>

interface CreateEndpointDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  endpoint?: Endpoint | null
}

function CreateEndpointDialog({
  projectId,
  open,
  onOpenChange,
  endpoint,
}: CreateEndpointDialogProps) {
  const createMutation = useCreateEndpoint()
  const updateMutation = useUpdateEndpoint()
  const isEditing = !!endpoint

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EndpointFormValues>({
    resolver: zodResolver(endpointSchema),
    defaultValues: {
      method: 'GET',
      path: '',
      name: '',
      description: '',
    },
  })

  const selectedMethod = watch('method')

  useEffect(() => {
    if (open) {
      if (endpoint) {
        reset({
          method: endpoint.method,
          path: endpoint.path,
          name: endpoint.name ?? '',
          description: endpoint.description ?? '',
        })
      } else {
        reset({
          method: 'GET',
          path: '',
          name: '',
          description: '',
        })
      }
    }
  }, [open, endpoint, reset])

  function onSubmit(values: EndpointFormValues) {
    if (isEditing && endpoint) {
      updateMutation.mutate(
        {
          projectId,
          endpointId: String(endpoint.id),
          data: {
            name: values.name,
            description: values.description,
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        }
      )
    } else {
      createMutation.mutate(
        {
          projectId,
          data: {
            method: values.method,
            path: values.path,
            name: values.name,
            description: values.description,
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        }
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Endpoint' : 'Add Endpoint'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the endpoint configuration.'
              : 'Define a new API endpoint to monitor.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="method">Method</Label>
            <Select
              value={selectedMethod}
              onValueChange={(value) => setValue('method', value, { shouldValidate: true })}
            >
              <SelectTrigger id="method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {HTTP_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.method && (
              <p className="text-sm text-destructive">{errors.method.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="path">Path</Label>
            <Input
              id="path"
              placeholder="/api/v1/resource"
              {...register('path')}
            />
            {errors.path && (
              <p className="text-sm text-destructive">{errors.path.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Name{' '}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., List Users"
              {...register('name')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description{' '}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <textarea
              id="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe what this endpoint does..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { CreateEndpointDialog }
export type { CreateEndpointDialogProps }
