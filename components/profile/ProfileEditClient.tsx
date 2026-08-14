'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { Camera, Save } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { uploadAvatarImage } from '@/lib/media'
import { ROLE_LABELS } from '@/lib/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/components/feedback/Toast'
import { AvatarCropModal } from '@/components/profile/AvatarCropModal'
import { SettingsPageHeader } from '@/components/settings/SettingsPageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { UserAvatar } from '@/components/ui/UserAvatar'

type AccountForm = {
  username: string
  nama_lengkap: string
  no_hp: string
  alamat: string
}

function fieldError(
  errors: Record<string, string[]> | undefined,
  field: keyof AccountForm,
): string | undefined {
  return errors?.[field]?.[0]
}

export function ProfileEditClient() {
  const router = useRouter()
  const { user, role, refreshProfile } = useAuth()
  const { success: toastSuccess, error: toastError } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<AccountForm>(() => ({
    username: user?.username ?? '',
    nama_lengkap: user?.nama_lengkap ?? '',
    no_hp: user?.no_hp ?? '',
    alamat: user?.alamat ?? '',
  }))
  const [errors, setErrors] = useState<Partial<Record<keyof AccountForm, string>>>({})

  if (!user || !role) return null

  function handleChange(field: keyof AccountForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleCropped(file: File) {
    try {
      const uploaded = await uploadAvatarImage(file)
      await api.patch('/auth/me/', { avatar_url: uploaded.url })
      await refreshProfile()
      toastSuccess('Foto profil berhasil diperbarui.')
      if (cropSrc) URL.revokeObjectURL(cropSrc)
      setCropSrc(null)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Gagal menyimpan foto profil.'
      toastError(message)
      throw err
    }
  }

  async function handleSave() {
    setSaving(true)
    setErrors({})
    try {
      await api.patch('/auth/me/', {
        username: form.username.trim(),
        nama_lengkap: form.nama_lengkap.trim(),
        no_hp: form.no_hp.trim(),
        alamat: form.alamat.trim(),
      })
      await refreshProfile()
      toastSuccess('Akun berhasil diperbarui.')
      router.push('/profile')
    } catch (err) {
      if (err instanceof ApiError) {
        toastError(err.message)
        if (err.errors) {
          setErrors({
            username: fieldError(err.errors, 'username'),
            nama_lengkap: fieldError(err.errors, 'nama_lengkap'),
            no_hp: fieldError(err.errors, 'no_hp'),
            alamat: fieldError(err.errors, 'alamat'),
          })
        }
      } else {
        toastError('Gagal menyimpan akun. Coba lagi.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <SettingsPageHeader
        title="Edit akun"
        description="Ubah username, foto, dan data diri."
        backHref="/profile"
      />
      <Card className="space-y-6 p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <UserAvatar src={user.avatar_url} name={user.nama_lengkap} size="md" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm hover:bg-surface-muted"
              aria-label="Ubah foto profil"
            >
              <Camera className="size-3.5" aria-hidden />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setCropSrc(URL.createObjectURL(file))
                e.target.value = ''
              }}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{user.nama_lengkap}</p>
            <Badge variant="primary" className="mt-1">
              {ROLE_LABELS[role]}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Username"
            value={form.username}
            onChange={(e) => handleChange('username', e.target.value)}
            error={errors.username}
            autoComplete="username"
          />
          <Input
            label="Nama lengkap"
            value={form.nama_lengkap}
            onChange={(e) => handleChange('nama_lengkap', e.target.value)}
            error={errors.nama_lengkap}
            autoComplete="name"
          />
          <Input
            label="No. HP"
            value={form.no_hp}
            onChange={(e) => handleChange('no_hp', e.target.value)}
            error={errors.no_hp}
            autoComplete="tel"
          />
          <Input
            label="Alamat"
            value={form.alamat}
            onChange={(e) => handleChange('alamat', e.target.value)}
            error={errors.alamat}
            autoComplete="street-address"
          />
        </div>

        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
          <Save className="size-4" aria-hidden />
          {saving ? 'Menyimpan...' : 'Simpan akun'}
        </Button>
      </Card>

      {cropSrc && (
        <AvatarCropModal
          open
          imageSrc={cropSrc}
          onClose={() => {
            URL.revokeObjectURL(cropSrc)
            setCropSrc(null)
          }}
          onConfirm={handleCropped}
        />
      )}
    </div>
  )
}
