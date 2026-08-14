'use client'

import { useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import { uploadEducationImage } from '@/lib/media'
import { useAuth } from '@/providers/AuthProvider'
import { canMutate } from '@/lib/permissions'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ImageDropzone } from '@/components/ui/ImageDropzone'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { ArrowLeft, Save, ShieldAlert } from 'lucide-react'
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
}

interface FormErrors {
  judul?: string
  isi?: string
  featured_image?: string
  kategori_terkait?: string
  _general?: string
}

export function EducationForm({ initialData, isEdit = false }: EducationFormProps) {
  const router = useRouter()
  const { role: authRole } = useAuth()
  const { success: toastSuccess, error: toastError } = useToast()
  const { mutate: globalMutate } = useSWRConfig()
  const canWrite = authRole ? canMutate(authRole) : false

  const { data: categories } = useSWR(
    '/waste-categories/',
    (path) => api.get<WasteCategory[]>(path),
    { revalidateOnFocus: false },
  )
  const categoryOptions = (categories ?? []).map((c) => ({
    value: String(c.id),
    label: c.nama,
  }))

  const [form, setForm] = useState<FormState>({
    judul: initialData?.judul ?? '',
    isi: initialData?.isi ?? '',
    featured_image: initialData?.featured_image ?? initialData?.gambar_url ?? '',
    kategori_terkait: initialData?.kategori_terkait
      ? String(initialData.kategori_terkait)
      : '',
    aktif: initialData?.aktif ?? true,
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

    setFormErrors(errs)
    return valid
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!validate() || !canWrite) return
    setSubmitting(true)

    const payload = {
      judul: form.judul.trim(),
      isi: form.isi,
      featured_image: form.featured_image.trim() || null,
      gambar_url: form.featured_image.trim() || null,
      kategori_terkait: form.kategori_terkait ? Number(form.kategori_terkait) : null,
      aktif: form.aktif,
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
            else if (field === 'featured_image' || field === 'gambar_url') {
              apiErrs.featured_image = msg
            } else if (field === 'kategori_terkait') apiErrs.kategori_terkait = msg
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
            <p className="text-sm font-semibold">
              Anda tidak memiliki izin untuk mengedit atau menambahkan artikel.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
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
              {isEdit
                ? 'Perbarui isi dan gambar artikel edukasi'
                : 'Tulis artikel panduan pemilahan sampah'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/education">
            <Button type="button" variant="outline" disabled={submitting}>
              Batal
            </Button>
          </Link>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            loading={submitting}
            disabled={submitting}
            className="gap-1.5 font-semibold"
          >
            <Save className="size-4" aria-hidden />
            {isEdit ? 'Simpan Perubahan' : 'Terbitkan Artikel'}
          </Button>
        </div>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        {formErrors._general && (
          <div
            className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger"
            role="alert"
          >
            {formErrors._general}
          </div>
        )}

        <Card className="space-y-5 p-6">
          <Input
            label="Judul Artikel"
            placeholder="Contoh: Panduan Lengkap Memilah Sampah Organik dan Anorganik"
            value={form.judul}
            onChange={(e) => {
              setForm((p) => ({ ...p, judul: e.target.value }))
              setFormErrors((p) => {
                const n = { ...p }
                delete n.judul
                return n
              })
            }}
            error={formErrors.judul}
          />

          <div className="space-y-1.5">
            <ImageDropzone
              label="Upload Photos"
              value={form.featured_image || null}
              onUpload={async (file) => {
                const uploaded = await uploadEducationImage(file)
                setForm((p) => ({ ...p, featured_image: uploaded.url }))
                setFormErrors((p) => {
                  const n = { ...p }
                  delete n.featured_image
                  return n
                })
              }}
              onClear={() => setForm((p) => ({ ...p, featured_image: '' }))}
              disabled={submitting}
            />
            {formErrors.featured_image && (
              <p className="text-xs font-medium text-danger" role="alert">
                {formErrors.featured_image}
              </p>
            )}
          </div>

          <div>
            <Select
              label="Kategori Terkait (opsional)"
              placeholder="Pilih Kategori Terkait"
              options={categoryOptions}
              value={form.kategori_terkait}
              onChange={(e) => {
                setForm((p) => ({ ...p, kategori_terkait: e.target.value }))
                setFormErrors((p) => {
                  const n = { ...p }
                  delete n.kategori_terkait
                  return n
                })
              }}
              error={formErrors.kategori_terkait}
            />
          </div>

          <RichTextEditor
            id="edukasi-isi"
            label="Isi Artikel"
            value={form.isi}
            onChange={(val) => {
              setForm((p) => ({ ...p, isi: val }))
              setFormErrors((p) => {
                const n = { ...p }
                delete n.isi
                return n
              })
            }}
            onUploadImage={async (file) => {
              const uploaded = await uploadEducationImage(file)
              return uploaded.url
            }}
            placeholder="Tulis artikel edukasi di sini…"
            error={formErrors.isi}
          />

          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted/30 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Status Publikasi Artikel</p>
              <p className="text-xs text-muted-foreground">
                {form.aktif
                  ? 'Artikel ini dapat dibaca oleh nasabah di aplikasi'
                  : 'Artikel disembunyikan (draft)'}
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
                  form.aktif ? 'translate-x-5.5' : 'translate-x-0.5'
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
          <Button
            type="submit"
            loading={submitting}
            disabled={submitting}
            className="gap-1.5 font-semibold"
          >
            <Save className="size-4" aria-hidden />
            {isEdit ? 'Simpan Perubahan' : 'Terbitkan Artikel'}
          </Button>
        </div>
      </form>
    </div>
  )
}
