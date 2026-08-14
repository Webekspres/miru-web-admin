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
> **Kerja aktif #1:** sisa **Fase 9** wire UI (wilayah, PDF bukti, laporan). KTP penarikan besar (lihat lampiran) ✅.
> Audit Temuan web (W0–W11) sudah ✅ — arsip BAGIAN B.
> Item hanya dari Proposal / Jawaban / Modules / Business Rules / **temuan audit** — **tidak menambah modul** di luar 17.

### Cakupan 17 Modul — Web Admin

| No | Modul | Halaman | Status MVP | Lanjutan (sisa) |
|----|-------|---------|------------|-----------------|
| 1 | Manajemen Pengguna | `/customers`, `/staff` | ✅ | Filter kelurahan; bulk import; verifikasi HP |
| 2 | Autentikasi | `/login` | ✅ | Pesan BI + disable empty ✅ |
| 3 | Profil Nasabah | `/customers/{id}` | ✅ | Field RT/RW; **tanpa NIK** (tidak dikumpulkan) |
| 4 | Edukasi Sampah | `/education` | ✅ | CRUD + Markdown ✅ |
| 5 | Katalog & Harga | `/waste/categories` | ✅ | Menu sidebar + form H-3 ✅ |
| 6 | Setor Langsung | `/transactions/add` | ✅ | Lookup + scan QR ✅; notif nilai (backend T1 ✅) |
| 7 | Penjemputan | `/pickups` | ✅ | Approve+assign; filter petugas; notif ✅ |
| 8 | Penimbangan | (form setoran) | ✅ | — |
| 9 | Saldo & Riwayat | `/customers/{id}`, `/transactions` | ✅ | Notifikasi in-app ✅ |
| 10 | Penarikan Saldo | `/balance` | ✅ | Lihat lampiran KTP pending ✅; tanda terima PDF |
| 11 | Poin & Reward | `/reward` | ✅ | Tab pengajuan dulu ✅; notif admin ✅ |
| 12 | Stok Gudang | `/warehouse` | ✅ | Link ke sales ✅ |
| 13 | Penjualan Mitra | `/warehouse/sales`, partners | ✅ | CRUD mitra discoverable ✅ |
| 14 | Pengaduan | `/complaints` | ✅ | Alert tindak lanjut; notif ✅ |
| 15 | Dashboard | `/dashboard` | ✅ | Dashboard petugas + per role ✅ |
| 16 | Laporan | `/reports` | ✅ | PDF arsip; evaluasi kendala; batasi PII export |
| 17 | Pengaturan & Audit | `/settings` | ✅ | Pisah pengumuman/audit; jam TimeField ✅ |

---

## Urutan kerja disarankan (Web)

1. **Sisa Fase 9** wire (wilayah, PDF bukti, laporan, bulk import).
2. Fase 7 UAT beriringan; Fase 8 deploy saat staging stabil.
3. Bulk import setelah backend endpoint import siap.
4. Audit Temuan web sudah selesai (arsip BAGIAN B).

---

# BAGIAN A — BELUM SELESAI (prioritas atas)

> Hanya item `[ ]`. Detail cukup untuk dikerjakan; tetap dalam 17 modul.

---

## Fase 9: Pengembangan Lanjutan (prioritas wire UI)
  *(Audit Temuan web W0–W11 sudah ✅ di BAGIAN B; di bawah hanya sisa wire UI.)*

> Bergantung Backend Fase 8 fitur bisnis (sudah ✅ untuk item di bawah, kecuali bulk import & Maps).

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

### 9.4 Modul 6 / 10 — Bukti digital

> **Sumber:** Jawaban §6.3.6; Proposal modul 9/10 (bukti transaksi). KTP **bukan** field modul proposal.
> **API:** PDF role-gated siap. Lampiran KTP penarikan besar: lihat-only saat `menunggu` ✅ (BAGIAN B).
> NIK tidak dikumpulkan — tidak ada mask NIK di UI.

- [ ] **Unduh / cetak tanda terima PDF** setoran & penarikan
  - Tombol di detail transaksi / detail penarikan; hit endpoint download role-gated
  - Jangan expose URL media publik terbuka
