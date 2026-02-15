import { useState } from 'react'
import { Download, Activity, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { differenceInCalendarDays, isValid, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { StaggerGroup, StaggerItem } from '@/components/animation'
import { useProjectContext } from '@/features/projects/project-context'
import { TimeRangePicker } from '../components/time-range-picker'
import { ExportDialog } from '../components/export-dialog'
import { RequestVolumeChart } from '../components/request-volume-chart'
import { ErrorRateChart } from '../components/error-rate-chart'
import {
  useSummary,
  useTimeSeries,
} from '../hooks'
import { useAnalyticsParams } from '../analytics-params-context'
import { exportData } from '../api'
import { formatNumber, formatMs, formatPercent } from '@/lib/utils/format'
import type { AnalyticsParams, ExportParams } from '../types'

function normalizeAnalyticsParams(params: AnalyticsParams): AnalyticsParams {
  if (params.start_date && params.end_date) {
    const start = parseISO(params.start_date)
    const end = parseISO(params.end_date)
    if (isValid(start) && isValid(end)) {
      const diff = Math.max(1, differenceInCalendarDays(end, start) + 1)
      return { days: Math.min(diff, 365) }
    }
  }
  return params
}

function getGranularity(days?: number): 'hour' | 'day' | 'week' | 'month' {
  if (!days || days <= 1) return 'hour'
  if (days <= 90) return 'day'
  return 'week'
}

export default function AnalyticsPage() {
  const { project } = useProjectContext()
  const { params, setParams } = useAnalyticsParams()
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  const normalizedParams = normalizeAnalyticsParams(params)

  const summary = useSummary(String(project.id), normalizedParams)
  const timeSeriesParams = { ...normalizedParams, granularity: getGranularity(normalizedParams.days) }
  const timeSeries = useTimeSeries(String(project.id), timeSeriesParams)

  function getFilenameFromDisposition(disposition?: string) {
    if (!disposition) return null
    const match = /filename="?([^"]+)"?/.exec(disposition)
    return match?.[1] ?? null
  }

  async function handleExport(exportOpts: { format: 'csv' | 'json'; start_date: string; end_date: string }) {
    const exportParams: ExportParams = {
      export_format: exportOpts.format,
      start_date: exportOpts.start_date,
      end_date: exportOpts.end_date,
    }
    const response = await exportData(String(project.id), exportParams)
    const blob = response.data
    const ext = exportOpts.format
    const filename =
      getFilenameFromDisposition(response.headers?.['content-disposition']) ??
      `analytics-${project.id}-${Date.now()}.${ext}`
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const s = summary.data?.summary
  const isLoading = summary.isLoading

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="High-level summary of API activity and health"
        actions={
          <div className="flex items-center gap-3">
            <TimeRangePicker value={params} onChange={setParams} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportDialogOpen(true)}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        }
      />

      {/* Summary Stats */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <StatCard
              title="Total Requests"
              value={formatNumber(s?.total_requests ?? 0)}
              icon={Activity}
              iconClassName="bg-primary/10 text-primary"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Error Rate"
              value={formatPercent(
                s && s.total_requests > 0
                  ? (s.error_requests / s.total_requests) * 100
                  : 0
              )}
              icon={AlertTriangle}
              iconClassName="bg-primary/10 text-primary"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Avg Latency"
              value={formatMs(s?.avg_response_time_ms ?? 0)}
              icon={Clock}
              iconClassName="bg-primary/10 text-primary"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Success Rate"
              value={formatPercent(s?.success_rate ?? 0)}
              icon={CheckCircle}
              iconClassName="bg-primary/10 text-primary"
            />
          </StaggerItem>
        </StaggerGroup>
      )}

      {/* Quick Traffic + Error snapshot */}
      <div className="grid gap-6 md:grid-cols-2">
        <RequestVolumeChart
          data={timeSeries.data?.data ?? []}
          isLoading={timeSeries.isLoading}
          days={normalizedParams.days}
        />
        <ErrorRateChart
          data={timeSeries.data?.data ?? []}
          isLoading={timeSeries.isLoading}
          days={normalizedParams.days}
        />
      </div>

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={handleExport}
      />
    </div>
  )
}
