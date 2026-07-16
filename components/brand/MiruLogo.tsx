import Image from 'next/image'
import { cn } from '@/lib/cn'

export type MiruLogoVariant = 'icon' | 'icon-bg' | 'full' | 'full-bg'

const VARIANTS: Record<
  MiruLogoVariant,
  { src: string; width: number; height: number; alt: string }
> = {
  icon: {
    src: '/brand/logo.svg',
    width: 119,
    height: 118,
    alt: 'Logo MIRU',
  },
  'icon-bg': {
    src: '/brand/logo-bg.svg',
    width: 139,
    height: 142,
    alt: 'Logo MIRU',
  },
  full: {
    src: '/brand/logo-with-text.svg',
    width: 312,
    height: 118,
    alt: 'MIRU Bank Sampah',
  },
  'full-bg': {
    src: '/brand/logo-with-text-bg.svg',
    width: 399,
    height: 218,
    alt: 'MIRU Bank Sampah',
  },
}

export interface MiruLogoProps {
  variant?: MiruLogoVariant
  className?: string
  height?: number
  priority?: boolean
}

export function MiruLogo({
  variant = 'icon',
  className,
  height = 36,
  priority = false,
}: MiruLogoProps) {
  const config = VARIANTS[variant]
  const width = Math.round((height * config.width) / config.height)

  return (
    <Image
      src={config.src}
      alt={config.alt}
      width={width}
      height={height}
      priority={priority}
      unoptimized
      className={cn('h-auto w-auto shrink-0', className)}
      style={{ height, width }}
    />
  )
}
