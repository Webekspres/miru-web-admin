# 10 — Integration & Roles (Web Admin)

> Dokumen ini mendefinisikan **role yang relevan untuk web admin**, **matriks permission**, **menu navigasi**, dan **alur integrasi** dengan backend & mobile app.
>
> **Referensi backend:** repositori **miru-backend-api** — `.ai-steering/01-project-overview.md` §6 Role Pengguna

---

## 1. Role di Web Admin

Web admin melayani **4 role dengan login**. Nasabah dan mitra **tidak** login ke web admin.

| Role | Kode API (`user.role`) | Login Web Admin | Aplikasi |
|------|------------------------|-----------------|----------|
| Admin Aplikasi | `admin` | ✅ | Web Admin |
| Petugas Bank Sampah | `petugas` | ✅ | Web Admin |
| Koordinator Program | `koordinator` | ✅ | Web Admin |
| Pemerintah Distrik | `pemerintah` | ✅ *(planned backend)* | Web Admin |
| Nasabah | `nasabah` | ❌ Ditolak | Mobile App |
| Mitra/Pengepul | — | ❌ Tidak punya akun | — |

### Login Guard

Saat login, cek `data.user.role`:

```typescript
const WEB_ADMIN_ROLES = ['admin', 'petugas', 'koordinator', 'pemerintah'] as const

if (!WEB_ADMIN_ROLES.includes(user.role)) {
  throw new Error('Akun nasabah hanya dapat login melalui aplikasi mobile MIRU.')
}
```

---

## 2. Matriks Permission per Role

Legenda: ✅ Full | 👁 Read-only | ✏️ Create/Update | ❌ Tidak ada akses

| Modul / Fitur | Admin | Petugas | Koordinator | Pemerintah |
|---------------|:-----:|:-------:|:-----------:|:----------:|
| Dashboard overview | ✅ | 👁 | 👁 | 👁 |
| Manajemen nasabah (CRUD) | ✅ | 👁 | 👁 | ❌ |
| Manajemen petugas/staff | ✅ | ❌ | 👁 | ❌ |
| Kategori & harga sampah | ✅ | 👁 | ✏️ | ❌ |
| Input setoran | ✅ | ✏️ | ❌ | ❌ |
| Riwayat transaksi (semua) | ✅ | 👁 | 👁 | 👁 |
| Penjemputan (update status) | ✅ | ✏️ | 👁 | ❌ |
| Penarikan saldo (approve) | ✅ | ❌ | 👁 | ❌ |
| Reward katalog (CRUD) | ✅ | ❌ | 👁 | ❌ |
| Penukaran poin (approve) | ✅ | ❌ | 👁 | ❌ |
| Stok gudang | ✅ | 👁 | 👁 | 👁 |
| Mitra & penjualan | ✅ | ❌ | 👁 | ❌ |
| Pengaduan (tindak lanjut) | ✅ | 👁 | 👁 | ❌ |
| Laporan & ekspor | ✅ | 👁* | 👁 | 👁 |
| Pengaturan sistem | ✅ | ❌ | ❌ | ❌ |
| Audit log | ✅ | ❌ | 👁 | ❌ |

\* Petugas: laporan harian operasional sendiri (planned).

---

## 3. Menu Sidebar per Role

### Admin — Menu Lengkap

```
📊 Dashboard
👥 Nasabah
👤 Petugas & Staff
💰 Transaksi Setoran
🚚 Penjemputan
🏦 Penarikan Saldo
🎁 Reward & Poin
🏭 Gudang & Mitra
📞 Pengaduan
📋 Laporan
⚙️ Pengaturan
```

### Petugas — Menu Terbatas

```
📊 Dashboard (ringkas)
💰 Input Setoran        ← prominent / default landing
🚚 Penjemputan
👥 Nasabah (read-only)
📋 Laporan Harian Saya
```

### Koordinator — Monitoring

```
📊 Dashboard
👥 Nasabah (read-only)
💰 Transaksi (read-only)
🚚 Penjemputan (read-only)
🏦 Penarikan (read-only)
🎁 Reward (read-only)
🏭 Gudang (read-only)
📞 Pengaduan (read-only)
📋 Laporan
```

### Pemerintah Distrik — Evaluasi

```
📊 Dashboard
📋 Laporan
🏭 Ringkasan Stok (read-only)
```

---

## 4. Redirect Setelah Login

| Role | Landing Page |
|------|--------------|
| `admin` | `/` (dashboard penuh) |
| `koordinator` | `/` (dashboard monitoring) |
| `pemerintah` | `/laporan` |
| `petugas` | `/transaksi/tambah` (input setoran) |

---

## 5. Alur Integrasi End-to-End

### 5.1 Setoran Sampah (Petugas → Backend → Mobile)

