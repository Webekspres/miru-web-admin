# 11 — Security & Privacy (Web Admin)

> Pedoman keamanan & privasi untuk **miru-web-admin** (Next.js).
> **Sumber kanonik ekosistem:** repositori backend → `.ai-steering/11-security-and-privacy.md`
>
> Dokumen ini menjabarkan kontrol yang **wajib diterapkan di UI/client staff**.
>
> **Referensi lokal:** `06-system-constraints.md`, `10-integration-and-roles.md`, `04-api-integration.md`  
> **Task:** `08-task-list.md` (Fase 7–8 + checklist keamanan)

---

## 1. Ruang Lingkup

Web admin melayani **staff saja**: `admin`, `petugas`, `koordinator`, `pemerintah`.

| Wajib | Dilarang |
|-------|----------|
| Blokir login `nasabah` | Login/register nasabah di web |
| HTTPS production | Payment gateway / “Bayar Sekarang” |
| Sembunyikan token dari UI | GPS live tracking petugas |
| Mask KTP | Expose stack trace / raw API error ke user awam |
| Role-based menu & `canMutate` | Mengandalkan hide-button saja tanpa backend enforce |

Server tetap sumber kebenaran otorisasi. UI hanya *defense in depth*.

---

## 2. Autentikasi & Penyimpanan Token

| Aturan | Detail |
|--------|--------|
| Login | `POST /api/auth/login/` — cek `role` ∈ web-admin roles |
| Tolak nasabah | Pesan: gunakan aplikasi mobile MIRU |
| Token storage | Preferensi: httpOnly cookie via route handler **atau** storage yang sudah dipakai proyek — dokumentasikan pilihan; jangan expose di URL/query |
| Restore session | `GET /api/auth/me/` on mount |
| Refresh | Pada 401: coba refresh sekali → jika gagal, logout + `/login` |
| Logout | Hapus **semua** access + refresh token + role cookie/state |
| Jangan | Simpan password; log token; tampilkan JWT di UI |

### Session security UX

- [ ] Idle / expired → redirect login dengan pesan jelas
- [ ] 403 → toast “Anda tidak memiliki akses” (tanpa detail internal)
- [ ] Double-submit prevention pada aksi saldo (setoran approve penarikan, dll.)

---

## 3. Otorisasi di Client (RBAC UI)

Selaras `10-integration-and-roles.md` dan backend permissions:

| Role | Landing | Mutasi data |
|------|---------|-------------|
| Admin | Dashboard | ✅ Full (sesuai menu) |
| Petugas | Input setoran | ✅ Operasional terbatas |
| Koordinator | Dashboard | ❌ Read-only (`canMutate=false`) |
| Pemerintah | `/reports` | ❌ Read-only; menu terbatas |

### Checklist UI

- [x] Sidebar filter by role
- [x] Hide/disable tombol edit/delete untuk role read-only
- [ ] Audit berkala: tidak ada route “tersembunyi” yang tetap callable tanpa guard
- [ ] Guard layout/`proxy` cek role vs path (defense in depth)

**Ingat:** menyembunyikan tombol ≠ keamanan. Backend wajib menolak.

---

## 4. Perlindungan Data di UI (PDP)

| Data | Perilaku UI |
|------|-------------|
| NIK | **Tidak dikumpulkan** — jangan tambah field NIK di form/tabel |
| Foto KTP | Hanya tombol lihat di alur penarikan besar (status menunggu); jangan tampil di list nasabah |
| No HP / alamat | Hanya di layar yang relevan; batasi di export jika tidak perlu |
| Password | Tidak pernah di response; field form `type=password` |
| Token / secret | Tidak di React state yang di-render debug |
| Export CSV/Excel | Hanya role berwenang; waspadai isi PII di file unduhan |

### Consent & privasi

- Staff memahami data untuk operasional bank sampah saja
- Jangan screenshot/bagi data nasabah ke kanal tidak resmi
- Link kebijakan privasi tersedia untuk referensi internal bila diminta

