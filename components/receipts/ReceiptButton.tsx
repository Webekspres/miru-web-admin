'use client'

import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'

const RECEIPTS = {
  setoran: { path: (id: number) => `/deposits/${id}/receipt/`, file: 'bukti_setoran', label: 'Bukti PDF' },
  penarikan: { path: (id: number) => `/withdrawals/${id}/receipt/`, file: 'tanda_terima_penarikan', label: 'Tanda terima' },
} as const

/** Unduh PDF bukti setoran / tanda terima penarikan dari backend. */
export function ReceiptButton({
  kind,
  id,
  label,
}: {
  kind: keyof typeof RECEIPTS
  id: number
  label?: string
}) {
  const { error: toastError } = useToast()
  const [loading, setLoading] = useState(false)
  const receipt = RECEIPTS[kind]

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation() // baris tabel bisa punya onClick sendiri
    setLoading(true)
    try {
      await api.download(receipt.path(id), `${receipt.file}_${id}.pdf`)
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Gagal mengunduh PDF. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleClick} loading={loading}>
      <FileDown className="size-3.5" aria-hidden />
      {label ?? receipt.label}
    </Button>
  )
}
