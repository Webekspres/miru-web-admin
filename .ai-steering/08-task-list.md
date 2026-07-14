# 08 — Task List: Web Admin Development Roadmap

> **Dokumen ini** adalah roadmap **miru-web-admin**.
> Urutan: **yang belum selesai di atas**, arsip MVP yang sudah selesai di bawah.
>
> Item pengembangan lanjutan hanya dari dokumen persyaratan (Proposal, Jawaban,
> Modules, Business Rules, Constraints) — bukan spekulasi fitur.
>
> **Referensi (repo ini):**
> - `04-api-integration.md`, `07-modules-and-features.md`, `10-integration-and-roles.md`
> - `05-business-rules-sops.md`, `06-system-constraints.md`
>
> **Referensi backend:**
> - `miru-backend-api` → `.ai-steering/08-task-list.md`, `04-api-contracts`, `07-modules`

---

## Ringkasan Fase

| Fase | Nama | Tujuan | Backend Min. | Status |
|------|------|--------|--------------|--------|
| 0–6 | Scaffold → Governance UI | Auth, operasional, manajemen, dashboard, settings | Fase 1–5 ✅ | ✅ Selesai |
| 7 | Kualitas & UAT | Test, a11y, edge cases | Fase 6 | 🔲 Aktif |
| 8 | Production | Deploy HTTPS + CORS | Fase 7 | 🔲 Aktif |
| 9 | Pengembangan Lanjutan | Pasca-MVP dari persyaratan | Backend Fase 8 | 🔲 Post-MVP |
| — | Out of Scope | Larangan sistem | — | ⛔ |

### Cakupan 17 Modul — Web Admin

| No | Modul | Halaman | Status MVP | Lanjutan |
|----|-------|---------|------------|----------|
| 1 | Manajemen Pengguna | `/customers`, `/staff` | ✅ | Filter kelurahan; bulk import |
| 2 | Autentikasi | `/login` | ✅ | — |
| 3 | Profil Nasabah | `/customers/{id}` | ✅ | Lihat KTP penarikan besar |
| 4 | Edukasi Sampah | `/education` | ⚠️ Placeholder | CRUD artikel |
| 5 | Katalog & Harga | `/waste/categories` | ✅ | Form harga H-3 |
| 6 | Setor Langsung | `/transactions/add` | ✅ | Unduh PDF bukti |
| 7 | Penjemputan | `/pickups` | ✅ | Wilayah; map sederhana |
| 8 | Penimbangan | (form setoran) | ✅ | — |
| 9 | Saldo & Riwayat | `/customers/{id}`, `/transactions` | ✅ | — |
| 10 | Penarikan Saldo | `/balance` | ✅ | Tanda terima PDF |
| 11 | Poin & Reward | `/reward` | ✅ | — |
| 12 | Stok Gudang | `/warehouse` | ✅ | — |
| 13 | Penjualan Mitra | `/warehouse/sales`, `partners` | ✅ | — |
| 14 | Pengaduan | `/complaints` | ✅ | — |
| 15 | Dashboard | `/dashboard` | ✅ | Wilayah teraktif |
| 16 | Laporan | `/reports` | ✅ | PDF arsip; evaluasi kendala |
| 17 | Pengaturan & Audit | `/settings` | ✅ | Panel notifikasi |

---

# BAGIAN A — BELUM SELESAI (prioritas atas)

---

## Fase 7: Kualitas & Testing (UAT Ready)

> **Tujuan:** Web admin stabil untuk UAT multi-role.
> **Sumber:** Kriteria UAT di roadmap; Business Rules §SLA; `07` UX.

### 7.1 Testing
- [ ] Setup Vitest + React Testing Library untuk komponen (util sudah ada sebagian)
- [x] Unit test API client / envelope / auth / permissions / routes / format *(ada di `lib/*.test.ts`)*
- [ ] Test AuthProvider / form setoran (validasi min 1 kg, auto-calculate) dengan RTL
- [ ] E2E manual checklist per role: admin, petugas, koordinator, pemerintah
- [ ] E2E alur: login → input setoran → cek saldo di mobile *(mirumobileapp)*

### 7.2 UX & Accessibility
- [x] Loading skeleton / Empty state / ErrorMessage component *(fondasi ada)*
- [ ] Pastikan skeleton & empty dipakai konsisten di semua halaman data
- [ ] Error boundary per route segment (`error.tsx`) — belum ada
- [ ] Keyboard navigation form utama
- [ ] Kontras warna tema hijau (a11y min)
- [ ] Responsive: tablet & mobile (petugas pakai HP)

