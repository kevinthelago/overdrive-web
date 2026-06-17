import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Drawer, DrawerContent } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { FormGroup } from '../../../components/ui/FormField';
import { OptimisticLockDialog } from '../components/OptimisticLockDialog';
import { useCreateServiceLevel, useUpdateServiceLevel, useAllCarriers } from '../hooks';
import { serviceLevelSchema, type ServiceLevelFormData } from '../schemas';
import { ApiError } from '../../../lib/api/client';
import { useAppStore } from '../../../state/appStore';
import type { ServiceLevel } from '../types';

interface ServiceLevelFormProps {
  open: boolean;
  onClose: () => void;
  serviceLevel: ServiceLevel | null;
}

export function ServiceLevelForm({ open, onClose, serviceLevel }: ServiceLevelFormProps) {
  const addToast = useAppStore(state => state.addToast);
  const [lockConflict, setLockConflict] = useState(false);
  const createServiceLevel = useCreateServiceLevel();
  const updateServiceLevel = useUpdateServiceLevel();
  const { data: carriersPage } = useAllCarriers();
  const isEditing = !!serviceLevel;
  const isPending = createServiceLevel.isPending || updateServiceLevel.isPending;

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<ServiceLevelFormData>({
    resolver: zodResolver(serviceLevelSchema),
  });

  useEffect(() => {
    if (open) {
      reset(serviceLevel
        ? {
            carrierId: serviceLevel.carrierId,
            code: serviceLevel.code,
            name: serviceLevel.name,
            minTransitDays: serviceLevel.minTransitDays,
            maxTransitDays: serviceLevel.maxTransitDays,
            active: serviceLevel.active,
          }
        : { active: true });
    }
  }, [open, serviceLevel, reset]);

  async function onSubmit(data: ServiceLevelFormData) {
    try {
      if (isEditing) {
        await updateServiceLevel.mutateAsync({ id: serviceLevel.id, data, version: serviceLevel.version });
        addToast({ title: `"${data.name}" updated.`, variant: 'success' });
      } else {
        await createServiceLevel.mutateAsync(data);
        addToast({ title: `"${data.name}" created.`, variant: 'success' });
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409 && err.body.type.endsWith('optimistic-lock-conflict')) {
          setLockConflict(true);
          return;
        }
        if (err.status === 422 || err.status === 400) {
          const fieldErrors = (err.body as Record<string, unknown>).fieldErrors as Record<string, string> | undefined;
          if (fieldErrors) {
            for (const [field, message] of Object.entries(fieldErrors)) {
              setError(field as keyof ServiceLevelFormData, { message });
            }
            return;
          }
        }
        addToast({ title: 'Save failed', description: err.message, variant: 'danger' });
      } else {
        addToast({ title: 'Save failed', description: String(err), variant: 'danger' });
      }
    }
  }

  return (
    <>
      <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent
          title={isEditing ? 'Edit Service Level' : 'Add Service Level'}
          footer={
            <>
              <Button variant="ghost" onClick={onClose} disabled={isPending}>Cancel</Button>
              <Button form="service-level-form" type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : 'Save'}
              </Button>
            </>
          }
        >
          <form id="service-level-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 py-4">
            <FormGroup label="Carrier" error={errors.carrierId?.message} required>
              <select {...register('carrierId')} className="field-select" disabled={isEditing}>
                <option value="">Select carrier…</option>
                {carriersPage?.content.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormGroup>
            <FormGroup label="Code" error={errors.code?.message} required>
              <input {...register('code')} className="field-input" placeholder="e.g. GROUND" />
            </FormGroup>
            <FormGroup label="Name" error={errors.name?.message} required>
              <input {...register('name')} className="field-input" placeholder="Service level name" />
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Min Transit Days" error={errors.minTransitDays?.message} required>
                <input
                  {...register('minTransitDays', { valueAsNumber: true })}
                  type="number"
                  min={1}
                  className="field-input"
                />
              </FormGroup>
              <FormGroup label="Max Transit Days" error={errors.maxTransitDays?.message} required>
                <input
                  {...register('maxTransitDays', { valueAsNumber: true })}
                  type="number"
                  min={1}
                  className="field-input"
                />
              </FormGroup>
            </div>
            <FormGroup label="" error={undefined}>
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input {...register('active')} type="checkbox" className="h-4 w-4 rounded" />
                Active
              </label>
            </FormGroup>
          </form>
        </DrawerContent>
      </Drawer>
      <OptimisticLockDialog open={lockConflict} onReload={() => { setLockConflict(false); onClose(); }} />
    </>
  );
}
