import { useState } from 'react'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { Pill } from '@/components/ui/Pill'
import { cn } from '@/lib/utils'
import { COST_BREAKDOWN_KEYS, COST_KEY_LABELS, COST_KEY_COLOR } from '@/components/charts/core'
import type { Money } from '@/lib/api/types'
import type { SolvedCandidate } from './types'

interface CandidateTableProps {
  candidates: SolvedCandidate[]
  /** carrierId + serviceLevel of the winning row */
  winnerId?: string
  className?: string
}

function moneyAmount(m: Money): number { return m.amount }
function moneyCurrency(m: Money): string { return m.currency }

function DeltaCell({ delta }: { delta: Money }) {
  const isNeg = delta.amount < 0
  const isPos = delta.amount > 0
  return (
    <span className={cn('font-mono tabular-nums text-sm', isNeg && 'text-success', isPos && 'text-danger')}>
      {isNeg ? '−' : isPos ? '+' : ''}<MoneyDisplay
        value={Math.abs(delta.amount)}
        currency={delta.currency}
        size="sm"
      />
    </span>
  )
}

function BreakdownRow({ candidate }: { candidate: SolvedCandidate }) {
  return (
    <tr className="border-b border-border-subtle bg-surface-raised/40">
      <td />
      <td colSpan={4} className="px-3 py-3">
        <div className="space-y-2">
          {/* Per-component cost cells */}
          <div className="flex flex-wrap gap-x-6 gap-y-1.5">
            {COST_BREAKDOWN_KEYS.map((key) => {
              const m = candidate.cost[key] as Money
              if (m.amount === 0) return null
              return (
                <div key={key} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="h-2 w-2 shrink-0 rounded-sm"
                    style={{ background: COST_KEY_COLOR[key] }}
                  />
                  <span className="text-text-muted">{COST_KEY_LABELS[key]}:</span>
                  <MoneyDisplay value={m.amount} currency={m.currency} size="sm" className="text-text-primary" />
                </div>
              )
            })}
          </div>

          {/* Binding constraint (infeasible) or factor notes */}
          {candidate.infeasible && candidate.bindingConstraint && (
            <p className="text-xs text-danger">
              <span className="font-medium">Constraint: </span>
              {candidate.bindingConstraint}
            </p>
          )}
          {!candidate.infeasible && candidate.factors.length > 0 && (
            <p className="text-xs text-text-muted">
              {candidate.factors.map((f) => f.explanation).join(' · ')}
            </p>
          )}
        </div>
      </td>
    </tr>
  )
}

export function CandidateTable({ candidates, winnerId, className }: CandidateTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  return (
    <div className={cn('overflow-auto rounded-md border border-border', className)}>
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 z-10 border-b border-border bg-surface">
          <tr>
            <th className="w-8 px-3 py-2.5" />
            <th className="px-3 py-2.5 text-left font-medium text-text-muted">Carrier / Service</th>
            <th className="px-3 py-2.5 text-right font-medium text-text-muted">Freight</th>
            <th className="px-3 py-2.5 text-right font-medium text-text-muted">Delivered</th>
            <th className="px-3 py-2.5 text-right font-medium text-text-muted">vs Current</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => {
            const rowId = `${c.carrierId}-${c.serviceLevel}`
            const isWinner = rowId === winnerId
            const isExpanded = expanded.has(rowId)

            return [
              <tr
                key={rowId}
                className={cn(
                  'border-b border-border-subtle last:border-0',
                  'cursor-pointer hover:bg-surface-raised transition-colors',
                  isWinner && 'bg-accent-muted/30 hover:bg-accent-muted/50',
                  c.infeasible && 'opacity-40',
                )}
                onClick={() => toggle(rowId)}
                aria-expanded={isExpanded}
              >
                {/* Expand chevron */}
                <td className="px-3 py-2.5 text-text-muted">
                  <span
                    className={cn(
                      'inline-block transition-transform text-xs',
                      isExpanded && 'rotate-90',
                    )}
                  >
                    ›
                  </span>
                </td>

                {/* Carrier / service */}
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn('font-medium', isWinner ? 'text-text-primary' : 'text-text-secondary')}>
                      {c.carrierName}
                    </span>
                    <span className="text-xs text-text-muted">{c.serviceLevel}</span>
                    {isWinner && <Pill variant="success">BEST</Pill>}
                    {c.infeasible && <Pill variant="danger">N/A</Pill>}
                    <span className="text-xs text-text-muted">{c.transitDays}d</span>
                  </div>
                </td>

                {/* Freight (base rate) */}
                <td className="px-3 py-2.5 text-right">
                  <MoneyDisplay
                    value={moneyAmount(c.cost.baseRate)}
                    currency={moneyCurrency(c.cost.baseRate)}
                    size="sm"
                  />
                </td>

                {/* Delivered total */}
                <td className="px-3 py-2.5 text-right">
                  <MoneyDisplay
                    value={moneyAmount(c.cost.total)}
                    currency={moneyCurrency(c.cost.total)}
                    size="sm"
                    className={isWinner ? 'text-text-primary font-semibold' : undefined}
                  />
                </td>

                {/* Delta vs current */}
                <td className="px-3 py-2.5 text-right">
                  {c.infeasible ? (
                    <span className="text-text-muted text-xs">—</span>
                  ) : (
                    <DeltaCell delta={c.deltaCost} />
                  )}
                </td>
              </tr>,

              isExpanded && (
                <BreakdownRow key={`${rowId}-expanded`} candidate={c} />
              ),
            ]
          })}
        </tbody>
      </table>
    </div>
  )
}
