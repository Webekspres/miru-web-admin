# 08 — Task List: Web Admin Development Roadmap

> **Dokumen ini** adalah roadmap pengembangan **miru-web-admin** dari scaffold hingga production-ready.
> Urutan task mengikuti dependensi **miru-backend-api** dan prioritas operasional (petugas & admin dulu).
>
> **Referensi terkait (repo ini):**
> - `04-api-integration.md` — API client & JSON Envelope
> - `07-modules-and-features.md` — 17 modul & halaman
> - `10-integration-and-roles.md` — role, menu, permission matrix
>
> **Referensi backend (repositori terpisah):**
> - **miru-backend-api** — `.ai-steering/08-task-list.md` (roadmap API)
> - **miru-backend-api** — `.ai-steering/04-api-contracts-and-standards.md` (kontrak endpoint)
> - **miru-backend-api** — `.ai-steering/07-modules-and-features.md` (17 modul sistem)

---

## Ringkasan Fase

| Fase | Nama | Tujuan | Backend Min. | Status |
|------|------|--------|--------------|--------|
| 0 | Scaffold | Next.js + TS + Tailwind | — | ✅ Selesai |
| 1 | Foundation | API client, types, layout shell | Backend Fase 1 ✅ | 🔲 Berikutnya |
| 2 | Auth & RBAC | Login, role guard, sidebar | Backend Fase 1 ✅ | 🔲 |
| 3 | MVP Operasional | Setoran, penjemputan, penarikan, pengaduan | Backend Fase 2–3 | 🔲 |
| 4 | Manajemen & Stok | Nasabah, staff, harga, reward, gudang, mitra | Backend Fase 2–3 | 🔲 |
| 5 | Monitoring & Laporan | Dashboard, grafik, ekspor | Backend Fase 4 | 🔲 |
| 6 | Governance UI | Pengaturan, audit log, role pemerintah | Backend Fase 5 | 🔲 |
| 7 | Kualitas & Testing | E2E flow, a11y, error handling | Backend Fase 6 | 🔲 |
| 8 | Production & Post-MVP | Deploy, responsive, polish | Backend Fase 7 | 🔲 |

---

## Cakupan 17 Modul — Web Admin

| No | Modul | Halaman | Fase Target | Backend API |
|----|-------|---------|-------------|-------------|
| 1 | Manajemen Pengguna | `/nasabah`, `/petugas` | Fase 4 | `GET/POST/PATCH /api/users/` |
| 2 | Autentikasi | `/login` | Fase 2 | `/api/auth/login/`, `/api/auth/me/` |
| 3 | Profil Nasabah | `/nasabah/{id}` | Fase 4 | `GET /api/users/{id}/`, riwayat |
| 4 | Edukasi Sampah | `/edukasi` | Fase 8 (post-MVP) | Planned |
| 5 | Katalog & Harga | `/sampah/kategori` | Fase 4 | `/api/waste-categories/` |
| 6 | Setor Langsung | `/transaksi/tambah` | Fase 3 | `POST /api/deposits/` |
| 7 | Penjemputan | `/penjemputan` | Fase 3 | `/api/pickups/` + actions |
| 8 | Penimbangan | (form setoran) | Fase 3 | Nested `details[]` |
| 9 | Saldo & Riwayat | `/nasabah/{id}`, `/transaksi` | Fase 3–4 | `/api/deposits/`, `/api/withdrawals/` |
| 10 | Penarikan Saldo | `/saldo` | Fase 3 | `/api/withdrawals/` + approve |
| 11 | Poin & Reward | `/reward` | Fase 4 | `/api/rewards/`, `/api/reward-redemptions/` |
| 12 | Stok Gudang | `/gudang` | Fase 4–5 | `/api/waste-categories/`, `/api/inventory/` |
| 13 | Penjualan Mitra | `/gudang/jual`, `/gudang/mitra` | Fase 4 | `/api/partners/`, `/api/partner-sales/` |
| 14 | Pengaduan | `/pengaduan` | Fase 3 | `/api/complaints/` |
| 15 | Dashboard | `/` | Fase 5 | `/api/dashboard/*` |
| 16 | Laporan | `/laporan` | Fase 5 | `/api/reports/*` |
| 17 | Pengaturan & Audit | `/pengaturan` | Fase 6 | `/api/settings/`, `/api/audit-log/` |

