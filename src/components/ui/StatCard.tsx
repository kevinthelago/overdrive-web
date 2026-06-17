import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  value: ReactNode
  subvalue?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  loading?: boolean
  empty?: boolean
}

export function StatCard({
  label,
  value,
  subvalue,
  trend,
  trendLabel,
  loading = false,
  empty = false,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-md border border-border bg-surface p-4 shadow-card',
        className,
      )}
      {...props}
    >
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</p>

      {loading ? (
        <div className="mt-2 space-y-2">
          <div className="h-7 w-24 animate-pulse rounded bg-surface-raised" />
          <div className="h-4 w-16 animate-pulse rounded bg-surface-raised" />
        </div>
      ) : empty ? (
        <p className="mt-2 text-sm text-text-muted">—</p>
      ) : (
        <>
          <div className="mt-1 font-mono tabular-nums text-2xl font-semibold text-text-primary" data-tabular-nums>
            {value}
          </div>
          {(subvalue || trendLabel) && (
            <div className="mt-1 flex items-center gap-2">
              {trendLabel && (
                <span
                  className={cn('text-xs font-medium', {
                    'text-success': trend === 'up',
                    'text-danger': trend === 'down',
                    'text-text-muted': trend === 'neutral' || !trend,
                  })}
                >
                  {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendLabel}
                </span>
              )}
              {subvalue && <span className="text-xs text-text-muted">{subvalue}</span>}
            </div>
          )}
        </>
      )}
    </div>
  )
}
