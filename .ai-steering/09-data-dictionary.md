# 09 — Data Dictionary & Reference Values (Web Admin)

> **Sumber:** Dokumen jawaban klien (2 Juli 2026), SOP Aplikasi MIRU Bank Sampah
>
> **Referensi data lengkap:** repositori **miru-backend-api** — `.ai-steering/09-data-dictionary.md`

---

## A. HARGA SAMPAH — Seed Data Awal

Data ini digunakan untuk **form input setoran** dan **tabel info harga** di web admin.

| Kategori | Harga Acuan (Rp/kg) | Contoh |
|----------|--------------------|--------|
| Plastik PET | **Rp3.000** | Botol air mineral |
| Gelas Plastik | **Rp4.000** | Gelas minuman |
| Kardus | **Rp1.500** | Kardus kemasan |
| Kertas Putih | **Rp2.000** | Kertas HVS, buku bekas |
| Aluminium | **Rp10.000** | Kaleng aluminium |
| Besi/Logam | **Rp3.000** | Besi tua, kaleng |
| Kaca | **Rp500** | Botol sirup/kecap |
| Minyak Jelantah | **Rp5.000/liter** | Minyak goreng bekas |

> ⚠️ Harga **WAJIB disesuaikan** pengepul lokal Timika. Perubahan harga diumumkan minimal 3 hari sebelum berlaku.

---

## B. ATURAN VALIDASI DI WEB ADMIN

### Form Input Setoran
| Field | Validasi |
|-------|----------|
| Nasabah | Wajib pilih dari daftar |
| Kategori | Wajib pilih, minimal 1 baris |
| Berat (kg) | **Min 1 kg**, angka positif |
| Harga | Auto dari database |
| Subtotal | Auto: berat × harga |

### Form Penjemputan (Update Status)
| Tombol Aksi | Muncul Saat Status | Validasi |
|------------|-------------------|----------|
| [Setujui] | menunggu | - |
| [Tolak] | menunggu | Wajib isi alasan |
| [Tugaskan Petugas] | disetujui | Pilih petugas dari dropdown |
| [Mulai Penjemputan] | dijadwalkan | - |
| [Sampai di Lokasi] | dalam_perjalanan | - |
| [Selesaikan Transaksi] | dijemput | Input berat aktual |

### Form Penarikan Saldo
| Field | Validasi |
|-------|----------|
| Nominal | **Min Rp50.000** |
| Saldo Nasabah | Harus >= nominal penarikan |
| Metode | Tunai (default), Transfer (future) |

### Form Penjualan ke Mitra
| Field | Validasi |
|-------|----------|
| Mitra | Wajib pilih dari daftar |
| Kategori | Wajib pilih |
| Berat Jual (kg) | **≤ stok_terkini_kg** |
| Harga Jual | Angka positif |

---

## C. KATALOG REWARD

| Reward | Poin | Setara Nilai |
|--------|------|-------------|
| Pulsa Rp10.000 | 100 poin | ±Rp10.000 |
| Bibit Tanaman | 50 poin | ±Rp5.000 |
| Sembako | 250 poin | ±Rp25.000 |
| Alat Kebersihan | 300 poin | ±Rp30.000 |

---

## D. ISIAN FORM LAPORAN

### Laporan Harian
- Jumlah transaksi setoran
- Total berat sampah per kategori
- Total nilai setoran (Rp)
- Jumlah penarikan saldo
- Jumlah penjemputan selesai

### Laporan Bulanan (Isi Lengkap)
| Komponen | Sumber Data |
|----------|-------------|
| Jumlah nasabah terdaftar | User (role=nasabah, is_active=true) |
| Jumlah nasabah aktif | User yang bertransaksi bulan ini |
| Total sampah terkumpul | DetailSetoran per periode |
| Total nilai ekonomi | TransaksiSetoran.total_nilai |
| Jumlah penjemputan | Penjemputan (status=selesai) |
| Jumlah saldo nasabah | SUM(User.saldo) |
| Jumlah reward diberikan | PenukaranPoin (status=selesai) |
| Wilayah RT/RW paling aktif | Dari alamat nasabah |
| Kendala lapangan | Input manual admin |
| Rekomendasi tindak lanjut | Input manual admin |

---

## E. JENIS PENGADUAN (untuk filter & pelaporan)

1. Saldo belum masuk
2. Jadwal penjemputan terlambat
3. Berat sampah tidak sesuai
4. Harga sampah tidak sesuai
5. Petugas tidak datang
6. Kesalahan data nasabah
7. Bukti transaksi tidak muncul

---

## F. STANDAR WAKTU (untuk SLA display di UI)

| Layanan | Standar Waktu |
|---------|---------------|
| Pendaftaran nasabah | Maksimal 1 hari kerja |
| Input setoran langsung | Hari yang sama |
| Konfirmasi penjemputan | Maksimal 1 hari kerja |
| Penarikan saldo | Maksimal 1–2 hari kerja |
| Pengaduan ringan | Maksimal 2 hari kerja |
