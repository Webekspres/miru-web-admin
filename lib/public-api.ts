import { API_PREFIX } from './config'
import type { ApiEnvelope } from '@/types/api'

/** Fetch endpoint publik (AllowAny) tanpa auth. Return null jika gagal. */
export async function fetchPublicData<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_PREFIX}${path}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const envelope = (await res.json()) as ApiEnvelope<T>
    if (!envelope.success || envelope.data == null) return null
    return envelope.data
  } catch {
    return null
  }
}
