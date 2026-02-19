import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/shared/data-table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { Wifi, TrendingUp, Users } from 'lucide-react'
import type { Column } from '@/components/shared/data-table'
import { formatNumber, formatPercent } from '@/lib/utils/format'
import type { GeoISP } from '../types'

interface GeoISPTableProps {
  isps: GeoISP[]
  isLoading?: boolean
}

interface ISPWithPercentage extends GeoISP {
  percentage: number
  color: string
}

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--success)',
  'var(--destructive)',
  'var(--primary)',
]

export function GeoISPTable({ isps, isLoading }: GeoISPTableProps) {
  const [view, setView] = useState<'chart' | 'table'>('chart')

  const { processedISPs, totalRequests, totalIPs, topISP } = useMemo(() => {
    if (isps.length === 0) {
      return { processedISPs: [], totalRequests: 0, totalIPs: 0, topISP: null }
    }

    const totalReq = isps.reduce((sum, isp) => sum + isp.request_count, 0)
    const totalUniqIPs = isps.reduce((sum, isp) => sum + isp.unique_ips, 0)

    const processed: ISPWithPercentage[] = isps.map((isp, index) => ({
      ...isp,
      percentage: (isp.request_count / totalReq) * 100,
      color: COLORS[index % COLORS.length],
    }))

    const top = processed.length > 0 ? processed[0] : null

    return {
      processedISPs: processed,
      totalRequests: totalReq,
      totalIPs: totalUniqIPs,
      topISP: top,
    }
  }, [isps])

  const columns = useMemo<Column<ISPWithPercentage>[]>(
    () => [
      {
        header: 'Rank',
        accessor: 'isp',
        cell: (row, index) => (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">#{(index ?? 0) + 1}</span>
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: row.color }}
            />
          </div>
        ),
        className: 'w-[80px]',
      },
      {
        header: 'ISP / Network Provider',
        accessor: 'isp',
        cell: (row) => (
          <div>
            <p className="font-medium">{row.isp}</p>
            <p className="text-xs text-muted-foreground">ASN: {row.asn}</p>
          </div>
        ),
      },
      {
        header: 'Market Share',
        accessor: 'percentage',
        cell: (row) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(row.percentage, 100)}%`,
                    backgroundColor: row.color,
                  }}
                />
              </div>
              <span className="text-sm font-medium tabular-nums">
                {formatPercent(row.percentage)}
              </span>
            </div>
          </div>
        ),
        className: 'w-[180px]',
      },
      {
        header: 'Unique IPs',
        accessor: 'unique_ips',
        cell: (row) => (
          <span className="tabular-nums">{formatNumber(row.unique_ips)}</span>
        ),
        className: 'text-right w-[120px]',
      },
      {
        header: 'Requests',
        accessor: 'request_count',
        cell: (row) => (
          <span className="font-medium tabular-nums">{formatNumber(row.request_count)}</span>
        ),
        className: 'text-right w-[140px]',
      },
    ],
    []
  )

  if (isLoading) {
    return <CardSkeleton />
  }

  if (processedISPs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">ISP / Network Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            No ISP data available
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold">ISP / Network Analytics</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Traffic distribution by network provider
            </p>
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as 'chart' | 'table')}>
            <TabsList className="h-8">
              <TabsTrigger value="chart" className="text-xs">Chart</TabsTrigger>
              <TabsTrigger value="table" className="text-xs">Table</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {view === 'chart' ? (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs">Total ISPs</span>
                </div>
                <p className="mt-1 text-2xl font-bold">{processedISPs.length}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Unique IPs</span>
                </div>
                <p className="mt-1 text-2xl font-bold">{formatNumber(totalIPs)}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">Total Requests</span>
                </div>
                <p className="mt-1 text-2xl font-bold">{formatNumber(totalRequests)}</p>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processedISPs.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => {
                      const percentage = props.percent * 100
                      return percentage > 5 ? `${percentage.toFixed(1)}%` : ''
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="request_count"
                  >
                    {processedISPs.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const data = payload[0].payload as ISPWithPercentage
                      return (
                        <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
                          <p className="font-medium">{data.isp}</p>
                          <p className="text-xs text-muted-foreground">ASN: {data.asn}</p>
                          <div className="mt-2 space-y-1">
                            <p>
                              Requests:{' '}
                              <span className="font-semibold">{formatNumber(data.request_count)}</span>
                            </p>
                            <p>
                              Share:{' '}
                              <span className="font-semibold">{formatPercent(data.percentage)}</span>
                            </p>
                            <p>
                              IPs: <span className="font-semibold">{formatNumber(data.unique_ips)}</span>
                            </p>
                          </div>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top ISP Highlight */}
            {topISP && (
              <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>Leading Network Provider</span>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <p className="text-xl font-bold">{topISP.isp}</p>
                    <p className="text-sm text-muted-foreground">ASN: {topISP.asn}</p>
                  </div>
                  <Badge variant="default" className="text-base">
                    {formatPercent(topISP.percentage)}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4 border-t pt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Unique IPs</p>
                    <p className="text-lg font-semibold tabular-nums">
                      {formatNumber(topISP.unique_ips)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Requests</p>
                    <p className="text-lg font-semibold tabular-nums">
                      {formatNumber(topISP.request_count)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 border-t pt-4 sm:grid-cols-4">
              {processedISPs.slice(0, 8).map((isp) => (
                <div key={isp.asn} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: isp.color }}
                  />
                  <span className="truncate text-xs text-muted-foreground">
                    {isp.isp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={processedISPs}
            isLoading={isLoading}
            rowKey={(row) => row.asn}
          />
        )}
      </CardContent>
    </Card>
  )
}