```
[Nasabah bawa sampah ke bank]
        ↓
[Petugas: Web Admin → Input Setoran]
  POST /api/deposits/ { nasabah, details[] }
        ↓
[Backend: update saldo, poin, stok — atomic]
        ↓
[Nasabah: Mobile → Riwayat / Dashboard refresh]
  GET /api/auth/me/ + GET /api/deposits/?nasabah={id}
```

### 5.2 Penjemputan (Mobile → Web Admin → Backend)

```
[Nasabah: Mobile → Ajukan Penjemputan]
  POST /api/pickups/
        ↓
[Petugas/Admin: Web Admin → Lihat daftar menunggu]
  GET /api/pickups/?status=menunggu
        ↓
[Petugas: Update status workflow]
  PATCH /api/pickups/{id}/ { status: 'disetujui' | 'dijadwalkan' | ... }
        ↓
[Nasabah: Mobile → Cek status]
  GET /api/pickups/?nasabah={id}
```

Status workflow: `menunggu` → `disetujui` → `dijadwalkan` → `dalam_perjalanan` → `dijemput` → `selesai` | `ditolak`

### 5.3 Penarikan Saldo (Mobile → Admin → Manual)

```
[Nasabah: Mobile → Ajukan Penarikan min Rp50.000]
  POST /api/withdrawals/
        ↓
[Admin: Web Admin → Approve]
  PATCH /api/withdrawals/{id}/ { status: 'selesai' }
        ↓
[Backend: kurangi saldo nasabah]
        ↓
[Admin: Bayar TUNAI/transfer MANUAL di luar sistem]
        ↓
[Nasabah: Mobile → Lihat status selesai]
```

> ⚠️ **Tidak ada payment gateway** — lihat `06-system-constraints.md`

### 5.4 QR Code Nasabah (Mobile → Petugas)

```
[Nasabah: Mobile → QR Code Screen]
  Encode: { id, nama_lengkap, no_hp }
        ↓
[Petugas: Scan QR / cari nasabah di web admin]
  GET /api/users/{id}/
        ↓
[Petugas: Input setoran untuk nasabah tersebut]
```

---

## 6. Permission API vs UI

Frontend **wajib** enforce permission di UI (hide menu/tombol), tetapi backend tetap menjadi **otoritas final** (return 403 jika unauthorized).

Mapping permission backend (implementasi saat ini):

| Permission Class | Role |
|------------------|------|
| `IsAdmin` | admin |
| `IsAdminOrKoordinator` | admin, koordinator |
| `IsPetugasOrAdmin` | petugas, admin, koordinator |
| `IsOwnerOrAdmin` | owner (nasabah) + staff |
| `IsUserOwnerOrAdmin` | user object-level |

Detail endpoint: **miru-backend-api** — `.ai-steering/04-api-contracts-and-standards.md` §6

---

## 7. Dependensi Backend (Endpoint Status)

| Endpoint | Status Backend | Dampak Web Admin |
|----------|----------------|------------------|
| Auth (`/api/auth/*`) | ✅ Implemented | Login siap |
| Users, waste-categories | ✅ Implemented | CRUD dasar siap |
| deposits, pickups, withdrawals | ✅ CRUD dasar | Perlu UI + business workflow |
| rewards, complaints, partners | ✅ CRUD dasar | Perlu UI |
| `/api/dashboard/` | 🔲 Planned (Fase 4) | Dashboard mock data dulu |
| `/api/reports/` | 🔲 Planned (Fase 4) | Laporan mock data dulu |
| Role `pemerintah` | 🔲 Planned (Fase 5) | Siapkan UI read-only |

Ikuti progress backend: **miru-backend-api** — `.ai-steering/08-task-list.md`

---

## 8. Diagram Arsitektur Integrasi

```
┌──────────────────────────────────────────────────────────────┐
│                      WEB ADMIN (Next.js)                      │
│  ┌─────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │  Login  │→ │ AuthProvider │→ │ Role-based Layout/Menu  │ │
│  └─────────┘  └──────────────┘  └─────────────────────────┘ │
│         │              │                      │                 │
│         └──────────────┴──────────────────────┘                 │
│                        │ lib/api.ts (JSON Envelope)            │
└────────────────────────┼───────────────────────────────────────┘
                         │ HTTPS + JWT
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   BACKEND (Django REST API)                   │
│  Auth │ Users │ Deposits │ Pickups │ Withdrawals │ ...       │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                  MOBILE APP (Flutter — Nasabah)               │
│  Register │ Pickups │ Withdrawals │ Rewards │ Complaints       │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. Checklist Implementasi Role-Based UI

- [ ] `AuthProvider` simpan `user.role`
- [ ] Middleware/guard route berdasarkan role
- [ ] Sidebar filter menu by role
- [ ] Tombol aksi (approve, delete) conditional by role
- [ ] Block login nasabah dengan pesan jelas
- [ ] Redirect landing page per role
- [ ] Handle 403 dari API dengan toast informatif
