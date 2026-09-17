'use client'

import { useCallback, useRef, useState } from 'react'

/**
 * Kunci in-flight (ref + state) agar double-click tidak mengirim request ganda
 * sebelum React sempat re-render `disabled`.
 */
export function useSubmitLock() {
  const locked = useRef(false)
  const [pending, setPending] = useState(false)

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
    if (locked.current) return undefined
    locked.current = true
    setPending(true)
    try {
      return await fn()
    } finally {
      locked.current = false
      setPending(false)
    }
  }, [])

  return { pending, run }
}
