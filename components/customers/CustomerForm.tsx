'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Select } from '@/components/ui/Select'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { UserPlus, ArrowLeft, Save } from 'lucide-react'
import { useWilayah } from '@/hooks/useWilayah'

// ─── Types ────────────────────────────────────────────────────────

interface CustomerFormData {
  username: string
  password: string
  nama_lengkap: string
  no_hp: string
  email: string
  alamat: string
  kelurahan: string
  rt: string
  rw: string
}

interface FormErrors {
  username?: string
  password?: string
  nama_lengkap?: string
  no_hp?: string
  email?: string
  alamat?: string
  kelurahan?: string
  rt?: string
  rw?: string
  setuju_kebijakan_data?: string
  _general?: string
}

// ─── Props ─────────────────────────────────────────────────────────

interface CustomerFormProps {
  initialData?: {
    id: number
    username: string
    nama_lengkap: string
    no_hp?: string
    email?: string
    email_verified?: boolean
    alamat?: string
    kelurahan?: number | null
    rt?: string
    rw?: string
    is_active: boolean
    avatar_url?: string | null
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
    email: initialData?.email ?? '',
    alamat: initialData?.alamat ?? '',
    kelurahan: initialData?.kelurahan ? String(initialData.kelurahan) : '',
    rt: initialData?.rt ?? '',
    rw: initialData?.rw ?? '',
  })
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true)
  const [consent, setConsent] = useState(false)
  const { options: wilayahOptions, isLoading: wilayahLoading } = useWilayah()
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

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Format email tidak valid.'
      valid = false
    }

    if (formData.rt.trim().length > 10) {
      errs.rt = 'RT maksimal 10 karakter.'
      valid = false
    }

    if (formData.rw.trim().length > 10) {
      errs.rw = 'RW maksimal 10 karakter.'
      valid = false
    }

    if (!isEdit && !consent) {
      errs.setuju_kebijakan_data = 'Nasabah harus menyetujui kebijakan data pribadi.'
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
    // Saat edit, kirim string kosong agar email bisa dihapus.
    if (isEdit || formData.email.trim()) payload.email = formData.email.trim().toLowerCase()
    if (formData.alamat.trim()) payload.alamat = formData.alamat.trim()
    // Saat edit, kirim nilai kosong agar kelurahan/RT/RW bisa dihapus.
    payload.kelurahan = formData.kelurahan ? Number(formData.kelurahan) : null
    payload.rt = formData.rt.trim()
    payload.rw = formData.rw.trim()
    if (!isEdit) payload.setuju_kebijakan_data = true

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
            else if (field === 'email') apiErrs.email = msg
            else if (field === 'alamat') apiErrs.alamat = msg
            else if (field === 'kelurahan') apiErrs.kelurahan = msg
            else if (field === 'rt') apiErrs.rt = msg
            else if (field === 'rw') apiErrs.rw = msg
            else if (field === 'setuju_kebijakan_data') apiErrs.setuju_kebijakan_data = msg
            else apiErrs._general = msg
          }
          setFieldErrors(apiErrs)
        } else {
          setFieldErrors({ _general: err.message })
        }
        toastError('Periksa kembali isian form.')
      } else {
        toastError('Maaf, terjadi kesalahan. Silakan coba lagi.')
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
            <CardTitle className="flex items-center gap-3">
              {isEdit ? (
                <UserAvatar
                  src={initialData?.avatar_url}
                  name={formData.nama_lengkap || initialData?.nama_lengkap || 'Nasabah'}
                  size="md"
                />
              ) : (
                <UserPlus className="size-5 text-primary" aria-hidden />
              )}
              {isEdit ? 'Edit Data Nasabah' : 'Form Data Nasabah'}
            </CardTitle>
            <CardDescription>
              {isEdit
                ? 'Ubah data nasabah. Biarkan password kosong jika tidak ingin mengubahnya. Avatar diubah oleh nasabah di aplikasi mobile.'
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
              <PasswordInput
                label={isEdit ? 'Password (biarkan kosong jika tidak diubah)' : 'Password'}
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
                hint="Nomor HP baru berstatus belum terverifikasi dan akan diverifikasi saat user login di aplikasi mobile."
              />
              <Input
                label="Email (opsional)"
                type="email"
                autoComplete="off"
                placeholder="Contoh: budi@gmail.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={fieldErrors.email}
                hint={
                  isEdit && initialData?.email_verified && formData.email.trim().toLowerCase() !== (initialData.email ?? '').toLowerCase()
                    ? 'Email diganti: nasabah harus memverifikasi ulang saat login berikutnya.'
                    : 'Untuk lupa kata sandi. Kosongkan jika nasabah tidak punya email — tidak wajib verifikasi.'
                }
              />
            </div>

            <Input
              label="Alamat"
              placeholder="Contoh: Jl. Merdeka No. 123, Kel. Karya Baru"
              value={formData.alamat}
              onChange={(e) => updateField('alamat', e.target.value)}
              error={fieldErrors.alamat}
            />

            <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
              <Select
                label="Kelurahan / Kampung"
                id="kelurahan"
                value={formData.kelurahan}
                onChange={(e) => updateField('kelurahan', e.target.value)}
                options={[{ value: '', label: wilayahLoading ? 'Memuat wilayah…' : '— Belum dipilih —' }, ...wilayahOptions]}
                error={fieldErrors.kelurahan}
                disabled={wilayahLoading}
              />
              <Input
                label="RT"
                placeholder="001"
                value={formData.rt}
                onChange={(e) => updateField('rt', e.target.value)}
                error={fieldErrors.rt}
              />
              <Input
                label="RW"
                placeholder="002"
                value={formData.rw}
                onChange={(e) => updateField('rw', e.target.value)}
                error={fieldErrors.rw}
              />
            </div>

            {!isEdit && (
              <div className="space-y-1.5">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 cursor-pointer accent-primary"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked)
                      setFieldErrors((prev) => {
                        const next = { ...prev }
                        delete next.setuju_kebijakan_data
                        return next
                      })
                    }}
                  />
                  <span>
                    Nasabah telah membaca dan menyetujui{' '}
                    <a href="/kebijakan-privasi" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline">
                      kebijakan data pribadi
                    </a>{' '}
                    MIRU Bank Sampah.
                  </span>
                </label>
                {fieldErrors.setuju_kebijakan_data && (
                  <p className="text-xs text-danger" role="alert">
                    {fieldErrors.setuju_kebijakan_data}
                  </p>
                )}
              </div>
            )}

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
