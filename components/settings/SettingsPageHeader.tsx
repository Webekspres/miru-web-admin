'use client'

import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'

export function SettingsPageHeader({
  title,
  description,
  backHref = '/settings',
  editHref,
  canEdit = false,
}: {
  title: string
  description?: string
  backHref?: string
  editHref?: string
  canEdit?: boolean
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <Link
          href={backHref}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Kembali
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {canEdit && editHref && (
        <Link
          href={editHref}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary-hover"
        >
          <Pencil className="size-3.5" aria-hidden />
          Edit
        </Link>
      )}
    </div>
  )
}
