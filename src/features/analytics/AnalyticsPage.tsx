import { useAppStore } from '@/state/appStore';
import { CostBreakdownCard } from './cards/CostBreakdownCard';
import { FreightAnalysisCard } from './cards/FreightAnalysisCard';
import { WarehouseUtilizationCard } from './cards/WarehouseUtilizationCard';
import { SavingsHistogramCard } from './cards/SavingsHistogramCard';
import { CompetitorMatrixCard } from './cards/CompetitorMatrixCard';
import { OpportunityRegionCard } from './cards/OpportunityRegionCard';
import { OpportunityRankingsCard } from './cards/OpportunityRankingsCard';

export function AnalyticsPage() {
  const activeScenarioId = useAppStore((s) => s.activeScenarioId);
  const params = { scenarioId: activeScenarioId ?? undefined };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
      </div>

      {activeScenarioId && (
        <div className="rounded-md border border-accent/30 bg-accent/10 px-4 py-2 text-sm text-accent">
          Scenario active — all charts reflect scenario overrides
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CostBreakdownCard params={params} />
        <FreightAnalysisCard params={params} />
        <WarehouseUtilizationCard params={params} />
        <SavingsHistogramCard params={params} />
        <CompetitorMatrixCard params={params} />
        <OpportunityRegionCard params={params} />
      </div>

      <OpportunityRankingsCard params={params} />
    </div>
  );
}
