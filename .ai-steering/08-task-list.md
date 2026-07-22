# 08 — Task List: Web Admin Development Roadmap

> **Dokumen ini** adalah roadmap **miru-web-admin**.
> **Urutan:** item **belum selesai di atas**; item **sudah selesai di bawah** (arsip).
>
> Item pengembangan lanjutan hanya dari dokumen persyaratan (Proposal, Jawaban,
> Modules, Business Rules, Constraints) — bukan spekulasi fitur; tetap dalam **17 modul**.
> MVP sudah selesai; Fase 7–9 adalah lingkup kerja aktif.
>
> **Referensi (repo ini):**
> - `04-api-integration.md`, `07-modules-and-features.md`, `10-integration-and-roles.md`
> - `05-business-rules-sops.md`, `06-system-constraints.md`
> - `11-security-and-privacy.md` — **pedoman keamanan & privasi web admin**
>
> **Referensi backend:**
> - `backend/` → `.ai-steering/08-task-list.md`, `04-api-contracts`, `07-modules`,
>   **`11-security-and-privacy.md` (kanonik)**

---

## Ringkasan Fase

| Fase | Nama | Tujuan | Backend Min. | Status |
|------|------|--------|--------------|--------|
| 0–6 | Scaffold → Governance UI | Auth, operasional, manajemen, dashboard, settings | Fase 1–5 ✅ | ✅ Selesai (arsip MVP) |
| 7 | Kualitas & UAT | Test, a11y, edge cases, keamanan client | Fase 6 | 🔲 Aktif |
| 8 | Production | Deploy HTTPS + CORS | Fase 7 | 🔲 Aktif |
| 9 | Pengembangan Lanjutan | Fitur persyaratan dalam **17 modul** | Backend Fase 8 (fitur ✅) | 🔲 **Aktif — prioritas wire UI** |
| — | Out of Scope | Larangan sistem / di luar modul | — | ⛔ |

> **Status proyek:** MVP web-admin selesai. API backend Fase 8 fitur bisnis hampir semua siap.
> Kerja aktif = **Fase 9 wire UI ke API** + **Fase 7 UAT** + **Fase 8 deploy**.
> Item hanya dari Proposal / Jawaban / Modules / Business Rules — **tidak menambah modul** di luar 17.

### Cakupan 17 Modul — Web Admin

| No | Modul | Halaman | Status MVP | Lanjutan (sisa) |
|----|-------|---------|------------|-----------------|
| 1 | Manajemen Pengguna | `/customers`, `/staff` | ✅ | Filter kelurahan; bulk import |
| 2 | Autentikasi | `/login` | ✅ | — |
| 3 | Profil Nasabah | `/customers/{id}` | ✅ | Lihat KTP penarikan besar; field RT/RW |
| 4 | Edukasi Sampah | `/education` | ⚠️ Placeholder | CRUD artikel (API ✅) |
| 5 | Katalog & Harga | `/waste/categories` | ✅ | Form `tanggal_berlaku` H-3 |
| 6 | Setor Langsung | `/transactions/add` | ✅ | Unduh PDF bukti |
| 7 | Penjemputan | `/pickups` | ✅ | UI wilayah/kuota; map sederhana (opsional) |
| 8 | Penimbangan | (form setoran) | ✅ | — |
| 9 | Saldo & Riwayat | `/customers/{id}`, `/transactions` | ✅ | Notifikasi in-app ✅ |
| 10 | Penarikan Saldo | `/balance` | ✅ | Tanda terima PDF; KTP penarikan besar |
| 11 | Poin & Reward | `/reward` | ✅ | — |
| 12 | Stok Gudang | `/warehouse` | ✅ | — |
| 13 | Penjualan Mitra | `/warehouse/sales`, `partners` | ✅ | — |
| 14 | Pengaduan | `/complaints` | ✅ | — |
| 15 | Dashboard | `/dashboard` | ✅ | Widget wilayah teraktif |
| 16 | Laporan | `/reports` | ✅ | PDF arsip; evaluasi kendala; batasi PII export |
| 17 | Pengaturan & Audit | `/settings` | ✅ | — |

---

## Urutan kerja disarankan (Web)

1. **9.1 Edukasi** — ganti placeholder `/education` (API `/api/edukasi/` sudah ✅).
2. **9.3 Harga H-3** — form `tanggal_berlaku` + banner terjadwal.
3. **9.2 Wilayah** — filter/form kelurahan–RT/RW + indikator kuota jemput.
4. **9.4 Bukti & KTP** — PDF unduh + upload/lihat KTP hanya di penarikan besar.
5. **9.5 Laporan** — evaluasi kendala, wilayah teraktif, batasi PII export.
6. **Fase 7 UAT** beriringan; **Fase 8 deploy** saat staging stabil.
7. **9.6 Bulk import** setelah backend endpoint import siap.

