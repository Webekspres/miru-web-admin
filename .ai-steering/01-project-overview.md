# 01 — Project Overview (Web Admin)

## Latar Belakang

Distrik Mimika Baru membutuhkan panel web untuk mengelola operasional **MIRU Bank Sampah (Miru-G)** — setor sampah, saldo nasabah, penjemputan, stok gudang, dan laporan program.

> **"Sampah Bernilai, Lingkungan Bersih, Warga Sejahtera"**

Web admin adalah panel operasional staff. MVP selesai; kerja aktif = UAT/Production + **Fase 9 lanjutan** (dalam 17 modul).

## Posisi dalam Ekosistem

Ketiga proyek MIRU adalah **repositori GitHub terpisah**, terintegrasi via REST API:

```
mirumobileapp (Nasabah)          miru-web-admin (Staff) ← repo ini
        │                                  │
        └──────── JWT + JSON Envelope ─────┘
                         │
              miru-backend-api (Django REST API)
```

## Target Pengguna Web Admin

| Role | Deskripsi | Hak Akses Utama |
|------|-----------|-----------------|
| **Petugas Bank Sampah** | Pelaksana lapangan | Input setoran, timbang, verifikasi, update penjemputan |
| **Admin Aplikasi** | Pengelola utama | CRUD penuh: nasabah, harga, transaksi, stok, mitra, pengaduan, laporan, pengaturan |
| **Koordinator Program** | Pengawas program | Dashboard monitoring, laporan, overview (read-heavy) |
| **Pemerintah Distrik** | Pembina & evaluator | Dashboard & laporan **read-only** |

> **Nasabah** tidak punya akses web admin — gunakan aplikasi mobile di repositori **mirumobileapp**.
> **Mitra/Pengepul** tidak login — data mitra dikelola admin.

Detail permission matrix: **`10-integration-and-roles.md`**

## 3 Repositori Sistem (GitHub Terpisah)

| Repositori GitHub | Platform | Teknologi | Target Pengguna | Status |
|-------------------|----------|-----------|-----------------|--------|
| **miru-backend-api** | REST API | Django + DRF + PostgreSQL | Semua role (via API) | ✅ MVP selesai; Fase 7–8 aktif |
| **miru-web-admin** | Web App | Next.js + TypeScript + Tailwind | Admin, Petugas, Koordinator, Distrik | ✅ MVP selesai; UAT + Fase 9 |
| **mirumobileapp** | Mobile App | Flutter + Dart | Nasabah | ✅ MVP selesai; UAT + Fase 8 |

## Informasi Branding

| Item | Detail |
|------|--------|
| Nama Aplikasi | **MIRU Bank Sampah** (Miru-G) |
| Slogan | "Sampah Bernilai, Lingkungan Bersih, Warga Sejahtera" |
| Instansi | Kantor Distrik Mimika Baru, Kab. Mimika, Papua Tengah |
| Warna Tema | Hijau `#16a34a` + Putih |
| Bahasa UI | Bahasa Indonesia |

## Jam Layanan Operasional

| Hari | Jam | Zona Waktu |
|------|-----|-----------|
| Senin – Sabtu | **08.00 – 17.00** | **WIT** (UTC+9) |
| Minggu & Hari Libur | **Libur** | - |

Tampilkan indikator jam layanan di dashboard jika di luar jam operasional.

## Standar Integrasi dengan Backend

Web admin **wajib** mengikuti kontrak API di repositori **miru-backend-api**:

| Aspek | Standar | Referensi |
|-------|---------|-----------|
| Auth | `/api/auth/login/`, `/api/auth/refresh/`, `/api/auth/me/` | **miru-backend-api** — `.ai-steering/04-api-contracts-and-standards.md` |
| Response | JSON Envelope (`success`, `data`, `meta`) | §3 dokumen di atas |
| URL | English, kebab-case | `/api/waste-categories/`, `/api/deposits/` |
| Field | `snake_case` | Sesuai serializer Django |

## Referensi Dokumen Terkait

| Topik | File |
|-------|------|
| Kontrak API lengkap | **miru-backend-api** — `.ai-steering/04-api-contracts-and-standards.md` |
| Business rules & SOP | `05-business-rules-sops.md` (ringkasan) → **miru-backend-api** §05 (lengkap) |
| System constraints | `06-system-constraints.md` |
| Role & menu matrix | `10-integration-and-roles.md` |
| Modul & halaman | `07-modules-and-features.md` |
| Roadmap | `08-task-list.md` |
| Data dictionary | `09-data-dictionary.md` → **miru-backend-api** §09 (lengkap) |
