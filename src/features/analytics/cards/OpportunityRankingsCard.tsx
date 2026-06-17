import { useAnalyticsOpportunityRankings } from '../api';
import type { AnalyticsParams } from '../types';
import RankedBars from '@/components/charts/RankedBars';

interface Props {
  params: AnalyticsParams;
}

export function OpportunityRankingsCard({ params }: Props) {
  const { data, isLoading, isError } = useAnalyticsOpportunityRankings(params);

  return (
    <div className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-3">
      <h3 className="text-sm font-medium text-foreground">Opportunity Rankings</h3>
      {isLoading && (
        <div className="animate-pulse h-48 rounded bg-border/40" />
      )}
      {!isLoading && (isError || !data || data.length === 0) && (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          No opportunity ranking data available
        </div>
      )}
      {!isLoading && data && data.length > 0 && (
        <RankedBars
          data={data.map((item) => ({
            label: item.productName,
            value: item.estimatedAnnualSavings,
            sublabel: item.topFactor,
          }))}
          xLabel="Estimated Annual Savings ($)"
          maxItems={10}
        />
      )}
    </div>
  );
}
