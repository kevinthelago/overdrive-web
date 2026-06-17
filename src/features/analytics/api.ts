import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  AnalyticsParams,
  CostBreakdownDistribution,
  CompetitorMatrix,
  FreightAnalytics,
  OpportunityRankingItem,
  RegionOpportunity,
  SavingsDistribution,
  WarehouseUtilization,
} from './types';

function queryParams(params: AnalyticsParams): Record<string, string | undefined> {
  return { scenarioId: params.scenarioId };
}

export function useAnalyticsCostBreakdown(params: AnalyticsParams) {
  return useQuery({
    queryKey: ['analytics', 'cost-breakdown', params.scenarioId],
    queryFn: () => apiClient.get<CostBreakdownDistribution>('/api/analytics/cost-breakdown', { params: queryParams(params) }),
  });
}

export function useAnalyticsFreight(params: AnalyticsParams) {
  return useQuery({
    queryKey: ['analytics', 'freight', params.scenarioId],
    queryFn: () => apiClient.get<FreightAnalytics>('/api/analytics/freight', { params: queryParams(params) }),
  });
}

export function useAnalyticsWarehouseUtilization(params: AnalyticsParams) {
  return useQuery({
    queryKey: ['analytics', 'warehouse-utilization', params.scenarioId],
    queryFn: () => apiClient.get<WarehouseUtilization[]>('/api/analytics/warehouse-utilization', { params: queryParams(params) }),
  });
}

export function useAnalyticsSavings(params: AnalyticsParams) {
  return useQuery({
    queryKey: ['analytics', 'savings', params.scenarioId],
    queryFn: () => apiClient.get<SavingsDistribution>('/api/analytics/savings', { params: queryParams(params) }),
  });
}

export function useAnalyticsCompetitorMatrix(params: AnalyticsParams) {
  return useQuery({
    queryKey: ['analytics', 'competitor-matrix', params.scenarioId],
    queryFn: () => apiClient.get<CompetitorMatrix>('/api/analytics/competitor-matrix', { params: queryParams(params) }),
  });
}

export function useAnalyticsOpportunityByRegion(params: AnalyticsParams) {
  return useQuery({
    queryKey: ['analytics', 'opportunity-by-region', params.scenarioId],
    queryFn: () => apiClient.get<RegionOpportunity[]>('/api/analytics/opportunity-by-region', { params: queryParams(params) }),
  });
}

export function useAnalyticsOpportunityRankings(params: AnalyticsParams) {
  return useQuery({
    queryKey: ['analytics', 'opportunity-rankings', params.scenarioId],
    queryFn: () => apiClient.get<OpportunityRankingItem[]>('/api/analytics/opportunity-rankings', { params: queryParams(params) }),
  });
}
