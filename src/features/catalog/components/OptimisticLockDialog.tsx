import { Dialog, DialogContent } from '../../../components/ui/Dialog';
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
      <DialogContent
        title="Record Modified"
        footer={<Button onClick={handleReload}>Reload</Button>}
      >
        <p className="text-sm text-white/80">
          Someone else modified this record. Reload to see the latest version before making changes.
        </p>
      </DialogContent>
    </Dialog>
  );
}
