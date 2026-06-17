import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { useToast } from '../../../components/ui/Toast';
import { OptimisticLockDialog } from '../components/OptimisticLockDialog';
import { useCreateRateTable, useUpdateRateTable, useAllCarriers, useServiceLevelsByCarrier } from '../hooks';
import { rateTableSchema, type RateTableFormData } from '../schemas';
import { ApiError } from '../../../lib/api/client';
import type { RateTable } from '../types';

interface RateTableFormProps {
  open: boolean;
  onClose: () => void;
  rateTable: RateTable | null;
}

export function RateTableForm({ open, onClose, rateTable }: RateTableFormProps) {
  const { toast } = useToast();
  const [lockConflict, setLockConflict] = useState(false);
  const createRateTable = useCreateRateTable();
  const updateRateTable = useUpdateRateTable();
  const { data: carriersPage } = useAllCarriers();
  const isEditing = !!rateTable;
  const isPending = createRateTable.isPending || updateRateTable.isPending;

  const { register, handleSubmit, reset, setError, control, formState: { errors } } = useForm<RateTableFormData>({
    resolver: zodResolver(rateTableSchema),
  });

  const selectedCarrierId = useWatch({ control, name: 'carrierId' });
  const { data: serviceLevelsPage } = useServiceLevelsByCarrier(selectedCarrierId ?? '');

  useEffect(() => {
    if (open) {
      reset(rateTable
        ? {
            carrierId: rateTable.carrierId,
            serviceLevelId: rateTable.serviceLevelId,
            originZone: rateTable.originZone,
            destZone: rateTable.destZone,
            weightMinLb: rateTable.weightMinLb,
            weightMaxLb: rateTable.weightMaxLb,
            rateCents: rateTable.rateCents,
            effectiveDate: rateTable.effectiveDate,
            expiryDate: rateTable.expiryDate ?? '',
          }
        : {});
    }
  }, [open, rateTable, reset]);

  async function onSubmit(data: RateTableFormData) {
    const payload = { ...data, expiryDate: data.expiryDate === '' ? undefined : data.expiryDate };
    try {
      if (isEditing) {
        await updateRateTable.mutateAsync({ id: rateTable.id, data: payload, version: rateTable.version });
        toast({ title: 'Rate table entry updated.' });
      } else {
        await createRateTable.mutateAsync(payload);
        toast({ title: 'Rate table entry created.' });
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
              setError(field as keyof RateTableFormData, { message });
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
            <DrawerTitle>{isEditing ? 'Edit Rate Entry' : 'Add Rate Entry'}</DrawerTitle>
          </DrawerHeader>
          <form id="rate-table-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 py-4">
            <FormField label="Carrier" error={errors.carrierId?.message} required>
              <select {...register('carrierId')} className="field-select" disabled={isEditing}>
                <option value="">Select carrier…</option>
                {carriersPage?.content.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Service Level" error={errors.serviceLevelId?.message} required>
              <select {...register('serviceLevelId')} className="field-select" disabled={isEditing || !selectedCarrierId}>
                <option value="">Select service level…</option>
                {serviceLevelsPage?.content.map((sl) => (
                  <option key={sl.id} value={sl.id}>{sl.name}</option>
                ))}
              </select>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Origin Zone" error={errors.originZone?.message} required>
                <input {...register('originZone')} className="field-input" placeholder="e.g. 1" />
              </FormField>
              <FormField label="Dest Zone" error={errors.destZone?.message} required>
                <input {...register('destZone')} className="field-input" placeholder="e.g. 4" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Min Weight (lb)" error={errors.weightMinLb?.message} required>
                <input
                  {...register('weightMinLb', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min={0}
                  className="field-input"
                />
              </FormField>
              <FormField label="Max Weight (lb)" error={errors.weightMaxLb?.message} required>
                <input
                  {...register('weightMaxLb', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min={0}
                  className="field-input"
                />
              </FormField>
            </div>
            <FormField label="Rate (cents)" error={errors.rateCents?.message} required>
              <input
                {...register('rateCents', { valueAsNumber: true })}
                type="number"
                min={0}
                className="field-input"
                placeholder="e.g. 1250 = $12.50"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Effective Date" error={errors.effectiveDate?.message} required>
                <input {...register('effectiveDate')} type="date" className="field-input" />
              </FormField>
              <FormField label="Expiry Date" error={errors.expiryDate?.message}>
                <input {...register('expiryDate')} type="date" className="field-input" />
              </FormField>
            </div>
          </form>
          <DrawerFooter>
            <Button variant="ghost" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button form="rate-table-form" type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <OptimisticLockDialog open={lockConflict} onReload={() => { setLockConflict(false); onClose(); }} />
    </>
  );
}
