import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Building2,
  Gift,
  LayoutDashboard,
  Package,
  Phone,
  Settings,
  Truck,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react'
import type { UserRole } from '@/types/models'

export type WebAdminRole = Extract<
  UserRole,
  'admin' | 'petugas' | 'koordinator' | 'pemerintah'
>

export const WEB_ADMIN_ROLES: readonly WebAdminRole[] = [
  'admin',
  'petugas',
  'koordinator',
  'pemerintah',
] as const

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const ADMIN_MENU: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Nasabah', href: '/nasabah', icon: Users },
  { label: 'Petugas & Staff', href: '/petugas', icon: UserCog },
  { label: 'Transaksi Setoran', href: '/transaksi', icon: Wallet },
  { label: 'Penjemputan', href: '/penjemputan', icon: Truck },
  { label: 'Penarikan Saldo', href: '/saldo', icon: Wallet },
  { label: 'Reward & Poin', href: '/reward', icon: Gift },
  { label: 'Gudang & Mitra', href: '/gudang', icon: Package },
  { label: 'Pengaduan', href: '/pengaduan', icon: Phone },
  { label: 'Laporan', href: '/laporan', icon: BarChart3 },
  { label: 'Pengaturan', href: '/pengaturan', icon: Settings },
]

const PETUGAS_MENU: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Input Setoran', href: '/transaksi/tambah', icon: Wallet },
  { label: 'Penjemputan', href: '/penjemputan', icon: Truck },
  { label: 'Nasabah', href: '/nasabah', icon: Users },
  { label: 'Laporan Harian Saya', href: '/laporan', icon: BarChart3 },
]

const KOORDINATOR_MENU: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Nasabah', href: '/nasabah', icon: Users },
  { label: 'Transaksi', href: '/transaksi', icon: Wallet },
  { label: 'Penjemputan', href: '/penjemputan', icon: Truck },
  { label: 'Penarikan', href: '/saldo', icon: Wallet },
  { label: 'Reward', href: '/reward', icon: Gift },
  { label: 'Gudang', href: '/gudang', icon: Package },
  { label: 'Pengaduan', href: '/pengaduan', icon: Phone },
  { label: 'Laporan', href: '/laporan', icon: BarChart3 },
]

const PEMERINTAH_MENU: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Laporan', href: '/laporan', icon: BarChart3 },
  { label: 'Ringkasan Stok', href: '/gudang', icon: Building2 },
]

const MENU_BY_ROLE: Record<WebAdminRole, NavItem[]> = {
  admin: ADMIN_MENU,
  petugas: PETUGAS_MENU,
  koordinator: KOORDINATOR_MENU,
  pemerintah: PEMERINTAH_MENU,
}

export function getNavItemsForRole(role: WebAdminRole): NavItem[] {
  return MENU_BY_ROLE[role]
}

export function isWebAdminRole(role: UserRole): role is WebAdminRole {
  return (WEB_ADMIN_ROLES as readonly string[]).includes(role)
}

export const ROLE_LABELS: Record<WebAdminRole, string> = {
  admin: 'Admin Aplikasi',
  petugas: 'Petugas Bank Sampah',
  koordinator: 'Koordinator Program',
  pemerintah: 'Pemerintah Distrik',
}
