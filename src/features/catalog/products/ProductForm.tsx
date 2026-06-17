import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { useToast } from '../../../components/ui/Toast';
import { OptimisticLockDialog } from '../components/OptimisticLockDialog';
import { useCreateProduct, useUpdateProduct } from '../hooks';
import { productSchema, type ProductFormData } from '../schemas';
import { ApiError } from '../../../lib/api/client';
import type { Product } from '../types';

const CATEGORIES = [
  { value: 'STANDARD', label: 'Standard' },
  { value: 'PERISHABLE', label: 'Perishable' },
  { value: 'HAZMAT', label: 'Hazmat' },
  { value: 'DANGEROUS_GOODS', label: 'Dangerous Goods' },
  { value: 'HIGH_VALUE', label: 'High Value' },
] as const;

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ProductForm({ open, onClose, product }: ProductFormProps) {
  const { toast } = useToast();
  const [lockConflict, setLockConflict] = useState(false);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isEditing = !!product;
  const isPending = createProduct.isPending || updateProduct.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (open) {
      reset(
        product
          ? {
              sku: product.sku,
              name: product.name,
              category: product.category,
              weightLb: product.weightLb,
              lengthIn: product.lengthIn,
              widthIn: product.widthIn,
              heightIn: product.heightIn,
              declaredValue: product.declaredValue,
              active: product.active,
            }
          : { active: true },
      );
    }
  }, [open, product, reset]);

  async function onSubmit(data: ProductFormData) {
    const payload = {
      ...data,
      declaredValue: data.declaredValue === '' ? undefined : data.declaredValue,
    };
    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id: product.id, data: payload, version: product.version });
        toast({ title: `"${data.name}" updated.` });
      } else {
        await createProduct.mutateAsync(payload);
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
              setError(field as keyof ProductFormData, { message });
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
            <DrawerTitle>{isEditing ? 'Edit Product' : 'Add Product'}</DrawerTitle>
          </DrawerHeader>

          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 py-4">
            <FormField label="SKU" error={errors.sku?.message} required>
              <input
                {...register('sku')}
                className="field-input"
                placeholder="e.g. SKU-001"
                autoComplete="off"
              />
            </FormField>

            <FormField label="Name" error={errors.name?.message} required>
              <input {...register('name')} className="field-input" placeholder="Product name" />
            </FormField>

            <FormField label="Category" error={errors.category?.message} required>
              <select {...register('category')} className="field-select">
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Weight (lb)" error={errors.weightLb?.message} required>
              <input
                {...register('weightLb', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="field-input"
                placeholder="0.00"
              />
            </FormField>

            <div className="grid grid-cols-3 gap-3">
              <FormField label="Length (in)" error={errors.lengthIn?.message} required>
                <input
                  {...register('lengthIn', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="field-input"
                />
              </FormField>
              <FormField label="Width (in)" error={errors.widthIn?.message} required>
                <input
                  {...register('widthIn', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="field-input"
                />
              </FormField>
              <FormField label="Height (in)" error={errors.heightIn?.message} required>
                <input
                  {...register('heightIn', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="field-input"
                />
              </FormField>
            </div>

            <FormField label="Declared Value ($)" error={errors.declaredValue?.message}>
              <input
                {...register('declaredValue', { setValueAs: (v: string) => v === '' ? undefined : parseFloat(v) })}
                type="number"
                step="0.01"
                className="field-input"
                placeholder="Optional"
              />
            </FormField>

            <FormField label="" error={undefined}>
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input {...register('active')} type="checkbox" className="h-4 w-4 rounded" />
                Active
              </label>
            </FormField>
          </form>

          <DrawerFooter>
            <Button variant="ghost" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button form="product-form" type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <OptimisticLockDialog open={lockConflict} onReload={() => { setLockConflict(false); onClose(); }} />
    </>
  );
}
