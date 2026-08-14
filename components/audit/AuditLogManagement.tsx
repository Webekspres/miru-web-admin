'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import { Filter, History, Search } from 'lucide-react'
import type { AuditLog } from '@/types/models'

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

/** Halaman khusus audit log (W11 — dipindah dari /settings). */
export function AuditLogManagement() {
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
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Riwayat perubahan data penting untuk keperluan audit (admin only).
        </p>
      </div>

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
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
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
                      <TableCell className="font-mono text-xs text-foreground">
                        {log.model_name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.object_id ?? '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
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
