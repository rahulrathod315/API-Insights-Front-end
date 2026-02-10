import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProjectContext } from '@/features/projects/project-context'
import { useCreateAlert, useUpdateAlert } from '../hooks'
import { Loader2 } from 'lucide-react'
import type { Alert } from '../types'

const alertFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().optional(),
  metric: z.enum(['error_rate', 'avg_response_time', 'p95_response_time', 'p99_response_time', 'request_count', 'error_count'], {
    error: 'Metric is required',
  }),
  comparison: z.enum(['gt', 'lt', 'gte', 'lte'], {
    error: 'Comparison is required',
  }),
  threshold: z.number({ error: 'Must be a number' }).min(0, 'Threshold must be 0 or greater'),
  evaluation_window_minutes: z.number().min(1).optional(),
  notify_on_trigger: z.boolean().optional(),
  notify_on_resolve: z.boolean().optional(),
  cooldown_minutes: z.number().min(0).optional(),
})

type AlertFormValues = z.infer<typeof alertFormSchema>

interface CreateAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alert?: Alert
}

const metricOptions = [
  { value: 'error_rate', label: 'Error Rate (%)' },
  { value: 'avg_response_time', label: 'Avg Response Time' },
  { value: 'p95_response_time', label: 'P95 Response Time' },
  { value: 'p99_response_time', label: 'P99 Response Time' },
  { value: 'request_count', label: 'Request Count' },
  { value: 'error_count', label: 'Error Count' },
]

const comparisonOptions = [
  { value: 'gt', label: '> (Greater than)' },
  { value: 'lt', label: '< (Less than)' },
  { value: 'gte', label: '>= (Greater than or equal)' },
  { value: 'lte', label: '<= (Less than or equal)' },
]

function CreateAlertDialog({ open, onOpenChange, alert }: CreateAlertDialogProps) {
  const { project } = useProjectContext()
  const createAlert = useCreateAlert()
  const updateAlert = useUpdateAlert()

  const isEditMode = !!alert

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<AlertFormValues>({
    resolver: zodResolver(alertFormSchema) as never,
    defaultValues: {
      name: '',
      description: '',
      metric: undefined,
      comparison: undefined,
      threshold: 0,
      evaluation_window_minutes: 5,
      notify_on_trigger: true,
      notify_on_resolve: true,
      cooldown_minutes: 15,
    },
  })

  useEffect(() => {
    if (open && alert) {
      reset({
        name: alert.name,
        description: alert.description ?? '',
        metric: alert.metric,
        comparison: alert.comparison,
        threshold: alert.threshold,
        evaluation_window_minutes: alert.evaluation_window_minutes,
        notify_on_trigger: alert.notify_on_trigger,
        notify_on_resolve: alert.notify_on_resolve,
        cooldown_minutes: alert.cooldown_minutes,
      })
    } else if (open && !alert) {
      reset({
        name: '',
        description: '',
        metric: undefined,
        comparison: undefined,
        threshold: 0,
        evaluation_window_minutes: 5,
        notify_on_trigger: true,
        notify_on_resolve: true,
        cooldown_minutes: 15,
      })
    }
  }, [open, alert, reset])

  function onSubmit(values: AlertFormValues) {
    const payload = {
      name: values.name,
      description: values.description,
      metric: values.metric,
      comparison: values.comparison,
      threshold: values.threshold,
      evaluation_window_minutes: values.evaluation_window_minutes,
      notify_on_trigger: values.notify_on_trigger,
      notify_on_resolve: values.notify_on_resolve,
      cooldown_minutes: values.cooldown_minutes,
    }

    if (isEditMode) {
      updateAlert.mutate(
        { projectId: String(project.id), alertId: String(alert.id), data: payload },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createAlert.mutate(
        { projectId: String(project.id), data: payload },
        { onSuccess: () => onOpenChange(false) }
      )
    }
  }

  const isPending = createAlert.isPending || updateAlert.isPending

  const metricValue = watch('metric')
  const comparisonValue = watch('comparison')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Alert' : 'Create Alert'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the alert configuration.'
              : 'Configure a new alert to monitor your API metrics.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., High Error Rate"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description{' '}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="description"
              placeholder="Describe what this alert monitors"
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metric">Metric</Label>
            <Select
              value={metricValue}
              onValueChange={(value) =>
                setValue('metric', value as AlertFormValues['metric'], { shouldValidate: true })
              }
            >
              <SelectTrigger id="metric">
                <SelectValue placeholder="Select a metric" />
              </SelectTrigger>
              <SelectContent>
                {metricOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.metric && (
              <p className="text-sm text-destructive">{errors.metric.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="comparison">Comparison</Label>
              <Select
                value={comparisonValue}
                onValueChange={(value) =>
                  setValue('comparison', value as AlertFormValues['comparison'], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="comparison">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {comparisonOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.comparison && (
                <p className="text-sm text-destructive">{errors.comparison.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">Threshold</Label>
              <Input
                id="threshold"
                type="number"
                step="any"
                placeholder="e.g., 5"
                {...register('threshold', { valueAsNumber: true })}
              />
              {errors.threshold && (
                <p className="text-sm text-destructive">{errors.threshold.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evaluation_window_minutes">Evaluation Window (minutes)</Label>
            <Input
              id="evaluation_window_minutes"
              type="number"
              placeholder="e.g., 5"
              {...register('evaluation_window_minutes', { valueAsNumber: true })}
            />
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
              {isEditMode ? 'Save Changes' : 'Create Alert'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { CreateAlertDialog }
export type { CreateAlertDialogProps }
