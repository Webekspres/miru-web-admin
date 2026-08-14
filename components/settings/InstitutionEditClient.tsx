'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Save } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import { SettingsPageHeader } from '@/components/settings/SettingsPageHeader'
import type { InstitutionSettings } from '@/types/models'

function toTimeInput(value: string | null | undefined): string {
  if (!value) return ''
  return value.slice(0, 5)
}

function toApiTime(value: string): string | null {
  if (!value) return null
  return `${value}:00`
}

export function InstitutionEditClient() {
  const router = useRouter()
  const { role } = useAuth()
  const { success: toastSuccess, error: toastError } = useToast()
  const [saving, setSaving] = useState(false)
  const { data, error, isLoading, mutate } = useSWR(
    '/settings/',
    (path) => api.get<InstitutionSettings>(path),
    { revalidateOnFocus: false },
  )
  const [form, setForm] = useState({
    nama_institusi: '',
    email: '',
    kontak: '',
    alamat: '',
    jam_buka_input: '',
    jam_tutup_input: '',
  })
  const initialized = useRef(false)

  useEffect(() => {
    if (data && !initialized.current) {
      setForm({
        nama_institusi: data.nama_institusi ?? '',
        email: data.email ?? '',
        kontak: data.kontak ?? '',
        alamat: data.alamat ?? '',
        jam_buka_input: toTimeInput(data.jam_buka),
        jam_tutup_input: toTimeInput(data.jam_tutup),
      })
      initialized.current = true
    }
  }, [data])

  useEffect(() => {
    if (role && role !== 'admin') {
      router.replace('/institution')
    }
  }, [role, router])

  if (role && role !== 'admin') return null

  async function handleSave() {
    setSaving(true)
    try {
      await api.patch('/settings/', {
        nama_institusi: form.nama_institusi,
        email: form.email,
        kontak: form.kontak,
        alamat: form.alamat,
        jam_buka: toApiTime(form.jam_buka_input),
        jam_tutup: toApiTime(form.jam_tutup_input),
      })
      await mutate()
      toastSuccess('Pengaturan institusi berhasil disimpan.')
      router.push('/institution')
    } catch {
      toastError('Gagal menyimpan pengaturan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <TableSkeleton rows={6} cols={2} />
  if (error) {
    return (
      <ErrorMessage
        title="Gagal memuat data"
        message="Tidak dapat memuat pengaturan institusi."
        onRetry={() => mutate()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Edit institusi"
        description="Perubahan ini tampil di aplikasi mobile."
        backHref="/institution"
      />
      <Card className="space-y-4 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nama Institusi"
            value={form.nama_institusi}
            onChange={(e) => setForm((p) => ({ ...p, nama_institusi: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
          <Input
            label="Kontak"
            value={form.kontak}
            onChange={(e) => setForm((p) => ({ ...p, kontak: e.target.value }))}
          />
          <div className="flex items-end gap-3">
            <Input
              label="Jam Buka"
              type="time"
              value={form.jam_buka_input}
              onChange={(e) => setForm((p) => ({ ...p, jam_buka_input: e.target.value }))}
            />
            <Input
              label="Jam Tutup"
              type="time"
              value={form.jam_tutup_input}
              onChange={(e) => setForm((p) => ({ ...p, jam_tutup_input: e.target.value }))}
            />
          </div>
        </div>
        <Input
          label="Alamat"
          value={form.alamat}
          onChange={(e) => setForm((p) => ({ ...p, alamat: e.target.value }))}
        />
        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
          <Save className="size-4" aria-hidden />
          {saving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </Card>
    </div>
  )
}
