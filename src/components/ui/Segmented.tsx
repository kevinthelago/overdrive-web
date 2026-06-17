import * as Tabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
  disabled?: boolean
}

export interface SegmentedProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
  className?: string
  size?: 'sm' | 'md'
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = 'md',
}: SegmentedProps<T>) {
  return (
    <Tabs.Root value={value} onValueChange={(v) => onChange(v as T)}>
      <Tabs.List
        className={cn(
          'inline-flex items-center rounded-md border border-border bg-surface p-0.5 gap-0.5',
          className,
        )}
      >
        {options.map((opt) => (
          <Tabs.Trigger
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled}
            className={cn(
              'rounded px-3 text-text-secondary transition-colors',
              'data-[state=active]:bg-surface-raised data-[state=active]:text-text-primary data-[state=active]:shadow-sm',
              'hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
              size === 'sm' ? 'py-0.5 text-xs' : 'py-1 text-sm',
            )}
          >
            {opt.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  )
}
