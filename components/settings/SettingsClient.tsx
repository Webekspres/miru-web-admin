'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { useAuth } from '@/providers/AuthProvider'
import { canMutate } from '@/lib/permissions'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import {
  Building2,
  Eye,
  FileText,
  Filter,
  History,
  Megaphone,
  Save,
  Search,
  Shield,
} from 'lucide-react'
import type { Announcement, AuditLog, InstitutionSettings } from '@/types/models'

// ─── Types ────────────────────────────────────────────────────────

type TabKey = 'institution' | 'announcement' | 'audit'

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'institution', label: 'Institusi', icon: Building2 },
  { key: 'announcement', label: 'Pengumuman', icon: Megaphone },
  { key: 'audit', label: 'Audit Log', icon: History },
]

const ACTION_LABELS: Record<string, string> = {
  create: 'Buat',
  update: 'Ubah',
  delete: 'Hapus',
}

const ACTION_COLORS: Record<string, 'success' | 'warning' | 'danger'> = {
  create: 'success',
  update: 'warning',
  delete: 'danger',
}

// ─── Tab 1: Institution Settings ──────────────────────────────────

function InstitutionTab() {
  const { role } = useAuth()
  const isReadOnly = !canMutate(role!)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const { data, error, isLoading, mutate } = useSWR(
    '/settings/',
    (path) => api.get<InstitutionSettings>(path),
    { revalidateOnFocus: false },
  )

  const [form, setForm] = useState<Partial<InstitutionSettings>>({})
  const formInitialized = useRef(false)

  // Sync form when data loads only on initial load
  useEffect(() => {
    if (data && !formInitialized.current) {
      setForm(data)
      formInitialized.current = true
    }
  }, [data])

  const handleChange = (field: keyof InstitutionSettings, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleSave() {
    if (!form || isReadOnly) return
    setSaving(true)
    setSaved(false)
    try {
      await api.patch('/settings/', form)
      await mutate()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // Error handled by API client
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
        <Input
          label="Jam Operasional"
          value={form.jam_operasional ?? ''}
          onChange={(e) => handleChange('jam_operasional', e.target.value)}
          disabled={isReadOnly}
        />
        <div className="md:col-span-2">
          <Input
            label="Logo URL"
            value={form.logo_url ?? ''}
            onChange={(e) => handleChange('logo_url', e.target.value)}
            disabled={isReadOnly}
          />
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

      {!isReadOnly && (
        <div className="flex items-center gap-3">
          <Button type="button" onClick={handleSave} disabled={saving}>
            <Save className="size-4" aria-hidden />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
          {saved && (
            <span className="text-sm text-success font-medium">
              ✓ Pengaturan berhasil disimpan.
            </span>
          )}
        </div>
      )}

      {isReadOnly && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Shield className="size-4" />
          Anda hanya dapat melihat pengaturan. Hubungi admin untuk perubahan.
        </p>
      )}
    </div>
  )
}

// ─── Tab 2: Pengumuman ────────────────────────────────────────────

function AnnouncementTab() {
  const { role } = useAuth()
  const isReadOnly = !canMutate(role!)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const { data: settings, error: settingsError, isLoading: settingsLoading, mutate: mutateSettings } = useSWR(
    '/settings/',
    (path) => api.get<InstitutionSettings>(path),
    { revalidateOnFocus: false },
  )

  const { data: announcements, error: annError, isLoading: annLoading } = useSWR(
    '/pengumuman/',
    (path) => api.get<Announcement[]>(path),
    { revalidateOnFocus: false },
  )

  const [pengumumanText, setPengumumanText] = useState('')
  const announcementInitialized = useRef(false)

  // Sync pengumuman text when settings load only on initial load
  useEffect(() => {
    if (settings?.pengumuman && !announcementInitialized.current) {
      setPengumumanText(settings.pengumuman)
      announcementInitialized.current = true
    }
  }, [settings])

  async function handleSave() {
    if (isReadOnly) return
    setSaving(true)
    setSaved(false)
    try {
      await api.patch('/settings/', { pengumuman: pengumumanText })
      await mutateSettings()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // Error handled by API client
    } finally {
      setSaving(false)
    }
  }

  if (settingsLoading || annLoading) return <TableSkeleton rows={4} cols={2} />
  if (settingsError || annError) return <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat pengumuman." onRetry={() => mutateSettings()} />

  return (
    <div className="space-y-6">
      {/* Banner pengumuman dari settings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Megaphone className="size-5 text-primary" aria-hidden />
            Banner Pengumuman (Aplikasi Mobile)
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="size-4" aria-hidden />
            {showPreview ? 'Tutup Preview' : 'Preview'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            rows={4}
            value={pengumumanText}
            onChange={(e) => { setPengumumanText(e.target.value); setSaved(false) }}
            disabled={isReadOnly}
            placeholder="Tulis pengumuman yang akan ditampilkan di aplikasi mobile nasabah..."
          />

          {showPreview && (
            <div className="rounded-lg border border-border bg-primary/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Preview — Tampilan di Mobile
              </p>
              <div className="rounded-lg bg-primary p-4 text-primary-foreground">
                <p className="text-sm font-medium">
                  {pengumumanText || 'Tidak ada pengumuman.'}
                </p>
              </div>
            </div>
          )}

          {!isReadOnly && (
            <div className="flex items-center gap-3">
              <Button type="button" onClick={handleSave} disabled={saving}>
                <Save className="size-4" aria-hidden />
                {saving ? 'Menyimpan...' : 'Simpan Banner'}
              </Button>
              {saved && (
                <span className="text-sm text-success font-medium">
                  ✓ Banner pengumuman berhasil disimpan.
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daftar Pengumuman */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-5 text-primary" aria-hidden />
            Riwayat Pengumuman
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {announcements && announcements.length > 0 ? (
            <ul className="divide-y divide-border">
              {announcements.map((ann) => (
                <li key={ann.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{ann.judul}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{ann.isi}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(ann.tanggal).toLocaleDateString('id-ID', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge variant={ann.aktif ? 'success' : 'default'}>
                      {ann.aktif ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 pb-4 text-sm text-muted-foreground">Belum ada pengumuman.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Tab 3: Audit Log ─────────────────────────────────────────────

function AuditLogTab() {
  const [filterUser, setFilterUser] = useState('')
  const [filterModel, setFilterModel] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterDateAfter, setFilterDateAfter] = useState('')

  const params = new URLSearchParams()
  if (filterUser) params.set('user', filterUser)
  if (filterModel) params.set('model', filterModel)
  if (filterAction) params.set('action', filterAction)
  if (filterDateAfter) params.set('date_after', filterDateAfter)

  const queryString = params.toString()
  const { data, error, isLoading, mutate } = useSWR(
    `/audit-log/${queryString ? `?${queryString}` : ''}`,
    (path) => api.get<AuditLog[]>(path),
    { revalidateOnFocus: false },
  )

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="size-5 text-primary" aria-hidden />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              type="number"
              placeholder="ID User"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            />
            <Input
              placeholder="Model (contoh: TransaksiSetoran)"
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
            />
            <Select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              placeholder="Semua Aksi"
              options={[
                { value: 'create', label: 'Buat' },
                { value: 'update', label: 'Ubah' },
                { value: 'delete', label: 'Hapus' },
              ]}
            />
            <Input
              type="date"
              label="Dari Tanggal"
              value={filterDateAfter}
              onChange={(e) => setFilterDateAfter(e.target.value)}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" onClick={() => mutate()}>
              <Search className="size-4" aria-hidden /> Terapkan Filter
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => {
              setFilterUser(''); setFilterModel(''); setFilterAction(''); setFilterDateAfter('')
            }}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="size-5 text-primary" aria-hidden />
            Riwayat Audit
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4"><TableSkeleton rows={6} cols={5} /></div>
          ) : error ? (
            <div className="p-4">
              <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat audit log." onRetry={() => mutate()} />
            </div>
          ) : data && data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Aksi</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Objek ID</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('id-ID', {
                          year: 'numeric', month: '2-digit', day: '2-digit',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {log.user_nama ?? `User #${log.user}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ACTION_COLORS[log.action] ?? 'default'}>
                          {ACTION_LABELS[log.action] ?? log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-foreground font-mono text-xs">
                        {log.model_name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono text-xs">
                        {log.object_id ?? '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {log.ip_address ?? '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-4">
              <TableEmpty colSpan={6} message="Belum ada data audit log." />
            </div>
          )}
        </CardContent>
      </Card>
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
          Profil institusi, pengumuman, dan audit log viewer.
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
          {activeTab === 'announcement' && <AnnouncementTab />}
          {activeTab === 'audit' && <AuditLogTab />}
        </div>
      </Card>
    </div>
  )
}