---

## Matriks Dependensi Backend → Web Admin

| Backend Fase (miru-backend-api) | Fitur API | Task Web Admin yang Unblock |
|---------------------------------|-----------|----------------------------|
| Fase 1 ✅ | Auth, envelope, users list, waste-categories | Fase 1–2, partial Fase 4 (kategori read) |
| Fase 2 | Business logic, atomic transactions, permissions | Fase 3 (setoran valid), Fase 4 (CRUD aman) |
| Fase 3 | Pickup actions, withdrawal approve, activity | Fase 3 lengkap (workflow buttons) |
| Fase 4 | Dashboard & reports API | Fase 5 |
| Fase 5 | Settings, audit log, role `pemerintah` | Fase 6 |
| Fase 7 | Production CORS/HTTPS | Fase 8 deploy |

> Jika endpoint belum ada: buat UI dengan mock data + flag `// TODO: backend Fase X` — jangan hardcode sebagai data produksi.

---

## Fase 0: Scaffold ✅ Selesai

### 0.1 Project Setup ✅
- [x] Create Next.js 16 project (`miru-web-admin`)
- [x] Configure TypeScript strict mode
- [x] Configure Tailwind CSS v4
- [x] Configure ESLint
- [x] Dokumentasi `.ai-steering/` selaras **miru-backend-api**

---

## Fase 1: Foundation

> **Backend:** Fase 1 ✅ (auth, JSON Envelope, seed data)
> **Tujuan:** Infrastruktur client siap — semua halaman memakai satu API layer.

### 1.1 Dependencies & Environment
- [x] Install: `swr`, `lucide-react`, `recharts`, `date-fns`
- [x] Install (opsional): `react-hook-form`, `zod`, `@hookform/resolvers`
- [x] Setup `.env.local` dari `.env.example`
- [x] `lib/config.ts` — `NEXT_PUBLIC_API_URL`, `API_PREFIX`

### 1.2 API Client & Types (Modul 2 — infrastruktur)
- [x] `types/api.ts` — `ApiEnvelope<T>`, `PaginationMeta`, `ApiError`
- [x] `types/models.ts` — User, WasteCategory, Deposit, Pickup, Withdrawal, Reward, Complaint, Partner, dll.
- [x] `lib/api.ts` — parse JSON Envelope, attach JWT, refresh on 401
- [x] `lib/format.ts` — format Rupiah (`Rp125.000,00`), tanggal WIT, berat kg
- [x] Unit test: envelope parser (success & error cases)

### 1.3 Layout Shell & Shared UI
- [x] `components/ui/` — Button, Input, Select, Badge, Card, Table, Modal
- [x] `components/layout/Sidebar.tsx` — menu config per role
- [x] `components/layout/Header.tsx` — user info, logout
- [x] `components/layout/DashboardLayout.tsx` — sidebar + header + main
- [x] `components/feedback/LoadingSkeleton.tsx`
- [x] `components/feedback/EmptyState.tsx`
- [x] `components/feedback/ErrorMessage.tsx` + retry
- [x] `components/feedback/Toast.tsx` — success/error notifications
- [x] `app/layout.tsx` — root layout, font, metadata MIRU
- [x] `app/globals.css` — tema hijau `#16a34a`

### 1.4 Routing Structure
- [x] `app/(auth)/login/page.tsx` — placeholder
- [x] `app/(dashboard)/layout.tsx` — protected wrapper
- [x] Route groups: `(auth)`, `(dashboard)` sesuai `07-modules-and-features.md`
- [x] `proxy.ts` — redirect unauthenticated → `/login`

