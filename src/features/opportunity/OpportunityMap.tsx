import { useGeographicOpportunities } from './api'
import { Choropleth, type ChoroplethDatum } from '../../components/charts/Choropleth'
import * as d3 from 'd3'

const COLOR_SCHEME = d3.schemeGreens[7] as readonly string[]

export function OpportunityMap() {
  const { data, isLoading, isError } = useGeographicOpportunities()

  const choroplethData: ChoroplethDatum[] = (data ?? []).map((d) => ({
    stateCode: d.stateCode,
    value: d.score,
  }))

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
        Failed to load opportunity geographic data.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-700">Opportunity Score by State</h3>
      <Choropleth
        data={choroplethData}
        colorScheme={COLOR_SCHEME}
        formatValue={(v) => `Score: ${v.toFixed(1)}`}
        className="rounded-lg border border-gray-200"
      />
    </div>
  )
}
