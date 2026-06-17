import { useQuery } from '@tanstack/react-query'
import type { Route, RouteFilter, RouteOpportunity } from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`)
  }
  return res.json() as Promise<T>
}

// ── Query key factory ──────────────────────────────────────────────────────

export const routingKeys = {
  all: ['routing'] as const,
  opportunities: (filter?: RouteFilter) => [...routingKeys.all, 'opportunities', filter] as const,
  opportunity: (shipmentId: string) => [...routingKeys.all, 'opportunity', shipmentId] as const,
  routes: (shipmentId: string, filter?: RouteFilter) =>
    [...routingKeys.all, 'routes', shipmentId, filter] as const,
}

// ── Query hooks ────────────────────────────────────────────────────────────

/** List all shipments that have routing opportunities */
export function useRouteOpportunities(filter?: RouteFilter) {
  return useQuery({
    queryKey: routingKeys.opportunities(filter),
    queryFn: () => {
      const params = new URLSearchParams()
      if (filter?.mode?.length) params.set('mode', filter.mode.join(','))
      if (filter?.maxTransitDays != null) params.set('maxTransitDays', String(filter.maxTransitDays))
      if (filter?.carriersInclude?.length) params.set('carriersInclude', filter.carriersInclude.join(','))
      if (filter?.carriersExclude?.length) params.set('carriersExclude', filter.carriersExclude.join(','))
      const qs = params.toString()
      return fetchJson<RouteOpportunity[]>(`/api/routing/opportunities${qs ? `?${qs}` : ''}`)
    },
  })
}

/** Get route opportunity details for a single shipment */
export function useRouteOpportunity(shipmentId: string) {
  return useQuery({
    queryKey: routingKeys.opportunity(shipmentId),
    queryFn: () => fetchJson<RouteOpportunity>(`/api/routing/opportunities/${shipmentId}`),
    enabled: Boolean(shipmentId),
  })
}

/** Get all available routes for a shipment */
export function useRoutes(shipmentId: string, filter?: RouteFilter) {
  return useQuery({
    queryKey: routingKeys.routes(shipmentId, filter),
    queryFn: () => {
      const params = new URLSearchParams()
      if (filter?.mode?.length) params.set('mode', filter.mode.join(','))
      if (filter?.maxTransitDays != null) params.set('maxTransitDays', String(filter.maxTransitDays))
      return fetchJson<Route[]>(`/api/routing/shipments/${shipmentId}/routes?${params}`)
    },
    enabled: Boolean(shipmentId),
  })
}
