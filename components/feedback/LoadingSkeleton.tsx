import { cn } from '@/lib/cn'

export interface LoadingSkeletonProps {
  className?: string
  lines?: number
}

export function LoadingSkeleton({
  className,
  lines = 3,
}: LoadingSkeletonProps) {
  return (
    <div
      className={cn('flex flex-col gap-3', className)}
      role="status"
      aria-label="Memuat data"
    >
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={cn(
            'h-4 animate-pulse rounded-md bg-surface-muted',
            index === lines - 1 && 'w-2/3',
          )}
        />
      ))}
      <span className="sr-only">Memuat...</span>
    </div>
  )
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-background p-6',
        className,
      )}
      role="status"
      aria-label="Memuat kartu"
    >
      <div className="mb-4 h-5 w-1/3 animate-pulse rounded-md bg-surface-muted" />
      <LoadingSkeleton lines={4} />
    </div>
  )
}

export function TableSkeleton({
  rows = 5,
  cols = 4,
  className,
}: {
  rows?: number
  cols?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-background',
        className,
      )}
      role="status"
      aria-label="Memuat tabel"
    >
      <div className="flex gap-4 border-b border-border bg-surface-muted/60 px-4 py-3">
        {Array.from({ length: cols }, (_, index) => (
          <div
            key={index}
            className="h-4 flex-1 animate-pulse rounded-md bg-surface-muted"
          />
        ))}
      </div>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 border-b border-border px-4 py-3 last:border-0"
        >
          {Array.from({ length: cols }, (_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 flex-1 animate-pulse rounded-md bg-surface-muted"
            />
          ))}
        </div>
      ))}
      <span className="sr-only">Memuat tabel...</span>
    </div>
  )
}
