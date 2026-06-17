import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { Pill } from '@/components/ui/Pill';
import { useAppStore } from '@/state/appStore';
import { useDeleteScenario, useScenarios } from './api';
import { ScenarioBuilder } from './ScenarioBuilder';
import { ScenarioCompare } from './ScenarioCompare';
import type { Scenario } from './types';

type View = { kind: 'list' } | { kind: 'compare'; scenarioId: string };

export function ScenarioPage() {
  const { data: scenarios, isLoading } = useScenarios();
  const deleteMutation = useDeleteScenario();
  const { activeScenarioId, setActiveScenarioId } = useAppStore();

  const [view, setView] = useState<View>({ kind: 'list' });
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Scenario | null>(null);

  const openCreate = () => {
    setEditingId(undefined);
    setBuilderOpen(true);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    setBuilderOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    if (activeScenarioId === deleteTarget.id) setActiveScenarioId(null);
    setDeleteTarget(null);
  };

  if (view.kind === 'compare') {
    return (
      <ScenarioCompare
        scenarioId={view.scenarioId}
        onBack={() => setView({ kind: 'list' })}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Scenarios</h1>
        <Button onClick={openCreate}>+ New Scenario</Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-md bg-surface" />
          ))}
        </div>
      )}

      {!isLoading && (!scenarios || scenarios.length === 0) && (
        <div className="flex h-48 items-center justify-center rounded-md border border-border bg-surface">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-muted-foreground">No scenarios yet.</p>
            <Button variant="outline" size="sm" onClick={openCreate}>
              Create your first scenario
            </Button>
          </div>
        </div>
      )}

      {!isLoading && scenarios && scenarios.length > 0 && (
        <div className="flex flex-col gap-3">
          {scenarios.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-md border border-border bg-surface p-4"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <button
                    className="text-left text-base font-medium text-foreground hover:underline"
                    onClick={() => setActiveScenarioId(s.id)}
                  >
                    {s.name}
                  </button>
                  {activeScenarioId === s.id && (
                    <Pill variant="success">Active</Pill>
                  )}
                </div>
                {s.description && (
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {s.overrides.length} override{s.overrides.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView({ kind: 'compare', scenarioId: s.id })}
                >
                  Compare
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(s.id)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400"
                  onClick={() => setDeleteTarget(s)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ScenarioBuilder
        scenarioId={editingId}
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent
          title="Delete Scenario"
          description={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </Button>
            </>
          }
        >
          <></>
        </DialogContent>
      </Dialog>
    </div>
  );
}
