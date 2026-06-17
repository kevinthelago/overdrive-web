import { useState } from 'react';
import { type ColumnDef } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import { useAppStore } from '../../../state/appStore';
import { EntityList } from '../components/EntityList';
import { DeleteDialog } from '../components/DeleteDialog';
import { WarehouseForm } from './WarehouseForm';
import { useWarehouses, useDeleteWarehouse } from '../hooks';
import { ApiError } from '../../../lib/api/client';
import type { Warehouse, WarehouseListParams, BlockedDeleteReference } from '../types';

export function WarehouseList() {
  const addToast = useAppStore(state => state.addToast);
  const [params, setParams] = useState<WarehouseListParams>({ page: 0, size: 20, sort: 'name,asc' });
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Warehouse | null>(null);
  const [blockedRefs, setBlockedRefs] = useState<BlockedDeleteReference[] | undefined>();

  const { data, isLoading } = useWarehouses({ ...params, search: search || undefined });
  const deleteWarehouse = useDeleteWarehouse();

  function openAdd() { setEditing(null); setFormOpen(true); }
  function openEdit(w: Warehouse) { setEditing(w); setFormOpen(true); }
  function openDelete(w: Warehouse) { setDeleteTarget(w); setBlockedRefs(undefined); }
  function closeDelete() { setDeleteTarget(null); setBlockedRefs(undefined); }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteWarehouse.mutateAsync({ id: deleteTarget.id, version: deleteTarget.version });
      addToast({ title: `"${deleteTarget.name}" deleted.`, variant: 'success' });
      closeDelete();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const refs = (err.body as Record<string, unknown>).references as BlockedDeleteReference[] | undefined;
        setBlockedRefs(refs ?? []);
      } else {
        addToast({ title: 'Delete failed', description: String(err), variant: 'danger' });
      }
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setParams((p) => ({ ...p, page: 0 }));
  }

  const columns: ColumnDef<Warehouse>[] = [
    { key: 'code', header: 'Code', cell: (w) => w.code },
    { key: 'name', header: 'Name', cell: (w) => w.name },
    { key: 'location', header: 'Location', cell: (w) => `${w.city}, ${w.state} ${w.zip}` },
    { key: 'active', header: 'Active', cell: (w) => (w.active ? 'Yes' : 'No') },
    {
      key: 'actions',
      header: '',
      cell: (w) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(w)}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => openDelete(w)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <EntityList
        title="Warehouses"
        columns={columns}
        data={data}
        isLoading={isLoading}
        search={search}
        onSearchChange={handleSearchChange}
        page={params.page ?? 0}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
        onAdd={openAdd}
        addLabel="Add Warehouse"
      />
      <WarehouseForm open={formOpen} onClose={() => setFormOpen(false)} warehouse={editing} />
      <DeleteDialog
        open={!!deleteTarget}
        onClose={closeDelete}
        entityName={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
        isDeleting={deleteWarehouse.isPending}
        blockedReferences={blockedRefs}
      />
    </>
  );
}
