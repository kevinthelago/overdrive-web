import { useAnalyticsSavings } from '../api';
import type { AnalyticsParams } from '../types';
import Histogram from '@/components/charts/Histogram';

interface Props {
  params: AnalyticsParams;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function SavingsHistogramCard({ params }: Props) {
  const { data, isLoading, isError } = useAnalyticsSavings(params);

  return (
    <div className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-3">
      <h3 className="text-sm font-medium text-foreground">Savings Distribution</h3>
      {isLoading && (
        <div className="animate-pulse h-48 rounded bg-border/40" />
      )}
      {!isLoading && (isError || !data || data.buckets.length === 0) && (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          No savings data available
        </div>
      )}
      {!isLoading && data && data.buckets.length > 0 && (
        <>
          <Histogram
            data={data.buckets}
            xLabel="Savings ($)"
            yLabel="Products"
          />
          <div className="grid grid-cols-4 gap-2 border-t border-border pt-3">
            <div>
              <p className="text-xs text-muted-foreground">Mean</p>
              <p className="font-mono text-sm tabular-nums text-foreground">{formatCurrency(data.mean)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Median</p>
              <p className="font-mono text-sm tabular-nums text-foreground">{formatCurrency(data.median)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">P90</p>
              <p className="font-mono text-sm tabular-nums text-foreground">{formatCurrency(data.p90)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-mono text-sm tabular-nums text-foreground">{formatCurrency(data.total)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
