'use client'

import { useCallback, useEffect, useState } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import { Markdown } from 'tiptap-markdown'
import {
  Bold,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  RotateCcw,
  RotateCw,
  Underline as UnderlineIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ImageDropzone } from '@/components/ui/ImageDropzone'
import { cn } from '@/lib/cn'

export interface RichTextEditorProps {
  id?: string
  value: string
  onChange: (val: string) => void
  onUploadImage?: (file: File) => Promise<string>
  placeholder?: string
  label?: string
  error?: string
  className?: string
  /** @deprecated ignored — editor height is fixed for writing UX */
  rows?: number
}

const isMac =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const mod = isMac ? '⌘' : 'Ctrl'

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  shortcut,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  shortcut?: string
  children: React.ReactNode
}) {
  const label = shortcut ? `${title} (${shortcut})` : title
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        'flex size-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors',
        'hover:bg-background hover:text-foreground',
        'disabled:cursor-not-allowed disabled:opacity-40',
        active && 'border-border bg-background text-foreground shadow-xs',
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="mx-0.5 h-5 w-px self-center bg-border" />
}

function getMarkdown(editor: Editor): string {
  const storage = editor.storage as { markdown?: { getMarkdown?: () => string } }
  return storage.markdown?.getMarkdown?.() ?? editor.getText()
}

export function RichTextEditor({
  id = 'rte-editor',
  value,
  onChange,
  onUploadImage,
  placeholder = 'Tulis artikel di sini…',
  label,
  error,
  className,
}: RichTextEditorProps) {
  const [imageOpen, setImageOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary underline underline-offset-2',
          },
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:float-left before:h-0 before:pointer-events-none before:text-muted-foreground',
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-h-80 w-full rounded-lg border border-border object-contain my-4',
        },
      }),
      Markdown.configure({
        html: false,
        tightLists: true,
        transformPastedText: true,
        transformCopiedText: false,
      }),
    ],
    content: value || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id,
        class: cn(
          'min-h-80 px-4 py-3 focus:outline-none text-base text-foreground',
          '[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold',
          '[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold',
          '[&_p]:mb-3 [&_p]:leading-relaxed',
          '[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6',
          '[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6',
          '[&_li]:mb-1',
          '[&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:bg-primary/5 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:italic',
          '[&_a]:text-primary [&_a]:underline',
          '[&_strong]:font-bold',
          '[&_em]:italic',
        ),
      },
    },
    onUpdate({ editor: ed }) {
      onChange(getMarkdown(ed))
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = getMarkdown(editor)
    if (current !== (value || '')) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [value, editor])

  const openLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    setLinkUrl(prev ?? '')
    setLinkOpen(true)
  }, [editor])

  useEffect(() => {
    if (!editor) return
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        openLink()
      }
    }
    editor.view.dom.addEventListener('keydown', onKeyDown)
    return () => editor.view.dom.removeEventListener('keydown', onKeyDown)
  }, [editor, openLink])

  if (!editor) return null

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-background">
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface-muted/50 p-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Judul 2"
          >
            <Heading2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Judul 3"
          >
            <Heading3 className="size-4" />
          </ToolbarButton>
          <Divider />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Tebal"
            shortcut={`${mod}+B`}
          >
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Miring"
            shortcut={`${mod}+I`}
          >
            <Italic className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Garis bawah"
            shortcut={`${mod}+U`}
          >
            <UnderlineIcon className="size-4" />
          </ToolbarButton>
          <Divider />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Daftar bullet"
            shortcut={`${mod}+Shift+8`}
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Daftar bernomor"
            shortcut={`${mod}+Shift+7`}
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Kutipan"
            shortcut={`${mod}+Shift+B`}
          >
            <Quote className="size-4" />
          </ToolbarButton>
          <Divider />
          <ToolbarButton
            onClick={openLink}
            active={editor.isActive('link')}
            title="Tautan"
            shortcut={`${mod}+K`}
          >
            <LinkIcon className="size-4" />
          </ToolbarButton>
          {onUploadImage && (
            <ToolbarButton
              onClick={() => {
                setImageSrc('')
                setImageAlt('')
                setImageOpen(true)
              }}
              title="Sisipkan gambar"
            >
              <ImageIcon className="size-4" />
            </ToolbarButton>
          )}
          <Divider />
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Urungkan"
            shortcut={`${mod}+Z`}
          >
            <RotateCcw className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Ulangi"
            shortcut={isMac ? `${mod}+Shift+Z` : 'Ctrl+Y'}
          >
            <RotateCw className="size-4" />
          </ToolbarButton>
        </div>

        <div className="max-h-[min(70vh,560px)] min-h-80 overflow-y-auto">
          <EditorContent editor={editor} />
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border bg-surface-muted/40 px-3 py-1.5">
          {[
            [`${mod}+B`, 'Tebal'],
            [`${mod}+I`, 'Miring'],
            [`${mod}+U`, 'Garis bawah'],
            [`${mod}+K`, 'Tautan'],
            [`${mod}+Z`, 'Urungkan'],
          ].map(([key, text]) => (
            <span key={key} className="font-mono text-[10px] text-muted-foreground">
              <kbd className="rounded border border-border bg-background px-1 py-0.5">{key}</kbd>{' '}
              {text}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      )}

      <Modal
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        title="Tautan"
        description="Masukkan URL untuk teks yang dipilih."
        size="sm"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setLinkOpen(false)}>
              Batal
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                editor.chain().focus().extendMarkRange('link').unsetLink().run()
                setLinkOpen(false)
              }}
            >
              Hapus tautan
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!linkUrl.trim()) return
                editor
                  .chain()
                  .focus()
                  .extendMarkRange('link')
                  .setLink({ href: linkUrl.trim() })
                  .run()
                setLinkOpen(false)
              }}
              disabled={!linkUrl.trim()}
            >
              Simpan
            </Button>
          </>
        }
      >
        <Input
          label="URL"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://"
          autoFocus
        />
      </Modal>

      {onUploadImage && (
        <Modal
          open={imageOpen}
          onClose={() => setImageOpen(false)}
          title="Upload Photos"
          description="Unggah gambar lalu sisipkan ke artikel."
          size="md"
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setImageOpen(false)}>
                Batal
              </Button>
              <Button
                type="button"
                disabled={!imageSrc}
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .setImage({ src: imageSrc, alt: imageAlt.trim() || 'Gambar' })
                    .run()
                  onChange(getMarkdown(editor))
                  setImageOpen(false)
                }}
              >
                Sisipkan gambar
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <ImageDropzone
              value={imageSrc || null}
              onUpload={async (file) => {
                const url = await onUploadImage(file)
                setImageSrc(url)
                if (!imageAlt.trim()) {
                  setImageAlt(file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '))
                }
              }}
              onClear={() => setImageSrc('')}
            />
            <Input
              label="Teks alternatif (opsional)"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Deskripsi singkat gambar"
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
