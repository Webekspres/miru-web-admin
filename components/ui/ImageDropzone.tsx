'use client'

import { useRef, useState } from 'react'
import { ImageIcon, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/cn'

const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp'

export function ImageDropzone({
  value,
  onUpload,
  onClear,
  disabled = false,
  label = 'Upload Photos',
  hint = 'Supports: PNG, JPG, JPEG, WEBP',
  className,
}: {
  value?: string | null
  onUpload: (file: File) => Promise<void>
  onClear?: () => void
  disabled?: boolean
  label?: string
  hint?: string
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File | undefined) {
    if (!file || disabled) return
    if (!file.type.startsWith('image/')) {
      setError('Pilih file gambar (PNG, JPG, JPEG, WEBP).')
      return
    }
    setUploading(true)
    setError('')
    try {
      await onUpload(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah gambar.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <p className="text-sm font-medium text-foreground">{label}</p>
      )}

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-border bg-surface-muted/40 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="max-h-64 w-full rounded-lg object-cover"
          />
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled || uploading}
              className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm hover:bg-surface-muted"
              aria-label="Hapus gambar"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setDragging(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            void handleFile(e.dataTransfer.files?.[0])
          }}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors',
            dragging
              ? 'border-primary bg-primary/5'
              : 'border-border bg-surface-muted/30 hover:border-primary/40 hover:bg-surface-muted/50',
            (disabled || uploading) && 'cursor-not-allowed opacity-60',
          )}
        >
          <span className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {uploading ? (
              <Loader2 className="size-7 animate-spin" aria-hidden />
            ) : (
              <ImageIcon className="size-7" aria-hidden />
            )}
          </span>
          <span className="text-sm text-foreground">
            {uploading ? (
              'Mengunggah…'
            ) : (
              <>
                Drop your image here, or{' '}
                <span className="font-semibold text-primary">browse</span>
              </>
            )}
          </span>
          <span className="text-xs text-muted-foreground">{hint}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(e) => {
          void handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {error && (
        <p className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
