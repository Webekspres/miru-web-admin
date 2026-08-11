'use client'

import { useState } from 'react'
import {
  Bold,
  Columns2,
  Eye,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  PenTool,
  Quote,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import { cn } from '@/lib/cn'

export interface RichTextEditorProps {
  id?: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  rows?: number
  label?: string
  error?: string
  className?: string
}

export function RichTextEditor({
  id = 'rte-editor',
  value,
  onChange,
  placeholder = 'Tulis konten artikel di sini... Teks terformat dan gambar akan langsung tampil secara real-time di panel pratinjau sebelah kanan.',
  rows = 14,
  label,
  error,
  className,
}: RichTextEditorProps) {
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split')
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [imageCaption, setImageCaption] = useState('')
  const [imageError, setImageError] = useState(false)

  function insertFormatting(prefix: string, suffix: string = '', defaultText: string = 'teks') {
    const textarea = document.getElementById(id) as HTMLTextAreaElement | null
    if (!textarea) {
      onChange(value + `${prefix}${defaultText}${suffix}`)
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.substring(start, end)
    const content = selected || defaultText
    const replacement = `${prefix}${content}${suffix}`

    const newValue = value.substring(0, start) + replacement + value.substring(end)
    onChange(newValue)

    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + prefix.length
      textarea.setSelectionRange(newCursorPos, newCursorPos + content.length)
    }, 0)
  }

  function handleOpenImageModal() {
    setImageUrl('')
    setImageAlt('')
    setImageCaption('')
    setImageError(false)
    setImageModalOpen(true)
  }

  function handleConfirmImage() {
    if (!imageUrl.trim()) return
    const alt = imageAlt.trim() || 'Gambar Artikel'
    const caption = imageCaption.trim()
    
    let imgMarkdown = `\n![${alt}](${imageUrl.trim()})\n`
    if (caption) {
      imgMarkdown += `*${caption}*\n`
    }

    const textarea = document.getElementById(id) as HTMLTextAreaElement | null
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + imgMarkdown + value.substring(end)
      onChange(newValue)
      setTimeout(() => {
        textarea.focus()
        const nextPos = start + imgMarkdown.length
        textarea.setSelectionRange(nextPos, nextPos)
      }, 0)
    } else {
      onChange(value + imgMarkdown)
    }

    setImageModalOpen(false)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-foreground flex items-center justify-between">
          <span>{label}</span>
          <span className="text-xs text-muted-foreground font-normal">
            Real-time Live Preview &amp; Editor
          </span>
        </label>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
        {/* Editor Toolbar Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-muted/60 px-3 py-2">
          {/* Layout Mode Switcher */}
          <div className="flex items-center gap-1 rounded-lg bg-background p-1 ring-1 ring-border">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer',
                viewMode === 'split'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              title="Tampilan berdampingan (Live Real-time Preview)"
            >
              <Columns2 className="size-3.5" aria-hidden />
              Split View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer',
                viewMode === 'edit'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              title="Fokus Editor Tulis"
            >
              <PenTool className="size-3.5" aria-hidden />
              Editor Saja
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer',
                viewMode === 'preview'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              title="Fokus Pratinjau Full"
            >
              <Eye className="size-3.5" aria-hidden />
              Pratinjau Saja
            </button>
          </div>

          {/* Action Tools */}
          {viewMode !== 'preview' && (
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => insertFormatting('## ', '', 'Judul Bagian')}
                title="Judul 2 (H2)"
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground cursor-pointer"
              >
                <Heading2 className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('### ', '', 'Sub-judul')}
                title="Judul 3 (H3)"
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground cursor-pointer"
              >
                <Heading3 className="size-4" aria-hidden />
              </button>

              <div className="h-4 w-px bg-border mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting('**', '**', 'teks tebal')}
                title="Tebal (Bold)"
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground cursor-pointer"
              >
                <Bold className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*', 'teks miring')}
                title="Miring (Italic)"
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground cursor-pointer"
              >
                <Italic className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('> ', '', 'Teks kutipan penting')}
                title="Kutipan (Blockquote)"
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground cursor-pointer"
              >
                <Quote className="size-4" aria-hidden />
              </button>

              <div className="h-4 w-px bg-border mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting('- ', '', 'Poin daftar')}
                title="Daftar Poin (List)"
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground cursor-pointer"
              >
                <List className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('1. ', '', 'Langkah pertama')}
                title="Daftar Bernomor (Ordered List)"
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground cursor-pointer"
              >
                <ListOrdered className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('[Teks Link](', ')', 'https://example.com')}
                title="Sisipkan Tautan"
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground cursor-pointer"
              >
                <LinkIcon className="size-4" aria-hidden />
              </button>

              <div className="h-4 w-px bg-border mx-1" />

              {/* Dedicated Image Modal Button */}
              <button
                type="button"
                onClick={handleOpenImageModal}
                title="Sisipkan Gambar (Modal)"
                className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
              >
                <ImageIcon className="size-3.5" aria-hidden />
                <span>+ Gambar</span>
              </button>
            </div>
          )}
        </div>

        {/* Editor Body Grid */}
        <div className="min-h-[380px] bg-background">
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
              {/* Left: Textarea Editor */}
              <div className="p-3 flex flex-col">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <PenTool className="size-3 text-primary" /> Editor Markdown
                  </span>
                  <span>{value.length} karakter</span>
                </div>
                <textarea
                  id={id}
                  rows={rows}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="w-full flex-1 bg-transparent font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none resize-y min-h-[340px]"
                />
              </div>

              {/* Right: Real-time Live Preview */}
              <div className="p-4 bg-surface-muted/30 flex flex-col overflow-y-auto max-h-[500px]">
                <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider pb-2 border-b border-border">
                  <span className="flex items-center gap-1.5 text-primary">
                    <Sparkles className="size-3.5" /> Live Pratinjau Artikel
                  </span>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">Real-time</span>
                </div>
                {value.trim() ? (
                  <div className="prose prose-sm max-w-none">
                    <MarkdownContent source={value} />
                  </div>
                ) : (
                  <div className="my-auto text-center py-12">
                    <Eye className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">Belum ada konten artikel.</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">Ketik di sebelah kiri untuk melihat hasil tampilan secara langsung.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode === 'edit' && (
            <div className="p-4">
              <textarea
                id={id}
                rows={rows}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none resize-y min-h-[380px]"
              />
            </div>
          )}

          {viewMode === 'preview' && (
            <div className="p-6 bg-surface-muted/20 min-h-[380px]">
              {value.trim() ? (
                <MarkdownContent source={value} />
              ) : (
                <p className="text-sm italic text-muted-foreground">Belum ada konten untuk di-preview.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      )}

      {/* ── Modal Sisipkan Gambar Artikel ───────────────────────────── */}
      <Modal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        title="Sisipkan Gambar ke Artikel"
        description="Masukkan URL gambar dan deskripsi pendukung untuk disisipkan ke dalam konten artikel."
        size="md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setImageModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleConfirmImage}
              disabled={!imageUrl.trim()}
              className="gap-1.5 font-semibold"
            >
              <ImageIcon className="size-4" aria-hidden />
              Sisipkan Gambar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="URL Gambar / Link Image"
            placeholder="https://example.com/images/artikel-sampah.jpg"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value)
              setImageError(false)
            }}
          />

          <Input
            label="Teks Alternatif (Alt Text)"
            placeholder="Contoh: Pemilahan botol plastik bekas"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
          />

          <Input
            label="Sumber / Keterangan Gambar (Opsional)"
            placeholder="Contoh: Dokumen Bank Sampah MIRU"
            value={imageCaption}
            onChange={(e) => setImageCaption(e.target.value)}
          />

          {/* Live Preview Box inside Modal */}
          {imageUrl.trim() ? (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Eye className="size-3.5 text-primary" />
                Pratinjau Gambar Modal:
              </p>
              <div className="overflow-hidden rounded-xl border border-border bg-surface-muted/40 p-2 flex items-center justify-center min-h-[120px]">
                {!imageError ? (
                  <img
                    src={imageUrl.trim()}
                    alt={imageAlt || 'Pratinjau Gambar'}
                    className="max-h-48 rounded-lg object-contain"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="text-center p-4 text-xs text-danger">
                    <p className="font-semibold">URL gambar tidak dapat dimuat</p>
                    <p className="text-muted-foreground mt-0.5">Pastikan URL gambar valid dan dapat diakses publik.</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}