---

## Fase 2: Auth & RBAC (Modul 2)

> **Backend:** Fase 1 ✅ — `POST /api/auth/login/`, `GET /api/auth/me/`
> **Tujuan:** Staff login aman; nasabah ditolak; menu sesuai role.

### 2.1 Auth Provider
- [x] `providers/AuthProvider.tsx` — user, role, login, logout, refreshProfile
- [x] Simpan `access_token` + `refresh_token` (localStorage atau httpOnly via route handler)
- [x] Restore session on mount → `GET /api/auth/me/`
- [x] Block role `nasabah` — pesan: "Gunakan aplikasi mobile MIRU"

### 2.2 Login Page
- [x] Form username + password (Bahasa Indonesia)
- [x] `POST /api/auth/login/` — parse `data.user.role`
- [x] Tampilkan error envelope (`message`, `errors`) di form
- [x] Loading state + disable submit saat loading

### 2.3 Role-Based Redirect & Guard
- [x] Admin → `/` (dashboard)
- [x] Koordinator → `/`
- [x] Pemerintah → `/laporan` *(setelah backend Fase 5)*
- [x] Petugas → `/transaksi/tambah`
- [x] `proxy.ts` / layout guard — cek role vs route
- [x] Sidebar filter menu by role (`10-integration-and-roles.md` §3)
- [x] Hide tombol edit/delete untuk koordinator & pemerintah (read-only)

### 2.4 Logout & Session
- [x] Logout clear token + redirect `/login`
- [x] Handle 401 global → refresh → login
- [x] Handle 403 → toast "Anda tidak memiliki akses"

---

## Fase 3: MVP Operasional (Modul 6–10, 14)

> **Backend:** Fase 2–3 — business logic, workflow, approve actions
> **Tujuan:** Petugas & admin bisa operasional harian end-to-end.

### 3.1 Input Setoran (Modul 6, 8)
- [ ] Halaman `/transaksi/tambah` — form multi-baris detail
- [ ] Search/select nasabah — `GET /api/users/?role=nasabah&search=`
- [ ] Select kategori — `GET /api/waste-categories/` (auto harga, read-only)
- [ ] Input berat kg — validasi min **1 kg** per baris (client + server)
- [ ] Auto-calculate subtotal & total (preview sebelum submit)
- [ ] Dynamic rows: tambah/hapus baris detail
- [ ] Konfirmasi dialog sebelum submit
- [ ] `POST /api/deposits/` — nested `details: [{ kategori, berat_kg }]`
- [ ] Success toast + redirect ke riwayat atau reset form
- [ ] Error handling: stok, validasi field dari `envelope.errors`

### 3.2 Riwayat Setoran (Modul 9)
- [ ] Halaman `/transaksi` — tab Riwayat
- [ ] `GET /api/deposits/` — pagination, filter `?nasabah=`, `?ordering=-tanggal`
- [ ] Tabel: tanggal, nasabah, petugas, total, status
- [ ] Detail modal/page — `GET /api/deposits/{id}/` (bukti digital)
- [ ] Role petugas: default filter hari ini

### 3.3 Penjemputan (Modul 7)
- [ ] Halaman `/penjemputan` — tab status (Menunggu, Aktif, Selesai, Ditolak)
- [ ] `GET /api/pickups/?status=` — pagination
- [ ] Tabel: tanggal, nasabah, alamat, estimasi berat, status, petugas
- [ ] Tombol aksi per status (`10-integration-and-roles.md` workflow):
  - menunggu → [Setujui] [Tolak]
  - disetujui → [Tugaskan Petugas]
  - dijadwalkan → [Mulai Penjemputan]
  - dalam_perjalanan → [Sampai di Lokasi]
  - dijemput → [Selesaikan] → link input setoran
- [ ] `PATCH /api/pickups/{id}/` atau action endpoints (`approve`, `assign`, `update-status`)
- [ ] Modal assign petugas — dropdown `GET /api/users/?role=petugas`
- [ ] Petugas: hanya lihat penjemputan assigned ke dirinya *(backend Fase 2.3)*

