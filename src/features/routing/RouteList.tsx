import { useState } from 'react'
import type { Route, RouteFilter, RouteSortKey } from './types'
import { totalCost } from './types'
import { RouteCard } from './RouteCard'

interface RouteListProps {
  routes: Route[]
  currentRoute: Route
  selectedRouteId: string | null
  onSelect: (routeId: string) => void
  filter: RouteFilter
  onFilterChange: (filter: RouteFilter) => void
}

function sortRoutes(routes: Route[], sort: RouteSortKey): Route[] {
  return [...routes].sort((a, b) => {
    let cmp = 0
    if (sort.field === 'cost') cmp = totalCost(a.cost) - totalCost(b.cost)
    else if (sort.field === 'transitDays') cmp = a.transitDays - b.transitDays
    else if (sort.field === 'carrier') cmp = a.carrier.name.localeCompare(b.carrier.name)
    return sort.direction === 'asc' ? cmp : -cmp
  })
}

export function RouteList({
  routes,
  currentRoute,
  selectedRouteId,
  onSelect,
  filter,
  onFilterChange,
}: RouteListProps) {
  const [sort, setSort] = useState<RouteSortKey>({ field: 'cost', direction: 'asc' })

  const currentCost = totalCost(currentRoute.cost)

  const filtered = routes.filter((r) => {
    if (filter.mode?.length && !filter.mode.includes(r.carrier.mode)) return false
    if (filter.maxTransitDays != null && r.transitDays > filter.maxTransitDays) return false
    if (filter.carriersExclude?.includes(r.carrier.scac)) return false
    if (filter.carriersInclude?.length && !filter.carriersInclude.includes(r.carrier.scac))
      return false
    return true
  })

  const sorted = sortRoutes(filtered, sort)

  const allModes = [...new Set(routes.map((r) => r.carrier.mode))]

  function toggleMode(mode: string) {
    const modes = filter.mode ?? []
    const next = modes.includes(mode as Route['carrier']['mode'])
      ? modes.filter((m) => m !== mode)
      : [...modes, mode as Route['carrier']['mode']]
    onFilterChange({ ...filter, mode: next.length ? next : undefined })
  }

  function toggleSort(field: RouteSortKey['field']) {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' },
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Mode filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {allModes.map((mode) => {
          const active = !filter.mode?.length || filter.mode.includes(mode)
          return (
            <button
              key={mode}
              type="button"
              onClick={() => toggleMode(mode)}
              className={[
                'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                active
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              ].join(' ')}
            >
              {mode}
            </button>
          )
        })}
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>Sort:</span>
        {(['cost', 'transitDays', 'carrier'] as const).map((field) => (
          <button
            key={field}
            type="button"
            onClick={() => toggleSort(field)}
            className={[
              'rounded px-1.5 py-0.5 font-medium transition-colors',
              sort.field === field
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ].join(' ')}
          >
            {field === 'cost' ? 'Cost' : field === 'transitDays' ? 'Transit' : 'Carrier'}
            {sort.field === field && (sort.direction === 'asc' ? ' ↑' : ' ↓')}
          </button>
        ))}
        <span className="ml-auto text-gray-400">{sorted.length} routes</span>
      </div>

      {/* Route cards */}
      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No routes match the current filter.</p>
      ) : (
        sorted.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            isSelected={selectedRouteId === route.id}
            isCurrent={route.id === currentRoute.id}
            currentCost={currentCost}
            onSelect={() => onSelect(route.id)}
          />
        ))
      )}
    </div>
  )
}