### 7.3 Error & Edge Cases
- [ ] Network offline message
- [ ] Session expired flow teruji end-to-end
- [ ] Double-submit prevention pada form transaksi saldo
- [ ] Optimistic UI **disabled** untuk operasi saldo (tunggu server confirm)

---

## Fase 8: Production Deploy

> **Sumber:** Jawaban Persyaratan §6.5 (domain, SSL, server Webekspres); Timeline go-live.

- [ ] `next build` tanpa error
- [ ] Env production: `NEXT_PUBLIC_API_URL=https://…`
- [ ] Deploy ke server Webekspres (Node/Nginx atau setara)
- [ ] HTTPS wajib
- [ ] Pastikan CORS backend whitelist domain admin

---

## Fase 9: Pengembangan Lanjutan (pasca-MVP)

> Hanya fitur yang tercantum di Proposal / Jawaban / Modules / Business Rules.
> Bergantung pada Backend Fase 8 di `miru-backend-api`.

### 9.1 Modul 4 — Edukasi sampah
> **Sumber:** Proposal §4 modul 4; `07-modules` “CRUD artikel/panduan (future)”.

- [ ] Ganti `ModulePlaceholder` di `/education` dengan CRUD artikel edukasi
- [ ] Preview konten + status aktif
- [ ] Integrasi API konten edukasi backend

### 9.2 Modul 1 / 3 / 7 — Wilayah layanan
> **Sumber:** `07-modules` filter kelurahan; Jawaban §6.2.13; Data dictionary §K; Proposal modul 3.

- [ ] Filter nasabah by kelurahan / wilayah
- [ ] Field RT-RW / kelurahan di form nasabah (jika backend field tersedia)
- [ ] UI batasan wilayah penjemputan + indikator kuota 2×/minggu (dari API)

### 9.3 Modul 5 — Perubahan harga H-3
> **Sumber:** Business Rules §G; Jawaban §6.2.4.

- [ ] Form edit harga: input `tanggal_berlaku` (min H+3)
- [ ] Preview teks pengumuman perubahan harga
- [ ] Banner admin: harga terjadwal belum aktif

### 9.4 Modul 6 / 10 — Bukti digital & verifikasi KTP
> **Sumber:** Jawaban §6.3.4, §6.3.6; Proposal bukti transaksi digital / tanda terima.

- [ ] Upload/lihat foto KTP saat proses penarikan besar
- [ ] Unduh / cetak tanda terima PDF setoran & penarikan
- [ ] Pastikan print-friendly view laporan (sudah ada sebagian — verifikasi UAT)

### 9.5 Modul 15 / 16 — Monitoring & laporan OPD
> **Sumber:** Proposal modul 15–16; Jawaban §6.2.14; Constraints arsip.

- [x] Ekspor CSV laporan (client-side)
- [x] Ekspor Excel laporan (client-side `xlsx`)
- [ ] Ekspor PDF laporan bulanan untuk arsip kantor distrik
- [ ] Tab/section evaluasi: kendala + rekomendasi tindak lanjut
- [ ] Kartu/widget wilayah teraktif di dashboard (jika API siap)
- [ ] Laporan harian petugas (view terbatas) — jika diminta SOP operasional final

### 9.6 Operasional & notifikasi
> **Sumber:** Proposal modul 9 (notifikasi status); Jawaban §6.6.5 (push — panel web baca status); Persyaratan import data.

- [ ] Bulk import nasabah CSV/Excel (UI + feedback error baris)
- [ ] Panel notifikasi in-app (dari `/api/notifications/`) — list / mark-read
- [ ] (Opsional) preview peta statis alamat jemput — Constraints: Maps sederhana saja

### 9.7 Out of Scope / tidak dari persyaratan
> Jangan dijadwalkan sebagai pekerjaan default.

- [ ] ❌ Dark mode (tidak ada di dokumen persyaratan)
- [ ] ❌ WebSocket / notifikasi real-time peta petugas (bertentangan dengan larangan live tracking)
- [ ] ❌ Payment gateway pada penarikan
- [ ] ❌ Login/register nasabah di web admin
- [ ] ❌ Multi-tenant / multi organisasi
- [ ] ❌ GPS live tracking
- [ ] ❌ Integrasi timbangan digital otomatis

---

# BAGIAN B — ARSIP MVP (Selesai) — urutan bawah

---

## Fase 0: Scaffold ✅

- [x] Next.js + TypeScript strict + Tailwind CSS v4 + ESLint
- [x] Dokumentasi `.ai-steering/` selaras backend

---

## Fase 1: Foundation ✅

