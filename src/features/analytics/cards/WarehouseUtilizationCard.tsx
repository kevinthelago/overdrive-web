import { useAnalyticsWarehouseUtilization } from '../api';
import type { AnalyticsParams } from '../types';
import UtilizationBars from '@/components/charts/UtilizationBars';

interface Props {
  params: AnalyticsParams;
}

export function WarehouseUtilizationCard({ params }: Props) {
  const { data, isLoading, isError } = useAnalyticsWarehouseUtilization(params);

  return (
    <div className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-3">
      <h3 className="text-sm font-medium text-foreground">Warehouse Utilization</h3>
      {isLoading && (
        <div className="animate-pulse h-48 rounded bg-border/40" />
      )}
      {!isLoading && (isError || !data || data.length === 0) && (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          No utilization data available
        </div>
      )}
      {!isLoading && data && data.length > 0 && (
        <UtilizationBars
          data={data.map((w) => ({
            label: w.warehouseName,
            capacity: w.capacity,
            used: w.used,
            utilizationRate: w.utilizationRate,
          }))}
        />
      )}
    </div>
  );
}
