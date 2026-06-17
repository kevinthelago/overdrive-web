import type { Route } from './types'
import { totalCost } from './types'
import { StackedBar, type StackedBarSeries, type StackedBarDatum } from '@/components/charts/StackedBar'
import { CostBreakdownPanel } from './CostBreakdownPanel'

const SERIES: StackedBarSeries[] = [
  { key: 'lineHaul', label: 'Line Haul' },
  { key: 'fuelSurcharge', label: 'Fuel Surcharge' },
  { key: 'residentialDelivery', label: 'Residential Delivery' },
  { key: 'deliveryAreaSurcharge', label: 'Delivery Area Surcharge' },
  { key: 'dimensionalWeight', label: 'Dimensional Weight' },
  { key: 'signatureRequired', label: 'Signature Required' },
  { key: 'otherAccessorials', label: 'Other Accessorials' },
]

function routeToStackedDatum(route: Route): StackedBarDatum {
  return {
    category: `${route.carrier.scac} – ${route.serviceLevel}`,
    values: {
      lineHaul: route.cost.lineHaul / 100,
      fuelSurcharge: route.cost.fuelSurcharge / 100,
      residentialDelivery: route.cost.residentialDelivery / 100,
      deliveryAreaSurcharge: route.cost.deliveryAreaSurcharge / 100,
      dimensionalWeight: route.cost.dimensionalWeight / 100,
      signatureRequired: route.cost.signatureRequired / 100,
      otherAccessorials: route.cost.otherAccessorials / 100,
    },
  }
}

interface RouteComparisonProps {
  currentRoute: Route
  selectedRoute: Route | null
}

export function RouteComparison({ currentRoute, selectedRoute }: RouteComparisonProps) {
  const routesToCompare = selectedRoute
    ? [currentRoute, selectedRoute]
    : [currentRoute]

  const stackedData: StackedBarDatum[] = routesToCompare.map(routeToStackedDatum)

  // Only show series that have at least one non-zero value
  const activeSeries = SERIES.filter((s) =>
    routesToCompare.some((r) => (r.cost[s.key as keyof typeof r.cost] ?? 0) > 0),
  )

  const savings = selectedRoute
    ? totalCost(currentRoute.cost) - totalCost(selectedRoute.cost)
    : null

  return (
    <div className="space-y-6">
      {/* Cost comparison stacked bar */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-1 font-semibold text-gray-900">Cost Comparison</h3>
        {savings != null && savings > 0 && (
          <p className="mb-3 text-sm text-emerald-600">
            Switching to {selectedRoute!.carrier.name} saves{' '}
            <strong>${(savings / 100).toFixed(2)}</strong> per shipment
          </p>
        )}
        <StackedBar
          series={activeSeries}
          data={stackedData}
          height={260}
          yLabel="Cost (USD)"
          showLegend
        />
      </div>

      {/* Side-by-side breakdown panels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CostBreakdownPanel
          route={currentRoute}
          compareRoute={selectedRoute ?? undefined}
        />
        {selectedRoute && (
          <CostBreakdownPanel
            route={selectedRoute}
            compareRoute={currentRoute}
          />
        )}
      </div>
    </div>
  )
}
