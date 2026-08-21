'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/cn'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  title?: string
  message: string
  variant: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toasts: ToastItem[]
  toast: (item: Omit<ToastItem, 'id'>) => void
  dismiss: (id: string) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-success/30 bg-success/5 text-success',
  error: 'border-danger/30 bg-danger/5 text-danger',
  info: 'border-primary/30 bg-primary/5 text-primary',
}

const variantIcons: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem
  onDismiss: (id: string) => void
}) {
  const Icon = variantIcons[item.variant]

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg',
        'bg-background',
        variantStyles[item.variant],
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {item.title && (
          <p className="text-sm font-semibold text-foreground">{item.title}</p>
        )}
        <p className="text-sm text-foreground">{item.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
        aria-label="Tutup notifikasi"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = crypto.randomUUID()
      setToasts((current) => [...current, { ...item, id }])
    },
    [],
  )

  const success = useCallback(
    (message: string, title?: string) => {
      toast({ message, title, variant: 'success', duration: 4000 })
    },
    [toast],
  )

  const error = useCallback(
    (message: string, title?: string) => {
      toast({ message, title, variant: 'error', duration: 6000 })
    },
    [toast],
  )

  const info = useCallback(
    (message: string, title?: string) => {
      toast({ message, title, variant: 'info', duration: 4000 })
    },
    [toast],
  )

  const value = useMemo(
    () => ({ toasts, toast, dismiss, success, error, info }),
    [toasts, toast, dismiss, success, error, info],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-100 flex flex-col gap-2"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((item) => (
          <AutoDismissToast
            key={item.id}
            item={item}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function AutoDismissToast({
  item,
  onDismiss,
}: {
  item: ToastItem
  onDismiss: (id: string) => void
}) {
  useEffect(() => {
    const duration = item.duration ?? 4000
    const timer = window.setTimeout(() => onDismiss(item.id), duration)
    return () => window.clearTimeout(timer)
  }, [item, onDismiss])

  return <ToastCard item={item} onDismiss={onDismiss} />
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast harus dipakai di dalam ToastProvider')
  }
  return context
}
