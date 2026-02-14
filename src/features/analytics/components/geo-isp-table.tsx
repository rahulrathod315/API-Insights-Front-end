import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/shared/data-table'
import type { Column } from '@/components/shared/data-table'
import { formatNumber } from '@/lib/utils/format'
import type { GeoISP } from '../types'

interface GeoISPTableProps {
  isps: GeoISP[]
  isLoading?: boolean
}

const columns: Column<GeoISP>[] = [
  {
    header: 'ISP',
    accessor: 'isp',
  },
  {
    header: 'ASN',
    accessor: 'asn',
  },
  {
    header: 'Unique IPs',
    accessor: 'unique_ips',
    cell: (row) => formatNumber(row.unique_ips),
  },
  {
    header: 'Requests',
    accessor: 'request_count',
    cell: (row) => formatNumber(row.request_count),
  },
]

export function GeoISPTable({ isps, isLoading }: GeoISPTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ISPs / Networks</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={isps}
          isLoading={isLoading}
          rowKey={(row) => row.asn}
        />
      </CardContent>
    </Card>
  )
}
