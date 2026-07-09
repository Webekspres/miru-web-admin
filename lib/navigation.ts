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
  { label: 'Nasabah', href: '/customers', icon: Users },
  { label: 'Petugas & Staff', href: '/staff', icon: UserCog },
  { label: 'Transaksi Setoran', href: '/transactions', icon: Wallet },
  { label: 'Penjemputan', href: '/pickups', icon: Truck },
  { label: 'Penarikan Saldo', href: '/balance', icon: Wallet },
  { label: 'Reward & Poin', href: '/reward', icon: Gift },
  { label: 'Gudang & Mitra', href: '/warehouse', icon: Package },
  { label: 'Pengaduan', href: '/complaints', icon: Phone },
  { label: 'Laporan', href: '/reports', icon: BarChart3 },
  { label: 'Pengaturan', href: '/settings', icon: Settings },
]

const PETUGAS_MENU: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Input Setoran', href: '/transactions/add', icon: Wallet },
  { label: 'Penjemputan', href: '/pickups', icon: Truck },
  { label: 'Nasabah', href: '/customers', icon: Users },
  { label: 'Laporan Harian Saya', href: '/reports', icon: BarChart3 },
]

const KOORDINATOR_MENU: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Nasabah', href: '/customers', icon: Users },
  { label: 'Transaksi', href: '/transactions', icon: Wallet },
  { label: 'Penjemputan', href: '/pickups', icon: Truck },
  { label: 'Penarikan', href: '/balance', icon: Wallet },
  { label: 'Reward', href: '/reward', icon: Gift },
  { label: 'Gudang', href: '/warehouse', icon: Package },
  { label: 'Pengaduan', href: '/complaints', icon: Phone },
  { label: 'Laporan', href: '/reports', icon: BarChart3 },
]

const PEMERINTAH_MENU: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Laporan', href: '/reports', icon: BarChart3 },
  { label: 'Ringkasan Stok', href: '/warehouse', icon: Building2 },
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
