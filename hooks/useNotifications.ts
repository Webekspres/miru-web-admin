import useSWR from 'swr'
import { getAccessToken } from '@/lib/api'
import { API_PREFIX } from '@/lib/config'
import type { PaginationMeta } from '@/types/api'
import type { Notification } from '@/types/models'

const PREVIEW_LIMIT = 5

async function fetchNotifications(userId: number) {
  const url = new URL(`${API_PREFIX}/notifications/`)
  url.searchParams.set('user', String(userId))
  url.searchParams.set('page_size', '50')
  url.searchParams.set('ordering', '-created_at')

  const token = getAccessToken()
  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Language': 'id',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const envelope = await res.json()
  return {
    items: (envelope.data ?? []) as Notification[],
    pagination: envelope.meta?.pagination as PaginationMeta | undefined,
  }
}

export function useNotifications(userId: number | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? ['notifications', userId] : null,
    () => fetchNotifications(userId!),
    { refreshInterval: 60_000, revalidateOnFocus: true },
  )

  const items = data?.items ?? []
  const unreadCount = items.filter((item) => !item.is_read).length
  const previewItems = items.slice(0, PREVIEW_LIMIT)

  return {
    items,
    previewItems,
    unreadCount,
    isLoading,
    error,
    mutate,
  }
}
