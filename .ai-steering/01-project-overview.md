# 01 — Project Overview (Web Admin)

Proyek ini adalah **Panel Admin Web** untuk **MIRU Bank Sampah (Miru-G)** — sistem pengelolaan Bank Sampah digital untuk Distrik Mimika Baru.

## Target Pengguna Web Admin

| Role | Halaman yang Diakses |
|------|---------------------|
| **Petugas Bank Sampah** | Input setoran, penjemputan, timbang sampah |
| **Admin Aplikasi** | Semua halaman: nasabah, transaksi, harga, stok, mitra, laporan, pengaturan |
| **Koordinator Program** | Dashboard monitoring, laporan, overview |
| **Pemerintah Distrik** | Dashboard, laporan (read-only) |

> **Nasabah** tidak punya akses ke web admin — mereka menggunakan aplikasi mobile Flutter.

## Informasi Branding
- Nama Aplikasi: **MIRU Bank Sampah** (Miru-G)
- Slogan: "Sampah Bernilai, Lingkungan Bersih, Warga Sejahtera"
- Instansi: Kantor Distrik Mimika Baru, Kab. Mimika, Papua Tengah
- Warna Tema: Hijau (#16a34a) + Putih — merepresentasikan lingkungan bersih

## Referensi ke Backend
Untuk detail bisnis rules, system constraints, dan data flow, lihat file yang sama di `miru-backend-api/.ai-steering/`:
- `05-business-rules-sops.md` — Logika bisnis
- `06-system-constraints.md` — Batasan sistem
