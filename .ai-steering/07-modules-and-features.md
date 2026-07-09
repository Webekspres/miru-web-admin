# 07 — Modules & Features (Web Admin)

## 17 Modul — Implementasi di Web Admin

| No | Modul | Halaman | Fitur Utama |
|----|-------|---------|-------------|
| 1 | **Manajemen Pengguna** | `/customers`, `/staff` | CRUD nasabah/petugas, filter, search, edit role |
| 2 | **Autentikasi** | `/login` | Login form, JWT, role-based redirect |
| 3 | **Profil Nasabah** | `/customers/{id}` | Detail profil, riwayat transaksi, saldo, poin |
| 4 | **Edukasi Sampah** | `/education` | CRUD artikel/panduan pemilahan (future) |
| 5 | **Katalog & Harga** | `/waste/categories` | CRUD kategori, edit harga, lihat stok |
| 6 | **Setor Langsung** | `/transactions/add` | Multi-step form: pilih nasabah → pilih kategori → input berat → konfirmasi |
| 7 | **Penjemputan** | `/pickups` | Daftar permintaan, update status, assign petugas |
| 8 | **Penimbangan** | Bagian dari setoran | Input berat per kategori di form setoran |
| 9 | **Saldo & Riwayat** | `/customers/{id}` | Riwayat setoran, penarikan, penukaran per nasabah |
| 10 | **Penarikan Saldo** | `/balance` | Daftar pengajuan, setujui/tolak |
| 11 | **Poin & Reward** | `/reward` | CRUD reward, daftar penukaran, setujui |
| 12 | **Stok Gudang** | `/warehouse` | Tabel stok per kategori, riwayat mutasi stok |
| 13 | **Penjualan Mitra** | `/warehouse/sales` | Form penjualan, daftar penjualan, CRUD mitra |
| 14 | **Pengaduan** | `/complaints` | Daftar pengaduan, detail, tindak lanjut, tutup |
| 15 | **Dashboard** | `/` (root) | Kartu statistik, grafik setoran, aktivitas terbaru |
| 16 | **Laporan** | `/reports` | Filter tanggal, tabel rekap, tombol ekspor |
| 17 | **Pengaturan** | `/settings` | Profil institusi, pengumuman, audit log viewer |

## Layout Dashboard

```
┌─────────────────────────────────────────────────────┐
│ Header: Logo MIRU | User info | Logout              │
├──────────┬──────────────────────────────────────────┤
│ Sidebar  │  Main Content Area                       │
│          │                                          │
│ 📊 Dash  │  (Halaman aktif ditampilkan di sini)     │
│ 👥 Nasabah  │                                         │
│ 💰 Trans.   │                                         │
│ 🚚 Jemput   │                                         │
│ 🏦 Saldo    │                                         │
│ 🎁 Reward   │                                         │
│ 🏭 Gudang   │                                         │
│ 📞 Pengaduan│                                         │
│ 📋 Laporan  │                                         │
│ ⚙ Settings  │                                         │
└──────────┴──────────────────────────────────────────┘
```

## Halaman Detail per Modul

### Dashboard (`/`)
- Kartu statistik: Total Nasabah, Total Setoran (hari ini/bulan ini), Sampah Terkumpul, Penjemputan Aktif
- Grafik setoran 7 hari terakhir (Chart.js atau Recharts)
- 5 transaksi terbaru
- 5 pengaduan terbuka

### Nasabah (`/customers`)
- Tabel: Nama, No HP, Alamat, Saldo, Poin, Status
- Search by nama/HP
- Filter by kelurahan
- Klik → detail nasabah (riwayat transaksi, saldo, poin)

### Transaksi (`/transactions`)
- Tab: "Input Setoran" (form) | "Riwayat" (tabel)
- Tabel riwayat: Tanggal, Nasabah, Petugas, Total, Status
- Filter by tanggal, nasabah

### Penjemputan (`/pickups`)
- Tabel: Tanggal, Nasabah, Alamat, Status, Petugas
- Filter by status (tab: Menunggu, Disetujui, Selesai)
- Tombol aksi per baris sesuai status

### Laporan (`/reports`)
- Filter: Jenis (Harian/Mingguan/Bulanan), Periode
- Tabel rekap
- Tombol: [Ekspor Excel] [Ekspor CSV]
