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
import { useCreateSLA, useUpdateSLA } from '../hooks'
import { Loader2 } from 'lucide-react'
import type { SLAConfig } from '../types'

const slaFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  uptime_target_percent: z
    .number({ error: 'Must be a number' })
    .min(0, 'Must be 0 or greater')
    .max(100, 'Must be 100 or less'),
  response_time_target_ms: z.number().min(0).nullable().optional(),
  response_time_percentile: z.enum(['p50', 'p95', 'p99']),
  error_rate_target_percent: z.number().min(0).max(100).nullable().optional(),
  evaluation_period: z.enum(['weekly', 'monthly', 'quarterly']),
})

type SLAFormValues = z.infer<typeof slaFormSchema>

interface CreateSLADialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sla?: SLAConfig
}

const percentileOptions = [
  { value: 'p50', label: 'P50 (Median)' },
  { value: 'p95', label: 'P95' },
  { value: 'p99', label: 'P99' },
]

const periodOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
]

function CreateSLADialog({ open, onOpenChange, sla }: CreateSLADialogProps) {
  const { project } = useProjectContext()
  const createSLA = useCreateSLA()
  const updateSLA = useUpdateSLA()

  const isEditMode = !!sla

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<SLAFormValues>({
    resolver: zodResolver(slaFormSchema) as never,
    defaultValues: {
      name: '',
      uptime_target_percent: 99.9,
      response_time_target_ms: null,
      response_time_percentile: 'p95',
      error_rate_target_percent: null,
      evaluation_period: 'monthly',
    },
  })

  useEffect(() => {
    if (open && sla) {
      reset({
        name: sla.name,
        uptime_target_percent: sla.uptime_target_percent,
        response_time_target_ms: sla.response_time_target_ms,
        response_time_percentile: sla.response_time_percentile,
        error_rate_target_percent: sla.error_rate_target_percent,
        evaluation_period: sla.evaluation_period,
      })
    } else if (open && !sla) {
      reset({
        name: '',
        uptime_target_percent: 99.9,
        response_time_target_ms: null,
        response_time_percentile: 'p95',
        error_rate_target_percent: null,
        evaluation_period: 'monthly',
      })
    }
  }, [open, sla, reset])

  function onSubmit(values: SLAFormValues) {
    const payload = {
      name: values.name,
      uptime_target_percent: values.uptime_target_percent,
      response_time_target_ms: values.response_time_target_ms || undefined,
      response_time_percentile: values.response_time_percentile,
      error_rate_target_percent: values.error_rate_target_percent || undefined,
      evaluation_period: values.evaluation_period,
    }

    if (isEditMode) {
      updateSLA.mutate(
        { projectId: String(project.id), slaId: String(sla.id), data: payload },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createSLA.mutate(
        { projectId: String(project.id), data: payload },
        { onSuccess: () => onOpenChange(false) }
      )
    }
  }

  const isPending = createSLA.isPending || updateSLA.isPending

  const percentileValue = watch('response_time_percentile')
  const periodValue = watch('evaluation_period')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit SLA' : 'Create SLA'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the SLA configuration.'
              : 'Configure a new Service Level Agreement for your API.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Production API SLA"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="uptime_target_percent">Uptime Target (%)</Label>
            <Input
              id="uptime_target_percent"
              type="number"
              step="0.01"
              placeholder="e.g., 99.9"
              {...register('uptime_target_percent', { valueAsNumber: true })}
            />
            {errors.uptime_target_percent && (
              <p className="text-sm text-destructive">{errors.uptime_target_percent.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="response_time_target_ms">
                Response Time Target (ms){' '}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="response_time_target_ms"
                type="number"
                step="1"
                placeholder="e.g., 500"
                {...register('response_time_target_ms', {
                  setValueAs: (v: string) => (v === '' ? null : Number(v)),
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="response_time_percentile">Percentile</Label>
              <Select
                value={percentileValue}
                onValueChange={(value) =>
                  setValue('response_time_percentile', value as SLAFormValues['response_time_percentile'], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="response_time_percentile">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {percentileOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="error_rate_target_percent">
              Error Rate Target (%){' '}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="error_rate_target_percent"
              type="number"
              step="0.01"
              placeholder="e.g., 1.0"
              {...register('error_rate_target_percent', {
                setValueAs: (v: string) => (v === '' ? null : Number(v)),
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evaluation_period">Evaluation Period</Label>
            <Select
              value={periodValue}
              onValueChange={(value) =>
                setValue('evaluation_period', value as SLAFormValues['evaluation_period'], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="evaluation_period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {isEditMode ? 'Save Changes' : 'Create SLA'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { CreateSLADialog }
export type { CreateSLADialogProps }
