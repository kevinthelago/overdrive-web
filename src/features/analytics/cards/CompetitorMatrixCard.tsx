import { useAnalyticsCompetitorMatrix } from '../api';
import type { AnalyticsParams } from '../types';
import Matrix from '@/components/charts/Matrix';

interface Props {
  params: AnalyticsParams;
}

export function CompetitorMatrixCard({ params }: Props) {
  const { data, isLoading, isError } = useAnalyticsCompetitorMatrix(params);

  return (
    <div className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-3">
      <h3 className="text-sm font-medium text-foreground">Competitor Matrix</h3>
      {isLoading && (
        <div className="animate-pulse h-48 rounded bg-border/40" />
      )}
      {!isLoading && (isError || !data || data.cells.length === 0) && (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          No competitor data available
        </div>
      )}
      {!isLoading && data && data.cells.length > 0 && (
        <Matrix
          rows={data.competitors}
          cols={data.products}
          data={data.cells.map((c) => ({
            row: c.competitorName,
            col: c.productName,
            value: c.savingsPct,
            status: c.status as 'winning' | 'losing' | 'tied' | 'neutral',
            label: `${c.savingsPct >= 0 ? '+' : ''}${c.savingsPct.toFixed(1)}%`,
          }))}
        />
      )}
    </div>
  );
}
