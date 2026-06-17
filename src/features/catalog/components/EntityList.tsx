import { type ReactNode } from 'react';
import { DataTable, type ColumnDef } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import type { Page } from '../types';

interface EntityListProps<T extends object> {
  title: string;
  columns: ColumnDef<T>[];
  data: Page<T> | undefined;
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  filters?: ReactNode;
  page: number;
  onPageChange: (page: number) => void;
  onAdd: () => void;
  addLabel: string;
}

export function EntityList<T extends object>({
  title,
  columns,
  data,
  isLoading,
  search,
  onSearchChange,
  filters,
  page,
  onPageChange,
  onAdd,
  addLabel,
}: EntityListProps<T>) {
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <Button onClick={onAdd} size="sm">
          {addLabel}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search…"
          className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search"
        />
        {filters}
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading}
        emptyMessage={`No ${title.toLowerCase()} found.`}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>
            {totalElements} result{totalElements !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              aria-label="Previous page"
            >
              ‹ Prev
            </Button>
            <span>
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              aria-label="Next page"
            >
              Next ›
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
