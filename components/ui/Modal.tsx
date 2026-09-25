'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
} as const

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}: ModalProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const dialog = dialogRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null

    function getFocusable(): HTMLElement[] {
      if (!dialog) return []
      return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.tabIndex !== -1 && !el.hasAttribute('disabled'),
      )
    }

    const initial = getFocusable()
    initial[0]?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const items = getFocusable()
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'relative z-10 w-full rounded-xl border border-border bg-background shadow-xl',
          sizeClasses[size],
          className,
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
            <div className="space-y-1">
              {title && (
                <h2 id={titleId} className="text-lg font-semibold text-foreground">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-11 min-w-11 shrink-0 px-2"
              onClick={onClose}
              aria-label="Tutup"
            >
              <X className="size-4" />
            </Button>
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
