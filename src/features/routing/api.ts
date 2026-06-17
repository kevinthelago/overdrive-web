import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { RouteSolveRequest, RouteSolveResponse } from './types'

export const routingKeys = {
  all: ['routing'] as const,
  solve: (req: RouteSolveRequest) => [...routingKeys.all, 'solve', req] as const,
}

/**
 * Mutation that calls POST /api/routing/solve.
 * The caller supplies the full RouteSolveRequest.
 */
export function useRouteSolve() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: RouteSolveRequest) =>
      apiClient.post<RouteSolveResponse>('/api/routing/solve', req),
    onSuccess: (_data, req) => {
      qc.setQueryData(routingKeys.solve(req), _data)
    },
  })
}
