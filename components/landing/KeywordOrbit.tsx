'use client'

import { useId } from 'react'
import { Recycle } from 'lucide-react'
import { cn } from '@/lib/cn'

const DEFAULT_TEXT =
  'Edukasi · Pemilahan · Daur Ulang · Setoran · Penjemputan · Laporan · '

export function KeywordOrbit({
  className,
  text = DEFAULT_TEXT,
}: {
  className?: string
  text?: string
}) {
  const rawId = useId().replace(/:/g, '')
  const pathId = `orbit-${rawId}`

  return (
    <div className={cn('relative size-40', className)}>
      <svg
        viewBox="0 0 200 200"
        className="size-full origin-center motion-safe:animate-orbit-spin"
        aria-hidden
      >
        <defs>
          <path
            id={pathId}
            d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
          />
        </defs>
        <text
          fill="currentColor"
          fontSize="11.5"
          fontWeight="600"
          letterSpacing="2.2"
        >
          <textPath href={`#${pathId}`}>{text}</textPath>
        </text>
      </svg>
      {/* Center tetap diam — float-y bikin ikon keluar dari orbit saat teks spin. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
          <Recycle className="size-7" aria-hidden />
        </span>
      </div>
    </div>
  )
}
