'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'
import type { PaginationMeta } from '@/types/api'

export interface PaginationControlsProps {
  meta: PaginationMeta | undefined
  page: number
  onPageChange: (p: number) => void
}

export function PaginationControls({
  meta,
  page,
  onPageChange,
}: PaginationControlsProps) {
  if (!meta || meta.total_pages <= 1) return null

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Menampilkan halaman {meta.page} dari {meta.total_pages} ({meta.count} total)
      </p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={!meta.previous} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="size-4" aria-hidden />
          Sebelumnya
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!meta.next} onClick={() => onPageChange(page + 1)}>
          Selanjutnya
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
