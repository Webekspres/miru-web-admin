# 04 — API Integration (Web Admin)

> **Sumber kebenaran API:** repositori GitHub **miru-backend-api** — `.ai-steering/04-api-contracts-and-standards.md`
>
> Dokumen ini fokus pada **implementasi client** di Next.js. Jangan duplikasi spesifikasi endpoint — selalu rujuk backend §04.

---

## 1. Base Configuration

```typescript
// lib/config.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export const API_PREFIX = `${API_BASE_URL}/api`

export const AUTH = {
  login: `${API_PREFIX}/auth/login/`,
  refresh: `${API_PREFIX}/auth/refresh/`,
  me: `${API_PREFIX}/auth/me/`,
} as const
```

| Environment | `NEXT_PUBLIC_API_URL` |
|-------------|----------------------|
| Local dev | `http://localhost:8000` |
| Staging | `https://staging-api.mirubanksampah.id` (usulan) |
| Production | `https://api.mirubanksampah.id` (usulan) |

---

## 2. JSON Envelope — WAJIB Dipahami

Backend mengembalikan **semua** response dalam envelope:

```typescript
interface ApiEnvelope<T> {
  success: boolean
  status_code: number
  message: string
  data: T | null
  code?: string           // hanya saat error
  errors?: Record<string, string[]> | null  // validasi field
  meta: {
    timestamp: string     // ISO 8601 WIT (+09:00)
    request_id: string
    pagination?: {
      count: number
      page: number
      page_size: number
      total_pages: number
      next: string | null
      previous: string | null
    }
  }
}
```

**Aturan client:**
- Payload bisnis selalu di `envelope.data`
- Cek `envelope.success` atau HTTP status header
- Pesan user-friendly dari `envelope.message`
- Error validasi per-field dari `envelope.errors`
- Pagination dari `envelope.meta.pagination`

---

## 3. Autentikasi

### 3.1 Login Flow

1. User input username + password di `/login`
2. `POST /api/auth/login/` dengan body `{ username, password }`
3. Parse `data.access`, `data.refresh`, `data.user` dari envelope
4. Simpan token (localStorage atau httpOnly cookie via route handler)
5. Redirect berdasarkan `data.user.role` (lihat `10-integration-and-roles.md`)

**Request:**
```json
{ "username": "admin", "password": "admin123" }
```

**Response sukses — ambil dari `data`:**
```json
{
  "access": "eyJ...",
  "refresh": "eyJ...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "nama_lengkap": "Admin MIRU"
  }
}
```

### 3.2 Token Refresh

- Trigger: API return `401` atau `status_code: 401`
- `POST /api/auth/refresh/` dengan `{ refresh: "<refresh_token>" }`
- Update `access` token, retry request original
- Jika refresh gagal → clear session → redirect `/login`

### 3.3 Profil Login

- `GET /api/auth/me/` — profil user yang sedang login (tanpa perlu tahu ID)
- Gunakan setelah login / restore session untuk validasi token

### 3.4 Header Standar

```
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
Accept-Language: id
```

---

## 4. API Client (`lib/api.ts`)

