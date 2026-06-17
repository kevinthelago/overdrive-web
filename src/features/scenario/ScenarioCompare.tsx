import { useEffect } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Pill } from '@/components/ui/Pill';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import type { PillVariant } from '@/components/ui/Pill';
import { useCompareScenario } from './api';
import type { CompareStatus, ProductCompareRow } from './types';

interface Props {
  scenarioId: string;
  onBack: () => void;
}

const STATUS_LABEL: Record<CompareStatus, string> = {
  CHEAPER: 'Cheaper',
  RISEN: 'Risen',
  UNCHANGED: 'Unchanged',
  UNCOSTABLE: 'Uncostable',
};

const STATUS_VARIANT: Record<CompareStatus, PillVariant> = {
  CHEAPER: 'success',
  RISEN: 'danger',
  UNCHANGED: 'default',
  UNCOSTABLE: 'warning',
};

function formatDelta(value: number | null, prefix: '$' | '%' = '$'): string {
  if (value === null) return '—';
  const sign = value > 0 ? '+' : '';
  return prefix === '$'
    ? `${sign}$${Math.abs(value).toFixed(2)}`
    : `${sign}${value.toFixed(2)}%`;
}

function DeltaCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  const color = value < 0 ? 'text-green-400' : value > 0 ? 'text-red-400' : 'text-muted-foreground';
  return <span className={`font-mono text-sm tabular-nums ${color}`}>{formatDelta(value)}</span>;
}

function RouteCell({ route }: { route: ProductCompareRow['baselineRoute'] }) {
  if (!route) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="text-sm">
      {route.carrierName} via {route.warehouseName}
      <span className="ml-1 text-xs text-muted-foreground">({route.transitDays}d)</span>
    </span>
  );
}

const COLUMNS = [
  { key: 'productName', header: 'Product', cell: (row: ProductCompareRow) => row.productName },
  {
    key: 'baselineRoute',
    header: 'Baseline Route',
    cell: (row: ProductCompareRow) => <RouteCell route={row.baselineRoute} />,
  },
  {
    key: 'scenarioRoute',
    header: 'Scenario Route',
    cell: (row: ProductCompareRow) => <RouteCell route={row.scenarioRoute} />,
  },
  {
    key: 'costDelta',
    header: 'Cost Δ',
    cell: (row: ProductCompareRow) => <DeltaCell value={row.costDelta} />,
  },
  {
    key: 'savingsDelta',
    header: 'Savings Δ',
    cell: (row: ProductCompareRow) => <DeltaCell value={row.savingsDelta} />,
  },
  {
    key: 'status',
    header: 'Status',
    cell: (row: ProductCompareRow) => (
      <div className="flex flex-col gap-1">
        <Pill variant={STATUS_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Pill>
        {row.uncostableReason && (
          <span className="text-xs text-amber-400">{row.uncostableReason}</span>
        )}
        {row.staleOverrides && row.staleOverrides.length > 0 && (
          <span className="text-xs text-muted-foreground">
            Stale: {row.staleOverrides.join(', ')}
          </span>
        )}
      </div>
    ),
  },
];

export function ScenarioCompare({ scenarioId, onBack }: Props) {
  const { mutate, data, isPending } = useCompareScenario(scenarioId);

  useEffect(() => {
    mutate({});
  }, [scenarioId, mutate]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <h1 className="text-xl font-semibold text-foreground">
          {data?.scenarioName ?? 'Scenario Compare'}
        </h1>
      </div>

      {isPending && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-md bg-surface" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-md bg-surface" />
        </div>
      )}

      {!isPending && data && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total Products" value={data.totalProducts} />
            <StatCard
              label="Cheaper"
              value={<span className="text-green-400">{data.cheaperCount}</span>}
            />
            <StatCard
              label="Risen"
              value={<span className="text-red-400">{data.risenCount}</span>}
            />
            <StatCard
              label="Uncostable"
              value={<span className="text-amber-400">{data.uncostableCount}</span>}
            />
          </div>

          {data.rows.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-md border border-border bg-surface">
              <p className="text-muted-foreground">No products to compare.</p>
            </div>
          ) : (
            <DataTable columns={COLUMNS} data={data.rows} keyExtractor={(r) => r.productId} />
          )}
        </>
      )}

      {!isPending && !data && (
        <div className="flex h-48 items-center justify-center rounded-md border border-border bg-surface">
          <p className="text-muted-foreground">Compare result unavailable.</p>
        </div>
      )}
    </div>
  );
}
