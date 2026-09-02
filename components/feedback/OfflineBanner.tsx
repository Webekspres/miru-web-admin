'use client'

import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineBanner() {
  const online = useOnlineStatus()

  if (online) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full border-b border-warning/30 bg-warning px-4 py-2.5 text-center text-sm font-medium text-white"
    >
      <span className="inline-flex items-center justify-center gap-2">
        <WifiOff className="size-4 shrink-0" aria-hidden />
        Tidak ada koneksi internet. Periksa jaringan Anda, lalu coba lagi.
      </span>
    </div>
  )
}
