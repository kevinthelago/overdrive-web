import React, { useState } from 'react';
import { type ColumnDef } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';
import { EntityList } from '../components/EntityList';
import { DeleteDialog } from '../components/DeleteDialog';
import { RateTableForm } from './RateTableForm';
import { useRateTables, useDeleteRateTable, useAllCarriers, useServiceLevelsByCarrier } from '../hooks';
import { ApiError } from '../../../lib/api/client';
import type { RateTable, RateTableListParams, BlockedDeleteReference } from '../types';

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function RateTableList() {
  const { toast } = useToast();
  const [params, setParams] = useState<RateTableListParams>({ page: 0, size: 20 });
  const [search, setSearch] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('');
  const [serviceLevelFilter, setServiceLevelFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RateTable | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RateTable | null>(null);
  const [blockedRefs, setBlockedRefs] = useState<BlockedDeleteReference[] | undefined>();

  const { data, isLoading } = useRateTables({
    ...params,
    search: search || undefined,
    carrierId: carrierFilter || undefined,
    serviceLevelId: serviceLevelFilter || undefined,
  });
  const { data: carriersPage } = useAllCarriers();
  const { data: serviceLevelsPage } = useServiceLevelsByCarrier(carrierFilter);
  const deleteRateTable = useDeleteRateTable();

  function openAdd() { setEditing(null); setFormOpen(true); }
  function openEdit(rt: RateTable) { setEditing(rt); setFormOpen(true); }
  function openDelete(rt: RateTable) { setDeleteTarget(rt); setBlockedRefs(undefined); }
  function closeDelete() { setDeleteTarget(null); setBlockedRefs(undefined); }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRateTable.mutateAsync({ id: deleteTarget.id, version: deleteTarget.version });
      toast({ title: 'Rate table entry deleted.' });
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

  function handleCarrierChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setCarrierFilter(e.target.value);
    setServiceLevelFilter('');
    setParams((p) => ({ ...p, page: 0 }));
  }

  const columns: ColumnDef<RateTable>[] = [
    { accessorKey: 'carrierName', header: 'Carrier' },
    { accessorKey: 'serviceLevelName', header: 'Service Level' },
    { accessorKey: 'originZone', header: 'Origin Zone' },
    { accessorKey: 'destZone', header: 'Dest Zone' },
    {
      id: 'weightBand',
      header: 'Weight Band (lb)',
      cell: ({ row }) => `${row.original.weightMinLb}–${row.original.weightMaxLb}`,
    },
    {
      accessorKey: 'rateCents',
      header: 'Rate',
      cell: ({ row }) => formatCents(row.original.rateCents),
    },
    { accessorKey: 'effectiveDate', header: 'Effective' },
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
    <>
      <select
        value={carrierFilter}
        onChange={handleCarrierChange}
        className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Filter by carrier"
      >
        <option value="">All carriers</option>
        {carriersPage?.content.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <select
        value={serviceLevelFilter}
        onChange={(e) => { setServiceLevelFilter(e.target.value); setParams((p) => ({ ...p, page: 0 })); }}
        className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Filter by service level"
        disabled={!carrierFilter}
      >
        <option value="">All service levels</option>
        {serviceLevelsPage?.content.map((sl) => (
          <option key={sl.id} value={sl.id}>{sl.name}</option>
        ))}
      </select>
    </>
  );

  return (
    <>
      <EntityList
        title="Rate Tables"
        columns={columns}
        data={data}
        isLoading={isLoading}
        search={search}
        onSearchChange={handleSearchChange}
        filters={filters}
        page={params.page ?? 0}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
        onAdd={openAdd}
        addLabel="Add Rate Entry"
      />
      <RateTableForm open={formOpen} onClose={() => setFormOpen(false)} rateTable={editing} />
      <DeleteDialog
        open={!!deleteTarget}
        onClose={closeDelete}
        entityName={deleteTarget ? `${deleteTarget.carrierName} / ${deleteTarget.serviceLevelName} (${deleteTarget.originZone}→${deleteTarget.destZone})` : ''}
        onConfirm={handleDelete}
        isDeleting={deleteRateTable.isPending}
        blockedReferences={blockedRefs}
      />
    </>
  );
}
