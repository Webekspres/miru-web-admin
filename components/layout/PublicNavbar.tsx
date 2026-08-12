'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LogIn, Menu, X } from 'lucide-react'
import { MiruLogo } from '@/components/brand/MiruLogo'
import { cn } from '@/lib/cn'

export const NAV_LINKS = [
  { href: '#beranda', label: 'Beranda' },
  { href: '#tentang', label: 'Tentang' },
  { href: '#alur', label: 'Alur Kerja' },
  { href: '#fitur', label: 'Fitur Utama' },
  { href: '#kategori', label: 'Kategori' },
  { href: '#akses', label: 'Peran Akses' },
  { href: '#faq', label: 'FAQ' },
] as const

interface PublicNavbarProps {
  showSectionLinks?: boolean
  /** Auth pages: keep navbar pinned; parent handles overflow. */
  lockScroll?: boolean
}

export function PublicNavbar({
  showSectionLinks = true,
  lockScroll = false,
}: PublicNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (lockScroll) return
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lockScroll])

  useEffect(() => {
    if (!mobileOpen) return
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [mobileOpen])

  return (
    <header
      className={cn(
        'z-50 w-full shrink-0 border-b transition-all duration-200',
        lockScroll ? 'relative' : 'sticky top-0',
        scrolled && !lockScroll
          ? 'border-border/80 bg-background/95 shadow-sm backdrop-blur-md'
          : 'border-border/40 bg-background/80 backdrop-blur-sm',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 transition-opacity duration-200 hover:opacity-90"
        >
          <MiruLogo variant="full" height={34} className="h-11 w-auto" priority />
        </Link>

        {showSectionLinks ? (
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-xs font-semibold text-foreground/80 transition-colors duration-150 hover:bg-primary/10 hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>
        ) : (
          <div className="hidden flex-1 lg:block" aria-hidden />
        )}

        <div className="flex items-center gap-2">
          {showSectionLinks ? (
            <Link
              href="/login"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3.5 text-xs font-bold text-primary-foreground shadow-xs transition-transform duration-150 hover:bg-primary-hover active:scale-95"
            >
              <LogIn className="size-3.5" aria-hidden />
              <span>Masuk Panel</span>
            </Link>
          ) : null}

          {showSectionLinks && (
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-muted lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <X className="size-4" aria-hidden />
              ) : (
                <Menu className="size-4" aria-hidden />
              )}
            </button>
          )}
        </div>
      </div>

      {showSectionLinks && (
        <div
          id="mobile-nav"
          className={cn(
            'grid transition-[grid-template-rows,opacity] duration-200 lg:hidden',
            mobileOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <div className="overflow-hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 border-t border-border/60 bg-background px-4 py-3 sm:px-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-primary/10 hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 border-t border-border pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-xs font-bold text-primary-foreground"
                >
                  <LogIn className="size-4" />
                  Masuk ke Panel Administrasi
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
