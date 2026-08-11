'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { useAuth } from '@/providers/AuthProvider'
import { canMutate } from '@/lib/permissions'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import {
  Building2,
  Clock,
  FileText,
  MapPin,
  Save,
  Shield,
} from 'lucide-react'
import type { InstitutionSettings } from '@/types/models'

// ─── Types ────────────────────────────────────────────────────────

type TabKey = 'institution' | 'privacy' | 'about'

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'institution', label: 'Institusi', icon: Building2 },
  { key: 'privacy', label: 'Kebijakan Data', icon: Shield },
  { key: 'about', label: 'Tentang MIRU', icon: FileText },
]

// ─── Helpers ──────────────────────────────────────────────────────

/** "HH:MM:SS" → "HH:MM" untuk input type="time" */
function toTimeInput(value: string | null | undefined): string {
  if (!value) return ''
  return value.slice(0, 5)
}

/** "HH:MM" → "HH:MM:SS" untuk API (TimeField backend) */
function toApiTime(value: string): string | null {
  if (!value) return null
  return `${value}:00`
}

// ─── Tab 1: Institution Settings ──────────────────────────────────

function InstitutionTab() {
  const { role } = useAuth()
  const isReadOnly = !canMutate(role!)
  const { success: toastSuccess, error: toastError } = useToast()
  const [saving, setSaving] = useState(false)

  const { data, error, isLoading, mutate } = useSWR(
    '/settings/',
    (path) => api.get<InstitutionSettings>(path),
    { revalidateOnFocus: false },
  )

  const [form, setForm] = useState<Partial<InstitutionSettings> & {
    jam_buka_input?: string
    jam_tutup_input?: string
  }>({})
  const formInitialized = useRef(false)

  // Sync form when data loads only on initial load
  useEffect(() => {
    if (data && !formInitialized.current) {
      setForm({
        ...data,
        jam_buka_input: toTimeInput(data.jam_buka),
        jam_tutup_input: toTimeInput(data.jam_tutup),
      })
      formInitialized.current = true
    }
  }, [data])

  const handleChange = (
    field: keyof InstitutionSettings,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form || isReadOnly) return
    setSaving(true)
    try {
      const jamBuka = toApiTime(form.jam_buka_input ?? '')
      const jamTutup = toApiTime(form.jam_tutup_input ?? '')
      const payload: Record<string, unknown> = {
        nama_institusi: form.nama_institusi,
        email: form.email,
        kontak: form.kontak,
        alamat: form.alamat,
        // W11: jam operasional dikirim sebagai jam_buka/jam_tutup (TimeField),
        // bukan free-text. `jam_operasional` disinkron otomatis di backend.
        jam_buka: jamBuka,
        jam_tutup: jamTutup,
      }
      await api.patch('/settings/', payload)
      // Sinkronkan label jam_operasional yang ditampilkan agar tidak stale
      if (jamBuka && jamTutup) {
        setForm((prev) => ({
          ...prev,
          jam_operasional: `${jamBuka.slice(0, 5).replace(':', '.')}–${jamTutup.slice(0, 5).replace(':', '.')} WIT`,
        }))
      }
      await mutate()
      toastSuccess('Pengaturan berhasil disimpan.')
    } catch {
      toastError('Gagal menyimpan pengaturan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <TableSkeleton rows={6} cols={2} />
  if (error) return <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat pengaturan institusi." onRetry={() => mutate()} />

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label="Nama Institusi"
          value={form.nama_institusi ?? ''}
          onChange={(e) => handleChange('nama_institusi', e.target.value)}
          disabled={isReadOnly}
        />
        <Input
          label="Email"
          type="email"
          value={form.email ?? ''}
          onChange={(e) => handleChange('email', e.target.value)}
          disabled={isReadOnly}
        />
        <Input
          label="Kontak"
          value={form.kontak ?? ''}
          onChange={(e) => handleChange('kontak', e.target.value)}
          disabled={isReadOnly}
        />
        {/* W11: input waktu buka/tutup — bukan textarea bebas */}
        <div className="flex items-end gap-3">
          <div className="min-w-0 flex-1">
            <Input
              label="Jam Buka"
              type="time"
              value={form.jam_buka_input ?? ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, jam_buka_input: e.target.value }))
              }
              disabled={isReadOnly}
            />
          </div>
          <span className="pb-2.5 text-sm text-muted-foreground">–</span>
          <div className="min-w-0 flex-1">
            <Input
              label="Jam Tutup"
              type="time"
              value={form.jam_tutup_input ?? ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, jam_tutup_input: e.target.value }))
              }
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>

      <div>
        <Input
          label="Alamat"
          value={form.alamat ?? ''}
          onChange={(e) => handleChange('alamat', e.target.value)}
          disabled={isReadOnly}
        />
      </div>

      {form.jam_operasional && (
        <div className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-sm text-muted-foreground">
          <Clock className="size-4 shrink-0" aria-hidden />
          Tampilan untuk nasabah: <span className="font-medium text-foreground">{form.jam_operasional}</span>
        </div>
      )}

      {!isReadOnly && (
        <div className="flex items-center gap-3">
          <Button type="button" onClick={handleSave} disabled={saving}>
            <Save className="size-4" aria-hidden />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </div>
      )}

      {isReadOnly && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="size-4" />
          Anda hanya dapat melihat pengaturan. Hubungi admin untuk perubahan.
        </p>
      )}
    </div>
  )
}

