import { useState } from 'react'
import { StatCard } from '@/components/ui/StatCard'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/state/appStore'
import { useRouteSolve } from './api'
import { RoutingInputs } from './RoutingInputs'
import { RouteHeroCard } from './RouteHeroCard'
import { CandidateTable } from './CandidateTable'
import type { RouteSolveResponse, SolvedCandidate, ServiceLevel } from './types'

export function RoutingPage() {
  const { selectedProductId, destinationZip, activeScenarioId } = useAppStore()
  const [result, setResult] = useState<RouteSolveResponse | null>(null)
  const { mutate: solve, isPending } = useRouteSolve()

  function handleSolve(serviceLevel: ServiceLevel, quantity: number) {
    if (!selectedProductId || !destinationZip) return
    solve(
      { productId: selectedProductId, destinationZip, serviceLevel, quantity, scenarioId: activeScenarioId },
      { onSuccess: (data) => setResult(data) },
    )
  }

  const winner: SolvedCandidate | undefined = result?.candidates[0]
  const winnerId = winner ? `${winner.carrierId}-${winner.serviceLevel}` : undefined
  const totalSavings =
    winner && winner.deltaCost.amount < 0 ? Math.abs(winner.deltaCost.amount) : 0

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Routing Explorer</h1>
        <p className="mt-0.5 text-sm text-text-muted">
          Find the lowest-cost carrier for this shipment
        </p>
      </div>

      <RoutingInputs onSolve={handleSolve} loading={isPending} />

      {/* Loading skeleton */}
      {isPending && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCard key={i} label="…" value="" loading />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-md bg-surface-raised" />
        </div>
      )}

      {/* Over-constrained state */}
      {!isPending && result?.overConstrained && (
        <div className="rounded-md border border-warning/30 bg-warning-muted p-6 text-center">
          <p className="font-semibold text-warning">No feasible route found</p>
          <p className="mt-1 text-sm text-text-muted">
            All carriers returned infeasible for these parameters. Try relaxing the SLA or adding
            carriers.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Button variant="secondary" size="sm">Relax SLA</Button>
            <Button variant="secondary" size="sm">Add carrier</Button>
          </div>
        </div>
      )}

      {/* Happy path */}
      {!isPending && winner && !result?.overConstrained && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Delivered Cost"
              value={
                <MoneyDisplay
                  value={winner.cost.total.amount}
                  currency={winner.cost.total.currency}
                />
              }
            />
            <StatCard
              label="Transit Days"
              value={String(winner.transitDays)}
              subvalue={winner.serviceLevel}
            />
            <StatCard
              label="Savings"
              value={
                totalSavings > 0 ? (
                  <MoneyDisplay value={totalSavings} currency={winner.deltaCost.currency} />
                ) : (
                  <span className="text-text-muted">—</span>
                )
              }
              trend={totalSavings > 0 ? 'down' : 'neutral'}
              trendLabel={totalSavings > 0 ? 'vs current' : undefined}
            />
            <StatCard
              label="Candidates"
              value={String(result!.candidates.length)}
              subvalue={`${result!.candidates.filter((c) => !c.infeasible).length} feasible`}
            />
          </div>

          <RouteHeroCard winner={winner} allCandidates={result!.candidates} />

          <div>
            <h2 className="mb-2 text-sm font-medium text-text-muted">All Candidates</h2>
            <CandidateTable candidates={result!.candidates} winnerId={winnerId} />
          </div>

          {/* Phase 4 slot */}
          <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-text-muted">
            Competitor savings strip — Phase 4
          </div>
        </>
      )}

      {/* Empty / first-load state */}
      {!isPending && !result && (
        <div className="rounded-md border border-dashed border-border p-12 text-center">
          <p className="text-sm text-text-muted">
            Configure inputs above and click <strong>Solve</strong> to find the best route.
          </p>
        </div>
      )}
    </div>
  )
}