### 3.4 Penarikan Saldo (Modul 10)
- [ ] Halaman `/saldo` — list pengajuan
- [ ] `GET /api/withdrawals/?status=menunggu`
- [ ] Tampilkan saldo nasabah saat ini sebelum approve
- [ ] [Setujui] → `PATCH` atau `POST .../approve/` — **tanpa payment gateway**
- [ ] Konfirmasi: "Pencairan dilakukan manual tunai/transfer di luar sistem"
- [ ] Filter tab: Menunggu | Selesai
- [ ] Permission: admin only (koordinator read-only)

### 3.5 Pengaduan (Modul 14)
- [ ] Halaman `/pengaduan` — tab Terbuka | Ditutup
- [ ] `GET /api/complaints/?status=`
- [ ] Detail drawer/modal — keluhan, nasabah, tanggal, jenis
- [ ] Form tindak lanjut — field `tindak_lanjut` *(backend Fase 2.7)*
- [ ] [Tutup Pengaduan] → `PATCH /api/complaints/{id}/` status `ditutup`
- [ ] Badge SLA — target 1–2 hari kerja

### 3.6 Integrasi QR Nasabah (Modul 3 — petugas)
- [ ] Input/cari nasabah by ID dari scan QR (manual ID atau future camera)
- [ ] `GET /api/users/{id}/` — pre-fill form setoran

---

## Fase 4: Manajemen & Stok (Modul 1, 3, 5, 11–13)

> **Backend:** Fase 2–3 — CRUD lengkap + stok side effects
> **Tujuan:** Admin kelola master data & stok gudang.

### 4.1 Manajemen Nasabah (Modul 1, 3, 9)
- [ ] Halaman `/nasabah` — tabel + search + pagination
- [ ] `GET /api/users/?role=nasabah&search=`
- [ ] Halaman `/nasabah/{id}` — profil, saldo, poin
- [ ] Tab riwayat: setoran, penarikan, penukaran — aggregate dari API
- [ ] Form tambah nasabah (admin) — `POST /api/users/` role nasabah
- [ ] Form edit nasabah — `PATCH /api/users/{id}/`
- [ ] Toggle aktif/nonaktif — `is_active`
- [ ] Export CSV nasabah (client-side dari JSON)

### 4.2 Manajemen Staff (Modul 1)
- [ ] Halaman `/petugas` — list petugas, admin, koordinator
- [ ] `GET /api/users/?role=petugas` (+ admin, koordinator tabs)
- [ ] Form create staff — admin only, `POST /api/users/` dengan role
- [ ] Edit/deactivate staff — admin only

### 4.3 Kategori & Harga Sampah (Modul 5)
- [ ] Halaman `/sampah/kategori` — tabel kategori + stok
- [ ] `GET /api/waste-categories/`
- [ ] Form tambah/edit — `POST/PATCH /api/waste-categories/`
- [ ] Validasi harga > 0, nama unik
- [ ] Tampilkan `stok_terkini_kg` per kategori
- [ ] Riwayat harga *(backend Fase 5.3 — post-MVP)*

### 4.4 Reward & Penukaran Poin (Modul 11)
- [ ] Halaman `/reward` — tab Katalog | Penukaran
- [ ] CRUD katalog — `/api/rewards/`
- [ ] List penukaran menunggu — `GET /api/reward-redemptions/?status=menunggu`
- [ ] [Setujui Penukaran] — approve action
- [ ] Tampilkan stok reward & poin dibutuhkan

### 4.5 Stok Gudang (Modul 12)
- [ ] Halaman `/gudang` — ringkasan stok per kategori
- [ ] Data dari `stok_terkini_kg` di waste-categories
- [ ] `GET /api/inventory/` *(backend Fase 4.3)*
- [ ] Indikator stok rendah (warna/alert)
- [ ] Riwayat mutasi stok *(post-MVP)*

