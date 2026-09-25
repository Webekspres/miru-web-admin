import { redirect } from 'next/navigation'

/**
 * W7: hub sederhana — `/waste` mengarah ke katalog & harga kategori.
 * Tidak ada index `/waste` kosong; semua konten harga ada di /waste/categories.
 */
export default function WastePage() {
  redirect('/waste/categories')
}
