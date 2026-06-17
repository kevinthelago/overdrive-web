import * as Popover from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import type { CostBreakdown, Money } from '@/lib/api/types'
import { COST_BREAKDOWN_KEYS, COST_KEY_LABELS, COST_KEY_COLOR } from '@/components/charts/core'

interface ExplainPopoverProps {
  breakdown: CostBreakdown
}

/** Popover showing each cost component's formula: label = $value */
export function ExplainPopover({ breakdown }: ExplainPopoverProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-5 w-5 items-center justify-center rounded-full',
            'border border-border bg-surface-raised text-xs text-text-muted',
            'hover:border-accent hover:text-accent transition-colors',
          )}
          aria-label="Explain cost breakdown"
        >
          ?
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="right"
          align="start"
          sideOffset={8}
          className={cn(
            'z-50 w-64 rounded-md border border-border bg-surface p-3 shadow-elevated',
            'text-xs text-text-secondary',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          )}
        >
          <p className="mb-2 font-semibold text-text-primary">Cost formula</p>
          <dl className="space-y-1.5">
            {COST_BREAKDOWN_KEYS.map((key) => {
              const money = breakdown[key] as Money
              if (money.amount === 0) return null
              return (
                <div key={key} className="flex items-center justify-between gap-2">
                  <dt className="flex items-center gap-1.5 text-text-secondary">
                    <span
                      className="h-2 w-2 shrink-0 rounded-sm"
                      style={{ background: COST_KEY_COLOR[key] }}
                    />
                    {COST_KEY_LABELS[key]}
                  </dt>
                  <dd className="font-mono text-text-primary tabular-nums">
                    {formatCurrency(money.amount, money.currency)}
                  </dd>
                </div>
              )
            })}
            <div className="flex items-center justify-between border-t border-border pt-1.5">
              <dt className="font-semibold text-text-primary">Total</dt>
              <dd className="font-mono font-semibold text-text-primary tabular-nums">
                {formatCurrency(breakdown.total.amount, breakdown.total.currency)}
              </dd>
            </div>
          </dl>
          <Popover.Arrow className="fill-border" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
