import { useState } from 'react'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { Segmented } from '@/components/ui/Segmented'
import { Pill } from '@/components/ui/Pill'
import { Waterfall, breakdownToSteps } from '@/components/charts/Waterfall'
import { StackedBar } from '@/components/charts/StackedBar'
import { ExplainPopover } from './ExplainPopover'
import { cn } from '@/lib/utils'
import type { SolvedCandidate, ChartMode } from './types'

interface RouteHeroCardProps {
  winner: SolvedCandidate
  allCandidates: SolvedCandidate[]
  className?: string
}

const CHART_OPTIONS = [
  { value: 'waterfall' as ChartMode, label: 'Waterfall' },
  { value: 'stacked' as ChartMode, label: 'Stacked' },
]

export function RouteHeroCard({ winner, allCandidates, className }: RouteHeroCardProps) {
  const [chartMode, setChartMode] = useState<ChartMode>('waterfall')

  const waterfallSteps = breakdownToSteps(winner.cost)
  const feasibleCandidates = allCandidates.filter((c) => !c.infeasible).slice(0, 5)

  return (
    <div className={cn('rounded-md border border-border bg-surface p-4 shadow-card', className)}>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-text-primary">{winner.carrierName}</h2>
            <Pill variant="success">BEST</Pill>
            <span className="text-sm text-text-muted">{winner.serviceLevel}</span>
          </div>
          <p className="mt-0.5 text-sm text-text-muted">
            {winner.transitDays} day{winner.transitDays !== 1 ? 's' : ''} transit
          </p>
        </div>

        <div className="text-right">
          <MoneyDisplay
            value={winner.cost.total.amount}
            currency={winner.cost.total.currency}
            size="xl"
            className="text-text-primary font-bold"
          />
          {winner.deltaCost.amount < 0 && (
            <p className="text-sm font-medium text-success">
              Saves{' '}
              <MoneyDisplay
                value={Math.abs(winner.deltaCost.amount)}
                currency={winner.deltaCost.currency}
                size="sm"
              />{' '}
              vs current
            </p>
          )}
        </div>
      </div>

      {/* Why-this-won factors */}
      {winner.factors.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {winner.factors.map((f) => (
            <Pill
              key={f.key}
              variant={f.impact === 'positive' ? 'success' : f.impact === 'negative' ? 'danger' : 'default'}
              title={f.explanation}
            >
              {f.label}
            </Pill>
          ))}
        </div>
      )}

      {/* Chart toggle + explain */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-medium text-text-muted">Cost breakdown</span>
        <Segmented value={chartMode} onChange={setChartMode} options={CHART_OPTIONS} size="sm" />
        <ExplainPopover breakdown={winner.cost} />
      </div>

      {/* Chart */}
      {chartMode === 'waterfall' ? (
        <Waterfall steps={waterfallSteps} height={220} />
      ) : (
        <StackedBar
          data={feasibleCandidates.map((c) => ({
            category: `${c.carrierName} ${c.serviceLevel}`,
            breakdown: c.cost,
          }))}
          height={220}
          showLegend
        />
      )}
    </div>
  )
}
