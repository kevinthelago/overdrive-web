import { type ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'

export type SortDirection = 'asc' | 'desc' | null

export interface ColumnDef<T> {
  key: string
  header: string
  cell: (row: T, index: number) => ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  headerClassName?: string
  cellClassName?: string
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  keyExtractor: (row: T, index: number) => string | number
  loading?: boolean
  empty?: ReactNode
  className?: string
  stickyHeader?: boolean
  onSortChange?: (key: string, direction: SortDirection) => void
  defaultSortKey?: string
  defaultSortDir?: SortDirection
}

const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

function SortIcon({ direction }: { direction: SortDirection }) {
  return (
    <span className="ml-1 inline-flex flex-col text-[10px] leading-none text-text-muted">
      <span className={direction === 'asc' ? 'text-accent' : ''}>▲</span>
      <span className={direction === 'desc' ? 'text-accent' : ''}>▼</span>
    </span>
  )
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  empty,
  className,
  stickyHeader = true,
  onSortChange,
  defaultSortKey,
  defaultSortDir = null,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey ?? null)
  const [sortDir, setSortDir] = useState<SortDirection>(defaultSortDir)

  function handleSort(key: string) {
    let nextDir: SortDirection
    if (sortKey !== key) {
      nextDir = 'asc'
    } else if (sortDir === 'asc') {
      nextDir = 'desc'
    } else {
      nextDir = null
    }
    setSortKey(nextDir === null ? null : key)
    setSortDir(nextDir)
    onSortChange?.(key, nextDir)
  }

  return (
    <div className={cn('overflow-auto rounded-md border border-border', className)}>
      <table className="min-w-full text-sm">
        <thead
          className={cn(
            'border-b border-border bg-surface',
            stickyHeader && 'sticky top-0 z-10',
          )}
        >
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-3 py-2.5 font-medium text-text-muted',
                  alignClass[col.align ?? 'left'],
                  col.sortable && 'cursor-pointer select-none hover:text-text-primary',
                  col.width,
                  col.headerClassName,
                )}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                {col.header}
                {col.sortable && (
                  <SortIcon direction={sortKey === col.key ? sortDir : null} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border-subtle">
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2.5">
                    <div className="h-4 animate-pulse rounded bg-surface-raised" style={{ width: col.width ?? '80%' }} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-10 text-center">
                {empty ?? (
                  <span className="text-text-muted">No data</span>
                )}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={keyExtractor(row, idx)}
                className={cn(
                  'border-b border-border-subtle last:border-0',
                  'hover:bg-surface-raised transition-colors',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-3 py-2.5 text-text-primary',
                      alignClass[col.align ?? 'left'],
                      col.cellClassName,
                    )}
                  >
                    {col.cell(row, idx)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
