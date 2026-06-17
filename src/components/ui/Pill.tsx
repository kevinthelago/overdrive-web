import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type PillVariant = 'default' | 'success' | 'danger' | 'warning' | 'accent'

export interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: PillVariant
}

const variantStyles: Record<PillVariant, string> = {
  default: 'bg-surface-raised text-text-secondary border-border',
  success: 'bg-success-muted text-success border-success/20',
  danger: 'bg-danger-muted text-danger border-danger/20',
  warning: 'bg-warning-muted text-warning border-warning/20',
  accent: 'bg-accent-muted text-accent border-accent/20',
}

export function Pill({ className, variant = 'default', children, ...props }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
