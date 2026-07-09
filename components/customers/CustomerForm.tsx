'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { UserPlus, ArrowLeft, Save } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────

interface CustomerFormData {
  username: string
  password: string
  nama_lengkap: string
  no_hp: string
  alamat: string
}

interface FormErrors {
  username?: string
  password?: string
  nama_lengkap?: string
  no_hp?: string
  alamat?: string
  _general?: string
}

// ─── Props ─────────────────────────────────────────────────────────

interface CustomerFormProps {
  initialData?: {
    id: number
    username: string
    nama_lengkap: string
    no_hp?: string
    alamat?: string
    is_active: boolean
  }
  isEdit?: boolean
}

// ─── Main Component ───────────────────────────────────────────────

export function CustomerForm({ initialData, isEdit = false }: CustomerFormProps) {
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()

  const [formData, setFormData] = useState<CustomerFormData>({
    username: initialData?.username ?? '',
    password: '',
    nama_lengkap: initialData?.nama_lengkap ?? '',
    no_hp: initialData?.no_hp ?? '',
    alamat: initialData?.alamat ?? '',
  })
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true)
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  // ── Validation ──
  function validate(): boolean {
    const errs: FormErrors = {}
    let valid = true

    if (!formData.username.trim()) {
      errs.username = 'Username wajib diisi.'
      valid = false
    } else if (formData.username.trim().length < 3) {
      errs.username = 'Username minimal 3 karakter.'
      valid = false
    }

    if (!isEdit && !formData.password) {
      errs.password = 'Password wajib diisi.'
      valid = false
    } else if (!isEdit && formData.password.length < 6) {
      errs.password = 'Password minimal 6 karakter.'
      valid = false
    }

    if (!formData.nama_lengkap.trim()) {
      errs.nama_lengkap = 'Nama lengkap wajib diisi.'
      valid = false
    }

    if (formData.no_hp && !/^0\d{8,13}$/.test(formData.no_hp.replace(/[\s-]/g, ''))) {
      errs.no_hp = 'Nomor HP tidak valid (mulai dengan 0, 9-14 digit).'
      valid = false
    }

    setFieldErrors(errs)
    return valid
  }

  // ── Submit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)

    const payload: Record<string, unknown> = {
      username: formData.username.trim(),
      nama_lengkap: formData.nama_lengkap.trim(),
      role: 'nasabah',
      is_active: isActive,
    }

    if (formData.password) payload.password = formData.password
    if (formData.no_hp.trim()) payload.no_hp = formData.no_hp.trim()
    if (formData.alamat.trim()) payload.alamat = formData.alamat.trim()

    try {
      if (isEdit && initialData) {
        // Remove password from payload if empty (don't change password)
        if (!payload.password) delete payload.password
        await api.patch(`/users/${initialData.id}/`, payload)
        toastSuccess('Data nasabah berhasil diperbarui.')
      } else {
        await api.post('/users/', payload)
        toastSuccess('Nasabah baru berhasil ditambahkan.')
      }
      router.push('/customers')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const apiErrs: FormErrors = {}
          for (const [field, messages] of Object.entries(err.errors)) {
            const msg = messages.join(', ')
            if (field === 'username') apiErrs.username = msg
            else if (field === 'password') apiErrs.password = msg
            else if (field === 'nama_lengkap') apiErrs.nama_lengkap = msg
            else if (field === 'no_hp') apiErrs.no_hp = msg
            else if (field === 'alamat') apiErrs.alamat = msg
            else apiErrs._general = msg
          }
          setFieldErrors(apiErrs)
        } else {
          setFieldErrors({ _general: err.message })
        }
        toastError('Periksa kembali isian form.')
      } else {
        toastError('Terjadi kesalahan. Silakan coba lagi.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Update field ──
  function updateField(field: keyof CustomerFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={() => router.push('/customers')}>
          <ArrowLeft className="size-4" aria-hidden />
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isEdit ? 'Edit Nasabah' : 'Tambah Nasabah'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEdit
              ? 'Perbarui data nasabah yang sudah terdaftar.'
              : 'Daftarkan nasabah baru ke MIRU Bank Sampah.'}
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="size-5 text-primary" aria-hidden />
              {isEdit ? 'Edit Data Nasabah' : 'Form Data Nasabah'}
            </CardTitle>
            <CardDescription>
              {isEdit
                ? 'Ubah data nasabah. Biarkan password kosong jika tidak ingin mengubahnya.'
                : 'Isi data diri nasabah untuk mendaftarkan akun baru.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {fieldErrors._general && (
              <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger" role="alert">
                {fieldErrors._general}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Username"
                placeholder="Contoh: budi123"
                value={formData.username}
                onChange={(e) => updateField('username', e.target.value)}
                error={fieldErrors.username}
                disabled={isEdit}
              />
              <Input
                label={isEdit ? 'Password (biarkan kosong jika tidak diubah)' : 'Password'}
                type="password"
                placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'}
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                error={fieldErrors.password}
              />
            </div>

            <Input
              label="Nama Lengkap"
              placeholder="Contoh: Budi Santoso"
              value={formData.nama_lengkap}
              onChange={(e) => updateField('nama_lengkap', e.target.value)}
              error={fieldErrors.nama_lengkap}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="No. HP"
                type="tel"
                placeholder="Contoh: 081234567890"
                value={formData.no_hp}
                onChange={(e) => updateField('no_hp', e.target.value)}
                error={fieldErrors.no_hp}
              />
            </div>

            <Input
              label="Alamat"
              placeholder="Contoh: Jl. Merdeka No. 123, Kel. Karya Baru"
              value={formData.alamat}
              onChange={(e) => updateField('alamat', e.target.value)}
              error={fieldErrors.alamat}
            />

            {/* Status Toggle */}
            {isEdit && (
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <label className="text-sm font-medium text-foreground" htmlFor="status-toggle">
                  Status Akun
                </label>
                <button
                  id="status-toggle"
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                    isActive ? 'bg-success' : 'bg-border'
                  }`}
                >
                  <span
                    className={`inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${
                      isActive ? 'translate-x-[22px]' : 'translate-x-[2px]'
                    }`}
                  />
                </button>
                <span className="text-sm text-muted-foreground">
                  {isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/customers')} disabled={submitting}>
              Batal
            </Button>
            <Button type="submit" loading={submitting} disabled={submitting}>
              <Save className="size-4" aria-hidden />
              {isEdit ? 'Simpan Perubahan' : 'Tambah Nasabah'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
