import { useQuery } from '@tanstack/react-query'
import {
  CompetitorDetailSchema,
  CompetitorPageSchema,
  type Competitor,
  type CompetitorDetail,
  type CompetitorPage,
} from './types'

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

export const competitorKeys = {
  all: ['competitors'] as const,
  list: (page: number, pageSize: number) => ['competitors', 'list', page, pageSize] as const,
  detail: (id: string) => ['competitors', id] as const,
}

export function useCompetitors(page = 0, pageSize = 20) {
  return useQuery<CompetitorPage>({
    queryKey: competitorKeys.list(page, pageSize),
    queryFn: () =>
      fetchJson(`/competitors?page=${page}&pageSize=${pageSize}`, CompetitorPageSchema),
  })
}

export function useCompetitor(id: string) {
  return useQuery<CompetitorDetail>({
    queryKey: competitorKeys.detail(id),
    queryFn: () => fetchJson(`/competitors/${id}`, CompetitorDetailSchema),
    enabled: Boolean(id),
  })
}