---

# BAGIAN A — BELUM SELESAI (prioritas atas)

> Hanya item `[ ]`. Detail cukup untuk dikerjakan; tetap dalam 17 modul.

---

## Fase 9: Pengembangan Lanjutan (prioritas wire UI)

> Bergantung Backend Fase 8 fitur bisnis (sudah ✅ untuk item di bawah, kecuali bulk import & Maps).

### 9.1 Modul 4 — Edukasi sampah

> **Sumber:** Proposal §4 modul 4; `07-modules` CRUD artikel.
> **API:** `GET/POST/PATCH/DELETE /api/edukasi/` — siap.

- [ ] **Ganti `ModulePlaceholder` di `/education`** dengan halaman CRUD artikel edukasi
  - List: judul, status aktif, urutan, kategori terkait, aksi edit/nonaktifkan
  - Form create/edit: judul, isi/panduan (rich text atau textarea), kategori terkait (opsional), `aktif`, `urutan`
  - Role: admin/koordinator mutate; pemerintah/petugas sesuai guard sidebar
- [ ] **Preview konten** sebelum simpan + badge status aktif/nonaktif di list
- [ ] **Integrasi penuh ke API** — envelope error BI; empty state jika belum ada artikel; skeleton saat loading

### 9.2 Modul 1 / 3 / 7 — Wilayah layanan

> **Sumber:** Jawaban §6.2.12–13; Data dictionary §K; Proposal modul 3/7.
> **API:** field kelurahan/RT-RW user; `WilayahLayanan`; validasi kuota 2×/minggu — siap.
> Alur Setujui → assign petugas sudah ✅ (lihat BAGIAN B).

- [ ] **Filter nasabah by kelurahan / wilayah** di `/customers`
  - Query param selaras backend; empty state jika filter kosong
- [ ] **Field RT / RW / kelurahan** di form tambah & edit nasabah (`/customers/...`)
  - Optional di registrasi/admin create; tampil di detail nasabah
  - Pakai referensi wilayah dari API jika tersedia (jangan hardcode list lokal panjang)
- [ ] **UI batasan wilayah penjemputan + indikator kuota 2×/minggu** di `/pickups`
  - Tampilkan pesan error envelope backend (wilayah tidak terdaftar / kuota penuh) dengan bahasa Indonesia jelas
  - Indikator sisa kuota wilayah jika API menyediakan meta; jika tidak, andalkan error server

### 9.3 Modul 5 — Perubahan harga H-3

> **Sumber:** Business Rules §G; Jawaban §6.2.4.
> **API:** `tanggal_berlaku` min H+3 + pengumuman otomatis — siap.
> Riwayat harga sudah ditampilkan di UI; **form edit belum kirim `tanggal_berlaku`**.

- [ ] **Form edit harga kategori:** input `tanggal_berlaku` (date) dengan validasi client min H+3
  - Kirim ke API bersama harga baru; tampilkan error envelope jika server tolak
- [ ] **Preview teks pengumuman** perubahan harga (yang akan/ sudah dibuat backend) sebelum/sesudah simpan
- [ ] **Banner admin** di halaman kategori atau dashboard: ada harga terjadwal belum aktif
  - Tampilkan nama kategori, harga baru, tanggal berlaku

### 9.4 Modul 6 / 10 — Bukti digital & verifikasi KTP

> **Sumber:** Jawaban §6.3.4, §6.3.6; Security §4, §6.
> **API:** download PDF role-gated + unduh KTP — siap.

- [ ] **Upload / lihat foto KTP hanya di alur penarikan besar** (`/balance`)
  - Jangan tampilkan KTP di list nasabah generik
  - Role need-to-know: admin/koordinator; petugas sesuai aturan backend
- [ ] **Mask NIK di UI** (partial, mis. `****1234`) di mana NIK muncul; akses penuh hanya need-to-know
- [ ] **Unduh / cetak tanda terima PDF** setoran & penarikan
  - Tombol di detail transaksi / detail penarikan; hit endpoint download role-gated
  - Jangan expose URL media publik terbuka
- [ ] **Verifikasi print-friendly** view laporan (UAT): margin, tanpa sidebar, data lengkap

### 9.5 Modul 15 / 16 — Monitoring & laporan OPD

> **Sumber:** Proposal modul 15–16; Jawaban §6.2.14; Security §4 (export PII).
> Ekspor CSV/Excel client-side sudah ✅.

- [ ] **Batasi kolom PII pada export** sesuai role / need-to-know
  - Pemerintah & petugas: jangan ikutkan NIK lengkap / kontak sensitif jika tidak diperlukan
