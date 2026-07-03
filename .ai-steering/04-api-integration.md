# 04 — API Integration (Web Admin)

## Base Configuration

```typescript
// lib/config.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
export const API_TOKEN_URL = `${API_BASE_URL.replace('/api', '')}/api/token/`
```

## Autentikasi

### Login Flow
1. User memasukkan username + password.
2. POST ke `/api/token/` → dapatkan `{ access, refresh }`.
3. Simpan `access` token ke localStorage.
4. Redirect ke dashboard.

### Token Refresh
- Jika API return 401, coba refresh token via `POST /api/token/refresh/`.
- Jika refresh gagal, redirect ke login.

### Auth Context
```typescript
// providers/AuthProvider.tsx
'use client'
// Menyediakan user, token, login, logout ke seluruh app
```

## API Endpoints untuk Web Admin

| Kategori | Endpoint | Method | Halaman |
|----------|----------|--------|---------|
| **Auth** | `/api/token/` | POST | Login page |
| | `/api/token/refresh/` | POST | - |
| **Nasabah** | `/api/users/?role=nasabah` | GET | Daftar nasabah |
| | `/api/users/{id}/` | GET | Detail nasabah |
| | `/api/users/{id}/` | PATCH | Edit nasabah |
| | `/api/users/` | POST | Tambah nasabah (by admin) |
| **Kategori** | `/api/sampah/kategori/` | GET/POST | Kelola harga |
| | `/api/sampah/kategori/{id}/` | PATCH/DELETE | Edit/hapus kategori |
| **Transaksi** | `/api/transaksi/` | GET/POST | Input setoran |
| | `/api/transaksi/{id}/` | GET | Detail transaksi |
| **Penjemputan** | `/api/penjemputan/` | GET | Daftar penjemputan |
| | `/api/penjemputan/{id}/` | PATCH | Update status |
| **Penarikan** | `/api/saldo/` | GET | Daftar pengajuan |
| | `/api/saldo/{id}/` | PATCH | Setujui/tolak |
| **Reward** | `/api/reward/katalog/` | GET/POST | Kelola reward |
| | `/api/reward/katalog/{id}/` | PATCH/DELETE | Edit reward |
| | `/api/reward/tukar/` | GET | Daftar penukaran |
| | `/api/reward/tukar/{id}/` | PATCH | Setujui penukaran |
| **Mitra** | `/api/gudang/mitra/` | GET/POST | Kelola mitra |
| | `/api/gudang/jual/` | GET/POST | Catat penjualan |
| **Pengaduan** | `/api/pengaduan/` | GET | Daftar pengaduan |
| | `/api/pengaduan/{id}/` | PATCH | Tindak lanjut |
| **Dashboard** | `/api/dashboard/overview/` | GET | Dashboard |
| | `/api/dashboard/grafik-setoran/` | GET | Grafik |
| **Laporan** | `/api/laporan/harian/?tanggal=` | GET | Laporan harian |
| | `/api/laporan/bulanan/?bulan=&tahun=` | GET | Laporan bulanan |

## Error Handling Pattern

```typescript
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new ApiError(
      error.detail || error.message || 'Terjadi kesalahan',
      response.status
    )
  }
  return response.json()
}
```

## Loading & Error States

Setiap halaman/admin panel harus handle:
- **Loading State**: Skeleton loader atau spinner.
- **Empty State**: "Belum ada data" dengan ilustrasi.
- **Error State**: "Gagal memuat data" dengan tombol coba lagi.
- **Success State**: Data ditampilkan dengan table/list/card.
