import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Drawer, DrawerContent } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { FormGroup } from '../../../components/ui/FormField';
import { OptimisticLockDialog } from '../components/OptimisticLockDialog';
import { useCreateCarrier, useUpdateCarrier } from '../hooks';
import { carrierSchema, type CarrierFormData } from '../schemas';
import { ApiError } from '../../../lib/api/client';
import { useAppStore } from '../../../state/appStore';
import type { Carrier } from '../types';

interface CarrierFormProps {
  open: boolean;
  onClose: () => void;
  carrier: Carrier | null;
}

export function CarrierForm({ open, onClose, carrier }: CarrierFormProps) {
  const addToast = useAppStore(state => state.addToast);
  const [lockConflict, setLockConflict] = useState(false);
  const createCarrier = useCreateCarrier();
  const updateCarrier = useUpdateCarrier();
  const isEditing = !!carrier;
  const isPending = createCarrier.isPending || updateCarrier.isPending;

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<CarrierFormData>({
    resolver: zodResolver(carrierSchema),
  });

  useEffect(() => {
    if (open) {
      reset(carrier ? { code: carrier.code, name: carrier.name, active: carrier.active } : { active: true });
    }
  }, [open, carrier, reset]);

  async function onSubmit(data: CarrierFormData) {
    try {
      if (isEditing) {
        await updateCarrier.mutateAsync({ id: carrier.id, data, version: carrier.version });
        addToast({ title: `"${data.name}" updated.`, variant: 'success' });
      } else {
        await createCarrier.mutateAsync(data);
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
              setError(field as keyof CarrierFormData, { message });
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
          title={isEditing ? 'Edit Carrier' : 'Add Carrier'}
          footer={
            <>
              <Button variant="ghost" onClick={onClose} disabled={isPending}>Cancel</Button>
              <Button form="carrier-form" type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : 'Save'}
              </Button>
            </>
          }
        >
          <form id="carrier-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 py-4">
            <FormGroup label="Code" error={errors.code?.message} required>
              <input {...register('code')} className="field-input" placeholder="e.g. FEDEX" />
            </FormGroup>
            <FormGroup label="Name" error={errors.name?.message} required>
              <input {...register('name')} className="field-input" placeholder="Carrier name" />
            </FormGroup>
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
