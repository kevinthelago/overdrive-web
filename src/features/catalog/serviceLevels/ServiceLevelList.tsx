import { useState } from 'react';
import { type ColumnDef } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';
import { EntityList } from '../components/EntityList';
import { DeleteDialog } from '../components/DeleteDialog';
import { ServiceLevelForm } from './ServiceLevelForm';
import { useServiceLevels, useDeleteServiceLevel, useAllCarriers } from '../hooks';
import { ApiError } from '../../../lib/api/client';
import type { ServiceLevel, ServiceLevelListParams, BlockedDeleteReference } from '../types';

export function ServiceLevelList() {
  const { toast } = useToast();
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
      toast({ title: `"${deleteTarget.name}" deleted.` });
      closeDelete();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setBlockedRefs((err.body as { references?: BlockedDeleteReference[] }).references ?? []);
      } else {
        toast({ title: 'Delete failed', description: String(err), variant: 'destructive' });
      }
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setParams((p) => ({ ...p, page: 0 }));
  }

  const columns: ColumnDef<ServiceLevel>[] = [
    { accessorKey: 'carrierName', header: 'Carrier' },
    { accessorKey: 'code', header: 'Code' },
    { accessorKey: 'name', header: 'Name' },
    {
      id: 'transit',
      header: 'Transit Days',
      cell: ({ row }) => {
        const { minTransitDays, maxTransitDays } = row.original;
        return minTransitDays === maxTransitDays ? `${minTransitDays}` : `${minTransitDays}–${maxTransitDays}`;
      },
    },
    { accessorKey: 'active', header: 'Active', cell: ({ row }) => (row.original.active ? 'Yes' : 'No') },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => openDelete(row.original)}>Delete</Button>
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
