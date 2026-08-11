'use client'

import { useAuth } from '@/providers/AuthProvider'
import { DepositHistory } from '@/components/transactions/DepositHistory'
import { ReportsClient } from '@/components/reports/ReportsClient'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'

export default function ReportsPage() {
  const { user, status } = useAuth()

  if (status === 'loading') {
    return <TableSkeleton rows={6} cols={4} />
  }

  // Petugas: "Laporan Saya" = riwayat setoran sendiri (bukan laporan institusi).
  if (user?.role === 'petugas') {
    return (
      <DepositHistory
        title="Laporan Saya"
        description="Riwayat setoran yang Anda catat."
        scopeToCurrentPetugas
      />
    )
  }

  return <ReportsClient />
}
