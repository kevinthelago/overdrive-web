import { useState } from 'react';
import { type ColumnDef } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import { useAppStore } from '../../../state/appStore';
import { EntityList } from '../components/EntityList';
import { DeleteDialog } from '../components/DeleteDialog';
import { CarrierForm } from './CarrierForm';
import { useCarriers, useDeleteCarrier } from '../hooks';
import { ApiError } from '../../../lib/api/client';
import type { Carrier, CarrierListParams, BlockedDeleteReference } from '../types';

export function CarrierList() {
  const addToast = useAppStore(state => state.addToast);
  const [params, setParams] = useState<CarrierListParams>({ page: 0, size: 20, sort: 'name,asc' });
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Carrier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Carrier | null>(null);
  const [blockedRefs, setBlockedRefs] = useState<BlockedDeleteReference[] | undefined>();

  const { data, isLoading } = useCarriers({ ...params, search: search || undefined });
  const deleteCarrier = useDeleteCarrier();

  function openAdd() { setEditing(null); setFormOpen(true); }
  function openEdit(c: Carrier) { setEditing(c); setFormOpen(true); }
  function openDelete(c: Carrier) { setDeleteTarget(c); setBlockedRefs(undefined); }
  function closeDelete() { setDeleteTarget(null); setBlockedRefs(undefined); }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCarrier.mutateAsync({ id: deleteTarget.id, version: deleteTarget.version });
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

  const columns: ColumnDef<Carrier>[] = [
    { key: 'code', header: 'Code', cell: (c) => c.code },
    { key: 'name', header: 'Name', cell: (c) => c.name },
    { key: 'active', header: 'Active', cell: (c) => (c.active ? 'Yes' : 'No') },
    {
      key: 'actions',
      header: '',
      cell: (c) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => openDelete(c)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <EntityList
        title="Carriers"
        columns={columns}
        data={data}
        isLoading={isLoading}
        search={search}
        onSearchChange={handleSearchChange}
        page={params.page ?? 0}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
        onAdd={openAdd}
        addLabel="Add Carrier"
      />
      <CarrierForm open={formOpen} onClose={() => setFormOpen(false)} carrier={editing} />
      <DeleteDialog
        open={!!deleteTarget}
        onClose={closeDelete}
        entityName={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
        isDeleting={deleteCarrier.isPending}
        blockedReferences={blockedRefs}
      />
    </>
  );
}
