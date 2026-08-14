'use client'

import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { ROLE_LABELS } from '@/lib/navigation'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { UserAvatar } from '@/components/ui/UserAvatar'

export function ProfileClient() {
  const { user, role } = useAuth()

  if (!user || !role) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Profil</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informasi akun Anda di panel MIRU.
          </p>
        </div>
        <Link
          href="/profile/edit"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary-hover"
        >
          <Pencil className="size-3.5" aria-hidden />
          Edit
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <UserAvatar src={user.avatar_url} name={user.nama_lengkap} size="md" />
          <div>
            <CardTitle>{user.nama_lengkap}</CardTitle>
            <Badge variant="primary" className="mt-1">
              {ROLE_LABELS[role]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-border pb-3">
            <span className="text-muted-foreground">Nama pengguna</span>
            <span className="font-medium text-foreground">{user.username}</span>
          </div>
          <div className="flex justify-between gap-4 border-b border-border pb-3">
            <span className="text-muted-foreground">No. HP</span>
            <span className="font-medium text-foreground">{user.no_hp || '—'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Alamat</span>
            <span className="max-w-xs text-right font-medium text-foreground">
              {user.alamat || '—'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
