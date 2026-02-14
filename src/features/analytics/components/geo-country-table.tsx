import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/shared/data-table'
import type { Column } from '@/components/shared/data-table'
import { formatNumber, formatMs, formatPercent } from '@/lib/utils/format'
import type { GeoCountry } from '../types'

interface GeoCountryTableProps {
  countries: GeoCountry[]
  isLoading?: boolean
  onCountryClick?: (countryCode: string) => void
}

type SortKey = 'request_count' | 'error_count' | 'error_rate' | 'avg_response_time_ms' | 'unique_ips' | 'percentage'

export function GeoCountryTable({ countries, isLoading, onCountryClick }: GeoCountryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('request_count')
  const [sortAsc, setSortAsc] = useState(false)

  const sorted = useMemo(() => {
    return [...countries].sort((a, b) => {
      const diff = a[sortKey] - b[sortKey]
      return sortAsc ? diff : -diff
    })
  }, [countries, sortKey, sortAsc])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortAsc ? ' \u25B2' : ' \u25BC') : ''

  const columns: Column<GeoCountry>[] = [
    {
      header: 'Country',
      accessor: 'country',
      cell: (row) => (
        <button
          className="text-left font-medium text-primary hover:underline"
          onClick={() => onCountryClick?.(row.country_code)}
        >
          {row.country_code} - {row.country}
        </button>
      ),
    },
    {
      header: `Requests${sortIndicator('request_count')}`,
      accessor: 'request_count',
      cell: (row) => formatNumber(row.request_count),
      className: 'cursor-pointer',
    },
    {
      header: `Errors${sortIndicator('error_count')}`,
      accessor: 'error_count',
      cell: (row) => formatNumber(row.error_count),
      className: 'cursor-pointer',
    },
    {
      header: `Error Rate${sortIndicator('error_rate')}`,
      accessor: 'error_rate',
      cell: (row) => formatPercent(row.error_rate),
      className: 'cursor-pointer',
    },
    {
      header: `Avg Response${sortIndicator('avg_response_time_ms')}`,
      accessor: 'avg_response_time_ms',
      cell: (row) => formatMs(row.avg_response_time_ms),
      className: 'cursor-pointer',
    },
    {
      header: `Unique IPs${sortIndicator('unique_ips')}`,
      accessor: 'unique_ips',
      cell: (row) => formatNumber(row.unique_ips),
      className: 'cursor-pointer',
    },
    {
      header: `Share${sortIndicator('percentage')}`,
      accessor: 'percentage',
      cell: (row) => formatPercent(row.percentage),
      className: 'cursor-pointer',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Countries</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          onClick={(e) => {
            const th = (e.target as HTMLElement).closest('th')
            if (!th) return
            const idx = Array.from(th.parentElement?.children ?? []).indexOf(th)
            const keys: (SortKey | null)[] = [null, 'request_count', 'error_count', 'error_rate', 'avg_response_time_ms', 'unique_ips', 'percentage']
            const key = keys[idx]
            if (key) handleSort(key)
          }}
        >
          <DataTable
            columns={columns}
            data={sorted}
            isLoading={isLoading}
            rowKey={(row) => row.country_code}
          />
        </div>
      </CardContent>
    </Card>
  )
}
