import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { useToast } from '../../../components/ui/Toast';
import { OptimisticLockDialog } from '../components/OptimisticLockDialog';
import { useCreateServiceLevel, useUpdateServiceLevel, useAllCarriers } from '../hooks';
import { serviceLevelSchema, type ServiceLevelFormData } from '../schemas';
import { ApiError } from '../../../lib/api/client';
import type { ServiceLevel } from '../types';

interface ServiceLevelFormProps {
  open: boolean;
  onClose: () => void;
  serviceLevel: ServiceLevel | null;
}

export function ServiceLevelForm({ open, onClose, serviceLevel }: ServiceLevelFormProps) {
  const { toast } = useToast();
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
        toast({ title: `"${data.name}" updated.` });
      } else {
        await createServiceLevel.mutateAsync(data);
        toast({ title: `"${data.name}" created.` });
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409 && (err.body as { type?: string }).type?.endsWith('optimistic-lock-conflict')) {
          setLockConflict(true);
          return;
        }
        if (err.status === 422 || err.status === 400) {
          const problem = err.body as { fieldErrors?: Record<string, string> };
          if (problem.fieldErrors) {
            for (const [field, message] of Object.entries(problem.fieldErrors)) {
              setError(field as keyof ServiceLevelFormData, { message });
            }
            return;
          }
        }
        toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
      } else {
        toast({ title: 'Save failed', description: String(err), variant: 'destructive' });
      }
    }
  }

  return (
    <>
      <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{isEditing ? 'Edit Service Level' : 'Add Service Level'}</DrawerTitle>
          </DrawerHeader>
          <form id="service-level-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 py-4">
            <FormField label="Carrier" error={errors.carrierId?.message} required>
              <select {...register('carrierId')} className="field-select" disabled={isEditing}>
                <option value="">Select carrier…</option>
                {carriersPage?.content.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Code" error={errors.code?.message} required>
              <input {...register('code')} className="field-input" placeholder="e.g. GROUND" />
            </FormField>
            <FormField label="Name" error={errors.name?.message} required>
              <input {...register('name')} className="field-input" placeholder="Service level name" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Min Transit Days" error={errors.minTransitDays?.message} required>
                <input
                  {...register('minTransitDays', { valueAsNumber: true })}
                  type="number"
                  min={1}
                  className="field-input"
                />
              </FormField>
              <FormField label="Max Transit Days" error={errors.maxTransitDays?.message} required>
                <input
                  {...register('maxTransitDays', { valueAsNumber: true })}
                  type="number"
                  min={1}
                  className="field-input"
                />
              </FormField>
            </div>
            <FormField label="" error={undefined}>
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input {...register('active')} type="checkbox" className="h-4 w-4 rounded" />
                Active
              </label>
            </FormField>
          </form>
          <DrawerFooter>
            <Button variant="ghost" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button form="service-level-form" type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <OptimisticLockDialog open={lockConflict} onReload={() => { setLockConflict(false); onClose(); }} />
    </>
  );
}
