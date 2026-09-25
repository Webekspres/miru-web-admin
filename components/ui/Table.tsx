import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { EmptyState } from '@/components/feedback/EmptyState'

export function Table({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border">
      <table
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
}

export function TableHeader({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn('border-b border-border bg-surface-muted/60', className)}
      {...props}
    />
  )
}

export function TableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}

export function TableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-border transition-colors hover:bg-surface-muted/40',
        className,
      )}
      {...props}
    />
  )
}

export function TableHead({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function TableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('px-4 py-3 align-middle text-foreground', className)}
      {...props}
    />
  )
}

export function TableEmpty({
  colSpan,
  message = 'Tidak ada data.',
  description,
}: {
  colSpan: number
  message?: string
  description?: string
}) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="p-0">
        <EmptyState
          compact
          title={message}
          description={description ?? ''}
          className="rounded-none border-0 bg-transparent"
        />
      </TableCell>
    </TableRow>
  )
}
