import { useState } from 'react'
import { Globe, MapPin, Building2, Wifi } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { StaggerGroup, StaggerItem } from '@/components/animation'
import { useProjectContext } from '@/features/projects/project-context'
import { TimeRangePicker } from '../components/time-range-picker'
import { GeoWorldMap } from '../components/geo-world-map'
import { GeoCountryTable } from '../components/geo-country-table'
import { GeoTimeSeriesChart } from '../components/geo-time-series-chart'
import { GeoPerformance } from '../components/geo-performance'
import { GeoISPTable } from '../components/geo-isp-table'
import { CountryDetailDialog } from '../components/country-detail-dialog'
import {
  useGeoOverview,
  useGeoMap,
  useGeoTimeSeries,
  useGeoPerformance,
  useGeoISPs,
} from '../hooks'
import { formatNumber } from '@/lib/utils/format'
import type { AnalyticsParams } from '../types'

export default function GeoAnalyticsPage() {
  const { project } = useProjectContext()
  const projectId = String(project.id)

  const [params, setParams] = useState<AnalyticsParams>({ days: 7 })
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  const overview = useGeoOverview(projectId, params)
  const geoMap = useGeoMap(projectId, params)
  const geoTimeSeries = useGeoTimeSeries(projectId, params)
  const performance = useGeoPerformance(projectId, params)
  const isps = useGeoISPs(projectId, params)

  const totalCities = geoMap.data?.total_points ?? 0
  const totalISPs = isps.data?.isps?.length ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Geographic Analytics"
        description="Understand where your API traffic originates"
        actions={
          <TimeRangePicker value={params} onChange={setParams} />
        }
      />

      {/* Stat Cards */}
      <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <StatCard
            title="Total Requests"
            value={formatNumber(overview.data?.total_requests ?? 0)}
            icon={Globe}
            iconClassName="bg-primary/10 text-primary"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Countries"
            value={formatNumber(overview.data?.total_countries ?? 0)}
            icon={MapPin}
            iconClassName="bg-success/10 text-success"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Cities"
            value={formatNumber(totalCities)}
            icon={Building2}
            iconClassName="bg-muted text-muted-foreground"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="ISPs"
            value={formatNumber(totalISPs)}
            icon={Wifi}
            iconClassName="bg-muted text-muted-foreground"
          />
        </StaggerItem>
      </StaggerGroup>

      {/* World Map */}
      <GeoWorldMap
        countries={overview.data?.countries ?? []}
        isLoading={overview.isLoading}
        onCountryClick={setSelectedCountry}
      />

      {/* Time Series Chart */}
      <GeoTimeSeriesChart
        data={geoTimeSeries.data?.data ?? []}
        isLoading={geoTimeSeries.isLoading}
      />

      {/* Performance + ISP side by side */}
      <div className="grid gap-6 md:grid-cols-2">
        <GeoPerformance
          fastest={performance.data?.fastest_regions ?? []}
          slowest={performance.data?.slowest_regions ?? []}
          highestErrors={performance.data?.highest_error_rate_regions ?? []}
          isLoading={performance.isLoading}
        />
        <GeoISPTable
          isps={isps.data?.isps ?? []}
          isLoading={isps.isLoading}
        />
      </div>

      {/* Country Table */}
      <GeoCountryTable
        countries={overview.data?.countries ?? []}
        isLoading={overview.isLoading}
        onCountryClick={setSelectedCountry}
      />

      {/* Country Detail Dialog */}
      <CountryDetailDialog
        countryCode={selectedCountry}
        open={!!selectedCountry}
        onOpenChange={(open) => { if (!open) setSelectedCountry(null) }}
        params={params}
      />
    </div>
  )
}
