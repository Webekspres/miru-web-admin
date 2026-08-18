'use client'

import Link from 'next/link'
import {
  Building2,
  ChevronRight,
  FileText,
  Scale,
  Shield,
  UserRound,
} from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { Card } from '@/components/ui/Card'
import type { WebAdminRole } from '@/lib/navigation'

const ITEMS = [
  {
    href: '/profile',
    label: 'Akun',
    description: 'Username, foto profil, dan data diri.',
    icon: UserRound,
    roles: ['admin', 'koordinator', 'petugas', 'pemerintah'],
  },
  {
    href: '/institution',
    label: 'Institusi',
    description: 'Nama, alamat, kontak, dan jam operasional.',
    icon: Building2,
    roles: ['admin', 'koordinator'],
  },
  {
    href: '/privacy',
    label: 'Kebijakan Privasi',
    description: 'Mobile & halaman publik /privacy-policy (Play Store).',
    icon: Shield,
    roles: ['admin', 'koordinator'],
  },
  {
    href: '/syarat-ketentuan',
    label: 'Syarat & Ketentuan',
    description: 'Halaman publik /terms — dapat diedit admin.',
    icon: Scale,
    roles: ['admin', 'koordinator'],
  },
  {
    href: '/about',
    label: 'Tentang MIRU',
    description: 'Konten tentang kami di aplikasi mobile.',
    icon: FileText,
    roles: ['admin', 'koordinator'],
  },
] as const

export function SettingsHub() {
  const { role } = useAuth()

  const items = ITEMS.filter((item) => role && (item.roles as readonly WebAdminRole[]).includes(role))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Pengaturan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih menu untuk melihat atau mengubah data.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <Card className="flex h-full items-start gap-3 p-4 transition-colors hover:bg-surface-muted">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
