'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Leaf, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { APP_NAME } from '@/lib/config'
import {
  getNavSectionsForRole,
  type NavItem,
  type WebAdminRole,
} from '@/lib/navigation'
import { Button } from '@/components/ui/Button'

export interface SidebarProps {
  role: WebAdminRole
  open: boolean
  onClose: () => void
  className?: string
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[]
  pathname: string
  onNavigate: () => void
}) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isActivePath(pathname, item.href)
        const Icon = item.icon

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export function Sidebar({ role, open, onClose, className }: SidebarProps) {
  const pathname = usePathname()
  const { main, settings } = getNavSectionsForRole(role)

  function handleNavigate() {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      onClose()
    }
  }

  return (
    <aside
      id="app-sidebar"
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-background transition-transform duration-200 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full pointer-events-none',
        className,
      )}
      aria-hidden={!open}
    >
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Leaf className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">MIRU</p>
          <p className="truncate text-xs text-muted-foreground">{APP_NAME}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 lg:hidden"
          onClick={onClose}
          aria-label="Tutup menu"
        >
          <X className="size-4" aria-hidden />
        </Button>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col p-3" aria-label="Menu utama">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <NavList items={main} pathname={pathname} onNavigate={handleNavigate} />
        </div>

        {settings.length > 0 && (
          <div className="mt-auto shrink-0 border-t border-border pt-3">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pengaturan
            </p>
            <NavList
              items={settings}
              pathname={pathname}
              onNavigate={handleNavigate}
            />
          </div>
        )}
      </nav>
    </aside>
  )
}
