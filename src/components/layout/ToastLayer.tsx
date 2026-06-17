import { useAppStore } from '@/state/appStore'
import { Toast, ToastProvider } from '@/components/ui'

export function ToastLayer() {
  const toastQueue = useAppStore((s) => s.toastQueue)
  const removeToast = useAppStore((s) => s.removeToast)

  return (
    <ToastProvider>
      {toastQueue.map((entry) => (
        <Toast
          key={entry.id}
          open
          onOpenChange={(open) => {
            if (!open) removeToast(entry.id)
          }}
          title={entry.title}
          description={entry.description}
          variant={entry.variant ?? 'default'}
        />
      ))}
    </ToastProvider>
  )
}
