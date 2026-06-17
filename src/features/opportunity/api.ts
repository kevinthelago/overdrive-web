import { useQuery } from '@tanstack/react-query'
import {
  OpportunityDetailSchema,
  OpportunityPageSchema,
  type Opportunity,
  type OpportunityDetail,
  type OpportunityPage,
  type OpportunityType,
  type StateOpportunityScore,
} from './types'
import { z } from 'zod'

const API_BASE = (import.meta as ImportMeta & { env: Record<string, string> }).env
  .VITE_API_BASE_URL ?? '/api'

async function fetchJson<T>(path: string, schema: { parse: (v: unknown) => T }): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${path}`)
  return schema.parse(await res.json())
}

export const opportunityKeys = {
  all: ['opportunities'] as const,
  list: (filters: OpportunityListFilters) => ['opportunities', 'list', filters] as const,
  detail: (id: string) => ['opportunities', id] as const,
  geographic: () => ['opportunities', 'geographic'] as const,
}

export type OpportunityListFilters = {
  page?: number
  pageSize?: number
  type?: OpportunityType
  region?: string
  minScore?: number
}

export function useOpportunities(filters: OpportunityListFilters = {}) {
  const { page = 0, pageSize = 20, type, region, minScore } = filters
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (type) params.set('type', type)
  if (region) params.set('region', region)
  if (minScore != null) params.set('minScore', String(minScore))

  return useQuery<OpportunityPage>({
    queryKey: opportunityKeys.list(filters),
    queryFn: () => fetchJson(`/opportunities?${params}`, OpportunityPageSchema),
  })
}

export function useOpportunity(id: string) {
  return useQuery<OpportunityDetail>({
    queryKey: opportunityKeys.detail(id),
    queryFn: () => fetchJson(`/opportunities/${id}`, OpportunityDetailSchema),
    enabled: Boolean(id),
  })
}

const StateScoreArraySchema = z.array(
  z.object({ stateCode: z.string(), score: z.number(), opportunityCount: z.number() })
)

export function useGeographicOpportunities() {
  return useQuery<StateOpportunityScore[]>({
    queryKey: opportunityKeys.geographic(),
    queryFn: () => fetchJson('/opportunities/geographic', StateScoreArraySchema),
  })
}
