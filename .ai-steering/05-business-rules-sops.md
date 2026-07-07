# 05 — Business Rules & SOPs (Web Admin)

> **Referensi utama**: Detail lengkap ada di repositori **miru-backend-api** — `.ai-steering/05-business-rules-sops.md`
> **Data referensi**: Lihat `09-data-dictionary.md` untuk harga sampah, reward, standar waktu, jenis pengaduan.

## Ringkasan Aturan yang Wajib Dipatuhi di UI Web Admin

### 1. Transaksi Setoran
- Setoran minimal 1 kg per jenis sampah — validasi di form input.
- Petugas memilih nasabah dari daftar, pilih kategori, input berat.
- Sistem otomatis hitung subtotal dan total.
- Setelah submit: saldo, poin, dan stok otomatis berubah.

**Form Input Setoran:**
```
Nasabah: [select/search dropdown]
Details:
  - Kategori: [select] | Berat (kg): [input number >= 1] | Harga: [auto] | Subtotal: [auto]
  - Kategori: [select] | Berat (kg): [input number >= 1] | Harga: [auto] | Subtotal: [auto]
  [+] Tambah Baris
Total: Rp [auto-calculated]
[Simpan]
```

### 2. Penjemputan
- Status workflow: menunggu → disetujui → dijadwalkan → dalam_perjalanan → dijemput → selesai
- Tombol/tindakan yang muncul tergantung status saat ini.
- Minimal estimasi berat: 5 kg.

**UI Status Actions:**
| Status | Tombol Tindakan |
|--------|-----------------|
| menunggu | [Setujui] [Tolak] |
| disetujui | [Tugaskan Petugas] |
| dijadwalkan | [Mulai Penjemputan] |
| dalam_perjalanan | [Sampai di Lokasi] |
| dijemput | [Selesaikan Transaksi] |
| selesai | - (none) |
| ditolak | - (none) |

### 3. Penarikan Saldo
- Nominal minimal Rp50.000 — validasi di form.
- Admin bisa setujui atau tolak.
- Saat disetujui: saldo nasabah otomatis berkurang.
- Pencairan dilakukan MANUAL oleh admin (tunai/transfer) di luar sistem.

### 4. Penukaran Poin
- Admin lihat daftar pengajuan → verifikasi → serahkan reward → update status.
- Saat status 'selesai': poin nasabah dan stok reward berkurang otomatis.

### 5. Penjualan ke Mitra
- Admin pilih mitra, pilih kategori sampah, input berat jual, harga jual.
- Stok kategori harus cukup (validasi: stok_terkini_kg >= berat_jual_kg).
- Setelah submit: stok otomatis berkurang.

### 6. Pengaduan
- Admin lihat daftar pengaduan → baca keluhan → isi tindak lanjut → tutup.
- Target penyelesaian: 1-2 hari kerja.

### 7. Laporan
- Laporan harian, mingguan, bulanan.
- Data bisa diekspor ke CSV/Excel.
- Lihat `09-data-dictionary.md` bagian D untuk isian lengkap laporan

### 8. Penjualan ke Mitra
- Pilih mitra + kategori + berat jual
- Validasi stok_terkini_kg >= berat_jual_kg
- Setelah submit: stok otomatis berkurang

### 9. Standar Waktu Pelayanan (SLA)
- Pendaftaran nasabah: **Maksimal 1 hari kerja**
- Input setoran langsung: **Pada hari yang sama**
- Konfirmasi penjemputan: **Maksimal 1 hari kerja**
- Penarikan saldo: **Maksimal 1–2 hari kerja**
- Pengaduan ringan: **Maksimal 2 hari kerja**
- Tampilkan SLA ini di halaman masing-masing sebagai guidance

### 10. Indikator Keberhasilan (untuk Dashboard)
- Nasabah aktif: Meningkat setiap bulan
- Total sampah: Meningkat setiap bulan
- Penjemputan selesai: Meningkat sesuai permintaan
- Pengaduan terselesaikan: Minimal 90%

> Tampilkan indikator ini di dashboard sebagai target yang bisa dicapai