- [ ] **Verifikasi print-friendly** view laporan (UAT): margin, tanpa sidebar, data lengkap

### 9.5 Modul 15 / 16 — Monitoring & laporan OPD

> **Sumber:** Proposal modul 15–16; Jawaban §6.2.14; Security §4 (export PII).
> Ekspor CSV/Excel client-side sudah ✅.

- [ ] **Batasi kolom PII pada export** sesuai role / need-to-know
  - Pemerintah & petugas: jangan ikutkan kontak sensitif jika tidak diperlukan (NIK tidak ada di sistem)
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


## Audit Temuan — selesai ✅

### W0. UX umum web

- [x] **`cursor-pointer`** pada semua button, link, dan elemen klikabel (termasuk yang styled sebagai button)
  - Global `button/select/a/[role=…]` di `globals.css`; komponen `Button` ikut
- [x] **Toast/popup hasil aksi edit/create/delete** di semua form mutate
  - Sukses: singkat BI (“Perubahan berhasil disimpan.”)
  - Gagal: tampilkan `message` + field errors dari envelope, bukan silent fail
  - Audit: WasteCategoryList, RewardManagement, ComplaintManagement, Customer/StaffForm, PartnerManagement, PartnerSalesView, WithdrawalManagement, PickupManagement, DepositForm, SettingsClient, AnnouncementManagement — semua pakai `useToast`

### W1. Modul 2 — Login

- [x] **Disable tombol Login** jika username atau password kosong (jangan submit)
  - Hapus perilaku: klik kosong → “username/password salah”
- [x] **Pesan rate-limit BI** — jangan tampilkan teks Inggris throttle mentah; map ke kalimat ramah + sisa detik jika ada
- [x] **Pesan login gagal BI** selaras backend (username tidak ada / password salah)

### W2. Modul 6 — Input setoran

- [x] **Perbaiki bug “ID nasabah tidak ditemukan”** padahal ID benar
  - Samakan format ID dengan QR / API lookup; tampilkan error envelope yang spesifik
  - Root cause FE: petugas lookup tanpa field `role` ditolak client; QR mobile = JSON `{id,nama_lengkap,no_hp}` bukan angka saja
- [x] **Scan QR dari kamera** di form setoran (izin kamera + parse payload QR MIRU → isi nasabah)
  - Fallback: input manual tetap ada
- [x] **Pastikan notifikasi / feedback nilai setoran** menampilkan Rupiah benar (koordinasi backend notif Rp0)
  - FE toast/konfirmasi memakai `formatRupiah` + `total_nilai` response ✅
  - **BLOCKER backend T1:** signal `_notif_setoran` fire saat create sebelum `total_nilai` di-set → notif in-app nasabah bisa Rp0 (bukan bug FE)
- [x] Multi-jenis sampah di web **tetap** didukung (regresi); mobile multi-jenis adalah task mobile terpisah / out-of-scope nasabah input

### W3. Modul 7 — Penjemputan (web)

- [x] **Setujui jangan fire API dulu** sebelum petugas dipilih
  - UX: modal/flow “Setujui + pilih petugas” → satu submit; cegah jemput aktif tanpa petugas
  - Selaras backend T3 (approve+assign atomik) — web: approve+assign berurutan sampai endpoint atomik ada
- [x] **Dropdown assign petugas: jangan tampilkan nomor HP** — cukup nama (dan role/kode jika perlu)
- [x] **Filter list untuk petugas (non-admin):** sembunyikan `menunggu` & `ditolak`; hanya jemput yang harus dikerjakan petugas login
- [x] **Notifikasi lonceng / badge** untuk jemput baru (admin) dan jemput selesai (petugas+admin) — andalkan API notif backend T3; pastikan UI refresh badge
  - UI: refresh `sidebar-badges` + `notifications` setelah aksi jemput; badge petugas = tugas aktif (bukan menunggu)

### W4. Modul 11 — Reward & penukaran

