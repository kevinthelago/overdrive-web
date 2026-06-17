import { useMemo } from 'react'
import { useCompetitors } from './api'
import { Choropleth, type ChoroplethDatum } from '@/components/charts/Choropleth'

/**
 * Colours US states by the count of competitors claiming that region.
 * Multi-state regions (e.g. "CA,TX") are split on comma/whitespace.
 */
export function CompetitorMap() {
  const { data, isLoading, isError } = useCompetitors(0, 200)

  const choroplethData = useMemo((): ChoroplethDatum[] => {
    if (!data) return []
    const counts = new Map<string, number>()
    for (const c of data.content) {
      const codes = c.region
        .split(/[,\s]+/)
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s.length === 2)
      for (const code of codes) {
        counts.set(code, (counts.get(code) ?? 0) + 1)
      }
    }
    return Array.from(counts.entries()).map(([stateCode, value]) => ({ stateCode, value }))
  }, [data])

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-md bg-surface-raised" />
  }

  if (isError) {
    return (
      <div className="rounded-md border border-danger/20 bg-danger-muted p-4 text-sm text-danger">
        Failed to load competitor geographic data.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-text-secondary">Competitor Coverage by State</p>
      <Choropleth
        data={choroplethData}
        formatValue={(v) => `${Math.round(v)} competitor${v !== 1 ? 's' : ''}`}
        className="rounded-md border border-border"
      />
    </div>
  )
}
