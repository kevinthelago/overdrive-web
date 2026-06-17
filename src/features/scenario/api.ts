import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  Scenario,
  ScenarioCompareRequest,
  ScenarioCompareResult,
  ScenarioCreateRequest,
  ScenarioUpdateRequest,
} from './types';

const SCENARIOS_KEY = ['scenarios'] as const;
const scenarioKey = (id: string) => ['scenarios', id] as const;

export function useScenarios() {
  return useQuery({
    queryKey: SCENARIOS_KEY,
    queryFn: () => apiClient.get<Scenario[]>('/api/scenarios'),
  });
}

export function useScenario(id: string) {
  return useQuery({
    queryKey: scenarioKey(id),
    queryFn: () => apiClient.get<Scenario>(`/api/scenarios/${id}`),
    enabled: !!id,
  });
}

export function useCreateScenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ScenarioCreateRequest) =>
      apiClient.post<Scenario>('/api/scenarios', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: SCENARIOS_KEY }),
  });
}

export function useUpdateScenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ScenarioUpdateRequest }) =>
      apiClient.put<Scenario>(`/api/scenarios/${id}`, body),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: SCENARIOS_KEY });
      qc.invalidateQueries({ queryKey: scenarioKey(id) });
    },
  });
}

export function useDeleteScenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/scenarios/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: SCENARIOS_KEY }),
  });
}

export function useCompareScenario(scenarioId: string) {
  return useMutation({
    mutationFn: (body: ScenarioCompareRequest) =>
      apiClient.post<ScenarioCompareResult>(
        `/api/scenarios/${scenarioId}/compare`,
        body,
      ),
  });
}
