import { useState } from 'react'
import { useOpportunities, type OpportunityListFilters } from './api'
import type { Opportunity, OpportunityType } from './types'

const TYPE_LABELS: Record<OpportunityType, string> = {
  UNDERSERVED_LANE: 'Underserved Lane',
  COST_ADVANTAGE: 'Cost Advantage',
  VOLUME_GAP: 'Volume Gap',
  NEW_MARKET: 'New Market',
}

const TYPE_COLORS: Record<OpportunityType, string> = {
  UNDERSERVED_LANE: 'bg-amber-100 text-amber-800',
  COST_ADVANTAGE: 'bg-green-100 text-green-800',
  VOLUME_GAP: 'bg-blue-100 text-blue-800',
  NEW_MARKET: 'bg-purple-100 text-purple-800',
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-yellow-400' : 'bg-gray-300'
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums text-gray-700">{score}</span>
    </div>
  )
}

type Props = {
  onSelect?: (opportunity: Opportunity) => void
  selectedId?: string
}

export function OpportunityList({ onSelect, selectedId }: Props) {
  const [filters, setFilters] = useState<OpportunityListFilters>({ page: 0, pageSize: 20 })
  const { data, isLoading, isError, error } = useOpportunities(filters)

  const { items = [], total = 0 } = data ?? {}
  const pageSize = filters.pageSize ?? 20
  const page = filters.page ?? 0
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          Type
          <select
            className="rounded border border-gray-200 bg-white px-2 py-1 text-sm"
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                page: 0,
                type: (e.target.value as OpportunityType) || undefined,
              }))
            }
          >
            <option value="">All</option>
            {(Object.keys(TYPE_LABELS) as OpportunityType[]).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          Min score
          <input
            type="number"
            min={0}
            max={100}
            placeholder="0"
            className="w-16 rounded border border-gray-200 px-2 py-1 text-sm"
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                page: 0,
                minScore: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
        </label>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
          Loading opportunities…
        </div>
      )}

      {isError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load opportunities: {(error as Error).message}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Region</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {items.map((opp) => (
                  <tr
                    key={opp.id}
                    onClick={() => onSelect?.(opp)}
                    className={`cursor-pointer transition-colors hover:bg-indigo-50 ${
                      selectedId === opp.id ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-300' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{opp.title}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[opp.type]}`}
                      >
                        {TYPE_LABELS[opp.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{opp.region}</td>
                    <td className="px-4 py-3">
                      <ScoreBadge score={opp.score} />
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      No opportunities match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters((f) => ({ ...f, page: Math.max(0, page - 1) }))}
                  disabled={page === 0}
                  className="rounded px-3 py-1 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: Math.min(totalPages - 1, page + 1) }))
                  }
                  disabled={page >= totalPages - 1}
                  className="rounded px-3 py-1 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
