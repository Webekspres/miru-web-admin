# 07 — Modules & Features (Web Admin)

## 17 Modul — Implementasi di Web Admin

| No | Modul | Halaman | Fitur Utama |
|----|-------|---------|-------------|
| 1 | **Manajemen Pengguna** | `/nasabah`, `/petugas` | CRUD nasabah/petugas, filter, search, edit role |
| 2 | **Autentikasi** | `/login` | Login form, JWT, role-based redirect |
| 3 | **Profil Nasabah** | `/nasabah/{id}` | Detail profil, riwayat transaksi, saldo, poin |
| 4 | **Edukasi Sampah** | `/edukasi` | CRUD artikel/panduan pemilahan (future) |
| 5 | **Katalog & Harga** | `/sampah/kategori` | CRUD kategori, edit harga, lihat stok |
| 6 | **Setor Langsung** | `/transaksi/tambah` | Multi-step form: pilih nasabah → pilih kategori → input berat → konfirmasi |
| 7 | **Penjemputan** | `/penjemputan` | Daftar permintaan, update status, assign petugas |
| 8 | **Penimbangan** | Bagian dari setoran | Input berat per kategori di form setoran |
| 9 | **Saldo & Riwayat** | `/nasabah/{id}` | Riwayat setoran, penarikan, penukaran per nasabah |
| 10 | **Penarikan Saldo** | `/saldo` | Daftar pengajuan, setujui/tolak |
| 11 | **Poin & Reward** | `/reward` | CRUD reward, daftar penukaran, setujui |
| 12 | **Stok Gudang** | `/gudang` | Tabel stok per kategori, riwayat mutasi stok |
| 13 | **Penjualan Mitra** | `/gudang/jual` | Form penjualan, daftar penjualan, CRUD mitra |
| 14 | **Pengaduan** | `/pengaduan` | Daftar pengaduan, detail, tindak lanjut, tutup |
| 15 | **Dashboard** | `/` (root) | Kartu statistik, grafik setoran, aktivitas terbaru |
| 16 | **Laporan** | `/laporan` | Filter tanggal, tabel rekap, tombol ekspor |
| 17 | **Pengaturan** | `/pengaturan` | Profil institusi, pengumuman, audit log viewer |

## Layout Dashboard

```
┌─────────────────────────────────────────────────────┐
│ Header: Logo MIRU | User info | Logout              │
├──────────┬──────────────────────────────────────────┤
│ Sidebar  │  Main Content Area                       │
│          │                                          │
│ 📊 Dash  │  (Halaman aktif ditampilkan di sini)     │
│ 👥 Nasabah│                                         │
│ 💰 Trans.│                                         │
│ 🚚 Jemput│                                         │
│ 🏦 Saldo │                                         │
│ 🎁 Reward│                                         │
│ 🏭 Gudang│                                         │
│ 📞 Pengaduan│                                       │
│ 📋 Laporan│                                         │
│ ⚙ Settings│                                         │
└──────────┴──────────────────────────────────────────┘
```

## Halaman Detail per Modul

### Dashboard (`/`)
- Kartu statistik: Total Nasabah, Total Setoran (hari ini/bulan ini), Sampah Terkumpul, Penjemputan Aktif
- Grafik setoran 7 hari terakhir (Chart.js atau Recharts)
- 5 transaksi terbaru
- 5 pengaduan terbuka

### Nasabah (`/nasabah`)
- Tabel: Nama, No HP, Alamat, Saldo, Poin, Status
- Search by nama/HP
- Filter by kelurahan
- Klik → detail nasabah (riwayat transaksi, saldo, poin)

### Transaksi (`/transaksi`)
- Tab: "Input Setoran" (form) | "Riwayat" (tabel)
- Tabel riwayat: Tanggal, Nasabah, Petugas, Total, Status
- Filter by tanggal, nasabah

### Penjemputan (`/penjemputan`)
- Tabel: Tanggal, Nasabah, Alamat, Status, Petugas
- Filter by status (tab: Menunggu, Disetujui, Selesai)
- Tombol aksi per baris sesuai status

### Laporan (`/laporan`)
- Filter: Jenis (Harian/Mingguan/Bulanan), Periode
- Tabel rekap
- Tombol: [Ekspor Excel] [Ekspor CSV]
