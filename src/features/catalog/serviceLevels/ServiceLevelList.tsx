import { useState } from 'react';
import { type ColumnDef } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import { useAppStore } from '../../../state/appStore';
import { EntityList } from '../components/EntityList';
import { DeleteDialog } from '../components/DeleteDialog';
import { ServiceLevelForm } from './ServiceLevelForm';
import { useServiceLevels, useDeleteServiceLevel, useAllCarriers } from '../hooks';
import { ApiError } from '../../../lib/api/client';
import type { ServiceLevel, ServiceLevelListParams, BlockedDeleteReference } from '../types';

export function ServiceLevelList() {
  const addToast = useAppStore(state => state.addToast);
  const [params, setParams] = useState<ServiceLevelListParams>({ page: 0, size: 20, sort: 'name,asc' });
  const [search, setSearch] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceLevel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceLevel | null>(null);
  const [blockedRefs, setBlockedRefs] = useState<BlockedDeleteReference[] | undefined>();

  const { data, isLoading } = useServiceLevels({
    ...params,
    search: search || undefined,
    carrierId: carrierFilter || undefined,
  });
  const { data: carriersPage } = useAllCarriers();
  const deleteServiceLevel = useDeleteServiceLevel();

  function openAdd() { setEditing(null); setFormOpen(true); }
  function openEdit(sl: ServiceLevel) { setEditing(sl); setFormOpen(true); }
  function openDelete(sl: ServiceLevel) { setDeleteTarget(sl); setBlockedRefs(undefined); }
  function closeDelete() { setDeleteTarget(null); setBlockedRefs(undefined); }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteServiceLevel.mutateAsync({ id: deleteTarget.id, version: deleteTarget.version });
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

  const columns: ColumnDef<ServiceLevel>[] = [
    { key: 'carrierName', header: 'Carrier', cell: (sl) => sl.carrierName },
    { key: 'code', header: 'Code', cell: (sl) => sl.code },
    { key: 'name', header: 'Name', cell: (sl) => sl.name },
    {
      key: 'transit',
      header: 'Transit Days',
      cell: (sl) => sl.minTransitDays === sl.maxTransitDays
        ? `${sl.minTransitDays}`
        : `${sl.minTransitDays}–${sl.maxTransitDays}`,
    },
    { key: 'active', header: 'Active', cell: (sl) => (sl.active ? 'Yes' : 'No') },
    {
      key: 'actions',
      header: '',
      cell: (sl) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(sl)}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => openDelete(sl)}>Delete</Button>
        </div>
      ),
    },
  ];

  const filters = (
    <select
      value={carrierFilter}
      onChange={(e) => { setCarrierFilter(e.target.value); setParams((p) => ({ ...p, page: 0 })); }}
      className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Filter by carrier"
    >
      <option value="">All carriers</option>
      {carriersPage?.content.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );

  return (
    <>
      <EntityList
        title="Service Levels"
        columns={columns}
        data={data}
        isLoading={isLoading}
        search={search}
        onSearchChange={handleSearchChange}
        filters={filters}
        page={params.page ?? 0}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
        onAdd={openAdd}
        addLabel="Add Service Level"
      />
      <ServiceLevelForm open={formOpen} onClose={() => setFormOpen(false)} serviceLevel={editing} />
      <DeleteDialog
        open={!!deleteTarget}
        onClose={closeDelete}
        entityName={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
        isDeleting={deleteServiceLevel.isPending}
        blockedReferences={blockedRefs}
      />
    </>
  );
}
