import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { DataTable } from '@/components/shared/data-table'
import type { Column } from '@/components/shared/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { useChartAnimation } from '@/lib/animation'
import { formatNumber, formatMs, formatPercent, formatDate } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import { useProjectContext } from '@/features/projects/project-context'
import { useCountryDetail } from '../hooks'
import type { AnalyticsParams, CountryDetailResponse } from '../types'

interface CountryDetailDialogProps {
  countryCode: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  params?: AnalyticsParams
}

type City = CountryDetailResponse['cities'][number]
type Endpoint = CountryDetailResponse['top_endpoints'][number]

const cityColumns: Column<City>[] = [
  { header: 'City', accessor: 'city' },
  { header: 'Region', accessor: 'region' },
  { header: 'Requests', accessor: 'request_count', cell: (row) => formatNumber(row.request_count) },
  { header: 'Unique IPs', accessor: 'unique_ips', cell: (row) => formatNumber(row.unique_ips) },
]

const endpointColumns: Column<Endpoint>[] = [
  { header: 'Endpoint', accessor: 'path', cell: (row) => `${row.method} ${row.path}` },
  { header: 'Requests', accessor: 'request_count', cell: (row) => formatNumber(row.request_count) },
  { header: 'Errors', accessor: 'error_count', cell: (row) => formatNumber(row.error_count) },
]

export function CountryDetailDialog({ countryCode, open, onOpenChange, params }: CountryDetailDialogProps) {
  const { project } = useProjectContext()
  const { data, isLoading } = useCountryDetail(String(project.id), countryCode, params)
  const animation = useChartAnimation()
  const tz = useTimezone()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {data ? `${data.country.name} (${data.country.code})` : 'Country Details'}
          </DialogTitle>
          <DialogDescription>
            Detailed traffic breakdown for this country
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
            <Skeleton className="h-64" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatBox label="Total Requests" value={formatNumber(data.summary.total_requests)} />
              <StatBox label="Error Rate" value={formatPercent(data.summary.error_rate)} />
              <StatBox label="Avg Response" value={formatMs(data.summary.avg_response_time_ms)} />
              <StatBox label="Unique IPs" value={formatNumber(data.summary.unique_ips)} />
            </div>

            {/* Daily Trend */}
            {data.daily_trend.length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-semibold">Daily Trend</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data.daily_trend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => formatDate(v, tz)}
                      className="text-xs"
                      tick={{ fill: 'var(--muted-foreground)' }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'var(--muted-foreground)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                      }}
                      labelFormatter={(v) => formatDate(v as string, tz)}
                    />
                    <Area
                      type="monotone"
                      dataKey="request_count"
                      name="Requests"
                      fill="var(--chart-1)"
                      stroke="var(--chart-1)"
                      fillOpacity={0.3}
                      {...animation}
                    />
                    <Area
                      type="monotone"
                      dataKey="error_count"
                      name="Errors"
                      fill="var(--destructive)"
                      stroke="var(--destructive)"
                      fillOpacity={0.3}
                      {...animation}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Cities */}
            {data.cities.length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-semibold">Top Cities</h4>
                <DataTable
                  columns={cityColumns}
                  data={data.cities}
                  rowKey={(row) => `${row.city}-${row.region}`}
                />
              </div>
            )}

            {/* Top Endpoints */}
            {data.top_endpoints.length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-semibold">Top Endpoints</h4>
                <DataTable
                  columns={endpointColumns}
                  data={data.top_endpoints}
                  rowKey={(row) => `${row.method}-${row.path}`}
                />
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  )
}
