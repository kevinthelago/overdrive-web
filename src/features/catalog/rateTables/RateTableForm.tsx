import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Drawer, DrawerContent } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { FormGroup } from '../../../components/ui/FormField';
import { OptimisticLockDialog } from '../components/OptimisticLockDialog';
import { useCreateRateTable, useUpdateRateTable, useAllCarriers, useServiceLevelsByCarrier } from '../hooks';
import { rateTableSchema, type RateTableFormData } from '../schemas';
import { ApiError } from '../../../lib/api/client';
import { useAppStore } from '../../../state/appStore';
import type { RateTable } from '../types';

interface RateTableFormProps {
  open: boolean;
  onClose: () => void;
  rateTable: RateTable | null;
}

export function RateTableForm({ open, onClose, rateTable }: RateTableFormProps) {
  const addToast = useAppStore(state => state.addToast);
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
        addToast({ title: 'Rate table entry updated.', variant: 'success' });
      } else {
        await createRateTable.mutateAsync(payload);
        addToast({ title: 'Rate table entry created.', variant: 'success' });
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
              setError(field as keyof RateTableFormData, { message });
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
          title={isEditing ? 'Edit Rate Entry' : 'Add Rate Entry'}
          footer={
            <>
              <Button variant="ghost" onClick={onClose} disabled={isPending}>Cancel</Button>
              <Button form="rate-table-form" type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : 'Save'}
              </Button>
            </>
          }
        >
          <form id="rate-table-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 py-4">
            <FormGroup label="Carrier" error={errors.carrierId?.message} required>
              <select {...register('carrierId')} className="field-select" disabled={isEditing}>
                <option value="">Select carrier…</option>
                {carriersPage?.content.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormGroup>
            <FormGroup label="Service Level" error={errors.serviceLevelId?.message} required>
              <select {...register('serviceLevelId')} className="field-select" disabled={isEditing || !selectedCarrierId}>
                <option value="">Select service level…</option>
                {serviceLevelsPage?.content.map((sl) => (
                  <option key={sl.id} value={sl.id}>{sl.name}</option>
                ))}
              </select>
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Origin Zone" error={errors.originZone?.message} required>
                <input {...register('originZone')} className="field-input" placeholder="e.g. 1" />
              </FormGroup>
              <FormGroup label="Dest Zone" error={errors.destZone?.message} required>
                <input {...register('destZone')} className="field-input" placeholder="e.g. 4" />
              </FormGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Min Weight (lb)" error={errors.weightMinLb?.message} required>
                <input
                  {...register('weightMinLb', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min={0}
                  className="field-input"
                />
              </FormGroup>
              <FormGroup label="Max Weight (lb)" error={errors.weightMaxLb?.message} required>
                <input
                  {...register('weightMaxLb', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min={0}
                  className="field-input"
                />
              </FormGroup>
            </div>
            <FormGroup label="Rate (cents)" error={errors.rateCents?.message} required>
              <input
                {...register('rateCents', { valueAsNumber: true })}
                type="number"
                min={0}
                className="field-input"
                placeholder="e.g. 1250 = $12.50"
              />
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Effective Date" error={errors.effectiveDate?.message} required>
                <input {...register('effectiveDate')} type="date" className="field-input" />
              </FormGroup>
              <FormGroup label="Expiry Date" error={errors.expiryDate?.message}>
                <input {...register('expiryDate')} type="date" className="field-input" />
              </FormGroup>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
      <OptimisticLockDialog open={lockConflict} onReload={() => { setLockConflict(false); onClose(); }} />
    </>
  );
}
