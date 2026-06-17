import { type HTMLAttributes } from 'react'
import { cn, formatCurrency, formatNumber } from '@/lib/utils'

export interface MoneyDisplayProps extends HTMLAttributes<HTMLSpanElement> {
  value: number
  currency?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeStyles = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-xl',
}

/** Renders a monetary value using IBM Plex Mono with tabular-nums. */
export function MoneyDisplay({ value, currency = 'USD', size = 'md', className, ...props }: MoneyDisplayProps) {
  return (
    <span
      className={cn('font-mono tabular-nums', sizeStyles[size], className)}
      data-tabular-nums
      {...props}
    >
      {formatCurrency(value, currency)}
    </span>
  )
}

export interface MetricDisplayProps extends HTMLAttributes<HTMLSpanElement> {
  value: number
  unit?: string
  precision?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

/** Renders a numeric metric using IBM Plex Mono with tabular-nums. */
export function MetricDisplay({ value, unit, precision = 1, size = 'md', className, ...props }: MetricDisplayProps) {
  const formatted = formatNumber(value, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  })
  return (
    <span
      className={cn('font-mono tabular-nums', sizeStyles[size], className)}
      data-tabular-nums
      {...props}
    >
      {formatted}
      {unit && <span className="ml-0.5 text-text-muted">{unit}</span>}
    </span>
  )
}
