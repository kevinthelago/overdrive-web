import * as ToastPrimitive from '@radix-ui/react-toast'
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ToastProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  variant?: 'default' | 'success' | 'danger'
  action?: ReactNode
  duration?: number
}

const variantStyles = {
  default: 'border-border bg-surface-raised',
  success: 'border-success/30 bg-success-muted',
  danger: 'border-danger/30 bg-danger-muted',
}

const titleStyles = {
  default: 'text-text-primary',
  success: 'text-success',
  danger: 'text-danger',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      <ToastPrimitive.Viewport
        className={cn(
          'fixed bottom-0 right-0 z-[100] m-0 flex max-h-screen w-[390px] flex-col-reverse gap-2 p-6',
          'outline-none',
        )}
      />
    </ToastPrimitive.Provider>
  )
}

export function Toast({
  open,
  onOpenChange,
  title,
  description,
  variant = 'default',
  action,
  duration = 5000,
}: ToastProps) {
  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      duration={duration}
      className={cn(
        'pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-md border p-4 shadow-elevated',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
        'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
        'transition-all data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full',
        'data-[state=open]:slide-in-from-bottom-full',
        variantStyles[variant],
      )}
    >
      <div className="flex-1 gap-1">
        <ToastPrimitive.Title
          className={cn('text-sm font-semibold', titleStyles[variant])}
        >
          {title}
        </ToastPrimitive.Title>
        {description && (
          <ToastPrimitive.Description className="mt-0.5 text-xs text-text-secondary">
            {description}
          </ToastPrimitive.Description>
        )}
      </div>
      {action}
      <ToastPrimitive.Close
        className="shrink-0 rounded p-0.5 text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        aria-label="Close"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  )
}
