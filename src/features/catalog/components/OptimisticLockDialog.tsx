import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';

interface OptimisticLockDialogProps {
  open: boolean;
  onReload: () => void;
}

export function OptimisticLockDialog({ open, onReload }: OptimisticLockDialogProps) {
  function handleReload() {
    window.location.reload();
    onReload();
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Modified</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-white/80">
          Someone else modified this record. Reload to see the latest version before making changes.
        </p>
        <DialogFooter>
          <Button onClick={handleReload}>Reload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
