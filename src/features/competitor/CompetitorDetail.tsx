import { StatCard, Pill } from '@/components/ui'
import { useCompetitor } from './api'

type Props = {
  competitorId: string
  onClose?: () => void
}

export function CompetitorDetail({ competitorId, onClose }: Props) {
  const { data, isLoading, isError, error } = useCompetitor(competitorId)

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-l border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-text-primary">Competitor Detail</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded p-1 text-text-muted hover:bg-surface-raised hover:text-text-primary"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex-1 p-5">
        {isLoading && (
          <div className="space-y-3">
            <div className="h-6 w-40 animate-pulse rounded bg-surface-raised" />
            <div className="h-4 w-28 animate-pulse rounded bg-surface-raised" />
          </div>
        )}

        {isError && (
          <div className="rounded-md border border-danger/20 bg-danger-muted p-3 text-sm text-danger">
            {(error as Error).message}
          </div>
        )}

        {data && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="text-lg font-bold text-text-primary">{data.name}</h3>
              <a
                href={data.url}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 text-xs text-accent hover:underline"
              >
                {data.url}
              </a>
            </div>

            {data.description && (
              <p className="text-sm text-text-secondary leading-relaxed">{data.description}</p>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <StatCard label="Region" value={data.region} />
              {data.marketShare != null && (
                <StatCard
                  label="Market Share"
                  value={`${(data.marketShare * 100).toFixed(1)}%`}
                />
              )}
              {data.estimatedRevenue != null && (
                <StatCard
                  label="Est. Revenue"
                  value={`$${(data.estimatedRevenue / 1_000_000).toFixed(1)}M`}
                />
              )}
              <StatCard
                label="States Covered"
                value={String(data.coverageStates?.length ?? '—')}
              />
            </div>

            {data.tags.length > 0 && (
              <div>
                <p className="mb-2 text-2xs font-semibold uppercase tracking-wider text-text-muted">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.tags.map((tag) => (
                    <Pill key={tag} variant="accent">{tag}</Pill>
                  ))}
                </div>
              </div>
            )}

            {data.coverageStates && data.coverageStates.length > 0 && (
              <div>
                <p className="mb-2 text-2xs font-semibold uppercase tracking-wider text-text-muted">
                  Coverage States
                </p>
                <div className="flex flex-wrap gap-1">
                  {data.coverageStates.map((s) => (
                    <Pill key={s}>{s}</Pill>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
