import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { useToast } from '../../../components/ui/Toast';
import { OptimisticLockDialog } from '../components/OptimisticLockDialog';
import { useCreateWarehouse, useUpdateWarehouse } from '../hooks';
import { warehouseSchema, type WarehouseFormData } from '../schemas';
import { ApiError } from '../../../lib/api/client';
import type { Warehouse } from '../types';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA',
  'ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK',
  'OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

interface WarehouseFormProps {
  open: boolean;
  onClose: () => void;
  warehouse: Warehouse | null;
}

export function WarehouseForm({ open, onClose, warehouse }: WarehouseFormProps) {
  const { toast } = useToast();
  const [lockConflict, setLockConflict] = useState(false);
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();
  const isEditing = !!warehouse;
  const isPending = createWarehouse.isPending || updateWarehouse.isPending;

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
  });

  useEffect(() => {
    if (open) {
      reset(warehouse
        ? { code: warehouse.code, name: warehouse.name, street: warehouse.street,
            city: warehouse.city, state: warehouse.state, zip: warehouse.zip, active: warehouse.active }
        : { active: true });
    }
  }, [open, warehouse, reset]);

  async function onSubmit(data: WarehouseFormData) {
    try {
      if (isEditing) {
        await updateWarehouse.mutateAsync({ id: warehouse.id, data, version: warehouse.version });
        toast({ title: `"${data.name}" updated.` });
      } else {
        await createWarehouse.mutateAsync(data);
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
              setError(field as keyof WarehouseFormData, { message });
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
            <DrawerTitle>{isEditing ? 'Edit Warehouse' : 'Add Warehouse'}</DrawerTitle>
          </DrawerHeader>
          <form id="warehouse-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 py-4">
            <FormField label="Code" error={errors.code?.message} required>
              <input {...register('code')} className="field-input" placeholder="e.g. CHI01" />
            </FormField>
            <FormField label="Name" error={errors.name?.message} required>
              <input {...register('name')} className="field-input" placeholder="Warehouse name" />
            </FormField>
            <FormField label="Street" error={errors.street?.message} required>
              <input {...register('street')} className="field-input" placeholder="123 Main St" />
            </FormField>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="City" error={errors.city?.message} required>
                <input {...register('city')} className="field-input" />
              </FormField>
              <FormField label="State" error={errors.state?.message} required>
                <select {...register('state')} className="field-select">
                  <option value="">--</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="ZIP" error={errors.zip?.message} required>
                <input {...register('zip')} className="field-input" placeholder="60601" />
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
            <Button form="warehouse-form" type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <OptimisticLockDialog open={lockConflict} onReload={() => { setLockConflict(false); onClose(); }} />
    </>
  );
}
