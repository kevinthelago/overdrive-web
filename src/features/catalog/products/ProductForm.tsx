import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Drawer, DrawerContent } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { FormGroup } from '../../../components/ui/FormField';
import { OptimisticLockDialog } from '../components/OptimisticLockDialog';
import { useCreateProduct, useUpdateProduct } from '../hooks';
import { productSchema, type ProductFormData } from '../schemas';
import { ApiError } from '../../../lib/api/client';
import { useAppStore } from '../../../state/appStore';
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
  const addToast = useAppStore(state => state.addToast);
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
        addToast({ title: `"${data.name}" updated.`, variant: 'success' });
      } else {
        await createProduct.mutateAsync(payload);
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
              setError(field as keyof ProductFormData, { message });
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
          title={isEditing ? 'Edit Product' : 'Add Product'}
          footer={
            <>
              <Button variant="ghost" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button form="product-form" type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : 'Save'}
              </Button>
            </>
          }
        >
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 py-4">
            <FormGroup label="SKU" error={errors.sku?.message} required>
              <input
                {...register('sku')}
                className="field-input"
                placeholder="e.g. SKU-001"
                autoComplete="off"
              />
            </FormGroup>

            <FormGroup label="Name" error={errors.name?.message} required>
              <input {...register('name')} className="field-input" placeholder="Product name" />
            </FormGroup>

            <FormGroup label="Category" error={errors.category?.message} required>
              <select {...register('category')} className="field-select">
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </FormGroup>

            <FormGroup label="Weight (lb)" error={errors.weightLb?.message} required>
              <input
                {...register('weightLb', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="field-input"
                placeholder="0.00"
              />
            </FormGroup>

            <div className="grid grid-cols-3 gap-3">
              <FormGroup label="Length (in)" error={errors.lengthIn?.message} required>
                <input
                  {...register('lengthIn', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="field-input"
                />
              </FormGroup>
              <FormGroup label="Width (in)" error={errors.widthIn?.message} required>
                <input
                  {...register('widthIn', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="field-input"
                />
              </FormGroup>
              <FormGroup label="Height (in)" error={errors.heightIn?.message} required>
                <input
                  {...register('heightIn', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="field-input"
                />
              </FormGroup>
            </div>

            <FormGroup label="Declared Value ($)" error={errors.declaredValue?.message}>
              <input
                {...register('declaredValue', { setValueAs: (v: string) => v === '' ? undefined : parseFloat(v) })}
                type="number"
                step="0.01"
                className="field-input"
                placeholder="Optional"
              />
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
