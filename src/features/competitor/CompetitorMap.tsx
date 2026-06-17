import { useMemo } from 'react'
import { useCompetitors } from './api'
import { Choropleth, type ChoroplethDatum } from '../../components/charts/Choropleth'

/**
 * Renders a US choropleth coloured by the number of competitors present in each state/region.
 * Regions from the API are treated as state codes; multi-state regions are split on comma/space.
 */
export function CompetitorMap() {
  const { data, isLoading, isError } = useCompetitors(0, 200)

  const choroplethData = useMemo((): ChoroplethDatum[] => {
    if (!data) return []
    const counts = new Map<string, number>()
    for (const c of data.items) {
      // region may be "CA" or "CA,TX,NV" or a single region name
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
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
        Loading map…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
        Failed to load competitor geographic data.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-700">Competitor Coverage by State</h3>
      <Choropleth
        data={choroplethData}
        formatValue={(v) => `${Math.round(v)} competitor${v !== 1 ? 's' : ''}`}
        className="rounded-lg border border-gray-200"
      />
    </div>
  )
}
