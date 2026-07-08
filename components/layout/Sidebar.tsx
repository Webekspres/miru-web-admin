'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Leaf } from 'lucide-react'
import { cn } from '@/lib/cn'
import { APP_NAME } from '@/lib/config'
import {
  getNavItemsForRole,
  type WebAdminRole,
} from '@/lib/navigation'

export interface SidebarProps {
  role: WebAdminRole
  className?: string
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Sidebar({ role, className }: SidebarProps) {
  const pathname = usePathname()
  const items = getNavItemsForRole(role)

  return (
    <aside
      className={cn(
        'flex h-full w-64 shrink-0 flex-col border-r border-border bg-background',
        className,
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Leaf className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">MIRU</p>
          <p className="truncate text-xs text-muted-foreground">{APP_NAME}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3" aria-label="Menu utama">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const active = isActivePath(pathname, item.href)
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
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
      </nav>
    </aside>
  )
}