// ─── Tab 2: Kebijakan Data ────────────────────────────────────────

interface PrivacyPolicyData {
  versi: string
  terakhir_diperbarui?: string
  data_yang_disimpan?: string[] | Record<string, unknown>
  retensi?: { masa_tahun?: number }
  hak_pengguna?: string[]
  kebijakan?: string
}

function PrivacyTab() {
  const { data, error, isLoading, mutate } = useSWR(
    '/privacy-policy/',
    (path) => api.get<PrivacyPolicyData>(path),
    { revalidateOnFocus: false },
  )

  if (isLoading) return <TableSkeleton rows={4} cols={1} />
  if (error) return <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat kebijakan data." onRetry={() => mutate()} />

  const items = Array.isArray(data?.data_yang_disimpan)
    ? data!.data_yang_disimpan
    : []

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-primary">
        <Shield className="size-4 shrink-0" aria-hidden />
        <span>
          Kebijakan Data Pribadi (UU PDP) — versi {data?.versi ?? '1.0'}
          {data?.retensi?.masa_tahun
            ? ` · retensi ${data.retensi.masa_tahun} tahun`
            : ''}
        </span>
      </div>

      {items.length > 0 && (
        <div>
          <h4 className="mb-1.5 font-semibold text-foreground">Data yang Disimpan</h4>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {data?.hak_pengguna && data.hak_pengguna.length > 0 && (
        <div>
          <h4 className="mb-1.5 font-semibold text-foreground">Hak Pengguna</h4>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {data.hak_pengguna.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-muted-foreground">
        Dokumen lengkap tersedia di endpoint publik{' '}
        <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs">/api/privacy-policy/</code>.
      </p>
    </div>
  )
}

// ─── Tab 3: Tentang MIRU ──────────────────────────────────────────

function AboutTab() {
  const { data: settings } = useSWR(
    '/settings/',
    (path) => api.get<InstitutionSettings>(path),
    { revalidateOnFocus: false },
  )

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center gap-3 rounded-lg bg-surface-muted p-4">
        <Building2 className="size-8 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-semibold text-foreground">
            {settings?.nama_institusi ?? 'MIRU Bank Sampah'}
          </p>
          <p className="text-muted-foreground">Distrik Mimika Baru, Kabupaten Mimika, Papua Tengah</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-muted-foreground">{settings?.alamat ?? '—'}</p>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-muted-foreground">
            Jam operasional: {settings?.jam_operasional || 'Senin–Sabtu, 08.00–17.00 WIT'}
          </p>
        </div>
      </div>

      <p className="leading-relaxed text-muted-foreground">
        MIRU (Mimika Recycle Unit) adalah aplikasi bank sampah untuk Distrik Mimika Baru.
        Aplikasi ini membantu nasabah menyetor sampah terpilah, menjadwalkan penjemputan,
        memantau saldo &amp; poin, serta mendukung pengelolaan bank sampah oleh petugas,
        koordinator, dan pemerintah distrik.
      </p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────

export function SettingsClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('institution')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Pengaturan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Data institusi, kebijakan data, dan informasi tentang MIRU.
        </p>
      </div>

      <Card>
        <div className="border-b border-border">
          <div className="flex gap-1 px-4" role="tablist">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'border-b-2 border-primary bg-background text-primary'
                      : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4" aria-hidden />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'institution' && <InstitutionTab />}
          {activeTab === 'privacy' && <PrivacyTab />}
          {activeTab === 'about' && <AboutTab />}
        </div>
      </Card>
    </div>
  )
}
