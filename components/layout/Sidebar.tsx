'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { MiruLogo } from '@/components/brand/MiruLogo'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { cn } from '@/lib/cn'
import { APP_NAME } from '@/lib/config'
import { useSidebarBadges } from '@/hooks/useSidebarBadges'
import {
  getGroupedNavForRole,
  ROLE_LABELS,
  type NavItem,
  type SidebarBadgeKey,
  type WebAdminRole,
} from '@/lib/navigation'
import { Button } from '@/components/ui/Button'

export interface SidebarProps {
  role: WebAdminRole
  user?: {
    nama_lengkap: string
    role: WebAdminRole
    avatar_url?: string | null
  }
  open: boolean
  onClose: () => void
  className?: string
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard'
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

function getBadgeCount(
  badgeKey: SidebarBadgeKey | undefined,
  badges: ReturnType<typeof useSidebarBadges>,
): number {
  if (!badgeKey || !badges) return 0
  return badges[badgeKey] ?? 0
}

function NavList({
  items,
  pathname,
  onNavigate,
  badges,
}: {
  items: NavItem[]
  pathname: string
  onNavigate: () => void
  badges: ReturnType<typeof useSidebarBadges>
}) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isActivePath(pathname, item.href)
        const Icon = item.icon
        const badgeCount = getBadgeCount(item.badgeKey, badges)

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={cn('size-4 shrink-0', active ? 'text-primary-foreground' : 'text-muted-foreground')} aria-hidden />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {badgeCount > 0 && (
                <span
                  className={cn(
                    'inline-flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none',
                    active
                      ? 'bg-primary-foreground text-primary'
                      : 'bg-danger text-white',
                  )}
                  aria-label={`${badgeCount} perlu ditindaklanjuti`}
                >
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export function Sidebar({ role, user, open, onClose, className }: SidebarProps) {
  const pathname = usePathname()
  const groups = getGroupedNavForRole(role)
  const badges = useSidebarBadges(role)

  function handleNavigate() {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      onClose()
    }
  }

  const roleLabel = ROLE_LABELS[role]
  const displayName = user?.nama_lengkap ?? roleLabel

  return (
    <aside
      id="app-sidebar"
      className={cn(
        'print-hidden fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-background text-foreground transition-transform duration-200 ease-in-out shadow-sm',
        open ? 'translate-x-0' : '-translate-x-full pointer-events-none',
        className,
      )}
      aria-hidden={!open}
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4 bg-background">
        <MiruLogo variant="icon" height={36} className="rounded-lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold tracking-tight text-foreground">MIRU</p>
          <p className="truncate text-xs text-muted-foreground">{APP_NAME}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-muted-foreground hover:text-foreground lg:hidden"
          onClick={onClose}
          aria-label="Tutup menu"
        >
          <X className="size-4" aria-hidden />
        </Button>
      </div>

      {/* User Profile Box (matching design tokens) */}
      <div className="shrink-0 border-b border-border px-4 py-3.5 bg-surface-muted/60">
        <div className="flex items-center gap-3">
          <UserAvatar src={user?.avatar_url} name={displayName} size="sidebar" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
            <p className="truncate text-xs font-medium text-muted-foreground">{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3" aria-label="Menu utama">
        <div className="space-y-4">
          {groups.map((group, idx) => (
            <div key={group.title || `group-${idx}`}>
              {group.title && (
                <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </p>
              )}
              <NavList
                items={group.items}
                pathname={pathname}
                onNavigate={handleNavigate}
                badges={badges}
              />
            </div>
          ))}
        </div>
      </nav>
    </aside>
  )
}


