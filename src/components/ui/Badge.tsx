import React from 'react'
import { clsx } from 'clsx'

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'outline'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-accent text-white',
        variant === 'secondary' && 'bg-white/10 text-text-secondary',
        variant === 'outline' && 'border border-border text-text-secondary',
        className,
      )}
    >
      {children}
    </span>
  )
}
