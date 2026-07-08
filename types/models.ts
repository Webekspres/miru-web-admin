export type UserRole =
  | 'nasabah'
  | 'petugas'
  | 'admin'
  | 'koordinator'
  | 'pemerintah'

export interface User {
  id: number
  username: string
  role: UserRole
  nama_lengkap: string
  nik?: string
  no_hp?: string
  alamat?: string
  saldo?: string
  poin?: number
  is_active: boolean
  date_joined?: string
  qr?: {
    id: number
    nama_lengkap: string
    no_hp?: string
  }
}

export interface WasteCategory {
  id: number
  nama: string
  harga_beli_per_kg: string
  stok_terkini_kg: string
}

export interface DepositDetail {
  id?: number
  kategori: number
  kategori_nama?: string
  berat_kg: string
  harga_saat_itu?: string
  subtotal?: string
}

export interface Deposit {
  id: number
  nasabah: number
  nasabah_nama?: string
  petugas: number | null
  petugas_nama?: string | null
  tanggal: string
  total_nilai: string
  status: string
  details?: DepositDetail[]
  poin_didapat?: number
  saldo_nasabah_baru?: string
  bukti_digital?: Record<string, unknown>
}

export type PickupStatus =
  | 'menunggu'
  | 'disetujui'
  | 'dijadwalkan'
  | 'dalam_perjalanan'
  | 'dijemput'
  | 'selesai'
  | 'ditolak'

export interface Pickup {
  id: number
  nasabah: number
  nasabah_nama?: string
  petugas: number | null
  petugas_nama?: string | null
  estimasi_berat: string
  alamat_jemput: string
  jadwal: string
  status: PickupStatus
  catatan?: string
  tanggal_pengajuan?: string
}

export type WithdrawalStatus = 'menunggu' | 'selesai' | 'ditolak'

export interface Withdrawal {
  id: number
  nasabah: number
  nasabah_nama?: string
  nominal: string
  metode: string
  status: WithdrawalStatus
  tanggal: string
  saldo_nasabah_baru?: string
}

export interface Reward {
  id: number
  nama: string
  poin_dibutuhkan: number
  stok: number
}

export type RewardRedemptionStatus = 'menunggu' | 'selesai'

export interface RewardRedemption {
  id: number
  nasabah: number
  nasabah_nama?: string
  reward: number
  reward_nama?: string
  poin_dibutuhkan?: number
  status: RewardRedemptionStatus
  tanggal: string
  poin_nasabah_baru?: number
  stok_reward_baru?: number
}

export interface Partner {
  id: number
  nama: string
  kontak: string
}

export interface PartnerSale {
  id: number
  mitra: number
  mitra_nama?: string
  kategori: number
  kategori_nama?: string
  berat_jual_kg: string
  harga_jual_per_kg: string
  total_penjualan: string
  tanggal: string
  stok_kategori_baru?: string
}

export type ComplaintType =
  | 'saldo_belum_masuk'
  | 'penjemputan_terlambat'
  | 'berat_tidak_sesuai'
  | 'harga_tidak_sesuai'
  | 'petugas_tidak_datang'
  | 'kesalahan_data'
  | 'bukti_tidak_muncul'

export type ComplaintStatus = 'terbuka' | 'ditutup'

export interface Complaint {
  id: number
  nasabah: number
  nasabah_nama?: string
  jenis_pengaduan: ComplaintType
  keluhan: string
  tindak_lanjut?: string
  status: ComplaintStatus
  tanggal: string
}

export interface InstitutionSettings {
  nama_institusi: string
  alamat: string
  kontak: string
  email: string
  logo_url?: string | null
  jam_operasional: string
  pengumuman: string
}

export interface Announcement {
  id: number
  judul: string
  isi: string
  aktif: boolean
  tanggal: string
}

export interface PriceHistory {
  id: number
  kategori: number
  harga_lama: string
  harga_baru: string
  tanggal_berlaku: string
  diubah_oleh: number | null
}
