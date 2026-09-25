'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

type Pending = () => void

/**
 * Tahan navigasi keluar saat form punya perubahan belum disimpan.
 *
 * Yang ditahan: tombol form (`leave(href)`), klik link internal (sidebar,
 * header), tombol Back browser, dan tutup/muat ulang tab (dialog bawaan
 * browser). `onSave` harus mengembalikan `true` bila tersimpan — setelah itu
 * navigasi yang tertunda dilanjutkan.
 */
export function useUnsavedChanges({
  dirty,
  onSave,
}: {
  dirty: boolean
  onSave: () => Promise<boolean>
}) {
  const router = useRouter()
  const [pending, setPending] = useState<Pending | null>(null)
  const [saving, setSaving] = useState(false)
  const dirtyRef = useRef(dirty)
  const allowRef = useRef(false)
  const guardPushedRef = useRef(false)

  useEffect(() => {
    dirtyRef.current = dirty
  }, [dirty])

  const ask = useCallback((next: Pending) => setPending(() => next), [])

  /** Navigasi dari tombol form (Kembali/Batal). */
  const leave = useCallback(
    (href: string) => {
      if (!dirtyRef.current) {
        router.push(href)
        return
      }
      ask(() => router.push(href))
    },
    [ask, router],
  )

  // Tutup tab / muat ulang.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current || allowRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  // Klik link internal (Next <Link> di sidebar/header) — tahan di fase capture
  // sebelum handler React/Next berjalan.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!dirtyRef.current || allowRef.current) return
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return
      e.preventDefault()
      e.stopPropagation()
      ask(() => router.push(url.pathname + url.search + url.hash))
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [ask, router])

  // Tombol Back browser: sisipkan satu entri penjaga (URL & state sama) saat
  // form mulai berubah; Back hanya melepas entri itu lalu modal muncul.
  useEffect(() => {
    if (dirty && !guardPushedRef.current) {
      window.history.pushState(window.history.state, '', window.location.href)
      guardPushedRef.current = true
    }
  }, [dirty])

  useEffect(() => {
    const onPopState = () => {
      if (allowRef.current || !guardPushedRef.current) return
      if (!dirtyRef.current) {
        // Perubahan sudah dibatalkan manual: lanjutkan Back yang sebenarnya.
        guardPushedRef.current = false
        window.history.back()
        return
      }
      window.history.pushState(window.history.state, '', window.location.href)
      ask(() => window.history.go(-2))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [ask])

  const proceed = useCallback(() => {
    const next = pending
    setPending(null)
    if (!next) return
    allowRef.current = true
    next()
  }, [pending])

  async function handleSave() {
    setSaving(true)
    try {
      const ok = await onSave()
      if (ok) proceed()
      else setPending(null) // tetap di halaman; error tampil di form
    } finally {
      setSaving(false)
    }
  }

  const dialog = (
    <Modal
      open={pending !== null}
      onClose={() => (saving ? undefined : setPending(null))}
      title="Perubahan belum disimpan"
      description="Anda memiliki perubahan yang belum disimpan. Simpan perubahan sebelum keluar?"
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" onClick={proceed} disabled={saving}>
            Tidak
          </Button>
          <Button type="button" onClick={() => void handleSave()} loading={saving} disabled={saving}>
            <Save className="size-4" aria-hidden />
            Simpan
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">
        Pilih <strong>Tidak</strong> untuk keluar tanpa menyimpan, atau tutup jendela ini untuk
        tetap di halaman.
      </p>
    </Modal>
  )

  /** Tandai navigasi berikutnya sebagai sah (mis. setelah simpan dari tombol form). */
  const allowNavigation = useCallback(() => {
    allowRef.current = true
  }, [])

  return { leave, dialog, allowNavigation }
}
