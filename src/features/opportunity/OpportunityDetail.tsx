import { StatCard, Pill, type PillVariant } from '@/components/ui'
import { useOpportunity } from './api'
import type { OpportunityType } from './types'

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

type Props = {
  opportunityId: string
  onClose?: () => void
}

export function OpportunityDetail({ opportunityId, onClose }: Props) {
  const { data, isLoading, isError, error } = useOpportunity(opportunityId)

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-l border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-text-primary">Opportunity Detail</h2>
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
            <div className="h-6 w-48 animate-pulse rounded bg-surface-raised" />
            <div className="h-4 w-24 animate-pulse rounded bg-surface-raised" />
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
              <h3 className="text-lg font-bold text-text-primary">{data.title}</h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Pill variant={TYPE_VARIANTS[data.type]}>{TYPE_LABELS[data.type]}</Pill>
                <span className="text-xs text-text-muted">{data.region}</span>
              </div>
            </div>

            {data.description && (
              <p className="text-sm text-text-secondary leading-relaxed">{data.description}</p>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <StatCard
                label="Opportunity Score"
                value={data.score}
                trend={data.score >= 75 ? 'up' : data.score >= 50 ? 'neutral' : 'down'}
              />
              {data.estimatedRevenue != null && (
                <StatCard
                  label="Est. Revenue"
                  value={`$${(data.estimatedRevenue / 1_000_000).toFixed(2)}M`}
                />
              )}
            </div>

            {data.affectedLanes && data.affectedLanes.length > 0 && (
              <div>
                <p className="mb-2 text-2xs font-semibold uppercase tracking-wider text-text-muted">
                  Affected Lanes
                </p>
                <ul className="flex flex-col gap-1">
                  {data.affectedLanes.map((lane) => (
                    <li key={lane} className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                      {lane}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.actionItems && data.actionItems.length > 0 && (
              <div>
                <p className="mb-2 text-2xs font-semibold uppercase tracking-wider text-text-muted">
                  Action Items
                </p>
                <ol className="flex flex-col gap-2">
                  {data.actionItems.map((item, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-text-secondary">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-muted text-2xs font-bold text-accent">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
