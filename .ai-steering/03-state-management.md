# 03 — State Management & Data Flow (Web Admin)

> **Integrasi API:** Lihat `04-api-integration.md` untuk JSON Envelope dan API client.
> **Role & menu:** Lihat `10-integration-and-roles.md`.

## State Management Strategy

### 1. Server State (Data dari API)

Gunakan **SWR** (atau React Query) untuk semua data dari backend. **Selalu** parse JSON Envelope — payload ada di `data`:

```typescript
import useSWR from 'swr'
import { api } from '@/lib/api'

function useNasabah(page = 1) {
  return useSWR(
    `/users/?role=nasabah&page=${page}`,
    (path) => api.get<Nasabah[]>(path)
  )
}
```

**Kenapa SWR?**
- Auto revalidation (refetch saat window focus)
- Caching + deduplication
- Optimistic updates
- Built-in error retry

### 2. Auth State (Global)

```typescript
type WebAdminRole = 'admin' | 'petugas' | 'koordinator' | 'pemerintah'

interface AuthState {
  user: User | null
  role: WebAdminRole | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
}
```

- Token disimpan di `localStorage` (key: `access_token`, `refresh_token`)
- On mount: cek token → `GET /api/auth/me/` → restore session
- Block role `nasabah` saat login
- Token expired → coba refresh → redirect `/login`

### 3. UI State (Lokal)

Gunakan React hooks lokal untuk:
- Form state (useState/useReducer)
- Modal visibility
- Search/filter input
- Pagination controls (sync dengan `meta.pagination`)

### 4. Form Management

Form kompleks (transaksi setoran multi-detail):
- `useReducer` untuk state multi-baris
- Atau React Hook Form + Zod validasi
- Tampilkan error validasi dari `envelope.errors` per field

## Data Fetching Pattern

### API Client

Semua request melalui `lib/api.ts` yang:
1. Attach JWT header
2. Parse JSON Envelope
3. Throw `ApiError` dengan `message`, `code`, `errors`
4. Handle 401 → refresh token

Lihat implementasi lengkap di `04-api-integration.md` §4.

### Pattern Server Components

```typescript
// app/(dashboard)/nasabah/page.tsx
async function NasabahPage() {
  // Prefer client-side SWR untuk data yang perlu refresh
  // Server Components hanya untuk static/SEO jika diperlukan
  return <NasabahListClient />
}
```

### Pattern Client Components

```typescript
'use client'
import useSWR from 'swr'

export function NasabahListClient() {
  const { data, error, isLoading, mutate } = useSWR(
    '/users/?role=nasabah',
    api.get
  )
  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorMessage message="Gagal memuat data nasabah" onRetry={mutate} />
  if (!data?.length) return <EmptyState message="Belum ada nasabah" />
  return <NasabahTable data={data} />
}
```

## Type Definitions (`types/`)

Field API menggunakan `snake_case`. Decimal/uang dari API sebagai **string**:

```typescript
interface User {
  id: number
  username: string
  role: 'nasabah' | 'petugas' | 'admin' | 'koordinator' | 'pemerintah'
  nama_lengkap: string
  saldo?: string      // "125000.00"
  poin?: number
  is_active: boolean
}

interface ApiEnvelope<T> {
  success: boolean
  status_code: number
  message: string
  data: T | null
  code?: string
  errors?: Record<string, string[]>
  meta: {
    timestamp: string
    request_id: string
    pagination?: PaginationMeta
  }
}
```

Model lengkap: `04-api-integration.md` §8 dan **miru-backend-api** — `.ai-steering/04-api-contracts-and-standards.md`

## Pagination Pattern

```typescript
const { data, meta } = await api.getWithMeta<Deposit[]>('/deposits/', { page: '2' })
// meta.pagination: { count, page, page_size, total_pages, next, previous }
```

## Role-Based Data Access

Filter data di UI sesuai role (backend tetap enforce 403):

| Role | Query Default |
|------|---------------|
| Admin | Semua data |
| Petugas | Fokus setoran & penjemputan assigned |
| Koordinator | Read-only, semua data |
| Pemerintah | Aggregated/laporan saja |

Lihat `10-integration-and-roles.md` untuk matriks lengkap.
