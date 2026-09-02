import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface EmptyStateProps {
  title?: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
  compact?: boolean
}

export function EmptyState({
  title = 'Belum ada data',
  description = 'Data akan muncul di sini setelah tersedia.',
  icon,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background text-center',
        compact ? 'px-4 py-8' : 'px-6 py-12',
        className,
      )}
    >
      <div
        className={cn(
          'mb-3 flex items-center justify-center rounded-full bg-surface-muted text-muted-foreground',
          compact ? 'size-10' : 'mb-4 size-12',
        )}
      >
        {icon ?? <Inbox className={cn(compact ? 'size-5' : 'size-6')} aria-hidden />}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
