import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  BookOpen,
  Building2,
  Gift,
  History,
  LayoutDashboard,
  Megaphone,
  Package,
  Phone,
  Recycle,
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

export type NavSection = 'main' | 'transactions' | 'master_data' | 'reports' | 'settings'

export type SidebarBadgeKey = 'complaints' | 'withdrawals' | 'pickups'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  section?: NavSection
  badgeKey?: SidebarBadgeKey
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

const ADMIN_MENU: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, section: 'main' },
  { label: 'Transaksi Setoran', href: '/transactions', icon: Wallet, section: 'transactions' },
  { label: 'Penjemputan', href: '/pickups', icon: Truck, badgeKey: 'pickups', section: 'transactions' },
  { label: 'Penarikan Saldo', href: '/balance', icon: Wallet, badgeKey: 'withdrawals', section: 'transactions' },
  { label: 'Nasabah', href: '/customers', icon: Users, section: 'master_data' },
  { label: 'Petugas & Staff', href: '/staff', icon: UserCog, section: 'master_data' },
  { label: 'Reward & Poin', href: '/reward', icon: Gift, section: 'master_data' },
  { label: 'Gudang & Mitra', href: '/warehouse', icon: Package, section: 'master_data' },
  { label: 'Katalog & Harga', href: '/waste/categories', icon: Recycle, section: 'master_data' },
  { label: 'Edukasi', href: '/education', icon: BookOpen, section: 'master_data' },
  { label: 'Pengaduan', href: '/complaints', icon: Phone, badgeKey: 'complaints', section: 'reports' },
  { label: 'Laporan', href: '/reports', icon: BarChart3, section: 'reports' },
  { label: 'Pengumuman', href: '/announcements', icon: Megaphone, section: 'settings' },
  { label: 'Audit Log', href: '/audit-log', icon: History, section: 'settings' },
  { label: 'Pengaturan', href: '/settings', icon: Settings, section: 'settings' },
]

const PETUGAS_MENU: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, section: 'main' },
  { label: 'Input Setoran', href: '/transactions/add', icon: Wallet, section: 'transactions' },
  { label: 'Penjemputan', href: '/pickups', icon: Truck, badgeKey: 'pickups', section: 'transactions' },
  { label: 'Nasabah', href: '/customers', icon: Users, section: 'master_data' },
  { label: 'Laporan Saya', href: '/reports', icon: BarChart3, section: 'reports' },
]

const KOORDINATOR_MENU: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, section: 'main' },
  { label: 'Transaksi', href: '/transactions', icon: Wallet, section: 'transactions' },
  { label: 'Penjemputan', href: '/pickups', icon: Truck, badgeKey: 'pickups', section: 'transactions' },
  { label: 'Penarikan', href: '/balance', icon: Wallet, badgeKey: 'withdrawals', section: 'transactions' },
  { label: 'Nasabah', href: '/customers', icon: Users, section: 'master_data' },
  { label: 'Reward', href: '/reward', icon: Gift, section: 'master_data' },
  { label: 'Gudang', href: '/warehouse', icon: Package, section: 'master_data' },
  { label: 'Katalog & Harga', href: '/waste/categories', icon: Recycle, section: 'master_data' },
  { label: 'Edukasi', href: '/education', icon: BookOpen, section: 'master_data' },
  { label: 'Pengaduan', href: '/complaints', icon: Phone, badgeKey: 'complaints', section: 'reports' },
  { label: 'Laporan', href: '/reports', icon: BarChart3, section: 'reports' },
  { label: 'Pengumuman', href: '/announcements', icon: Megaphone, section: 'settings' },
  { label: 'Pengaturan', href: '/settings', icon: Settings, section: 'settings' },
]

const PEMERINTAH_MENU: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, section: 'main' },
  { label: 'Laporan', href: '/reports', icon: BarChart3, section: 'reports' },
  { label: 'Ringkasan Stok', href: '/warehouse', icon: Building2, section: 'master_data' },
]

const MENU_BY_ROLE: Record<WebAdminRole, NavItem[]> = {
  admin: ADMIN_MENU,
  petugas: PETUGAS_MENU,
  koordinator: KOORDINATOR_MENU,
  pemerintah: PEMERINTAH_MENU,
}

const SECTION_LABELS: Record<NavSection, string> = {
  main: '',
  transactions: 'TRANSAKSI',
  master_data: 'MASTER DATA',
  reports: 'LAPORAN & PENGADUAN',
  settings: 'PENGATURAN',
}

export function getNavItemsForRole(role: WebAdminRole): NavItem[] {
  return MENU_BY_ROLE[role]
}

export function getGroupedNavForRole(role: WebAdminRole): NavGroup[] {
  const items = getNavItemsForRole(role)
  const groupMap = new Map<NavSection, NavItem[]>()

  for (const item of items) {
    const sec = item.section ?? 'main'
    if (!groupMap.has(sec)) {
      groupMap.set(sec, [])
    }
    groupMap.get(sec)!.push(item)
  }

  const sectionsOrder: NavSection[] = ['main', 'transactions', 'master_data', 'reports', 'settings']
  const groups: NavGroup[] = []

  for (const sec of sectionsOrder) {
    const secItems = groupMap.get(sec)
    if (secItems && secItems.length > 0) {
      groups.push({
        title: SECTION_LABELS[sec],
        items: secItems,
      })
    }
  }

  return groups
}

export function getNavSectionsForRole(role: WebAdminRole): {
  main: NavItem[]
  settings: NavItem[]
} {
  const items = getNavItemsForRole(role)
  return {
    main: items.filter((item) => (item.section ?? 'main') !== 'settings'),
    settings: items.filter((item) => item.section === 'settings'),
  }
}

export function isWebAdminRole(role: UserRole): role is WebAdminRole {
  return (WEB_ADMIN_ROLES as readonly string[]).includes(role)
}

export const ROLE_LABELS: Record<WebAdminRole, string> = {
  admin: 'Administrator',
  petugas: 'Petugas Bank Sampah',
  koordinator: 'Koordinator Program',
  pemerintah: 'Pemerintah Distrik',
}
