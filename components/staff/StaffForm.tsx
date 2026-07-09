'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ArrowLeft, Save, UserCog } from 'lucide-react'
import type { UserRole } from '@/types/models'

// ─── Types ────────────────────────────────────────────────────────

type StaffRole = Extract<UserRole, 'petugas' | 'admin' | 'koordinator'>

interface StaffFormData {
  username: string
  password: string
  nama_lengkap: string
  no_hp: string
  role: StaffRole
}

interface FormErrors {
  username?: string
  password?: string
  nama_lengkap?: string
  no_hp?: string
  role?: string
  _general?: string
}

// ─── Props ─────────────────────────────────────────────────────────

interface StaffFormProps {
  initialData?: {
    id: number
    username: string
    nama_lengkap: string
    no_hp?: string
    role: StaffRole
    is_active: boolean
  }
  isEdit?: boolean
}

const ROLE_OPTIONS = [
  { value: 'petugas', label: 'Petugas Bank Sampah' },
  { value: 'admin', label: 'Admin Aplikasi' },
  { value: 'koordinator', label: 'Koordinator Program' },
]

// ─── Main Component ───────────────────────────────────────────────

export function StaffForm({ initialData, isEdit = false }: StaffFormProps) {
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()

  const [formData, setFormData] = useState<StaffFormData>({
    username: initialData?.username ?? '',
    password: '',
    nama_lengkap: initialData?.nama_lengkap ?? '',
    no_hp: initialData?.no_hp ?? '',
    role: initialData?.role ?? 'petugas',
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

    if (!formData.role) {
      errs.role = 'Pilih role staff.'
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
      role: formData.role,
      is_active: isActive,
    }

    if (formData.password) payload.password = formData.password
    if (formData.no_hp.trim()) payload.no_hp = formData.no_hp.trim()

    try {
      if (isEdit && initialData) {
        if (!payload.password) delete payload.password
        await api.patch(`/users/${initialData.id}/`, payload)
        toastSuccess('Data staff berhasil diperbarui.')
      } else {
        await api.post('/users/', payload)
        toastSuccess('Staff baru berhasil ditambahkan.')
      }
      router.push('/staff')
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
            else if (field === 'role') apiErrs.role = msg
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
  function updateField(field: keyof StaffFormData, value: string) {
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
        <Button type="button" variant="ghost" size="sm" onClick={() => router.push('/staff')}>
          <ArrowLeft className="size-4" aria-hidden />
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isEdit ? 'Edit Staff' : 'Tambah Staff'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEdit
              ? 'Perbarui data staff bank sampah.'
              : 'Tambahkan petugas, admin, atau koordinator baru.'}
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="size-5 text-primary" aria-hidden />
              {isEdit ? 'Edit Data Staff' : 'Form Data Staff'}
            </CardTitle>
            <CardDescription>
              {isEdit
                ? 'Ubah data staff. Biarkan password kosong jika tidak ingin mengubahnya.'
                : 'Isi data staff untuk membuat akun baru.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {fieldErrors._general && (
              <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger" role="alert">
                {fieldErrors._general}
              </div>
            )}

            {/* Role Select */}
            <Select
              label="Role"
              placeholder="Pilih role..."
              options={ROLE_OPTIONS}
              value={formData.role}
              onChange={(e) => updateField('role', e.target.value)}
              error={fieldErrors.role}
              disabled={isEdit}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Username"
                placeholder="Contoh: petugas01"
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

            <Input
              label="No. HP"
              type="tel"
              placeholder="Contoh: 081234567890"
              value={formData.no_hp}
              onChange={(e) => updateField('no_hp', e.target.value)}
              error={fieldErrors.no_hp}
            />

            {/* Status Toggle */}
            {isEdit && (
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <label className="text-sm font-medium text-foreground" htmlFor="staff-status-toggle">
                  Status Akun
                </label>
                <button
                  id="staff-status-toggle"
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
            <Button type="button" variant="outline" onClick={() => router.push('/staff')} disabled={submitting}>
              Batal
            </Button>
            <Button type="submit" loading={submitting} disabled={submitting}>
              <Save className="size-4" aria-hidden />
              {isEdit ? 'Simpan Perubahan' : 'Tambah Staff'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