---

## 5. Komunikasi ke API

| Aturan | Detail |
|--------|--------|
| Base URL | `NEXT_PUBLIC_API_URL` — production **HTTPS only** |
| Envelope | Parse error tanpa melempar body mentah ke console production |
| Auth header | Bearer access token otomatis dari API client |
| CSRF | Ikuti pola Next/backend bila cookie session dipakai; jika pure Bearer JWT, tetap amankan cookie role |
| Tidak ada hardcoded API key front | Semua secret server-side / env build yang tepat |

### CORS

Deploy web-admin hanya di origin yang di-whitelist backend (lihat backend `11` §5.3).

---

## 6. Keamanan Operasional Fitur Sensitif

| Fitur | Kontrol UI |
|-------|------------|
| Approve penarikan | Konfirmasi eksplisit; sebutkan pembayaran **manual di luar sistem** |
| Setoran | Konfirmasi sebelum submit; tampilkan total; jangan optimistic saldo |
| Ubah harga | Post-MVP: tampilkan `tanggal_berlaku` H-3; jangan apply senyap |
| Audit log | Read-only; filter; tidak bisa hapus dari UI |
| Bulk import | Validasi file; tampilkan error per baris; batasi ukuran |
| Pengaturan institusi | Admin only |

---

## 7. Frontend Hardening (Production)

| Kontrol | Status target |
|---------|----------------|
| `next build` tanpa secret di bundle (kecuali `NEXT_PUBLIC_*` yang memang publik) | Fase 8 |
| HTTPS | Wajib |
| Tidak kirim source map publik berisi path internal sensitif (evaluasi) | Production |
| Error boundary — jangan render stack ke user | Fase 7 |
| Dependency audit sebelum release | Rutin |
| CSP / security headers (Nginx atau Next headers) | Recommended production |

Contoh arah headers (Nginx/Next — sesuaikan):

- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY` (atau CSP frame-ancestors)

---

## 8. Logging Client

- Development: boleh log envelope error (tanpa token)
- Production: minimal; **jangan** `console.log` token, KTP, atau body penarikan penuh
- Laporkan crash ke Sentry **hanya jika** diaktifkan lintas proyek dan sudah di-scrub

---

## 9. Checklist Go-Live Keamanan (Web Admin)

### Wajib

- [ ] HTTPS + API URL HTTPS
- [ ] CORS backend whitelist domain admin
- [ ] Logout membersihkan semua credential client
- [ ] Role guard: nasabah ditolak; pemerintah/koordinator tidak bisa mutate via UI
- [ ] Tidak ada password/token di UI atau URL
- [ ] Session expired → login
- [ ] Error boundary tanpa stack trace user-facing
- [ ] Double-submit guard pada transaksi keuangan

### Selaras Backend Fase 8

- [x] Alur lihat lampiran KTP hanya untuk penarikan besar (status menunggu)
- [ ] Unduh PDF bukti hanya untuk user berwenang
- [ ] Panel notifikasi tidak menampilkan PII berlebih

---

## 10. Mapping Task List

| Item keamanan | Fase di `08-task-list.md` |
|---------------|---------------------------|
| Error boundary, session, double-submit | Fase 7 |
| HTTPS, CORS, deploy | Fase 8 |
| KTP, PDF, bulk import aman | Fase 9 |
| Out of scope gateway/GPS | § Out of Scope |

---

## 11. Aturan untuk AI / Engineer

1. Jangan menambah flow yang menyimpan password atau token di `localStorage` tanpa review keamanan.  
2. Setiap halaman baru: tentukan role yang boleh akses + read-only vs mutate.  
3. Jangan bypass `canMutate` / route guard.  
4. Jangan tampilkan data sensitif di toast/URL.  
5. Patuhi kanonik backend `11-security-and-privacy.md`.
