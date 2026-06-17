import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Drawer, DrawerContent } from '@/components/ui/Drawer';
import { Input, Textarea } from '@/components/ui/FormField';
import { useCreateScenario, useScenario, useUpdateScenario } from './api';
import { OverrideEditor } from './OverrideEditor';
import type { OverrideDraft, OverrideType } from './types';

interface Props {
  scenarioId?: string;
  open: boolean;
  onClose: () => void;
}

const DEFAULT_DRAFT: OverrideDraft = {
  type: 'ADD_WAREHOUSE',
  entityId: '',
};

function isDuplicateOverride(drafts: OverrideDraft[], idx: number): boolean {
  const current = drafts[idx];
  return drafts.some(
    (d, i) => i !== idx && d.type === current.type && d.entityId === current.entityId,
  );
}

export function ScenarioBuilder({ scenarioId, open, onClose }: Props) {
  const isEdit = !!scenarioId;
  const { data: existing } = useScenario(scenarioId ?? '');
  const createMutation = useCreateScenario();
  const updateMutation = useUpdateScenario();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [overrides, setOverrides] = useState<OverrideDraft[]>([]);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (isEdit && existing) {
      setName(existing.name);
      setDescription(existing.description ?? '');
      setOverrides(
        existing.overrides.map((o) => ({ type: o.type, entityId: o.entityId, value: o.value })),
      );
    } else if (!isEdit) {
      setName('');
      setDescription('');
      setOverrides([]);
    }
    setNameError('');
  }, [existing, isEdit, open]);

  const addOverride = () =>
    setOverrides((prev) => [...prev, { ...DEFAULT_DRAFT }]);

  const updateOverride = (idx: number, next: OverrideDraft) =>
    setOverrides((prev) => prev.map((o, i) => (i === idx ? next : o)));

  const removeOverride = (idx: number) =>
    setOverrides((prev) => prev.filter((_, i) => i !== idx));

  const hasDuplicates = overrides.some((_, i) => isDuplicateOverride(overrides, i));

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError('Name is required.');
      return;
    }
    if (name.length > 80) {
      setNameError('Name must be 80 characters or fewer.');
      return;
    }
    if (hasDuplicates) return;

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      overrides: overrides
        .filter((o) => o.entityId.trim())
        .map(({ type, entityId, value }) => ({
          type: type as OverrideType,
          entityId: entityId.trim(),
          value,
        })),
    };

    if (isEdit && scenarioId) {
      await updateMutation.mutateAsync({ id: scenarioId, body: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent
        title={isEdit ? 'Edit Scenario' : 'New Scenario'}
        footer={
          <>
            <Button variant="ghost" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending || hasDuplicates}>
              {isPending ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 p-4">
          <div>
            <label className="mb-1 block text-sm text-foreground">
              Name <span className="text-red-400">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError('');
              }}
              maxLength={80}
              placeholder="e.g. Remove West Coast Carrier"
            />
            {nameError && <p className="mt-1 text-xs text-red-400">{nameError}</p>}
            <p className="mt-1 text-right text-xs text-muted-foreground">{name.length}/80</p>
          </div>

          <div>
            <label className="mb-1 block text-sm text-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description…"
              rows={3}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-foreground">Overrides</span>
              <Button variant="secondary" size="sm" onClick={addOverride}>
                + Add Override
              </Button>
            </div>
            {overrides.length === 0 ? (
              <p className="text-sm text-muted-foreground">No overrides — scenario mirrors baseline.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {overrides.map((o, i) => (
                  <div key={i}>
                    <OverrideEditor
                      value={o}
                      onChange={(next) => updateOverride(i, next)}
                      onRemove={() => removeOverride(i)}
                    />
                    {isDuplicateOverride(overrides, i) && (
                      <p className="mt-1 text-xs text-red-400">
                        Duplicate override type + entity.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
