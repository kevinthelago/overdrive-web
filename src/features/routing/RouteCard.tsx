import type { Route } from './types'
import { totalCost } from './types'
import { formatUsd } from '@/components/charts/core'

interface RouteCardProps {
  route: Route
  isSelected?: boolean
  isCurrent?: boolean
  currentCost?: number
  onSelect?: () => void
}

const MODE_BADGE: Record<string, string> = {
  LTL: 'bg-blue-100 text-blue-800',
  TL: 'bg-violet-100 text-violet-800',
  Parcel: 'bg-emerald-100 text-emerald-800',
  Rail: 'bg-amber-100 text-amber-800',
  Intermodal: 'bg-cyan-100 text-cyan-800',
}

export function RouteCard({
  route,
  isSelected = false,
  isCurrent = false,
  currentCost,
  onSelect,
}: RouteCardProps) {
  const cost = totalCost(route.cost)
  const savings = currentCost != null ? currentCost - cost : null

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'group w-full rounded-lg border p-4 text-left transition-all',
        isSelected
          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
      ].join(' ')}
      aria-pressed={isSelected}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate font-medium text-gray-900">{route.carrier.name}</span>
            <span
              className={`rounded px-1.5 py-0.5 text-xs font-medium ${MODE_BADGE[route.carrier.mode] ?? 'bg-gray-100 text-gray-700'}`}
            >
              {route.carrier.mode}
            </span>
            {isCurrent && (
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                Current
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-gray-500">{route.serviceLevel}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-semibold text-gray-900">{formatUsd(cost / 100)}</p>
          {savings != null && savings > 0 && (
            <p className="text-xs font-medium text-emerald-600">
              Save {formatUsd(savings / 100)}
            </p>
          )}
          {savings != null && savings < 0 && (
            <p className="text-xs font-medium text-red-500">
              +{formatUsd(Math.abs(savings) / 100)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
        <span>{route.transitDays} day{route.transitDays !== 1 ? 's' : ''} transit</span>
        <span className="text-gray-300">·</span>
        <span>{route.carrier.scac}</span>
        <span className="text-gray-300">·</span>
        <span>{route.origin} → {route.destination}</span>
      </div>
    </button>
  )
}
