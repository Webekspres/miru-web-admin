'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR, { useSWRConfig } from 'swr'
import Link from 'next/link'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/providers/AuthProvider'
import { canMutate } from '@/lib/permissions'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import {
  ArrowLeft,
  BookOpen,
  Image as ImageIcon,
  Save,
  ShieldAlert,
} from 'lucide-react'
import type { KontenEdukasi, WasteCategory } from '@/types/models'

export interface EducationFormProps {
  initialData?: KontenEdukasi
  isEdit?: boolean
}

interface FormState {
  judul: string
  isi: string
  featured_image: string
  kategori_terkait: string
  aktif: boolean
  urutan: string
}

interface FormErrors {
  judul?: string
  isi?: string
  featured_image?: string
  kategori_terkait?: string
  urutan?: string
  _general?: string
}

export function EducationForm({ initialData, isEdit = false }: EducationFormProps) {
  const router = useRouter()
  const { role: authRole } = useAuth()
  const { success: toastSuccess, error: toastError } = useToast()
  const { mutate: globalMutate } = useSWRConfig()
  const canWrite = authRole ? canMutate(authRole) : false

  const { data: categories } = useSWR('/waste-categories/', (path) => api.get<WasteCategory[]>(path), {
    revalidateOnFocus: false,
  })
  const categoryOptions = (categories ?? []).map((c) => ({
    value: String(c.id),
    label: c.nama,
  }))

  const [form, setForm] = useState<FormState>({
    judul: initialData?.judul ?? '',
    isi: initialData?.isi ?? '',
    featured_image: initialData?.featured_image ?? initialData?.gambar_url ?? '',
    kategori_terkait: initialData?.kategori_terkait ? String(initialData.kategori_terkait) : '',
    aktif: initialData?.aktif ?? true,
    urutan: initialData?.urutan !== undefined ? String(initialData.urutan) : '0',
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  function validate(): boolean {
    const errs: FormErrors = {}
    let valid = true

    if (!form.judul.trim()) {
      errs.judul = 'Judul artikel wajib diisi.'
      valid = false
    }
    if (!form.isi.trim()) {
      errs.isi = 'Isi artikel wajib diisi.'
      valid = false
    }
    const urutan = parseInt(form.urutan)
    if (form.urutan === '' || isNaN(urutan) || urutan < 0) {
      errs.urutan = 'Urutan harus berupa angka ≥ 0.'
      valid = false
    }

    setFormErrors(errs)
    return valid
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || !canWrite) return
    setSubmitting(true)

    const payload = {
      judul: form.judul.trim(),
      isi: form.isi,
      featured_image: form.featured_image.trim() || null,
      gambar_url: form.featured_image.trim() || null,
      kategori_terkait: form.kategori_terkait ? Number(form.kategori_terkait) : null,
      aktif: form.aktif,
      urutan: parseInt(form.urutan),
    }

    try {
      if (isEdit && initialData?.id) {
        await api.patch(`/edukasi/${initialData.id}/`, payload)
        toastSuccess('Artikel edukasi berhasil diperbarui.')
      } else {
        await api.post('/edukasi/', payload)
        toastSuccess('Artikel edukasi baru berhasil diterbitkan.')
      }
      globalMutate('/edukasi/')
      router.push('/education')
    } catch (err) {
      if (err instanceof ApiError) {
        const apiErrs: FormErrors = {}
        if (err.errors) {
          for (const [field, messages] of Object.entries(err.errors)) {
            const msg = messages.join(', ')
            if (field === 'judul') apiErrs.judul = msg
            else if (field === 'isi') apiErrs.isi = msg
            else if (field === 'featured_image' || field === 'gambar_url') apiErrs.featured_image = msg
            else if (field === 'kategori_terkait') apiErrs.kategori_terkait = msg
            else if (field === 'urutan') apiErrs.urutan = msg
            else apiErrs._general = msg
          }
        } else {
          apiErrs._general = err.message
        }
        setFormErrors(apiErrs)
        toastError('Periksa kembali isian form.')
      } else {
        toastError('Terjadi kesalahan. Silakan coba lagi.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!canWrite) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/education">
            <Button type="button" variant="outline" size="sm">
              <ArrowLeft className="size-4" aria-hidden />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Akses Terbatas</h1>
        </div>
        <Card className="p-6">
          <div className="flex items-center gap-3 text-danger">
            <ShieldAlert className="size-6" />
            <p className="text-sm font-semibold">Anda tidak memiliki izin untuk mengedit atau menambahkan artikel.</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/education">
            <Button type="button" variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="size-4" aria-hidden />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isEdit ? 'Edit Artikel Edukasi' : 'Tambah Artikel Edukasi Baru'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEdit ? 'Perbarui isi dan gambar artikel edukasi' : 'Tulis artikel panduan pemilahan sampah dengan gambar utama dan Markdown editor'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/education">
            <Button type="button" variant="outline" disabled={submitting}>
              Batal
            </Button>
          </Link>
          <Button type="button" onClick={handleSubmit} loading={submitting} disabled={submitting} className="gap-1.5 font-semibold">
            <Save className="size-4" aria-hidden />
            {isEdit ? 'Simpan Perubahan' : 'Terbitkan Artikel'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formErrors._general && (
          <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger" role="alert">
            {formErrors._general}
          </div>
        )}

        <Card className="p-6 space-y-5">
          {/* Judul Artikel */}
          <Input
            label="Judul Artikel"
            placeholder="Contoh: Panduan Lengkap Memilah Sampah Organik dan Anorganik"
            value={form.judul}
            onChange={(e) => {
              setForm((p) => ({ ...p, judul: e.target.value }))
              setFormErrors((p) => { const n = { ...p }; delete n.judul; return n })
            }}
            error={formErrors.judul}
          />

          {/* Featured Image (Gambar Utama) */}
          <div className="space-y-2">
            <Input
              label="Gambar Utama / Featured Image (URL)"
              placeholder="https://example.com/images/artikel-banner.jpg"
              value={form.featured_image}
              onChange={(e) => {
                setForm((p) => ({ ...p, featured_image: e.target.value }))
                setFormErrors((p) => { const n = { ...p }; delete n.featured_image; return n })
              }}
              error={formErrors.featured_image}
            />

            {form.featured_image.trim() ? (
              <div className="relative overflow-hidden rounded-xl border border-border bg-surface-muted/40 p-2">
                <img
                  src={form.featured_image.trim()}
                  alt="Featured Preview"
                  className="max-h-64 w-full rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <p className="mt-1.5 px-1 text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-primary" />
                  Preview Gambar Utama (Featured Image)
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ImageIcon className="size-3.5" />
                Masukkan URL gambar utama artikel untuk menampilkan banner thumbnail.
              </p>
            )}
          </div>

          {/* Metadata Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Kategori Terkait (opsional)"
              placeholder="Pilih Kategori Terkait"
              options={categoryOptions}
              value={form.kategori_terkait}
              onChange={(e) => {
                setForm((p) => ({ ...p, kategori_terkait: e.target.value }))
                setFormErrors((p) => { const n = { ...p }; delete n.kategori_terkait; return n })
              }}
              error={formErrors.kategori_terkait}
            />
            <Input
              label="Urutan Tampil"
              type="number"
              min="0"
              placeholder="Contoh: 1"
              value={form.urutan}
              onChange={(e) => {
                setForm((p) => ({ ...p, urutan: e.target.value }))
                setFormErrors((p) => { const n = { ...p }; delete n.urutan; return n })
              }}
              error={formErrors.urutan}
            />
          </div>

          {/* Full-width Rich Text / Markdown Editor */}
          <RichTextEditor
            id="edukasi-isi"
            label="Isi Artikel (Rich Text Editor & Markdown)"
            value={form.isi}
            onChange={(val) => {
              setForm((p) => ({ ...p, isi: val }))
              setFormErrors((p) => { const n = { ...p }; delete n.isi; return n })
            }}
            placeholder={'# Judul Panduan\n\nTulis artikel edukasi di sini. Anda dapat menggunakan toolbar untuk **tebal**, *miring*, daftar, dan **sisipkan gambar** (`![alt](url)`).'}
            rows={14}
            error={formErrors.isi}
          />

          {/* Status Aktif */}
          <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-surface-muted/30">
            <div>
              <p className="text-sm font-semibold text-foreground">Status Publikasi Artikel</p>
              <p className="text-xs text-muted-foreground">
                {form.aktif ? 'Artikel ini dapat dibaca oleh nasabah di aplikasi' : 'Artikel disembunyikan (draft)'}
              </p>
            </div>
            <button
              id="edukasi-aktif"
              type="button"
              role="switch"
              aria-checked={form.aktif}
              onClick={() => setForm((p) => ({ ...p, aktif: !p.aktif }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                form.aktif ? 'bg-success' : 'bg-border'
              }`}
            >
              <span
                className={`inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${
                  form.aktif ? 'translate-x-[22px]' : 'translate-x-[2px]'
                }`}
              />
            </button>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/education">
            <Button type="button" variant="outline" disabled={submitting}>
              Batal
            </Button>
          </Link>
          <Button type="submit" loading={submitting} disabled={submitting} className="gap-1.5 font-semibold">
            <Save className="size-4" aria-hidden />
            {isEdit ? 'Simpan Perubahan' : 'Terbitkan Artikel'}
          </Button>
        </div>
      </form>
    </div>
  )
}
