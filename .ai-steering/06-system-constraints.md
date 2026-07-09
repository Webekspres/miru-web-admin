# 06 — System Constraints (Web Admin)

> **Referensi utama (backend):** repositori **miru-backend-api** — `.ai-steering/06-system-constraints.md`
>
> Dokumen ini fokus pada **implikasi UI/UX** di web admin.

## ⚠️ Batasan KERAS — Jangan Implementasikan

### 1. Pencairan Saldo — TANPA Payment Gateway
- **Jangan** tambahkan tombol "Bayar Sekarang", Midtrans, Xendit, atau transfer otomatis.
- Proses: Admin [Setujui] → bayar manual tunai/transfer → [Selesai].
- UI hanya mengubah status, bukan memproses pembayaran.

### 2. Penjemputan — TANPA GPS Live Tracking
- **Jangan** tambahkan peta real-time lokasi petugas.
- Status diperbarui **manual** oleh petugas via dropdown/tombol aksi.
- Cukup tampilkan alamat penjemputan sebagai teks.

### 3. Hardware — TANPA Integrasi Fisik
- **Jangan** asumsikan timbangan digital otomatis atau barcode scanner hardware.
- Berat diinput manual. QR nasabah via kamera HP (upload/scan).

### 4. TIDAK ADA Integrasi Dukcapil
- NIK field opsional, tanpa validasi ke database kependudukan.

### 5. Google Maps — Sederhana Saja
- Static map atau input alamat teks saja.
- **Jangan** navigasi real-time, distance matrix, geofencing.

### 6. Multi-Tenant
- Sistem untuk **satu** Bank Sampah Distrik Mimika Baru.
- **Jangan** desain multi-tenant / multi-organisasi.

---

## Role & Akses

| Role | Web Admin | Mobile |
|------|:---------:|:------:|
| Nasabah | ❌ | ✅ |
| Petugas | ✅ | ❌ |
| Admin | ✅ | ❌ |
| Koordinator | ✅ | ❌ |
| Pemerintah Distrik | ✅ (read-only) | ❌ |
| Mitra/Pengepul | ❌ (data only) | ❌ |

Detail matriks: `10-integration-and-roles.md`

### Tampilan Role-Based
- **Petugas** → landing `/transaksi/tambah`, sidebar terbatas
- **Admin** → sidebar lengkap
- **Koordinator** → read-only, no tombol edit/delete
- **Pemerintah** → dashboard + laporan saja

---

## Keamanan & Privasi UI

- Jangan tampilkan password, token, atau stack trace ke user
- Mask NIK di tabel (tampilkan partial: `****1234`)
- Logout clear semua token dari storage
- HTTPS wajib di production

---

## Jam Operasional

Senin–Sabtu, 08.00–17.00 WIT. Tampilkan banner info jika di luar jam layanan pada halaman operasional.

---

## Dependensi Backend

UI web admin **bergantung penuh** pada backend API. Jika endpoint belum tersedia (dashboard, reports), gunakan placeholder/mock dengan flag jelas — jangan hardcode sebagai data produksi.

Progress backend: **miru-backend-api** — `.ai-steering/08-task-list.md`
