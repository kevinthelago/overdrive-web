import * as DialogPrimitive from '@radix-ui/react-dialog'
import { type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const Drawer = DialogPrimitive.Root
export const DrawerTrigger = DialogPrimitive.Trigger
export const DrawerClose = DialogPrimitive.Close

export interface DrawerContentProps extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  side?: 'left' | 'right'
  width?: string
}

export function DrawerContent({
  title,
  description,
  children,
  footer,
  side = 'right',
  width = 'w-96',
  className,
  ...props
}: DrawerContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-y-0 z-50 flex flex-col border-border bg-surface shadow-elevated',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          width,
          'data-[state=open]:animate-in data-[state=closed]:animate-out duration-300',
          side === 'right'
            ? 'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right'
            : 'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
          'focus-visible:outline-none',
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <DialogPrimitive.Title className="text-base font-semibold text-text-primary">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="mt-0.5 text-sm text-text-secondary">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            className={cn(
              'ml-4 shrink-0 rounded p-1 text-text-muted hover:text-text-primary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
            )}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </DialogPrimitive.Close>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
            {footer}
          </div>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
