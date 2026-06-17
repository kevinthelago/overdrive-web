import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRouteOpportunities, useRouteOpportunity } from './api'
import { RouteList } from './RouteList'
import { RouteComparison } from './RouteComparison'
import type { RouteFilter } from './types'
import { totalCost } from './types'
import { formatUsd } from '@/components/charts/core'

/** Opportunity list panel */
function OpportunityList({
  onSelect,
  selectedId,
}: {
  onSelect: (id: string) => void
  selectedId: string | null
}) {
  const { data, isLoading, isError } = useRouteOpportunities()

  if (isLoading) return <ListSkeleton />
  if (isError)
    return (
      <p className="p-4 text-sm text-red-500">
        Failed to load routing opportunities. Check API connectivity.
      </p>
    )
  if (!data?.length)
    return <p className="p-4 text-sm text-gray-400">No routing opportunities found.</p>

  return (
    <ul className="divide-y divide-gray-100">
      {data.map((opp) => (
        <li key={opp.shipmentId}>
          <button
            type="button"
            onClick={() => onSelect(opp.shipmentId)}
            className={[
              'w-full px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50',
              selectedId === opp.shipmentId ? 'bg-blue-50' : '',
            ].join(' ')}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-medium text-gray-900">
                {opp.origin} → {opp.destination}
              </span>
              <span className="text-xs font-semibold text-emerald-600">
                Save {formatUsd(opp.bestSavings / 100)}
              </span>
            </div>
            <div className="mt-0.5 flex gap-2 text-xs text-gray-500">
              <span>Current: {formatUsd(totalCost(opp.currentRoute.cost) / 100)}</span>
              <span>·</span>
              <span>{opp.alternativeRoutes.length} alternatives</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}

function ListSkeleton() {
  return (
    <ul className="divide-y divide-gray-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="animate-pulse px-4 py-3">
          <div className="flex justify-between">
            <div className="h-3.5 w-36 rounded bg-gray-200" />
            <div className="h-3.5 w-16 rounded bg-gray-200" />
          </div>
          <div className="mt-2 h-3 w-24 rounded bg-gray-100" />
        </li>
      ))}
    </ul>
  )
}

/** Detail panel for a single shipment opportunity */
function OpportunityDetail({ shipmentId }: { shipmentId: string }) {
  const { data, isLoading, isError } = useRouteOpportunity(shipmentId)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<RouteFilter>({})

  if (isLoading) return <div className="p-6 text-sm text-gray-400 animate-pulse">Loading…</div>
  if (isError || !data)
    return <p className="p-4 text-sm text-red-500">Failed to load shipment details.</p>

  const allRoutes = [data.currentRoute, ...data.alternativeRoutes]
  const selectedRoute = allRoutes.find((r) => r.id === selectedRouteId) ?? null

  return (
    <div className="flex h-full flex-col gap-0">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {data.origin} → {data.destination}
        </h2>
        <p className="text-sm text-gray-500">
          {data.weight} lbs · {data.dimensions.length}″ × {data.dimensions.width}″ ×{' '}
          {data.dimensions.height}″
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Route list sidebar */}
        <div className="w-72 shrink-0 overflow-y-auto border-r border-gray-200 px-4 py-4">
          <RouteList
            routes={allRoutes}
            currentRoute={data.currentRoute}
            selectedRouteId={selectedRouteId ?? data.currentRoute.id}
            onSelect={setSelectedRouteId}
            filter={filter}
            onFilterChange={setFilter}
          />
        </div>

        {/* Comparison panel */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <RouteComparison
            currentRoute={data.currentRoute}
            selectedRoute={
              selectedRoute && selectedRoute.id !== data.currentRoute.id ? selectedRoute : null
            }
          />
        </div>
      </div>
    </div>
  )
}

/** Top-level routing page — list of opportunities + detail pane */
export function RoutingPage() {
  const navigate = useNavigate()
  const { shipmentId } = useParams<{ shipmentId?: string }>()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left panel: opportunities list */}
      <aside className="flex w-80 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-4">
          <h1 className="text-base font-semibold text-gray-900">Routing Opportunities</h1>
          <p className="text-xs text-gray-500">Select a shipment to explore alternatives</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <OpportunityList
            selectedId={shipmentId ?? null}
            onSelect={(id) => navigate(`/routing/${id}`)}
          />
        </div>
      </aside>

      {/* Right panel: detail */}
      <main className="flex-1 overflow-hidden bg-white">
        {shipmentId ? (
          <OpportunityDetail shipmentId={shipmentId} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-400">Select a shipment to view routing options.</p>
          </div>
        )}
      </main>
    </div>
  )
}
