import { useAppStore } from '@/state/appStore'
import { Input } from '@/components/ui'
import { cn } from '@/lib/utils'

export function Header() {
  const destinationZip = useAppStore((s) => s.destinationZip)
  const setDestinationZip = useAppStore((s) => s.setDestinationZip)
  const activeScenarioId = useAppStore((s) => s.activeScenarioId)

  return (
    <header
      className={cn(
        'flex h-header shrink-0 items-center gap-4 border-b border-border bg-surface px-4',
      )}
    >
      {/* Product context selector — placeholder; populated by feature stream */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-text-muted whitespace-nowrap" htmlFor="product-selector">
          Product
        </label>
        <select
          id="product-selector"
          className={cn(
            'h-7 rounded border border-border bg-surface-raised px-2 text-xs text-text-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
          )}
          aria-label="Select product"
        >
          <option value="">All products</option>
        </select>
      </div>

      <div className="h-4 w-px bg-border" aria-hidden />

      {/* Ship-to ZIP */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-text-muted whitespace-nowrap" htmlFor="destination-zip">
          Ship-to ZIP
        </label>
        <Input
          id="destination-zip"
          value={destinationZip}
          onChange={(e) => setDestinationZip(e.target.value)}
          placeholder="00000"
          maxLength={10}
          className="h-7 w-24 text-xs font-mono"
          aria-label="Destination ZIP code"
        />
      </div>

      <div className="h-4 w-px bg-border" aria-hidden />

      {/* Scenario selector */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-text-muted whitespace-nowrap" htmlFor="scenario-selector">
          Scenario
        </label>
        <select
          id="scenario-selector"
          className={cn(
            'h-7 rounded border border-border bg-surface-raised px-2 text-xs text-text-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
          )}
          value={activeScenarioId ?? ''}
          onChange={(e) => useAppStore.getState().setActiveScenarioId(e.target.value || null)}
          aria-label="Select scenario"
        >
          <option value="">Baseline</option>
        </select>
      </div>

      {activeScenarioId && (
        <span className="rounded-full bg-accent-muted px-2 py-0.5 text-2xs font-medium text-accent">
          scenario active
        </span>
      )}
    </header>
  )
}