- [ ] **Ekspor PDF laporan bulanan** untuk arsip kantor distrik
  - Boleh client-print atau unduh dari export server jika endpoint tersedia
- [ ] **Tab/section evaluasi** di `/reports`: field **kendala** + **rekomendasi tindak lanjut**
  - Integrasi `GET`/`PATCH` laporan evaluasi backend
- [ ] **Kartu/widget wilayah teraktif** di `/dashboard` (dari overview/evaluasi API)
- [ ] **Laporan harian petugas** (view terbatas) — hanya jika SOP operasional final meminta

### 9.6 Operasional & notifikasi (Modul 1 / 7 / 9)

> **Sumber:** Persyaratan import; Jawaban §6.6.1; Constraints Maps sederhana.
> Panel notifikasi in-app (lonceng) sudah ✅.

- [ ] **Bulk import nasabah CSV/Excel** (setelah Backend 8.8 siap)
  - UI upload + feedback error per baris; batasi ukuran file
  - Hanya admin/koordinator; audit trail dari server
- [ ] **(Opsional) Preview peta statis** alamat jemput di detail penjemputan
  - Static map / pin saja — **bukan** live tracking
  - Butuh Backend 8.7 koordinat + Maps key ter-restrict

---

## Fase 7: Kualitas & Testing (UAT Ready)

> **Sumber:** Kriteria UAT; Business Rules §SLA; `11-security-and-privacy.md` §2–3, §9.
> Auth block nasabah, role guard, 401/403 toast, unit test `lib/*`, fondasi skeleton — sudah ✅.

### 7.0 Keamanan Client — sisa

- [ ] **Audit route:** tidak ada route dashboard tanpa guard role yang sesuai
  - Cek `(dashboard)/*` + redirect petugas/pemerintah/koordinator
- [ ] **Mask NIK di tabel** (partial) di semua tempat NIK ditampilkan
- [ ] **Jangan log / tampilkan** JWT, password, atau stack trace ke user (console production & toast)
- [ ] **Session expired** → redirect `/login` dengan pesan jelas (bukan blank/spinner infinite)
- [ ] **Double-submit prevention** pada form transaksi keuangan (setoran, approve penarikan, approve tukar poin)
- [ ] **Optimistic UI disabled** untuk operasi saldo — tunggu konfirmasi server
- [ ] **Error boundary per route** (`error.tsx`) — pesan ramah, tanpa stack user-facing

### 7.1 Testing — sisa

- [ ] Setup Vitest + RTL untuk komponen UI (util/unit `lib/*.test.ts` sudah ada)
- [ ] Test AuthProvider / form setoran (validasi min 1 kg, auto-calculate) dengan RTL
- [ ] **E2E manual checklist per role:** admin, petugas, koordinator, pemerintah
- [ ] **E2E keamanan:** nasabah ditolak login; pemerintah tidak mutate; petugas tidak approve penarikan
- [ ] **E2E alur:** login web → input setoran → cek saldo naik di mobile

### 7.2 UX & Accessibility — sisa

- [ ] Skeleton & empty state **konsisten** di semua halaman data (bukan hanya fondasi komponen)
- [ ] Keyboard navigation form utama (setoran, login, penarikan)
- [ ] Kontras warna tema hijau memenuhi a11y minimum
- [ ] Responsive tablet & mobile (petugas sering pakai HP)

### 7.3 Error & Edge Cases — sisa

- [ ] Pesan network offline jelas (Bahasa Indonesia)
- [ ] Verifikasi ulang session expired + double-submit (selaras 7.0)

---

## Fase 8: Production Deploy

> **Sumber:** Jawaban §6.5; Timeline go-live; Security §5–7, §9.

