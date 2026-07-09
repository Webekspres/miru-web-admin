# MIRU Bank Sampah — Web Admin

Panel administrasi web untuk **MIRU Bank Sampah (Miru-G)** — sistem pengelolaan Bank Sampah digital Distrik Mimika Baru. Dibangun dengan Next.js 16, TypeScript, dan Tailwind CSS v4.

## Target Pengguna

| Role | Akses |
|------|-------|
| **Petugas Bank Sampah** | Input setoran, penjemputan, timbang sampah |
| **Admin Aplikasi** | Akses penuh: nasabah, transaksi, harga, stok, mitra, laporan, pengaturan |
| **Koordinator Program** | Dashboard monitoring, laporan (read-heavy) |
| **Pemerintah Distrik** | Dashboard & laporan (read-only) |

> **Nasabah** tidak login ke web admin — mereka menggunakan aplikasi mobile di repositori GitHub **mirumobileapp**.

## Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Framework | Next.js 16.2 (App Router) |
| Bahasa | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 |
| HTTP | fetch API + JSON Envelope |
| Auth | JWT (localStorage / httpOnly cookie) |
| Backend | Django REST API — repositori GitHub **miru-backend-api** |

## Prerequisites

- Node.js 20+
- npm / pnpm / yarn
- Backend MIRU berjalan di `http://localhost:8000` (clone & setup repositori **miru-backend-api**)

## Local Development

### 1. Environment Variables

Salin template environment:

```bash
cp .env.example .env.local
```

| Variable | Description | Default (dev) |
|----------|-------------|---------------|
| `NEXT_PUBLIC_API_URL` | Base URL API (tanpa trailing slash) | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_NAME` | Nama tampilan aplikasi | `MIRU Bank Sampah` |

### 2. Install & Run

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### 3. Login dengan Akun Demo

Jalankan seed data di repositori **miru-backend-api** terlebih dahulu:

```bash
# Di repositori miru-backend-api (clone terpisah)
python manage.py seed_data --flush
```

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | admin |
| `koordinator` | `koordinator123` | koordinator |
| `petugas1` | `petugas123` | petugas |

## Integrasi Backend API

Web admin berkomunikasi **hanya** dengan backend REST API. Tidak ada database lokal.

### Autentikasi

```
POST /api/auth/login/     → { access, refresh, user }
POST /api/auth/refresh/   → { access }
GET  /api/auth/me/        → profil user login
```

Header untuk request terproteksi:

```
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
Accept-Language: id
```

### Format Response — JSON Envelope

Semua response API menggunakan envelope standar:

```json
{
  "success": true,
  "status_code": 200,
  "message": "Data berhasil diambil.",
  "data": { ... },
  "meta": {
    "timestamp": "2026-07-07T14:30:00+09:00",
    "request_id": "req_abc123",
    "pagination": { "count": 150, "page": 1, "page_size": 20 }
  }
}
```

Frontend **selalu** baca payload dari `response.data`, bukan root JSON.

### Endpoint Utama (English routes)

| Resource | Route |
|----------|-------|
| Users | `/api/users/` |
| Waste categories | `/api/waste-categories/` |
| Deposits | `/api/deposits/` |
| Pickups | `/api/pickups/` |
| Withdrawals | `/api/withdrawals/` |
| Rewards | `/api/rewards/` |
| Reward redemptions | `/api/reward-redemptions/` |
| Partners | `/api/partners/` |
| Partner sales | `/api/partner-sales/` |
| Complaints | `/api/complaints/` |

Detail lengkap: repositori **miru-backend-api** — `.ai-steering/04-api-contracts-and-standards.md`

## Struktur Folder (Target)

```
web-admin/
├── .ai-steering/           # Dokumentasi AI & spesifikasi
├── app/
│   ├── (auth)/login/       # Halaman login
│   └── (dashboard)/        # Halaman setelah login
├── components/             # UI, layout, forms
├── lib/                    # API client, utils
├── types/                  # TypeScript interfaces
├── .env.example
├── AGENTS.md
└── README.md
```

## Dokumentasi Proyek

| File | Isi |
|------|-----|
| [`.ai-steering/01-project-overview.md`](.ai-steering/01-project-overview.md) | Konteks bisnis & ekosistem |
| [`.ai-steering/02-architecture-and-stack.md`](.ai-steering/02-architecture-and-stack.md) | Arsitektur & stack |
| [`.ai-steering/04-api-integration.md`](.ai-steering/04-api-integration.md) | Integrasi API & envelope |
| [`.ai-steering/10-integration-and-roles.md`](.ai-steering/10-integration-and-roles.md) | Role, menu, permission matrix |
| [`.ai-steering/07-modules-and-features.md`](.ai-steering/07-modules-and-features.md) | 17 modul & halaman |
| [`.ai-steering/08-task-list.md`](.ai-steering/08-task-list.md) | Roadmap pengembangan |

Repositori terkait (GitHub terpisah): **miru-backend-api** (API), **mirumobileapp** (mobile nasabah).

## Scripts

```bash
npm run dev      # Development server (port 3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## Status Proyek

Proyek ini **belum dikerjakan** (scaffold Next.js default). Backend API sudah tersedia sebagai fondasi integrasi. Ikuti roadmap di `.ai-steering/08-task-list.md`.

## Branding

- **Nama:** MIRU Bank Sampah (Miru-G)
- **Slogan:** "Sampah Bernilai, Lingkungan Bersih, Warga Sejahtera"
- **Warna tema:** Hijau `#16a34a` + Putih
