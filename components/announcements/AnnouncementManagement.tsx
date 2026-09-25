'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { useAuth } from '@/providers/AuthProvider'
import { canMutate } from '@/lib/permissions'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import { Eye, FileText, Megaphone, Save } from 'lucide-react'
import type { Announcement, InstitutionSettings } from '@/types/models'

/**
 * Halaman khusus kelola pengumuman (W11 — dipindah dari /settings).
 * Banner aplikasi mobile di-patch lewat /settings/; riwayat pengumuman
 * read-only dari GET /api/pengumuman/ (backend auto-buat utk perubahan harga H-3).
 */
export function AnnouncementManagement() {
  const { role } = useAuth()
  const isReadOnly = !canMutate(role!)
  const { success: toastSuccess, error: toastError } = useToast()

  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const { data: settings, error: settingsError, isLoading: settingsLoading, mutate: mutateSettings } = useSWR(
    '/settings/',
    (path) => api.get<InstitutionSettings>(path),
    { revalidateOnFocus: false },
  )

  const { data: announcements, error: annError, isLoading: annLoading, mutate: mutateAnnouncements } = useSWR(
    '/pengumuman/',
    (path) => api.get<Announcement[]>(path),
    { revalidateOnFocus: false },
  )

  const [pengumumanText, setPengumumanText] = useState('')
  const announcementInitialized = useRef(false)

  useEffect(() => {
    if (settings?.pengumuman && !announcementInitialized.current) {
      setPengumumanText(settings.pengumuman)
      announcementInitialized.current = true
    }
  }, [settings])

  async function handleSave() {
    if (isReadOnly) return
    setSaving(true)
    try {
      await api.patch('/settings/', { pengumuman: pengumumanText })
      await mutateSettings()
      toastSuccess('Banner pengumuman berhasil disimpan.')
    } catch {
      toastError('Gagal menyimpan banner pengumuman. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  if (settingsLoading || annLoading) return <TableSkeleton rows={4} cols={2} />
  if (settingsError || annError) {
    return (
      <ErrorMessage
        title="Gagal memuat data"
        message="Tidak dapat memuat pengumuman."
        onRetry={() => { void mutateSettings(); void mutateAnnouncements() }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Pengumuman</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Banner pengumuman untuk aplikasi mobile nasabah dan riwayat pengumuman.
        </p>
      </div>

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
            onChange={(e) => { setPengumumanText(e.target.value) }}
            disabled={isReadOnly}
            placeholder="Tulis pengumuman yang akan ditampilkan di aplikasi mobile nasabah..."
          />

          {showPreview && (
            <div className="rounded-lg border border-border bg-primary/5 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
            </div>
          )}

          {isReadOnly && (
            <p className="text-sm text-muted-foreground">
              Anda hanya dapat melihat pengumuman. Hubungi admin untuk perubahan.
            </p>
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
