# 08 — Task List: Web Admin Development Roadmap

## Fase 1: Setup & Foundation

### 1.1 Project Setup (✅ Selesai)
- [x] Create Next.js project
- [x] Configure TypeScript (strict mode)
- [x] Configure Tailwind CSS v4
- [x] Configure ESLint
- [x] Setup folder structure

### 1.2 Core Infrastructure
- [ ] Install dependencies: SWR, lucide-react (icons), recharts (grafik), date-fns
- [ ] Create `lib/api.ts` — API client dengan JWT handling
- [ ] Create `types/index.ts` — TypeScript interfaces
- [ ] Create `providers/AuthProvider.tsx` — Auth context
- [ ] Create `components/layout/Sidebar.tsx` — Navigation sidebar
- [ ] Create `components/layout/Header.tsx` — Top header
- [ ] Create `components/layout/DashboardLayout.tsx` — Protected layout

## Fase 2: Auth & Layout

- [ ] Create `/login` page (username + password form)
- [ ] Implement login API call + token storage
- [ ] Implement role-based redirect (admin vs petugas vs koordinator)
- [ ] Create dashboard layout with sidebar + header
- [ ] Implement logout
- [ ] Handle 401 → redirect to login

## Fase 3: Modul Inti (MVP)

### 3.1 Dashboard
- [ ] Create dashboard overview page with stat cards
- [ ] Add grafik setoran (Recharts bar chart)
- [ ] Add aktivitas terbaru list
- [ ] Add pengaduan terbuka list

### 3.2 Manajemen Nasabah
- [ ] Create nasabah list page (table with search & filter)
- [ ] Create nasabah detail page (profil + riwayat transaksi)
- [ ] Create add nasabah form (by admin)
- [ ] Create edit nasabah form

### 3.3 Kategori & Harga Sampah
- [ ] Create kategori list page
- [ ] Create add/edit kategori form (with harga_beli_per_kg)
- [ ] Create harga history display (future)

### 3.4 Transaksi Setoran
- [ ] Create "Input Setoran" form with dynamic detail rows
- [ ] Implement search/select nasabah (dropdown dengan search)
- [ ] Implement dynamic category selection with auto price
- [ ] Implement auto-calculate subtotal & total
- [ ] Show confirmation before submit
- [ ] Create transaksi riwayat list (filterable by date/nasabah)

### 3.5 Penjemputan
- [ ] Create penjemputan list with status tabs (Menunggu, Aktif, Selesai, Ditolak)
- [ ] Implement status update actions (Setujui, Tolak, Tugaskan, dll)
- [ ] Create assign petugas modal/dropdown
- [ ] Implement filter by status

### 3.6 Penarikan Saldo
- [ ] Create daftar penarikan list
- [ ] Implement approve/reject actions
- [ ] Show saldo nasabah before approving

### 3.7 Poin & Reward
- [ ] Create reward katalog page (CRUD)
- [ ] Create daftar penukaran poin list
- [ ] Implement approve penukaran action

### 3.8 Stok Gudang & Penjualan Mitra
- [ ] Create stok gudang table (per kategori)
- [ ] Create mitra pengepul list (CRUD)
- [ ] Create form penjualan ke mitra (pilih mitra + kategori + berat + harga)
- [ ] Create daftar penjualan list

### 3.9 Pengaduan
- [ ] Create daftar pengaduan list (tab: Terbuka / Ditutup)
- [ ] Create pengaduan detail page/modal
- [ ] Implement tindak lanjut form + tutup pengaduan

### 3.10 Laporan
- [ ] Create laporan page with date filter
- [ ] Display tabel rekap (sesuai jenis laporan)
- [ ] Implement export to CSV/Excel

## Fase 4: Pengaturan & Polish

### 4.1 Pengaturan Sistem
- [ ] Create pengaturan institusi form (nama, alamat, kontak, logo)
- [ ] Create pengumuman editor
- [ ] Display audit log (read-only)

### 4.2 UX Polish
- [ ] Add loading skeletons for all pages
- [ ] Add empty states ("Belum ada data")
- [ ] Add error boundaries per page
- [ ] Add toast notifications for success/error actions
- [ ] Responsive design for mobile (petugas pakai HP)
- [ ] Dark mode (optional)

## Fase 5: Post-MVP

- [ ] Export laporan ke PDF
- [ ] Print-friendly laporan page
- [ ] Bulk import nasabah via Excel
- [ ] Notifikasi real-time (WebSocket) untuk penjemputan baru
- [ ] Activity log viewer dengan filter
