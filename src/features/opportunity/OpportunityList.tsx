import { useState } from 'react'
import { DataTable, type ColumnDef, Pill, type PillVariant, Button, Select, type SelectOption, Input } from '@/components/ui'
import { useOpportunities, type OpportunityListFilters } from './api'
import type { Opportunity, OpportunityType } from './types'

const TYPE_LABELS: Record<OpportunityType, string> = {
  UNDERSERVED_LANE: 'Underserved Lane',
  COST_ADVANTAGE: 'Cost Advantage',
  VOLUME_GAP: 'Volume Gap',
  NEW_MARKET: 'New Market',
}

const TYPE_VARIANTS: Record<OpportunityType, PillVariant> = {
  UNDERSERVED_LANE: 'warning',
  COST_ADVANTAGE: 'success',
  VOLUME_GAP: 'accent',
  NEW_MARKET: 'default',
}

const TYPE_OPTIONS: SelectOption[] = [
  { value: '', label: 'All types' },
  ...Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label })),
]

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 75 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-border'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-raised">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="font-mono text-xs tabular-nums text-text-secondary">{score}</span>
    </div>
  )
}

type Props = {
  onSelect?: (opportunity: Opportunity) => void
}

export function OpportunityList({ onSelect }: Props) {
  const [filters, setFilters] = useState<OpportunityListFilters>({ page: 0, size: 20 })
  const { data, isLoading, isError, error } = useOpportunities(filters)

  const { content = [], totalElements = 0, totalPages = 0 } = data ?? {}
  const page = filters.page ?? 0
  const size = filters.size ?? 20

  const columns: ColumnDef<Opportunity>[] = [
    {
      key: 'title',
      header: 'Opportunity',
      cell: (opp) => (
        <button
          className="text-left font-medium text-text-primary hover:text-accent"
          onClick={() => onSelect?.(opp)}
        >
          {opp.title}
        </button>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      cell: (opp) => (
        <Pill variant={TYPE_VARIANTS[opp.type]}>{TYPE_LABELS[opp.type]}</Pill>
      ),
    },
    {
      key: 'region',
      header: 'Region',
      cell: (opp) => <span className="text-text-secondary">{opp.region}</span>,
    },
    {
      key: 'score',
      header: 'Score',
      sortable: true,
      align: 'right',
      cell: (opp) => <ScoreBar score={opp.score} />,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Select
          options={TYPE_OPTIONS}
          value={filters.type ?? ''}
          onValueChange={(v) =>
            setFilters((f) => ({
              ...f,
              page: 0,
              type: v ? (v as OpportunityType) : undefined,
            }))
          }
          placeholder="All types"
        />
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-text-muted" htmlFor="min-score">
            Min score
          </label>
          <Input
            id="min-score"
            type="number"
            min={0}
            max={100}
            className="w-16"
            placeholder="0"
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                page: 0,
                minScore: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
        </div>
      </div>

      {isError && (
        <div className="rounded-md border border-danger/20 bg-danger-muted p-4 text-sm text-danger">
          Failed to load opportunities: {(error as Error).message}
        </div>
      )}

      <DataTable
        columns={columns}
        data={content}
        keyExtractor={(o) => o.id}
        loading={isLoading}
        empty={<span className="text-text-muted">No opportunities match your filters.</span>}
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
              onClick={() => setFilters((f) => ({ ...f, page: Math.max(0, page - 1) }))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setFilters((f) => ({ ...f, page: Math.min(totalPages - 1, page + 1) }))
              }
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
