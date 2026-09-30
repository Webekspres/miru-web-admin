'use client'

import { useState, type FormEvent } from 'react'
import useSWR from 'swr'
import { Eye, EyeOff, Megaphone, Send, Trash2 } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { formatDateWIT } from '@/lib/format'
import { useToast } from '@/components/feedback/Toast'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { Announcement } from '@/types/models'

const KELOLA = '/pengumuman/kelola/'

/**
 * Pengumuman untuk nasabah: tampil di beranda aplikasi (banner) dan dikirim
 * sebagai notifikasi push saat diterbitkan.
 */
export function AnnouncementManagement() {
  const { success: toastSuccess, error: toastError } = useToast()
  const { data, error, isLoading, mutate } = useSWR(KELOLA, (path: string) =>
    api.get<Announcement[]>(path, { page_size: '100' }),
  )

  const [judul, setJudul] = useState('')
  const [isi, setIsi] = useState('')
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [hapus, setHapus] = useState<Announcement | null>(null)

  async function terbitkan(event: FormEvent) {
    event.preventDefault()
    if (!judul.trim() || !isi.trim()) return
    setSaving(true)
    try {
      await api.post(KELOLA, { judul: judul.trim(), isi: isi.trim(), aktif: true })
      toastSuccess('Pengumuman diterbitkan dan dikirim ke nasabah.')
      setJudul('')
      setIsi('')
      await mutate()
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Gagal menerbitkan pengumuman.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleAktif(item: Announcement) {
    setBusyId(item.id)
    try {
      await api.patch(`${KELOLA}${item.id}/`, { aktif: !item.aktif })
      toastSuccess(item.aktif ? 'Pengumuman disembunyikan dari aplikasi.' : 'Pengumuman ditampilkan lagi.')
      await mutate()
    } catch {
      toastError('Gagal mengubah pengumuman.')
    } finally {
      setBusyId(null)
    }
  }

  async function konfirmasiHapus() {
    if (!hapus) return
    setBusyId(hapus.id)
    try {
      await api.delete(`${KELOLA}${hapus.id}/`)
      toastSuccess('Pengumuman dihapus.')
      setHapus(null)
      await mutate()
    } catch {
      toastError('Gagal menghapus pengumuman.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Pengumuman</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tampil di beranda aplikasi nasabah dan dikirim sebagai notifikasi saat diterbitkan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Megaphone className="size-4 text-primary" aria-hidden />
            Tulis pengumuman
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={terbitkan} className="space-y-3">
            <Input
              label="Judul"
              placeholder="Mis. Bank sampah libur 17 Agustus"
              value={judul}
              maxLength={200}
              onChange={(e) => setJudul(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="isi-pengumuman" className="text-sm font-medium text-foreground">
                Isi
              </label>
              <textarea
                id="isi-pengumuman"
                rows={4}
                className="h-auto w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                placeholder="Tulis informasi untuk nasabah…"
                value={isi}
                onChange={(e) => setIsi(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={saving} disabled={saving || !judul.trim() || !isi.trim()}>
                <Send className="size-4" aria-hidden />
                Terbitkan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar pengumuman</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat pengumuman." onRetry={() => mutate()} />
          ) : isLoading ? (
            <TableSkeleton rows={3} cols={2} />
          ) : !data?.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Belum ada pengumuman.</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.map((item) => (
                <li key={item.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{item.judul}</p>
                      <Badge variant={item.aktif ? 'success' : 'default'}>
                        {item.aktif ? 'Tampil' : 'Disembunyikan'}
                      </Badge>
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{item.isi}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDateWIT(item.tanggal, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAktif(item)}
                      disabled={busyId === item.id}
                    >
                      {item.aktif ? <EyeOff className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
                      {item.aktif ? 'Sembunyikan' : 'Tampilkan'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setHapus(item)}
                      disabled={busyId === item.id}
                      aria-label={`Hapus ${item.judul}`}
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Modal
        open={hapus !== null}
        onClose={() => setHapus(null)}
        title="Hapus pengumuman?"
        description={hapus ? `"${hapus.judul}" akan hilang dari aplikasi nasabah.` : undefined}
        size="sm"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setHapus(null)}>
              Batal
            </Button>
            <Button type="button" variant="danger" onClick={konfirmasiHapus} loading={busyId === hapus?.id}>
              Hapus
            </Button>
          </>
        }
      >
        <span className="sr-only">Konfirmasi hapus</span>
      </Modal>
    </div>
  )
}
