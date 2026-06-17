import type { CostBreakdown, Route } from './types'
import { totalCost } from './types'
import { Waterfall, type WaterfallStep } from '@/components/charts/Waterfall'
import { formatUsd } from '@/components/charts/core'

const COST_LABELS: Record<keyof CostBreakdown, string> = {
  lineHaul: 'Line Haul',
  fuelSurcharge: 'Fuel Surcharge',
  residentialDelivery: 'Residential Delivery',
  deliveryAreaSurcharge: 'Delivery Area Surcharge',
  dimensionalWeight: 'Dimensional Weight',
  signatureRequired: 'Signature Required',
  otherAccessorials: 'Other Accessorials',
}

function breakdownToWaterfallSteps(cost: CostBreakdown): WaterfallStep[] {
  const steps: WaterfallStep[] = []
  let runningTotal = 0

  for (const [key, value] of Object.entries(cost) as [keyof CostBreakdown, number][]) {
    if (value === 0) continue
    // First non-zero component is the "start" total
    if (runningTotal === 0 && steps.length === 0) {
      steps.push({ label: COST_LABELS[key], value: value / 100, kind: 'total' })
      runningTotal = value
    } else {
      steps.push({ label: COST_LABELS[key], value: value / 100, kind: 'delta' })
      runningTotal += value
    }
  }

  steps.push({ label: 'Total', value: runningTotal / 100, kind: 'total' })
  return steps
}

interface CostBreakdownPanelProps {
  route: Route
  compareRoute?: Route
}

export function CostBreakdownPanel({ route, compareRoute }: CostBreakdownPanelProps) {
  const steps = breakdownToWaterfallSteps(route.cost)
  const total = totalCost(route.cost)
  const compareTotal = compareRoute ? totalCost(compareRoute.cost) : null
  const savings = compareTotal != null ? compareTotal - total : null

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{route.carrier.name}</h3>
          <p className="text-sm text-gray-500">{route.serviceLevel}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">{formatUsd(total / 100)}</p>
          {savings != null && savings > 0 && (
            <p className="text-sm font-medium text-emerald-600">
              Saves {formatUsd(savings / 100)} vs current
            </p>
          )}
        </div>
      </div>

      <Waterfall steps={steps} height={240} currencyLabel="Cost (USD)" />

      <table className="mt-3 w-full text-xs">
        <tbody>
          {(Object.entries(route.cost) as [keyof CostBreakdown, number][])
            .filter(([, v]) => v > 0)
            .map(([key, value]) => (
              <tr key={key} className="border-t border-gray-100">
                <td className="py-1 text-gray-600">{COST_LABELS[key]}</td>
                <td className="py-1 text-right font-mono text-gray-900">{formatUsd(value / 100)}</td>
              </tr>
            ))}
          <tr className="border-t-2 border-gray-300">
            <td className="py-1 font-semibold text-gray-900">Total</td>
            <td className="py-1 text-right font-mono font-semibold text-gray-900">
              {formatUsd(total / 100)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
