'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/cn'

const OVERLAY = {
  hero: 'bg-linear-to-r from-emerald-950/90 via-emerald-950/55 to-emerald-950/20',
  heroBottom: 'bg-linear-to-t from-emerald-950/75 via-transparent to-emerald-950/25',
  dark: 'bg-emerald-950/85',
  split: 'bg-linear-to-br from-emerald-950/92 via-emerald-900/78 to-black/70',
  mist: 'bg-[#eef3ef]/90',
} as const

const DEFAULT_INTERVAL_MS = 7500

export function PhotoBackdrop({
  src,
  alt = '',
  overlay,
  extraOverlay,
  kenBurns = false,
  priority = false,
  sizes = '100vw',
  intervalMs = DEFAULT_INTERVAL_MS,
  className,
}: {
  src: string | readonly string[]
  alt?: string
  overlay?: keyof typeof OVERLAY
  extraOverlay?: keyof typeof OVERLAY
  kenBurns?: boolean
  priority?: boolean
  sizes?: string
  intervalMs?: number
  className?: string
}) {
  const slides = Array.isArray(src) ? src : [src]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (slides.length < 2) return undefined
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [slides.length, intervalMs])

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)} aria-hidden={!alt}>
      {slides.map((slide, slideIndex) => {
        const active = slideIndex === index
        return (
          <Image
            key={slide}
            src={slide}
            alt={active ? alt : ''}
            fill
            priority={priority && slideIndex === 0}
            className={cn(
              'object-cover object-center transition-opacity duration-1000 ease-in-out',
              active ? 'opacity-100' : 'opacity-0',
              kenBurns &&
                active &&
                (slideIndex % 2 === 0
                  ? 'motion-safe:animate-ken-burns'
                  : 'motion-safe:animate-ken-burns-alt'),
            )}
            sizes={sizes}
          />
        )
      })}
      {overlay ? <div className={cn('absolute inset-0', OVERLAY[overlay])} /> : null}
      {extraOverlay ? (
        <div className={cn('absolute inset-0', OVERLAY[extraOverlay])} />
      ) : null}
    </div>
  )
}
