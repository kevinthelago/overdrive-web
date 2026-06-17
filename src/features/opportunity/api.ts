import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { apiClient } from '@/lib/api'
import {
  OpportunityDetailSchema,
  OpportunityPageSchema,
  type OpportunityDetail,
  type OpportunityPage,
  type OpportunityType,
  type StateOpportunityScore,
} from './types'

export const opportunityKeys = {
  all: ['opportunities'] as const,
  list: (filters: OpportunityListFilters) => ['opportunities', 'list', filters] as const,
  detail: (id: string) => ['opportunities', id] as const,
  geographic: () => ['opportunities', 'geographic'] as const,
}

export type OpportunityListFilters = {
  page?: number
  size?: number
  type?: OpportunityType
  region?: string
  minScore?: number
}

export function useOpportunities(filters: OpportunityListFilters = {}) {
  const { page = 0, size = 20, type, region, minScore } = filters
  return useQuery<OpportunityPage>({
    queryKey: opportunityKeys.list(filters),
    queryFn: () =>
      apiClient
        .get<unknown>('/opportunities', {
          params: { page, size, type, region, minScore },
        })
        .then((raw) => OpportunityPageSchema.parse(raw)),
  })
}

export function useOpportunity(id: string) {
  return useQuery<OpportunityDetail>({
    queryKey: opportunityKeys.detail(id),
    queryFn: () =>
      apiClient
        .get<unknown>(`/opportunities/${id}`)
        .then((raw) => OpportunityDetailSchema.parse(raw)),
    enabled: Boolean(id),
  })
}

const StateScoreArraySchema = z.array(
  z.object({ stateCode: z.string(), score: z.number(), opportunityCount: z.number() })
)

export function useGeographicOpportunities() {
  return useQuery<StateOpportunityScore[]>({
    queryKey: opportunityKeys.geographic(),
    queryFn: () =>
      apiClient
        .get<unknown>('/opportunities/geographic')
        .then((raw) => StateScoreArraySchema.parse(raw)),
  })
}
