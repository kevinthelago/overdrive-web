import { useState } from 'react';
import { useAnalyticsFreight } from '../api';
import type { AnalyticsParams, FreightLane } from '../types';
import FreightFlow from '@/components/charts/FreightFlow';
import { Segmented } from '@/components/ui/Segmented';

type View = 'lanes' | 'mode' | 'carrier';

interface Props {
  params: AnalyticsParams;
}

function lanesToGraph(lanes: FreightLane[]) {
  const origins = [...new Set(lanes.map((l) => l.from))];
  const modes = [...new Set(lanes.map((l) => l.mode).filter(Boolean))];
  const carriers = [...new Set(lanes.map((l) => l.carrier).filter(Boolean))];
  const dests = [...new Set(lanes.map((l) => l.to).filter(Boolean))];

  const nodes = [
    ...origins.map((id) => ({ id, name: id, group: 'origin' as const })),
    ...modes.map((id) => ({ id, name: id, group: 'mode' as const })),
    ...carriers.map((id) => ({ id, name: id, group: 'carrier' as const })),
    ...dests.map((id) => ({ id, name: id, group: 'dest' as const })),
  ];

  const links = lanes.flatMap((l) => [
    { source: l.from, target: l.mode, value: l.volume },
    { source: l.mode, target: l.carrier, value: l.volume },
    { source: l.carrier, target: l.to, value: l.volume },
  ]).filter((link) => link.source && link.target);

  return { nodes, links };
}

export function FreightAnalysisCard({ params }: Props) {
  const [view, setView] = useState<View>('lanes');
  const { data, isLoading, isError } = useAnalyticsFreight(params);

  const isEmpty = !data || (data.lanes.length === 0 && data.byMode.length === 0 && data.byCarrier.length === 0);

  const graph = (() => {
    if (!data) return { nodes: [], links: [] };
    if (view === 'lanes') return lanesToGraph(data.lanes);
    if (view === 'mode') return {
      nodes: data.byMode.map((m) => ({ id: m.mode, name: m.mode, group: 'mode' as const })),
      links: [],
    };
    return {
      nodes: data.byCarrier.map((c) => ({ id: c.carrier, name: c.carrier, group: 'carrier' as const })),
      links: [],
    };
  })();

  return (
    <div className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Freight Analysis</h3>
        <Segmented
          options={[
            { label: 'Lanes', value: 'lanes' },
            { label: 'By Mode', value: 'mode' },
            { label: 'By Carrier', value: 'carrier' },
          ]}
          value={view}
          onChange={(v) => setView(v as View)}
        />
      </div>
      {isLoading && (
        <div className="animate-pulse h-48 rounded bg-border/40" />
      )}
      {!isLoading && (isError || isEmpty) && (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          No freight data available
        </div>
      )}
      {!isLoading && !isEmpty && (
        <FreightFlow nodes={graph.nodes} links={graph.links} valueLabel="shipments" />
      )}
    </div>
  );
}
