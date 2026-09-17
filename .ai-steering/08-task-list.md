# 08 — Task List: Web Admin

Belum selesai di atas; selesai di bawah.
Hanya task dalam 17 modul. Jangan tambah fitur di luar persyaratan.

---

## Fase 7 — Kualitas & UAT

### Bisa langsung

- [x] Audit route: tidak ada `(dashboard)/*` tanpa guard role
- [x] Jangan log/tampilkan JWT, password, atau stack trace ke user
- [x] Session expired → redirect `/login` dengan pesan jelas
- [x] Double-submit prevention: setoran, approve penarikan, approve tukar poin
- [x] Optimistic UI disabled untuk operasi saldo
- [x] Error boundary per route (`error.tsx`) — pesan ramah, tanpa stack
- [x] Setup Vitest + RTL untuk komponen UI
- [x] Test AuthProvider / form setoran (min 1 kg, auto-calculate) dengan RTL
- [x] E2E per role: admin, petugas, koordinator, pemerintah
- [x] E2E keamanan: nasabah ditolak; pemerintah tidak mutate; petugas tidak approve penarikan
- [x] Skeleton & empty state konsisten di semua halaman data
- [x] Keyboard navigation form utama (setoran, login, penarikan)
- [x] Kontras tema hijau memenuhi a11y minimum
- [x] Responsive tablet & HP (petugas)
- [x] Pesan network offline (Bahasa Indonesia)

### Perlu integrasi (mobile + staging)

- [ ] E2E alur: login web → input setoran → saldo naik di mobile

---

## Fase 8 — Production deploy

### Bisa langsung

- [ ] `next build` tanpa error
- [ ] Secret non-public tidak ikut bundle client

### Perlu integrasi (domain, Webekspres, Backend 8.9)

- [ ] Env production: `NEXT_PUBLIC_API_URL=https://…` (HTTPS only)
- [ ] Deploy ke server Webekspres
- [ ] HTTPS di domain admin
- [ ] Security headers: HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` / CSP
- [ ] CORS backend whitelist domain admin
- [ ] Checklist go-live: `11-security-and-privacy.md` §9

---

## Fase 9 — Pengembangan lanjutan

### Bisa langsung (API sudah ✅)

- [ ] Filter nasabah by kelurahan / wilayah di `/customers`
- [ ] Field RT / RW / kelurahan di form tambah & edit nasabah
- [ ] UI kuota wilayah 2×/minggu di `/pickups` (pesan envelope BI)
- [ ] Unduh / cetak PDF tanda terima setoran & penarikan (role-gated; bukan URL media publik)
- [ ] Print-friendly view laporan (margin, tanpa sidebar)
- [ ] Batasi kolom PII pada export sesuai role
- [ ] Ekspor PDF laporan bulanan (client-print atau export server)
- [ ] Tab evaluasi di `/reports`: kendala + rekomendasi (`GET`/`PATCH`)
- [ ] Kartu wilayah teraktif di `/dashboard`

### Perlu integrasi

- [ ] Laporan harian petugas — **hanya jika SOP operasional minta**
- [ ] Bulk import nasabah CSV/Excel — **Backend 8.8**
- [ ] Preview peta statis alamat jemput — **Backend 8.7 Maps key**; bukan live tracking

---

## Out of scope

- ❌ Dark mode
- ❌ WebSocket / peta petugas real-time
- ❌ Payment gateway
- ❌ Login/register nasabah di web admin
- ❌ Multi-tenant
- ❌ GPS live tracking
- ❌ Timbangan digital otomatis
- ❌ Fitur di luar 17 modul tanpa addendum

---

## Selesai

### Fase 0 — Scaffold

- [x] Next.js + TypeScript strict + Tailwind CSS v4 + ESLint
- [x] Dokumentasi `.ai-steering/`

### Fase 1 — Foundation

- [x] swr, lucide-react, recharts, date-fns
- [x] `.env.local` / `.env.example`; `lib/config.ts`
- [x] Envelope + JWT refresh; format Rupiah/WIT/kg
- [x] UI primitives + Sidebar/Header/DashboardLayout
- [x] Routing `(auth)/login`, `(dashboard)/*`

### Fase 2 — Auth & RBAC

- [x] AuthProvider; blok role `nasabah`; logout clear token
- [x] Login BI + error envelope; disable jika kosong
- [x] Redirect per role; sidebar filter; `canMutate`
- [x] 401 refresh → login; 403 toast tanpa stack
- [x] Pesan rate-limit + login gagal BI
- [x] `cursor-pointer` pada kontrol klikabel
- [x] Toast sukses/gagal envelope di form mutate

### Fase 3 — Operasional

- [x] `/transactions/add` multi-baris, min 1 kg, QR scan + lookup
- [x] `/transactions` riwayat + detail
- [x] `/pickups` tabs + approve/reject/assign/status
- [x] Setujui jemput hanya setelah petugas dipilih; dropdown tanpa HP
- [x] Filter petugas: sembunyikan `menunggu` & `ditolak`
- [x] `/balance` approve manual tanpa gateway
- [x] `/complaints` tindak lanjut wajib sebelum tutup; jenis Lainnya
- [x] Unit test `lib/*.test.ts`; skeleton/empty/error fondasi

### Fase 4 — Manajemen & stok

- [x] `/customers` CRUD, export CSV, badge HP belum verifikasi
- [x] `/staff` CRUD; PasswordInput show/hide
- [x] `/waste/categories` + price history
- [x] `/reward` tab pengajuan dulu → katalog
- [x] `/warehouse` + sales + partners CRUD

### Fase 5 — Monitoring & laporan

- [x] Dashboard overview + chart; widget per role (termasuk petugas)
- [x] `/reports` harian/mingguan/bulanan/tonase; ekspor CSV/Excel

### Fase 6 — Governance UI

- [x] `/settings`: institusi (jam TimeField, tanpa logo) + kebijakan + tentang
- [x] Pengumuman → `/announcements`; Audit → `/audit-log`
- [x] Role pemerintah: menu terbatas, write disabled, landing `/reports`
- [x] NIK tidak ditampilkan; lampiran KTP hanya di `/balance` status menunggu

### Fase 7 (sebagian)

- [x] Blokir login nasabah; role guard sidebar
- [x] Audit route, session expired, error boundary, double-submit, Vitest/RTL, E2E role & keamanan, a11y/offline

### Fase 9 (sebagian)

- [x] CRUD edukasi Markdown di `/education`
- [x] Form harga H-3 + preview pengumuman + banner terjadwal
- [x] Panel notifikasi lonceng
- [x] Alur jemput: Setujui → assign; tab Aktif `status__in`