- [x] **Susunan halaman `/reward`:** tab/default **Pengajuan penukaran** (tabel siapa mengajukan) dulu → tab kedua **Katalog reward**
- [x] **Notifikasi admin** saat ada pengajuan tukar poin baru (lonceng)
  - Backend T4 selesai: `_notif_penukaran` → `notify_roles(('admin',))` saat create. UI lonceng poll `/api/notifications/` ✅ (diverifikasi)
- [x] Saat approve gagal karena poin tidak cukup setelah harga berubah: tampilkan pesan server BI; jangan toast generik
  - `handleApprove` memakai `ApiError.errors` (`non_field_errors` / field errors) sebelum fallback `message` generik.

### W5. Modul 14 — Pengaduan

- [x] **Sebelum tutup:** jika `tindak_lanjut` kosong → alert/dialog “Isi tindak lanjut dulu” (client-side), jangan sampai request gagal tanpa penjelasan
- [x] **Notifikasi admin** saat pengaduan baru
  - Backend T7 selesai: `_notif_pengaduan` → `notify_admins` saat create. UI lonceng sudah ada ✅ (diverifikasi)
- [x] Opsi jenis **Lainnya** muncul di filter/detail
  - Backend T7 selesai (`lainnya` di `Pengaduan.JENIS_CHOICES` + migration 0022); label `Lainnya` ditambahkan di `COMPLAINT_TYPE_LABELS` web; fallback raw value tetap

### W6. Modul 4 — Edukasi

- [x] **Menu sidebar “Edukasi”** mengarah ke CRUD (bukan placeholder)
  - Menu sidebar admin/koordinator → `/education`; koordinator diizinkan via `routes.ts`
- [x] Halaman CRUD penuh: list + form; **editor/preview Markdown** untuk isi artikel
  - `EducationManagement` — list (judul, kategori, urutan, status, updated), form create/edit, `MarkdownContent` preview, hapus; empty state + skeleton
- [x] Role mutate: admin/koordinator; read-only sesuai matriks
  - `canMutate` guard — admin/koordinator mutate; pemerintah/petugas lihat (read-only)

### W7. Modul 5 — Katalog & harga

- [x] **Menu sidebar jelas** ke katalog harga (label ramah; route `/waste/categories` atau redirect `/waste` → categories)
  - Menu sidebar admin/koordinator: “Katalog & Harga” → `/waste/categories`; redirect `/waste` → categories (hub, bukan index kosong)
- [x] **Form ubah harga + `tanggal_berlaku`** dengan validasi client **H+3**
  - Input date min H+3 + error BI; kirim `tanggal_berlaku` ke API; preview pengumuman di modal; banner “Harga Terjadwal Belum Aktif” di halaman kategori (dari price-history)

### W8. Modul 12–13 — Gudang & mitra

- [x] **Dari `/warehouse`:** CTA/tab/link jelas ke **`/warehouse/sales`** (penjualan ke mitra)
  - Dua CTA cards di `/warehouse`: “Penjualan ke Mitra” → `/warehouse/sales`, “Kelola Mitra Pengepul” → `/warehouse/partners`
- [x] **CRUD mitra discoverable:** halaman atau section “Kelola mitra” (bukan hanya dropdown tanpa jalan menambah)
  - `/warehouse/partners` (CRUD penuh) — link CTA dari `/warehouse`; sidebar “Gudang & Mitra” tetap

### W9. Modul 15 — Dashboard per role

- [x] **Petugas punya dashboard** (bukan kosong / redirect tanpa ringkasan)
  - Landing petugas → `/dashboard` (routes.ts); `PetugasDashboard` — widget “Jemput Ditugaskan Hari Ini”, “Antrian Aktif”, daftar “Tugas Penjemputan Saya” (API T9 `get_petugas_overview`)
- [x] **Widget per role** (admin / koordinator / petugas / pemerintah) hanya tampilkan yang role boleh lihat
  - Petugas → widget petugas; admin/koordinator/pemerintah → overview penuh (permission backend tetap guard)

### W10. Modul 1 — Nasabah & staff

