import { User } from 'lucide-react'
import { cn } from '@/lib/cn'

const sizeClass = {
  sm: 'size-6',
  sidebar: 'size-9',
  md: 'size-14',
  lg: 'size-20',
} as const

const iconClass = {
  sm: 'size-3.5',
  sidebar: 'size-5',
  md: 'size-7',
  lg: 'size-9',
} as const

export function UserAvatar({
  src,
  name,
  size = 'md',
  className,
}: {
  src?: string | null
  name: string
  size?: keyof typeof sizeClass
  className?: string
}) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary',
        sizeClass[size],
        className,
      )}
      aria-hidden={!src}
    >
      {src ? (
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        <User className={iconClass[size]} aria-hidden />
      )}
    </span>
  )
}
