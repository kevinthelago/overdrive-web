import { useAnalyticsCostBreakdown } from '../api';
import type { AnalyticsParams } from '../types';
import { StackedBar } from '@/components/charts/StackedBar';
import { COST_COLORS } from '@/styles/costColors';

interface Props {
  params: AnalyticsParams;
}

export function CostBreakdownCard({ params }: Props) {
  const { data, isLoading, isError } = useAnalyticsCostBreakdown(params);

  return (
    <div className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-3">
      <h3 className="text-sm font-medium text-foreground">Cost Breakdown</h3>
      {isLoading && (
        <div className="animate-pulse h-48 rounded bg-border/40" />
      )}
      {!isLoading && (isError || !data || data.components.length === 0) && (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          No cost breakdown data available
        </div>
      )}
      {!isLoading && data && data.components.length > 0 && (
        <StackedBar
          series={data.components.map((c, i) => ({
            key: c.component,
            label: c.component,
            color: COST_COLORS[i % COST_COLORS.length],
          }))}
          data={[{
            category: 'Average Cost',
            values: Object.fromEntries(data.components.map((c) => [c.component, c.mean])),
          }]}
        />
      )}
    </div>
  );
}