### 4.6 Mitra & Penjualan (Modul 13)
- [ ] Halaman `/gudang/mitra` — CRUD mitra
- [ ] `GET/POST/PATCH /api/partners/`
- [ ] Halaman `/gudang/jual` — form penjualan
- [ ] Pilih mitra + kategori + berat + harga jual
- [ ] Validasi client: stok >= berat jual
- [ ] `POST /api/partner-sales/`
- [ ] List riwayat penjualan — `GET /api/partner-sales/`

---

## Fase 5: Monitoring & Laporan (Modul 15–16)

> **Backend:** Fase 4 — dashboard & reports API
> **Tujuan:** Koordinator, admin, pemerintah pantau program.

### 5.1 Dashboard (Modul 15)
- [ ] Halaman `/` — overview cards
- [ ] `GET /api/dashboard/overview/` — nasabah, sampah, penjemputan, pengaduan
- [ ] Kartu: Total Nasabah, Setoran Hari Ini/Bulan, Sampah Terkumpul, Penjemputan Aktif
- [ ] Grafik setoran 7/30 hari — `GET /api/dashboard/deposit-chart/`
- [ ] Recharts bar/line chart
- [ ] Aktivitas terbaru — `GET /api/dashboard/recent-activity/?limit=10`
- [ ] List 5 pengaduan terbuka (link ke `/pengaduan`)
- [ ] Role pemerintah/koordinator: read-only, no action buttons

### 5.2 Laporan (Modul 16)
- [ ] Halaman `/laporan` — filter jenis & periode
- [ ] Harian — `GET /api/reports/daily/?tanggal=`
- [ ] Mingguan — `GET /api/reports/weekly/?minggu=&tahun=`
- [ ] Bulanan — `GET /api/reports/monthly/?bulan=&tahun=`
- [ ] Tonase per kategori — `GET /api/reports/waste/?start=&end=`
- [ ] Tabel rekap sesuai format SOP (`09-data-dictionary.md`)
- [ ] [Ekspor CSV] — client-side dari JSON
- [ ] [Ekspor Excel] — library `xlsx` atau similar
- [ ] Print-friendly view *(post-MVP)*

---

## Fase 6: Governance UI (Modul 17)

> **Backend:** Fase 5 — settings, audit log, role pemerintah
> **Tujuan:** Transparansi & pengaturan institusi.

### 6.1 Pengaturan Institusi (Modul 17)
- [ ] Halaman `/pengaturan` — tab Institusi | Pengumuman | Audit
- [ ] Form profil institusi — `GET/PATCH /api/settings/`
- [ ] Field: nama, alamat, kontak, logo URL, jam operasional
- [ ] Editor pengumuman — rich text sederhana atau textarea
- [ ] Preview pengumuman

### 6.2 Audit Log (Modul 17)
- [ ] Tab audit log — read-only table
- [ ] `GET /api/audit-log/?user=&model=&date_after=`
- [ ] Filter by user, model, tanggal
- [ ] Admin full access; koordinator read-only

### 6.3 Role Pemerintah Distrik
- [ ] Login pemerintah — sidebar terbatas (Dashboard, Laporan, Stok read-only)
- [ ] Semua form write disabled
- [ ] Landing redirect `/laporan`

---

## Fase 7: Kualitas & Testing

> **Backend:** Fase 6 — backend tested
> **Tujuan:** Web admin stabil untuk UAT.

### 7.1 Testing
- [ ] Setup Vitest + React Testing Library
- [ ] Test API client (envelope parse, error throw)
- [ ] Test AuthProvider (login success, block nasabah, logout)
- [ ] Test form setoran (validasi min 1kg, auto-calculate)
- [ ] E2E manual checklist per role (admin, petugas, koordinator)
- [ ] E2E alur: login → input setoran → cek saldo nasabah di mobile *(mirumobileapp)*

