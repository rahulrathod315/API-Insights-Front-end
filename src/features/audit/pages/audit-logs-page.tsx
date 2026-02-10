import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { useProjectContext } from '@/features/projects/project-context'
import { useAuditLogs } from '../hooks'
import { AuditLogFiltersBar } from '../components/audit-log-filters'
import { AuditLogTable } from '../components/audit-log-table'
import { ScrollText } from 'lucide-react'
import type { AuditLogFilters } from '../types'

const DEFAULT_PAGE_SIZE = 20

export default function AuditLogsPage() {
  const { project } = useProjectContext()
  const [searchParams, setSearchParams] = useSearchParams()

  const filters: AuditLogFilters = useMemo(() => {
    const params: AuditLogFilters = {
      page: Number(searchParams.get('page')) || 1,
      page_size: Number(searchParams.get('page_size')) || DEFAULT_PAGE_SIZE,
    }

    const action = searchParams.get('action')
    if (action) params.action = action

    const resourceType = searchParams.get('resource_type')
    if (resourceType) params.resource_type = resourceType

    const actor = searchParams.get('actor')
    if (actor) params.actor = Number(actor)

    const dateFrom = searchParams.get('date_from')
    if (dateFrom) params.date_from = dateFrom

    const dateTo = searchParams.get('date_to')
    if (dateTo) params.date_to = dateTo

    return params
  }, [searchParams])

  const { data, isLoading } = useAuditLogs(String(project.id), filters)

  const handleFiltersChange = useCallback(
    (newFilters: AuditLogFilters) => {
      const params = new URLSearchParams()

      if (newFilters.action) params.set('action', newFilters.action)
      if (newFilters.resource_type) params.set('resource_type', newFilters.resource_type)
      if (newFilters.actor) params.set('actor', String(newFilters.actor))
      if (newFilters.date_from) params.set('date_from', newFilters.date_from)
      if (newFilters.date_to) params.set('date_to', newFilters.date_to)
      if (newFilters.page && newFilters.page > 1) {
        params.set('page', String(newFilters.page))
      }
      if (newFilters.page_size && newFilters.page_size !== DEFAULT_PAGE_SIZE) {
        params.set('page_size', String(newFilters.page_size))
      }

      setSearchParams(params, { replace: true })
    },
    [setSearchParams]
  )

  const handlePageChange = useCallback(
    (page: number) => {
      handleFiltersChange({ ...filters, page })
    },
    [filters, handleFiltersChange]
  )

  const logs = data?.results ?? []
  const totalCount = data?.pagination?.count ?? 0
  const hasNoResults = !isLoading && logs.length === 0
  const hasActiveFilters =
    filters.action || filters.resource_type || filters.date_from || filters.date_to

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Track all changes and activity within your project"
      />

      <AuditLogFiltersBar filters={filters} onFiltersChange={handleFiltersChange} />

      {hasNoResults ? (
        <EmptyState
          icon={ScrollText}
          title="No audit logs found"
          description={
            hasActiveFilters
              ? 'No logs match your current filters. Try adjusting or clearing your filters.'
              : 'Activity will appear here as changes are made to your project.'
          }
          action={
            hasActiveFilters
              ? {
                  label: 'Clear filters',
                  onClick: () =>
                    handleFiltersChange({
                      page: 1,
                      page_size: filters.page_size,
                    }),
                }
              : undefined
          }
        />
      ) : (
        <AuditLogTable
          logs={logs}
          pagination={{
            page: filters.page ?? 1,
            pageSize: filters.page_size ?? DEFAULT_PAGE_SIZE,
            total: totalCount,
          }}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
