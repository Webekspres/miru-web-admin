# 06 — System Constraints (Web Admin)

## ⚠️ Batasan yang WAJIB Dipatuhi di UI

### 1. Pencairan Saldo — TANPA Payment Gateway
- **Jangan tambahkan** tombol "Bayar Sekarang" atau "Transfer Otomatis".
- Proses: Admin setujui → Admin bayar manual (tunai/transfer) → Admin konfirmasi selesai.
- UI hanya perlu: [Setujui] dan [Selesai] — tidak ada pemrosesan pembayaran.

### 2. Penjemputan — TANPA GPS Tracking
- **Jangan tambahkan** peta interaktif dengan lokasi real-time petugas.
- Status diperbarui MANUAL oleh petugas.
- Cukup tampilkan alamat penjemputan (text).

### 3. Hardware — TANPA Integrasi Fisik
- **Jangan** asumsikan ada timbangan digital otomatis atau barcode scanner.
- Berat diinput manual oleh petugas.
- QR Code untuk ID nasabah bisa discan via kamera (file upload atau kamera HP).

### 4. Multi-Role Access
- Nasabah → TIDAK bisa login ke web admin.
- Petugas → hanya bisa lihat halaman: transaksi (input), penjemputan, nasabah (read-only).
- Admin → akses penuh ke semua halaman.
- Koordinator → dashboard + laporan (read-only, tidak bisa edit data).
- Distrik → dashboard + laporan (read-only).

### 5. Tampilan Role-Based
Setiap halaman harus menyesuaikan tampilan berdasarkan role:
- Petugas → tombol "Input Setoran" besar, sidebar terbatas.
- Admin → sidebar lengkap dengan semua menu.
- Koordinator/Distrik → hanya Dashboard dan Laporan.
