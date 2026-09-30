import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  CalendarCheck,
  Gift,
  Headset,
  Megaphone,
  PiggyBank,
  TrendingUp,
  Truck,
  Wallet,
} from 'lucide-react'
import { canAccessRoute, type WebAdminRole } from '@/lib/routes'

export interface NotifStyle {
  label: string
  icon: LucideIcon
  /** Kelas warna ikon + latar lembut (tema terang & gelap). */
  tone: string
  /** Halaman panel yang berhubungan dengan notifikasi ini. */
  href?: string
}

const STYLES: Record<string, NotifStyle> = {
  penjemputan: { label: 'Penjemputan', icon: Truck, tone: 'bg-emerald-500/10 text-emerald-600', href: '/pickups' },
  jadwal_jemput: { label: 'Jadwal jemput', icon: CalendarCheck, tone: 'bg-teal-500/10 text-teal-600', href: '/pickups' },
  setoran: { label: 'Setoran', icon: PiggyBank, tone: 'bg-green-500/10 text-green-600', href: '/transactions' },
  penarikan: { label: 'Penarikan saldo', icon: Wallet, tone: 'bg-blue-500/10 text-blue-600', href: '/balance' },
  penukaran: { label: 'Penukaran poin', icon: Gift, tone: 'bg-purple-500/10 text-purple-600', href: '/reward' },
  pengaduan: { label: 'Pengaduan', icon: Headset, tone: 'bg-orange-500/10 text-orange-600', href: '/complaints' },
  harga: { label: 'Harga sampah', icon: TrendingUp, tone: 'bg-amber-500/10 text-amber-600', href: '/waste/categories' },
  pengumuman: { label: 'Pengumuman', icon: Megaphone, tone: 'bg-indigo-500/10 text-indigo-600', href: '/announcements' },
}

const FALLBACK: NotifStyle = { label: 'Info', icon: Bell, tone: 'bg-slate-500/10 text-slate-600' }

export function notifStyleFor(kategori: string | null | undefined): NotifStyle {
  return (kategori && STYLES[kategori]) || FALLBACK
}

/** Halaman terkait yang boleh dibuka role ini (undefined bila tidak ada/tidak boleh). */
export function notifTargetFor(
  kategori: string | null | undefined,
  role: WebAdminRole | null | undefined,
): string | undefined {
  const href = notifStyleFor(kategori).href
  if (!href || !role) return undefined
  return canAccessRoute(role, href) ? href : undefined
}
