# 03 — State Management & Data Flow (Web Admin)

## State Management Strategy

### 1. Server State (Data dari API)
Gunakan **SWR** (atau React Query) untuk semua data yang berasal dari backend:

```typescript
// Contoh dengan SWR
import useSWR from 'swr'
import { api } from '@/lib/api'

function useNasabah() {
  return useSWR('/users/?role=nasabah', api.fetchJSON)
}
```

**Kenapa SWR?**
- Auto revalidation (refetch saat window focus)
- Caching + deduplication
- Optimistic updates
- Built-in error retry

### 2. Auth State (Global)
Gunakan React Context untuk auth:

```typescript
interface AuthState {
  user: User | null
  token: string | null
  role: 'admin' | 'petugas' | 'koordinator' | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}
```
- Token disimpan di `localStorage`
- Pada mount, cek localStorage untuk restore session
- Jika token expired, redirect ke login

### 3. UI State (Lokal)
Gunakan React hooks lokal untuk:
- Form state (useState/useReducer)
- Modal visibility
- Search/filter input
- Pagination controls

### 4. Form Management
Untuk form kompleks (transaksi setoran dengan multiple details):
- Gunakan `useReducer` untuk state multi-step form
- Atau React Hook Form untuk validasi form yang kompleks

## Data Fetching Pattern

### API Client (`lib/api.ts`)
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  async get<T>(path: string): Promise<T> { ... }
  async post<T>(path: string, body: unknown): Promise<T> { ... }
  async patch<T>(path: string, body: unknown): Promise<T> { ... }
  async delete(path: string): Promise<void> { ... }
}

export const api = new ApiClient()
```

### Pattern untuk Server Components
```typescript
// app/(dashboard)/nasabah/page.tsx — Server Component
async function NasabahPage() {
  const data = await fetch(`${API_URL}/users/?role=nasabah`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  })
  const nasabah = await data.json()
  return <NasabahList data={nasabah} />
}
```

### Pattern untuk Client Components
```typescript
// components/NasabahList.tsx — Client Component
'use client'
import useSWR from 'swr'

export function NasabahList() {
  const { data, error, isLoading } = useSWR('/users/?role=nasabah', api.get)
  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorMessage message="Gagal memuat data nasabah" />
  return <table>{...}</table>
}
```

## Type Definitions (`types/index.ts`)
```typescript
interface Nasabah {
  id: number
  username: string
  nama_lengkap: string
  role: 'nasabah'
  nik?: string
  no_hp?: string
  alamat?: string
  saldo: number
  poin: number
}

interface KategoriSampah {
  id: number
  nama: string
  harga_beli_per_kg: number
  stok_terkini_kg: number
}

interface TransaksiSetoran {
  id: number
  nasabah: number
  petugas: number | null
  tanggal: string
  total_nilai: number
  status: string
  details: DetailSetoran[]
}

interface DetailSetoran {
  id: number
  kategori: number
  berat_kg: number
  harga_saat_itu: number
  subtotal: number
}

interface Penjemputan {
  id: number
  nasabah: number
  petugas: number | null
  estimasi_berat: number
  alamat_jemput: string
  jadwal: string
  status: 'menunggu' | 'disetujui' | 'dijadwalkan' | 'dalam_perjalanan' | 'dijemput' | 'selesai' | 'ditolak'
}

interface PenarikanSaldo {
  id: number
  nasabah: number
  nominal: number
  metode: string
  status: 'menunggu' | 'selesai'
  tanggal: string
}

interface Reward {
  id: number
  nama: string
  poin_dibutuhkan: number
  stok: number
}

interface PenukaranPoin {
  id: number
  nasabah: number
  reward: number
  status: 'menunggu' | 'selesai'
  tanggal: string
}

interface MitraPengepul {
  id: number
  nama: string
  kontak: string
}

interface PenjualanMitra {
  id: number
  mitra: number
  kategori: number
  berat_jual_kg: number
  harga_jual_per_kg: number
  total_penjualan: number
  tanggal: string
}

interface Pengaduan {
  id: number
  nasabah: number
  keluhan: string
  status: 'terbuka' | 'ditutup'
  tanggal: string
  tindak_lanjut?: string
}
```
