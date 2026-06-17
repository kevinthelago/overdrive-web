import { useState, type ChangeEvent } from 'react';
import { type ColumnDef } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import { Pill } from '../../../components/ui/Pill';
import { useToast } from '../../../components/ui/Toast';
import { EntityList } from '../components/EntityList';
import { DeleteDialog } from '../components/DeleteDialog';
import { ProductForm } from './ProductForm';
import { useProducts, useDeleteProduct } from '../hooks';
import { ApiError } from '../../../lib/api/client';
import type { Product, ProductCategory, ProductListParams, BlockedDeleteReference } from '../types';

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  STANDARD: 'Standard',
  PERISHABLE: 'Perishable',
  HAZMAT: 'Hazmat',
  DANGEROUS_GOODS: 'Dangerous Goods',
  HIGH_VALUE: 'High Value',
};

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  STANDARD: 'default',
  PERISHABLE: 'blue',
  HAZMAT: 'orange',
  DANGEROUS_GOODS: 'red',
  HIGH_VALUE: 'purple',
};

export function ProductList() {
  const { toast } = useToast();
  const [params, setParams] = useState<ProductListParams>({ page: 0, size: 20, sort: 'name,asc' });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | ''>('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [blockedRefs, setBlockedRefs] = useState<BlockedDeleteReference[] | undefined>();

  const { data, isLoading } = useProducts({
    ...params,
    search: search || undefined,
    category: categoryFilter || undefined,
  });

  const deleteProduct = useDeleteProduct();

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setFormOpen(true);
  }

  function openDelete(product: Product) {
    setDeleteTarget(product);
    setBlockedRefs(undefined);
  }

  function closeDelete() {
    setDeleteTarget(null);
    setBlockedRefs(undefined);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync({ id: deleteTarget.id, version: deleteTarget.version });
      toast({ title: `"${deleteTarget.name}" deleted.` });
      closeDelete();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const problem = err.body as { references?: BlockedDeleteReference[] };
        setBlockedRefs(problem.references ?? []);
      } else {
        toast({ title: 'Delete failed', description: String(err), variant: 'destructive' });
      }
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setParams((p) => ({ ...p, page: 0 }));
  }

  function handleCategoryChange(e: ChangeEvent<HTMLSelectElement>) {
    setCategoryFilter(e.target.value as ProductCategory | '');
    setParams((p) => ({ ...p, page: 0 }));
  }

  const columns: ColumnDef<Product>[] = [
    { accessorKey: 'sku', header: 'SKU' },
    { accessorKey: 'name', header: 'Name' },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Pill color={CATEGORY_COLORS[row.original.category]}>
          {CATEGORY_LABELS[row.original.category]}
        </Pill>
      ),
    },
    {
      accessorKey: 'weightLb',
      header: 'Weight (lb)',
      cell: ({ row }) => row.original.weightLb.toFixed(2),
    },
    {
      accessorKey: 'active',
      header: 'Active',
      cell: ({ row }) => (row.original.active ? 'Yes' : 'No'),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openDelete(row.original)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const filters = (
    <select
      value={categoryFilter}
      onChange={handleCategoryChange}
      className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Filter by category"
    >
      <option value="">All categories</option>
      {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((cat) => (
        <option key={cat} value={cat}>
          {CATEGORY_LABELS[cat]}
        </option>
      ))}
    </select>
  );

  return (
    <>
      <EntityList
        title="Products"
        columns={columns}
        data={data}
        isLoading={isLoading}
        search={search}
        onSearchChange={handleSearchChange}
        filters={filters}
        page={params.page ?? 0}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
        onAdd={openAdd}
        addLabel="Add Product"
      />

      <ProductForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        product={editing}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onClose={closeDelete}
        entityName={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
        isDeleting={deleteProduct.isPending}
        blockedReferences={blockedRefs}
      />
    </>
  );
}
