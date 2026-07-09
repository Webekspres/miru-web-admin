import type { ReactNode } from 'react'
import { DashboardAuthShell } from '@/components/layout/DashboardAuthShell'

export default function DashboardGroupLayout({
  children,
}: {
  children: ReactNode
}) {
  return <DashboardAuthShell>{children}</DashboardAuthShell>
}
