import * as LabelPrimitive from '@radix-ui/react-label'
import * as SelectPrimitive from '@radix-ui/react-select'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ComponentPropsWithoutRef,
  forwardRef,
} from 'react'
import { cn } from '@/lib/utils'

// ── Label ────────────────────────────────────────────────────────────────────

export interface FieldLabelProps extends ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  required?: boolean
}

export function FieldLabel({ className, required, children, ...props }: FieldLabelProps) {
  return (
    <LabelPrimitive.Root
      className={cn('block text-sm font-medium text-text-secondary', className)}
      {...props}
    >
      {children}
      {required && <span className="ml-0.5 text-danger">*</span>}
    </LabelPrimitive.Root>
  )
}

// ── FieldHint / FieldError ────────────────────────────────────────────────────

export function FieldHint({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mt-1 text-xs text-text-muted', className)} {...props} />
}

export function FieldError({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mt-1 text-xs text-danger', className)} {...props} />
}

// ── Input ─────────────────────────────────────────────────────────────────────

const inputBase =
  'w-full rounded border bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      inputBase,
      'h-8',
      error ? 'border-danger focus-visible:ring-danger/50' : 'border-border',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'

// ── Textarea ──────────────────────────────────────────────────────────────────

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        inputBase,
        'py-2 resize-y min-h-[80px]',
        error ? 'border-danger focus-visible:ring-danger/50' : 'border-border',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

// ── Checkbox ─────────────────────────────────────────────────────────────────

export interface CheckboxProps extends ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string
}

export function Checkbox({ className, label, id, ...props }: CheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <CheckboxPrimitive.Root
        id={id}
        className={cn(
          'h-4 w-4 shrink-0 rounded border border-border bg-surface-raised',
          'data-[state=checked]:bg-accent data-[state=checked]:border-accent',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="2,6 5,9 10,3" />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <LabelPrimitive.Root htmlFor={id} className="text-sm text-text-secondary cursor-pointer select-none">
          {label}
        </LabelPrimitive.Root>
      )}
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  error?: boolean
  className?: string
}

export function Select({ value, onValueChange, options, placeholder, disabled, error, className }: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        className={cn(
          inputBase,
          'h-8 flex items-center justify-between gap-2 cursor-pointer',
          error ? 'border-danger focus-visible:ring-danger/50' : 'border-border',
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder ?? 'Select…'} />
        <SelectPrimitive.Icon className="text-text-muted">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface-raised shadow-elevated',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          )}
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className={cn(
                  'relative flex cursor-pointer select-none items-center rounded px-2 py-1.5 text-sm text-text-primary',
                  'hover:bg-surface focus-visible:bg-surface outline-none',
                  'data-[state=checked]:text-accent',
                  'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
                )}
              >
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

// ── FormGroup ─────────────────────────────────────────────────────────────────

import type React from 'react'

export interface FormGroupProps {
  label: string
  htmlFor?: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function FormGroup({ label, htmlFor, required, hint, error, children, className }: FormGroupProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <FieldLabel htmlFor={htmlFor} required={required}>
        {label}
      </FieldLabel>
      {children}
      {hint && !error && <FieldHint>{hint}</FieldHint>}
      {error && <FieldError>{error}</FieldError>}
    </div>
  )
}
