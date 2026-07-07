# 08 — Task List: Web Admin Development Roadmap

> **Roadmap backend (dependensi):** repositori **miru-backend-api** — `.ai-steering/08-task-list.md`
>
> Web admin **tidak bisa** dikerjakan penuh tanpa endpoint backend yang stabil. Prioritas: auth + CRUD operasional dulu, dashboard/laporan menyusul Fase 4 backend.

---

## Ringkasan Fase

| Fase | Nama | Tujuan | Status |
|------|------|--------|--------|
| 0 | Scaffold | Next.js + TS + Tailwind setup | ✅ Selesai |
| 1 | Foundation | API client, auth, layout, types | 🔲 Berikutnya |
| 2 | Auth & RBAC | Login, role guard, sidebar per role | 🔲 |
| 3 | MVP Operasional | Setoran, penjemputan, penarikan, pengaduan | 🔲 |
| 4 | Manajemen & Stok | Nasabah CRUD, reward, gudang, mitra | 🔲 |
| 5 | Monitoring | Dashboard, laporan, ekspor *(butuh backend Fase 4)* | 🔲 |
| 6 | Polish & Production | UX, responsive, deploy | 🔲 |

---

## Dependensi Backend per Fase Web Admin

| Fase Web Admin | Backend Minimum |
|----------------|-----------------|
| Fase 1–2 | Fase 1 ✅ (auth, envelope, users, waste-categories) |
| Fase 3 | Fase 2–3 (business logic, workflow status) |
| Fase 4 | Fase 2–3 (CRUD lengkap) |
| Fase 5 | Fase 4 (dashboard, reports endpoints) |
| Role pemerintah | Fase 5 backend |

---

## Fase 0: Scaffold ✅ Selesai

- [x] Create Next.js 16 project
- [x] Configure TypeScript (strict mode)
- [x] Configure Tailwind CSS v4
- [x] Configure ESLint
- [x] Dokumentasi `.ai-steering/` selaras backend

## Fase 1: Foundation

### 1.1 Dependencies & Config
- [ ] Install: SWR, lucide-react, recharts, date-fns, (optional) react-hook-form + zod
- [ ] Setup `.env.local` dari `.env.example`
- [ ] Create `lib/config.ts` — `NEXT_PUBLIC_API_URL`
- [ ] Create `lib/api.ts` — JSON Envelope parser + JWT (lihat `04-api-integration.md`)
- [ ] Create `types/api.ts` — User, Envelope, model interfaces

### 1.2 Layout Shell
- [ ] Create `providers/AuthProvider.tsx`
- [ ] Create `components/layout/Sidebar.tsx` — role-based menu (`10-integration-and-roles.md`)
- [ ] Create `components/layout/Header.tsx`
- [ ] Create `app/(dashboard)/layout.tsx` — protected layout
- [ ] Create shared: LoadingSkeleton, EmptyState, ErrorMessage, Toast

## Fase 2: Auth & RBAC

- [ ] Create `app/(auth)/login/page.tsx`
- [ ] Implement login → `POST /api/auth/login/`
- [ ] Block login role `nasabah` dengan pesan jelas
- [ ] Role-based redirect (admin → `/`, petugas → `/transaksi/tambah`)
- [ ] Token refresh on 401
- [ ] Logout + clear storage
- [ ] Route middleware/guard by role

## Fase 3: MVP Operasional (Petugas + Admin)

### 3.1 Input Setoran
- [ ] Form multi-detail: nasabah, kategori, berat (min 1 kg)
- [ ] Auto-calculate subtotal & total
- [ ] `POST /api/deposits/`
- [ ] Riwayat setoran `GET /api/deposits/`

### 3.2 Penjemputan
- [ ] List dengan tab status
- [ ] `PATCH /api/pickups/{id}/` — workflow actions
- [ ] Assign petugas (planned backend field)

### 3.3 Penarikan Saldo
- [ ] List pengajuan `GET /api/withdrawals/?status=menunggu`
- [ ] Approve `PATCH` — **tanpa payment gateway**

### 3.4 Pengaduan
- [ ] List + detail + tindak lanjut
- [ ] `PATCH /api/complaints/{id}/`

## Fase 4: Manajemen & Stok (Admin)

### 4.1 Nasabah
- [ ] List `GET /api/users/?role=nasabah` + search
- [ ] Detail + riwayat transaksi
- [ ] Create/edit nasabah (admin)

### 4.2 Kategori & Harga
- [ ] CRUD ` /api/waste-categories/`

### 4.3 Reward & Poin
- [ ] CRUD `/api/rewards/`
- [ ] Approve `/api/reward-redemptions/`

### 4.4 Gudang & Mitra
- [ ] Stok table (dari `stok_terkini_kg` per kategori)
- [ ] CRUD `/api/partners/`
- [ ] Form `/api/partner-sales/`

## Fase 5: Monitoring *(Backend Fase 4)*

- [ ] Dashboard stat cards
- [ ] Grafik setoran (Recharts)
- [ ] Laporan harian/bulanan `GET /api/reports/*`
- [ ] Export CSV/Excel dari JSON

## Fase 6: Polish & Production

- [ ] Loading skeletons, empty states, error boundaries
- [ ] Responsive (petugas pakai HP)
- [ ] Pengaturan institusi + audit log *(backend Fase 5)*
- [ ] Deploy + HTTPS + CORS production config

---

## Referensi Dokumentasi

| Dokumen | Kegunaan |
|---------|----------|
| `04-api-integration.md` | API client & endpoints |
| `10-integration-and-roles.md` | Role, menu, alur integrasi |
| `07-modules-and-features.md` | Halaman per modul |
| `05-business-rules-sops.md` | Validasi form |

Repositori terkait: **miru-backend-api**, **mirumobileapp** (GitHub terpisah).
