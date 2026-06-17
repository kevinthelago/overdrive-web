import { useState } from 'react'
import { DataTable, type ColumnDef, Pill, Button } from '@/components/ui'
import { useCompetitors } from './api'
import type { Competitor } from './types'

type Props = {
  onSelect?: (competitor: Competitor) => void
}

function buildColumns(onSelect?: (c: Competitor) => void): ColumnDef<Competitor>[] {
  return [
    {
      key: 'name',
      header: 'Name',
      cell: (c) => (
        <button
          className="text-left font-medium text-text-primary hover:text-accent"
          onClick={() => onSelect?.(c)}
        >
          {c.name}
        </button>
      ),
    },
    {
      key: 'region',
      header: 'Region',
      cell: (c) => <span className="text-text-secondary">{c.region}</span>,
    },
    {
      key: 'tags',
      header: 'Tags',
      cell: (c) => (
        <div className="flex flex-wrap gap-1">
          {c.tags.map((tag) => (
            <Pill key={tag}>{tag}</Pill>
          ))}
        </div>
      ),
    },
    {
      key: 'url',
      header: 'Website',
      cell: (c) => (
        <a
          href={c.url}
          target="_blank"
          rel="noreferrer"
          className="truncate text-accent hover:underline"
        >
          {c.url}
        </a>
      ),
    },
  ]
}

export function CompetitorList({ onSelect }: Props) {
  const [page, setPage] = useState(0)
  const size = 20
  const { data, isLoading, isError, error } = useCompetitors(page, size)

  if (isError) {
    return (
      <div className="rounded-md border border-danger/20 bg-danger-muted p-4 text-sm text-danger">
        Failed to load competitors: {(error as Error).message}
      </div>
    )
  }

  const items = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        columns={buildColumns(onSelect)}
        data={items}
        keyExtractor={(c) => c.id}
        loading={isLoading}
        empty={<span className="text-text-muted">No competitors found.</span>}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>
            {page * size + 1}–{Math.min((page + 1) * size, totalElements)} of {totalElements}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