### 1.1 Dependencies & Environment ✅
- [x] `swr`, `lucide-react`, `recharts`, `date-fns` (+ form/zod sesuai kebutuhan)
- [x] `.env.local` / `.env.example`; `lib/config.ts`

### 1.2 API Client & Types ✅
- [x] `types/api.ts`, `types/models.ts`
- [x] `lib/api.ts` — envelope, JWT, refresh 401
- [x] `lib/format.ts` — Rupiah, tanggal WIT, kg
- [x] Unit test parser envelope

### 1.3 Layout Shell & Shared UI ✅
- [x] UI primitives + Sidebar/Header/DashboardLayout
- [x] LoadingSkeleton, EmptyState, ErrorMessage, Toast
- [x] Root layout + tema hijau `#16a34a`

### 1.4 Routing ✅
- [x] `(auth)/login`, `(dashboard)/*`, proxy redirect unauthenticated

---

## Fase 2: Auth & RBAC ✅

- [x] AuthProvider — login/logout/refreshProfile; blok role `nasabah`
- [x] Login form BI + error envelope
- [x] Redirect per role (admin/koordinator → dashboard; pemerintah → `/reports`; petugas → setoran)
- [x] Sidebar filter by role; hide mutate untuk read-only
- [x] 401 refresh → login; 403 toast

---

## Fase 3: MVP Operasional ✅

### 3.1–3.2 Setoran ✅
- [x] `/transactions/add` multi-baris, min 1 kg, konfirmasi, `POST /api/deposits/`
- [x] `/transactions` riwayat + detail bukti

### 3.3 Penjemputan ✅
- [x] `/pickups` tabs status + aksi approve/reject/assign/update-status

### 3.4 Penarikan ✅
- [x] `/balance` approve manual tanpa gateway; konfirmasi tunai/transfer luar sistem

### 3.5 Pengaduan ✅
- [x] `/complaints` tindak lanjut + tutup; badge SLA 1–2 hari kerja

### 3.6 QR Nasabah ✅
- [x] Cari nasabah by ID untuk prefill setoran

---

## Fase 4: Manajemen & Stok ✅

- [x] `/customers` (+ detail, add, edit, toggle aktif, export CSV)
- [x] `/staff` CRUD
- [x] `/waste/categories` + price history
- [x] `/reward` katalog + approve penukaran
- [x] `/warehouse` stok + history; partners + sales

---

## Fase 5: Monitoring & Laporan ✅

- [x] Dashboard overview + chart + recent activity + stok ringkas
- [x] `/reports` harian/mingguan/bulanan/tonase + ekspor CSV/Excel

---

## Fase 6: Governance UI ✅

- [x] `/settings` institusi, pengumuman, audit log
- [x] Role pemerintah: menu terbatas, write disabled, landing `/reports`

---

## Matriks Dependensi Backend → Web Admin

| Backend | Unblock Web Admin |
|---------|-------------------|
| Fase 1–5 ✅ | Fase 0–6 MVP UI |
| Fase 7 | Fase 8 deploy |
| Fase 8.1 edukasi | Fase 9.1 |
| Fase 8.2 harga H-3 | Fase 9.3 |
| Fase 8.3 wilayah | Fase 9.2 |
| Fase 8.4 KTP/PDF | Fase 9.4 |
| Fase 8.6 notifikasi | Fase 9.6 |

---

## Checklist Integrasi End-to-End

| Alur | Web Admin | Mobile | Backend |
|------|-----------|--------|---------|
| Setoran langsung | Input setoran | Lihat riwayat | Fase 2–3 ✅ |
| Penjemputan | Approve & status | Ajukan & cek | Fase 2–3 ✅ |
| Penarikan | Approve manual | Ajukan | Fase 2–3 ✅ |
| Tukar poin | Approve | Ajukan | Fase 2–3 ✅ |
| Pengaduan | Tindak lanjut | Ajukan | Fase 2–3 ✅ |
| Dashboard / laporan | UI | — | Fase 4 ✅ |
| Edukasi artikel | CRUD | Baca | Backend Fase 8 |

---

## Definisi "Selesai" per Tahap

| Tahap | Kriteria |
|-------|----------|
| **MVP Operasional** | Fase 0–3; petugas setoran & jemput |
| **MVP Admin Lengkap** | Fase 4; master data & gudang |
| **Monitoring Ready** | Fase 5; dashboard & laporan real |
| **UAT Ready** | Fase 7; role ditest, responsive OK |
| **Go-Live** | Fase 8 deploy + HTTPS |
| **Pengembangan Lanjutan** | Fase 9 iteratif per dokumen persyaratan |