- [ ] `next build` tanpa error
- [ ] Env production: `NEXT_PUBLIC_API_URL=https://…` (**HTTPS only**)
- [ ] Pastikan tidak ada secret non-public ikut ke bundle client
- [ ] Deploy ke server Webekspres (Node/Nginx atau setara)
- [ ] HTTPS wajib di domain admin
- [ ] Security headers: HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` / CSP
- [ ] CORS backend whitelist domain admin (koordinasi Backend 8.9)
- [ ] Checklist go-live keamanan web: `11-security-and-privacy.md` §9

---

## Out of Scope / tidak dari persyaratan

> Jangan dijadwalkan sebagai pekerjaan default. Lihat Security §1 larangan.

- [ ] ❌ Dark mode
- [ ] ❌ WebSocket / notifikasi real-time peta petugas (bertentangan larangan live tracking)
- [ ] ❌ Payment gateway pada penarikan
- [ ] ❌ Login/register nasabah di web admin
- [ ] ❌ Multi-tenant / multi organisasi
- [ ] ❌ GPS live tracking
- [ ] ❌ Integrasi timbangan digital otomatis
- [ ] ❌ Fitur di luar 17 modul tanpa addendum

---

# BAGIAN B — SELESAI (arsip) — urutan bawah

---

## Fase 9 (sebagian) — sudah selesai ✅

- [x] Alur penjemputan: Setujui → modal tugaskan petugas; tab Aktif `status__in`; label “Belum ditugaskan”
- [x] Ekspor CSV laporan (client-side)
- [x] Ekspor Excel laporan (client-side `xlsx`)
- [x] Panel notifikasi in-app (lonceng `/api/notifications/`) — list / mark-read; petugas lihat milik sendiri

---

## Fase 7 (sebagian) — sudah selesai ✅

- [x] Blokir login role `nasabah`; logout clear token
- [x] Role guard sidebar + `canMutate` untuk koordinator/pemerintah
- [x] 401 refresh → login; 403 toast tanpa detail internal
- [x] Unit test API client / envelope / auth / permissions / routes / format (`lib/*.test.ts`)
- [x] Loading skeleton / Empty state / ErrorMessage component (fondasi)

---

## Fase 0: Scaffold ✅

- [x] Next.js + TypeScript strict + Tailwind CSS v4 + ESLint
- [x] Dokumentasi `.ai-steering/` selaras backend

---

## Fase 1: Foundation ✅

- [x] Dependencies: `swr`, `lucide-react`, `recharts`, `date-fns` (+ form/zod sesuai kebutuhan)
- [x] `.env.local` / `.env.example`; `lib/config.ts`
- [x] `types/api.ts`, `types/models.ts`; `lib/api.ts` envelope + JWT refresh
- [x] `lib/format.ts` — Rupiah, tanggal WIT, kg
- [x] UI primitives + Sidebar/Header/DashboardLayout
- [x] Routing `(auth)/login`, `(dashboard)/*`, proxy redirect

---

## Fase 2: Auth & RBAC ✅

- [x] AuthProvider — login/logout/refreshProfile; blok role `nasabah`
- [x] Login form BI + error envelope
- [x] Redirect per role; sidebar filter; hide mutate untuk read-only
- [x] 401 refresh → login; 403 toast

---

## Fase 3: MVP Operasional ✅

- [x] `/transactions/add` multi-baris, min 1 kg, konfirmasi, `POST /api/deposits/`
- [x] `/transactions` riwayat + detail bukti
- [x] `/pickups` tabs status + aksi approve/reject/assign/update-status
- [x] `/balance` approve manual tanpa gateway
- [x] `/complaints` tindak lanjut + tutup; badge SLA
- [x] Cari nasabah by ID untuk prefill setoran (QR)

---

## Fase 4: Manajemen & Stok ✅

- [x] `/customers` (+ detail, add, edit, toggle aktif, export CSV)
- [x] `/staff` CRUD
- [x] `/waste/categories` + tampilan price history
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
| Fase 8.1 edukasi ✅ | Fase 9.1 |
| Fase 8.2 harga H-3 ✅ | Fase 9.3 |
| Fase 8.3 wilayah ✅ | Fase 9.2 |
| Fase 8.4 KTP/PDF ✅ | Fase 9.4 |
| Fase 8.6 notifikasi ✅ | Panel lonceng ✅ |
| Fase 8.7 Maps (belum) | Preview peta opsional 9.6 |
| Fase 8.8 bulk import (belum) | UI import 9.6 |

---

## Checklist Integrasi End-to-End

| Alur | Web Admin | Mobile | Backend |
|------|-----------|--------|---------|
| Setoran langsung | Input setoran ✅ | Lihat riwayat ✅ | ✅ |
| Penjemputan | Approve & status ✅ | Ajukan & cek ✅ | ✅ |
| Penarikan | Approve manual ✅ | Ajukan ✅ | ✅ |
| Tukar poin | Approve ✅ | Ajukan ✅ | ✅ |
| Pengaduan | Tindak lanjut ✅ | Ajukan ✅ | ✅ |
| Dashboard / laporan | UI ✅ | — | ✅ |
| Edukasi artikel | CRUD 🔲 | Baca ✅ | API ✅ |
| Harga H-3 | Form 🔲 | Banner 🔲 | API ✅ |
| PDF bukti / KTP | UI 🔲 | Share/unduh 🔲 | API ✅ |

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

## Indeks dokumen keamanan

| Repo | Dokumen |
|------|---------|
| Backend (kanonik) | `backend/.ai-steering/11-security-and-privacy.md` |
| Web Admin | `.ai-steering/11-security-and-privacy.md` |
| Mobile | `mirumobileapp/.ai-steering/11-security-and-privacy.md` |
