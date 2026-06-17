import { useState } from 'react'
import { useCompetitors } from './api'
import type { Competitor } from './types'

type Props = {
  onSelect?: (competitor: Competitor) => void
  selectedId?: string
}

export function CompetitorList({ onSelect, selectedId }: Props) {
  const [page, setPage] = useState(0)
  const pageSize = 20
  const { data, isLoading, isError, error } = useCompetitors(page, pageSize)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
        Loading competitors…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
        Failed to load competitors: {(error as Error).message}
      </div>
    )
  }

  const { items = [], total = 0 } = data ?? {}
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Region</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Tags</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">URL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {items.map((c) => (
              <tr
                key={c.id}
                onClick={() => onSelect?.(c)}
                className={`cursor-pointer transition-colors hover:bg-indigo-50 ${
                  selectedId === c.id ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-300' : ''
                }`}
              >
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.region}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="truncate text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    {c.url}
                  </a>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No competitors found.
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
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded px-3 py-1 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded px-3 py-1 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