### 7.2 UX & Accessibility
- [ ] Loading skeleton semua halaman data
- [ ] Empty state semua list
- [ ] Error boundary per route segment
- [ ] Keyboard navigation form
- [ ] Kontras warna tema hijau (a11y min)
- [ ] Responsive: tablet & mobile (petugas pakai HP)

### 7.3 Error & Edge Cases
- [ ] Network offline message
- [ ] Session expired flow
- [ ] Double-submit prevention pada form transaksi
- [ ] Optimistic UI disabled untuk operasi saldo (tunggu server confirm)

---

## Fase 8: Production & Post-MVP

> **Backend:** Fase 7 — production deploy
> **Tujuan:** Go-live web admin.

### 8.1 Production Build
- [ ] `next build` tanpa error
- [ ] Env production: `NEXT_PUBLIC_API_URL=https://api...`
- [ ] Deploy ke server Webekspres (Node/Nginx atau Vercel)
- [ ] HTTPS wajib
- [ ] CORS backend whitelist domain admin

### 8.2 Post-MVP
- [ ] Modul edukasi sampah `/edukasi` *(butuh backend content API)*
- [ ] Bulk import nasabah CSV/Excel
- [ ] Dark mode (opsional)
- [ ] Notifikasi real-time penjemputan baru *(WebSocket — post-MVP)*
- [ ] Export laporan PDF
- [ ] Laporan harian petugas (view terbatas)

### 8.3 Yang TIDAK BOLEH Diimplementasikan
- [ ] ❌ Payment gateway (Midtrans, Xendit) pada penarikan saldo
- [ ] ❌ GPS live tracking peta penjemputan
- [ ] ❌ Integrasi timbangan digital otomatis
- [ ] ❌ Login/register nasabah di web admin
- [ ] ❌ Multi-tenant / multi organisasi

---

## Urutan Sprint (Selaras Backend)

| Sprint | Backend (miru-backend-api) | Web Admin (miru-web-admin) |
|--------|---------------------------|----------------------------|
| 1 | Fase 1 — Auth & seed ✅ | Fase 1–2 — Foundation + Auth |
| 2 | Fase 2.1–2.2 — Setoran | Fase 3.1–3.2 — Input setoran + riwayat |
| 3 | Fase 2.3–2.5 — Jemput, tarik, poin | Fase 3.3–3.5 — Penjemputan, saldo, pengaduan |
| 4 | Fase 2.6–3 — End-to-end | Fase 4 — Manajemen & stok |
| 5 | Fase 4 — Dashboard & laporan | Fase 5 — Monitoring UI |
| 6 | Fase 5–6 — Governance & test | Fase 6–7 — Settings, QA |
| 7 | Fase 7 — Production | Fase 8 — Deploy |

---

## Definisi "Selesai" per Tahap

| Tahap | Kriteria Selesai (Web Admin) |
|-------|------------------------------|
| **MVP Operasional** | Fase 1–3 selesai; petugas bisa input setoran & kelola penjemputan |
| **MVP Admin Lengkap** | Fase 4 selesai; admin kelola nasabah, harga, reward, gudang |
| **Monitoring Ready** | Fase 5 selesai; dashboard & laporan tampil data real |
| **UAT Ready** | Fase 7 selesai; semua role ditest, responsive OK |
| **Go-Live** | Fase 8 deploy production + HTTPS |

---

## Checklist Integrasi End-to-End

| Alur | Web Admin | Mobile (mirumobileapp) | Backend |
|------|-----------|------------------------|---------|
| Setoran langsung | Input setoran | Lihat riwayat refresh | Fase 2–3 |
| Penjemputan | Approve & update status | Ajukan & cek status | Fase 2–3 |
| Penarikan | Approve manual | Ajukan tarik | Fase 2–3 |
| Tukar poin | Approve penukaran | Ajukan tukar | Fase 2–3 |
| Pengaduan | Tindak lanjut | Ajukan keluhan | Fase 2–3 |
| Dashboard | Kartu & grafik | — | Fase 4 |
