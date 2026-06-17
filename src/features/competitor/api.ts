import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import {
  CompetitorDetailSchema,
  CompetitorPageSchema,
  type CompetitorDetail,
  type CompetitorPage,
} from './types'

export const competitorKeys = {
  all: ['competitors'] as const,
  list: (page: number, size: number) => ['competitors', 'list', page, size] as const,
  detail: (id: string) => ['competitors', id] as const,
}

export function useCompetitors(page = 0, size = 20) {
  return useQuery<CompetitorPage>({
    queryKey: competitorKeys.list(page, size),
    queryFn: () =>
      apiClient
        .get<unknown>('/competitors', { params: { page, size } })
        .then((raw) => CompetitorPageSchema.parse(raw)),
  })
}

export function useCompetitor(id: string) {
  return useQuery<CompetitorDetail>({
    queryKey: competitorKeys.detail(id),
    queryFn: () =>
      apiClient
        .get<unknown>(`/competitors/${id}`)
        .then((raw) => CompetitorDetailSchema.parse(raw)),
    enabled: Boolean(id),
  })
}
