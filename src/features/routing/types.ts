import type { CostBreakdown, Money, RouteCandidate } from '@/lib/api/types'

export type { CostBreakdown, Money, RouteCandidate }
export type { RouteFactor } from '@/lib/api/types'

// ── Request / response DTOs ─────────────────────────────────────────────────

export interface RouteSolveRequest {
  productId: string
  destinationZip: string
  serviceLevel: string
  quantity: number
  scenarioId?: string | null
}

export interface RouteSolveResponse {
  /** Ordered cheapest-first; first entry is the winner. */
  candidates: SolvedCandidate[]
  /** True when every carrier returned infeasible. */
  overConstrained: boolean
}

export interface SolvedCandidate extends RouteCandidate {
  /** Delta cost vs current/baseline (negative = cheaper) */
  deltaCost: Money
  /** Whether this route is currently infeasible given the constraints */
  infeasible: boolean
  /** The binding constraint that makes this route infeasible, if any */
  bindingConstraint?: string
}

// ── Service-level options ────────────────────────────────────────────────────

export type ServiceLevel = 'GROUND' | 'EXPRESS' | 'PRIORITY'

export const SERVICE_LEVELS: { value: ServiceLevel; label: string }[] = [
  { value: 'GROUND', label: 'Ground' },
  { value: 'EXPRESS', label: 'Express' },
  { value: 'PRIORITY', label: 'Priority' },
]

// ── UI state ─────────────────────────────────────────────────────────────────

export type ChartMode = 'waterfall' | 'stacked'
