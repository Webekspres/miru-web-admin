import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const variants = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-primary/40',
  secondary:
    'bg-surface-muted text-foreground hover:bg-border focus-visible:ring-primary/30',
  outline:
    'border border-border bg-background text-foreground hover:bg-surface-muted focus-visible:ring-primary/30',
  ghost:
    'text-foreground hover:bg-surface-muted focus-visible:ring-primary/30',
  danger:
    'bg-danger text-white hover:bg-danger-hover focus-visible:ring-danger/40',
} as const

const sizes = {
  sm: 'min-h-9 h-9 px-3 text-xs gap-1.5',
  md: 'min-h-11 h-11 px-4 text-sm gap-2',
  lg: 'min-h-12 h-12 px-5 text-base gap-2',
} as const

export type ButtonVariant = keyof typeof variants
export type ButtonSize = keyof typeof sizes

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <span
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
        )}
        {children}
      </button>
    )
  },
)