```typescript
import { API_PREFIX, AUTH } from './config'
import type { ApiEnvelope } from '@/types/api'

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public errors?: Record<string, string[]>
  ) {
    super(message)
  }
}

async function parseEnvelope<T>(response: Response): Promise<T> {
  const envelope: ApiEnvelope<T> = await response.json()

  if (!envelope.success) {
    throw new ApiError(
      envelope.message,
      envelope.status_code,
      envelope.code,
      envelope.errors ?? undefined
    )
  }
  return envelope.data as T
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Language': 'id',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${API_PREFIX}${path}`)
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    const res = await fetch(url.toString(), { headers: this.getHeaders() })
    return parseEnvelope<T>(res)
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_PREFIX}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    })
    return parseEnvelope<T>(res)
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_PREFIX}${path}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    })
    return parseEnvelope<T>(res)
  }

  async delete(path: string): Promise<void> {
    const res = await fetch(`${API_PREFIX}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    await parseEnvelope<null>(res)
  }
}

export const api = new ApiClient()
export { ApiError, AUTH }
```

---

## 5. Endpoint Web Admin (English Routes)

> Permission detail per endpoint: backend §04 bagian 6.

| Modul | Method | Endpoint | Role |
|-------|--------|----------|------|
| **Auth** | POST | `/api/auth/login/` | Public |
| | POST | `/api/auth/refresh/` | Public |
| | GET | `/api/auth/me/` | JWT |
| **Users** | GET | `/api/users/?role=nasabah` | Admin, Koordinator |
| | GET/PATCH | `/api/users/{id}/` | Owner, Admin |
| | POST | `/api/users/` | Admin (create staff) |
| **Waste categories** | GET | `/api/waste-categories/` | Public (GET), Admin/Koordinator (write) |
| | POST/PATCH/DELETE | `/api/waste-categories/{id}/` | Admin, Koordinator |
| **Deposits** | GET | `/api/deposits/` | Owner, Petugas, Admin, Koordinator |
| | POST | `/api/deposits/` | Petugas, Admin |
| **Pickups** | GET | `/api/pickups/?status=menunggu` | Petugas, Admin, Koordinator |
| | PATCH | `/api/pickups/{id}/` | Petugas, Admin |
| **Withdrawals** | GET | `/api/withdrawals/?status=menunggu` | Admin, Koordinator |
| | PATCH | `/api/withdrawals/{id}/` | Admin |
| **Rewards** | GET/POST/PATCH | `/api/rewards/` | Admin, Koordinator |
| **Reward redemptions** | GET/PATCH | `/api/reward-redemptions/` | Admin |
| **Partners** | GET/POST/PATCH | `/api/partners/` | Admin |
| **Partner sales** | GET/POST | `/api/partner-sales/` | Admin |
| **Complaints** | GET/PATCH | `/api/complaints/` | Admin, Koordinator |
| **Dashboard** | GET | `/api/dashboard/` | Admin, Koordinator, Pemerintah *(planned)* |
| **Reports** | GET | `/api/reports/daily/`, `/api/reports/monthly/` | Admin, Koordinator, Pemerintah *(planned)* |

### Filter & Pagination Umum

```
?page=1&page_size=20
?role=nasabah&is_active=true
?search=budi
?status=menunggu
?ordering=-tanggal
```

---

## 6. Auth Context

```typescript
// providers/AuthProvider.tsx
'use client'

type UserRole = 'admin' | 'petugas' | 'koordinator' | 'pemerintah'

interface AuthState {
  user: User | null
  role: UserRole | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
}
```

- Restore session: baca token → `GET /api/auth/me/` → set user
- Block login jika `role === 'nasabah'` → tampilkan pesan "Gunakan aplikasi mobile"
- Logout: clear token + redirect `/login`

---

## 7. Error Handling Pattern

| HTTP | `code` (contoh) | Aksi UI |
|------|-----------------|---------|
| 400 | `VALIDATION_ERROR` | Tampilkan `errors` per field form |
| 401 | `AUTHENTICATION_FAILED` | Coba refresh → login |
| 403 | `PERMISSION_DENIED` | Toast "Anda tidak memiliki akses" |
| 404 | `NOT_FOUND` | Halaman/komponen not found |
| 422 | `BUSINESS_RULE_VIOLATION` | Toast dengan `message` (mis. saldo tidak cukup) |
| 500 | `INTERNAL_ERROR` | Toast generik + tombol coba lagi |

Setiap halaman wajib handle: **Loading**, **Empty**, **Error**, **Success**.

---

## 8. TypeScript Types (`types/api.ts`)

```typescript
export interface User {
  id: number
  username: string
  role: 'nasabah' | 'petugas' | 'admin' | 'koordinator' | 'pemerintah'
  nama_lengkap: string
  nik?: string
  no_hp?: string
  alamat?: string
  saldo?: string  // Decimal as string dari API
  poin?: number
  is_active: boolean
}

export interface WasteCategory {
  id: number
  nama: string
  harga_beli_per_kg: string
  stok_terkini_kg: string
}

export interface Deposit {
  id: number
  nasabah: number
  petugas: number | null
  tanggal: string
  total_nilai: string
  status: string
  details: DepositDetail[]
}

export interface DepositDetail {
  kategori: number
  berat_kg: string
  harga_saat_itu: string
  subtotal: string
}

// ... lihat backend §04 untuk field lengkap
```

---

## 9. Testing Integrasi

1. Jalankan backend: `python manage.py runserver`
2. Seed data: `python manage.py seed_data --flush`
3. Test login di Swagger: http://localhost:8000/api/docs/
4. Panduan alur per role: http://localhost:8000/api/guide/
5. Export OpenAPI: `python manage.py spectacular --file openapi.json` (di repositori **miru-backend-api**)

---

## 10. CORS & Production

- Development: backend `CORS_ALLOW_ALL_ORIGINS=True`
- Production: set `CORS_ALLOWED_ORIGINS` ke domain web admin
- Web admin production harus HTTPS (SSL wajib)
