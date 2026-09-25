import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-all duration-200',
        className,
      )}
      {...props}
    />
  )
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'emerald' | 'cyan' | 'amber' | 'rose' | 'slate' | 'primary'
}

export function CardHeader({
  className,
  variant = 'default',
  ...props
}: CardHeaderProps) {
  const variantStyles = {
    default: 'border-b border-border bg-background text-foreground',
    primary: 'bg-primary text-primary-foreground',
    emerald: 'bg-emerald-600 text-white',
    cyan: 'bg-cyan-600 text-white',
    amber: 'bg-amber-500 text-white',
    rose: 'bg-rose-600 text-white',
    slate: 'bg-slate-800 text-slate-100',
  }[variant]

  return (
    <div
      className={cn('flex flex-col gap-1.5 px-5 py-3.5', variantStyles, className)}
      {...props}
    />
  )
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-base font-semibold text-inherit', className)}
      {...props}
    />
  )
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-inherit opacity-90', className)}
      {...props}
    />
  )
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center border-t border-border px-5 py-3.5',
        className,
      )}
      {...props}
    />
  )
}

