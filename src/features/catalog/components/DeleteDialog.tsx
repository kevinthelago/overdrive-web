import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { BlockedDeleteReference } from '../types';

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  entityName: string;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  blockedReferences?: BlockedDeleteReference[];
}

export function DeleteDialog({
  open,
  onClose,
  entityName,
  onConfirm,
  isDeleting,
  blockedReferences,
}: DeleteDialogProps) {
  const isBlocked = blockedReferences && blockedReferences.length > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isBlocked ? 'Cannot Delete' : 'Confirm Delete'}</DialogTitle>
        </DialogHeader>

        {isBlocked ? (
          <div className="space-y-3">
            <p className="text-sm text-white/80">
              <span className="font-semibold text-white">{entityName}</span> cannot be deleted because it is
              referenced by the following:
            </p>
            <ul className="divide-y divide-white/10 rounded-md border border-white/10">
              {blockedReferences.map((ref) => (
                <li key={ref.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-white">{ref.name}</span>
                  <Badge variant="secondary">{ref.type}</Badge>
                </li>
              ))}
            </ul>
            <p className="text-xs text-white/50">
              Remove or reassign these references before deleting.
            </p>
          </div>
        ) : (
          <p className="text-sm text-white/80">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-white">{entityName}</span>? This action cannot be
            undone.
          </p>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
            {isBlocked ? 'Close' : 'Cancel'}
          </Button>
          {!isBlocked && (
            <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
