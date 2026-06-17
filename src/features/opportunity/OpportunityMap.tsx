import * as d3 from 'd3'
import { useGeographicOpportunities } from './api'
import { Choropleth, type ChoroplethDatum } from '@/components/charts/Choropleth'

const COLOR_SCHEME = d3.schemeGreens[7] as readonly string[]

export function OpportunityMap() {
  const { data, isLoading, isError } = useGeographicOpportunities()

  const choroplethData: ChoroplethDatum[] = (data ?? []).map((d) => ({
    stateCode: d.stateCode,
    value: d.score,
  }))

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-md bg-surface-raised" />
  }

  if (isError) {
    return (
      <div className="rounded-md border border-danger/20 bg-danger-muted p-4 text-sm text-danger">
        Failed to load opportunity geographic data.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-text-secondary">Opportunity Score by State</p>
      <Choropleth
        data={choroplethData}
        colorScheme={COLOR_SCHEME}
        formatValue={(v) => `Score: ${v.toFixed(1)}`}
        className="rounded-md border border-border"
      />
    </div>
  )
}
