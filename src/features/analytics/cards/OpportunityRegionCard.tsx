import { useAnalyticsOpportunityByRegion } from '../api';
import type { AnalyticsParams } from '../types';
import Choropleth from '@/components/charts/Choropleth';

interface Props {
  params: AnalyticsParams;
}

export function OpportunityRegionCard({ params }: Props) {
  const { data, isLoading, isError } = useAnalyticsOpportunityByRegion(params);

  return (
    <div className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-3">
      <h3 className="text-sm font-medium text-foreground">Opportunity by Region</h3>
      {isLoading && (
        <div className="animate-pulse h-48 rounded bg-border/40" />
      )}
      {!isLoading && (isError || !data || data.length === 0) && (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          No regional opportunity data available
        </div>
      )}
      {!isLoading && data && data.length > 0 && (
        <Choropleth
          data={data.map((r) => ({ stateCode: r.stateCode, value: r.opportunityScore }))}
        />
      )}
    </div>
  );
}
