import useSWR from 'swr'
import { api, getAccessToken } from '@/lib/api'
import { API_PREFIX } from '@/lib/config'
import type { WebAdminRole } from '@/lib/navigation'
import type { PaginationMeta } from '@/types/api'

export interface SidebarBadgeCounts {
  complaints: number
  withdrawals: number
  pickups: number
}

const EMPTY_BADGES: SidebarBadgeCounts = {
  complaints: 0,
  withdrawals: 0,
  pickups: 0,
}

async function fetchCount(path: string, params: Record<string, string>): Promise<number> {
  const url = new URL(`${API_PREFIX}${path}`)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const token = getAccessToken()
  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Language': 'id',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!res.ok) return 0

  const envelope = await res.json()
  const pagination = envelope.meta?.pagination as PaginationMeta | undefined
  return pagination?.count ?? 0
}

export function useSidebarBadges(role: WebAdminRole) {
  const { data } = useSWR(
    ['sidebar-badges', role],
    async () => {
      const badges: SidebarBadgeCounts = { ...EMPTY_BADGES }

      if (role === 'admin' || role === 'koordinator') {
        const [overview, withdrawals] = await Promise.all([
          api.get<{
            penjemputan_menunggu: number
            pengaduan_terbuka: number
          }>('/dashboard/overview/'),
          fetchCount('/withdrawals/', {
            status: 'menunggu',
            page_size: '1',
          }),
        ])

        badges.complaints = overview.pengaduan_terbuka
        badges.pickups = overview.penjemputan_menunggu
        badges.withdrawals = withdrawals
        return badges
      }

      if (role === 'petugas') {
        // Petugas tidak melihat menunggu/ditolak — badge = tugas aktif yang ditugaskan
        badges.pickups = await fetchCount('/pickups/', {
          status__in: 'dijadwalkan,dalam_perjalanan,dijemput',
          page_size: '1',
        })
      }

      return badges
    },
    { refreshInterval: 60_000, revalidateOnFocus: true },
  )

  return data
}
