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

export type NavSection = 'main' | 'settings'

export type SidebarBadgeKey = 'complaints' | 'withdrawals' | 'pickups'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  section?: NavSection
  badgeKey?: SidebarBadgeKey
}

const ADMIN_MENU: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Nasabah', href: '/customers', icon: Users },
  { label: 'Petugas & Staff', href: '/staff', icon: UserCog },
  { label: 'Transaksi Setoran', href: '/transactions', icon: Wallet },
  { label: 'Penjemputan', href: '/pickups', icon: Truck, badgeKey: 'pickups' },
  { label: 'Penarikan Saldo', href: '/balance', icon: Wallet, badgeKey: 'withdrawals' },
  { label: 'Reward & Poin', href: '/reward', icon: Gift },
  { label: 'Gudang & Mitra', href: '/warehouse', icon: Package },
  { label: 'Pengaduan', href: '/complaints', icon: Phone, badgeKey: 'complaints' },
  { label: 'Laporan', href: '/reports', icon: BarChart3 },
  {
    label: 'Pengaturan',
    href: '/settings',
    icon: Settings,
    section: 'settings',
  },
]

const PETUGAS_MENU: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Input Setoran', href: '/transactions/add', icon: Wallet },
  { label: 'Penjemputan', href: '/pickups', icon: Truck, badgeKey: 'pickups' },
  { label: 'Nasabah', href: '/customers', icon: Users },
  { label: 'Laporan Harian Saya', href: '/reports', icon: BarChart3 },
]

const KOORDINATOR_MENU: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Nasabah', href: '/customers', icon: Users },
  { label: 'Transaksi', href: '/transactions', icon: Wallet },
  { label: 'Penjemputan', href: '/pickups', icon: Truck, badgeKey: 'pickups' },
  { label: 'Penarikan', href: '/balance', icon: Wallet, badgeKey: 'withdrawals' },
  { label: 'Reward', href: '/reward', icon: Gift },
  { label: 'Gudang', href: '/warehouse', icon: Package },
  { label: 'Pengaduan', href: '/complaints', icon: Phone, badgeKey: 'complaints' },
  { label: 'Laporan', href: '/reports', icon: BarChart3 },
  {
    label: 'Pengaturan',
    href: '/settings',
    icon: Settings,
    section: 'settings',
  },
]

const PEMERINTAH_MENU: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
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

export function getNavSectionsForRole(role: WebAdminRole): {
  main: NavItem[]
  settings: NavItem[]
} {
  const items = getNavItemsForRole(role)
  return {
    main: items.filter((item) => (item.section ?? 'main') === 'main'),
    settings: items.filter((item) => item.section === 'settings'),
  }
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
