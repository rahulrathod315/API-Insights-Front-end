import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { formatMs, formatPercent } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { GeoRegionStats } from '../types'

interface GeoPerformanceProps {
  fastest: GeoRegionStats[]
  slowest: GeoRegionStats[]
  highestErrors: GeoRegionStats[]
  isLoading?: boolean
}

function RankedList({
  items,
  valueRenderer,
  colorClass,
}: {
  items: GeoRegionStats[]
  valueRenderer: (item: GeoRegionStats) => string
  colorClass: string
}) {
  return (
    <div className="space-y-3">
      {items.slice(0, 5).map((item, i) => (
        <div key={item.country_code} className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
              colorClass
            )}
          >
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{item.country}</p>
            <p className="text-xs text-muted-foreground">{item.request_count.toLocaleString()} requests</p>
          </div>
          <span className="text-sm font-semibold">{valueRenderer(item)}</span>
        </div>
      ))}
      {items.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">No data available</p>
      )}
    </div>
  )
}

export function GeoPerformance({ fastest, slowest, highestErrors, isLoading }: GeoPerformanceProps) {
  if (isLoading) {
    return <CardSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Regional Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="fastest">
          <TabsList className="w-full">
            <TabsTrigger value="fastest" className="flex-1">Fastest</TabsTrigger>
            <TabsTrigger value="slowest" className="flex-1">Slowest</TabsTrigger>
            <TabsTrigger value="errors" className="flex-1">Most Errors</TabsTrigger>
          </TabsList>
          <TabsContent value="fastest">
            <RankedList
              items={fastest}
              valueRenderer={(item) => formatMs(item.avg_response_time_ms)}
              colorClass="bg-success"
            />
          </TabsContent>
          <TabsContent value="slowest">
            <RankedList
              items={slowest}
              valueRenderer={(item) => formatMs(item.avg_response_time_ms)}
              colorClass="bg-warning text-warning-foreground"
            />
          </TabsContent>
          <TabsContent value="errors">
            <RankedList
              items={highestErrors}
              valueRenderer={(item) => formatPercent(item.error_rate)}
              colorClass="bg-destructive"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