- [x] Setelah admin isi/ubah nomor HP: tampilkan status **belum verifikasi**; dokumentasikan bahwa user akan diverifikasi saat login mobile
  - Badge “HP Belum Verifikasi” di list & detail nasabah (`phone_verified=false`); hint di form “akan diverifikasi saat login mobile” (backend T10 set unverified otomatis)
- [x] **Icon mata show/hide password** di form set/reset password nasabah & staff
  - `PasswordInput` (Eye/EyeOff) dipakai di CustomerForm & StaffForm

### W11. Modul 17 — Pengaturan (restruktur)

- [x] **Jam operasional:** input tipe waktu (buka/tutup), bukan textarea bebas — selaras backend TimeField
  - Input `type=time` untuk `jam_buka`/`jam_tutup`; backend sinkron `jam_operasional` otomatis
- [x] **Hapus input logo** institusi (pakai ikon app tetap)
  - Field logo dihapus dari form; backend `logo_url` read-only (T8)
- [x] **Pindahkan Pengumuman** dari settings → **menu sidebar** + halaman kelola khusus
  - Menu sidebar “Pengumuman” → `/announcements` (banner mobile + riwayat)
- [x] **Pindahkan Audit log** dari settings → **menu sidebar** + halaman khusus
  - Menu sidebar “Audit Log” → `/audit-log` (filter + tabel; admin only)
- [x] **`/settings` hanya berisi:** data institusi + kebijakan data + tentang MIRU
  - Tab Institusi (jam time input, tanpa logo) + Kebijakan Data (`/privacy-policy/`) + Tentang MIRU

### PDP / KTP (selaras proposal + implementasi 2026-08)

- [x] **NIK tidak ditampilkan** di detail/list nasabah (field tidak dikumpulkan)
- [x] **Lihat lampiran KTP** hanya di `/balance` saat status menunggu + `ada_lampiran_ktp`
  - Tombol admin/koordinator; unduh via endpoint role-gated; tidak di list nasabah

---

### Dari Fase 9: Pengembangan Lanjutan (prioritas wire UI)

### 9.1 Modul 4 — Edukasi sampah

> **Sumber:** Proposal §4 modul 4; `07-modules` CRUD artikel.
> **API:** `GET/POST/PATCH/DELETE /api/edukasi/` — siap.

- [x] **Ganti `ModulePlaceholder` di `/education`** dengan halaman CRUD artikel edukasi
  - List: judul, status aktif, urutan, kategori terkait, aksi edit/nonaktifkan
  - Form create/edit: judul, isi/panduan (Markdown), kategori terkait (opsional), `aktif`, `urutan`
  - Role: admin/koordinator mutate; pemerintah/petugas sesuai guard sidebar
- [x] **Preview konten** sebelum simpan + badge status aktif/nonaktif di list
- [x] **Integrasi penuh ke API** — envelope error BI; empty state jika belum ada artikel; skeleton saat loading

### 9.3 Modul 5 — Perubahan harga H-3

> **Sumber:** Business Rules §G; Jawaban §6.2.4.
> **API:** `tanggal_berlaku` min H+3 + pengumuman otomatis — siap.
> Riwayat harga sudah ditampilkan di UI; **form edit belum kirim `tanggal_berlaku`**.

- [x] **Form edit harga kategori:** input `tanggal_berlaku` (date) dengan validasi client min H+3
  - Kirim ke API bersama harga baru; tampilkan error envelope jika server tolak
- [x] **Preview teks pengumuman** perubahan harga (yang akan/ sudah dibuat backend) sebelum/sesudah simpan
- [x] **Banner admin** di halaman kategori atau dashboard: ada harga terjadwal belum aktif
  - Tampilkan nama kategori, harga baru, tanggal berlaku


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
| Edukasi artikel | CRUD ✅ (W6) | Baca ✅ | API ✅ |
| Harga H-3 | Form ✅ (W7) | Banner ✅ | API ✅ |
| PDF bukti | UI 🔲 | Share/unduh 🔲 | API ✅ |
| Lampiran KTP penarikan ≥1jt | Lihat pending ✅ | Unggah di app ✅ | API ✅ (hapus setelah proses) |

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
