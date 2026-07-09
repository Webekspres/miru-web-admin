# Graph Report - web-admin  (2026-07-09)

## Corpus Check
- 109 files · ~42,153 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 710 nodes · 1608 edges · 37 communities (30 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e6ba1068`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 38 edges
2. `useAuth()` - 32 edges
3. `useToast()` - 28 edges
4. `formatRupiah()` - 26 edges
5. `Button` - 24 edges
6. `Card()` - 21 edges
7. `api` - 21 edges
8. `formatWeightKg()` - 20 edges
9. `canMutate()` - 20 edges
10. `ErrorMessage()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `SetujuiModal()` --calls--> `formatRupiah()`  [EXTRACTED]
  components/balance/WithdrawalManagement.tsx → lib/format.ts
- `LoginForm()` --calls--> `useAuth()`  [EXTRACTED]
  components/auth/LoginForm.tsx → providers/AuthProvider.tsx
- `LoginSessionSync()` --calls--> `useAuth()`  [EXTRACTED]
  components/auth/LoginSessionSync.tsx → providers/AuthProvider.tsx
- `DetailPengaduanModal()` --calls--> `formatDateWIT()`  [EXTRACTED]
  components/complaints/ComplaintManagement.tsx → lib/format.ts
- `CustomerDetail()` --calls--> `formatRupiah()`  [EXTRACTED]
  components/customers/CustomerDetail.tsx → lib/format.ts

## Import Cycles
- None detected.

## Communities (37 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (30): geistMono, geistSans, metadata, CanWrite(), CanWriteProps, useCanWrite(), SetujuiModal(), TabDefinition (+22 more)

### Community 1 - "Community 1"
Cohesion: 0.21
Nodes (4): DashboardClient(), ModulePlaceholder(), ModulePlaceholderProps, RewardManagement()

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (47): 08 — Task List: Web Admin Development Roadmap, 0.1 Project Setup ✅, 1.1 Dependencies & Environment, 1.2 API Client & Types (Modul 2 — infrastruktur), 1.3 Layout Shell & Shared UI, 1.4 Routing Structure, 2.1 Auth Provider, 2.2 Login Page (+39 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (19): 10 — Integration & Roles (Web Admin), 1. Role di Web Admin, 2. Matriks Permission per Role, 3. Menu Sidebar per Role, 4. Redirect Setelah Login, 5.1 Setoran Sampah (Petugas → Backend → Mobile), 5.2 Penjemputan (Mobile → Web Admin → Backend), 5.3 Penarikan Saldo (Mobile → Admin → Manual) (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (34): dependencies, date-fns, @hookform/resolvers, lucide-react, next, react, react-dom, react-hook-form (+26 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (17): 1. Environment Variables, 2. Install & Run, 3. Login dengan Akun Demo, Autentikasi, Branding, Dokumentasi Proyek, Endpoint Utama (English routes), Format Response — JSON Envelope (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (16): 04 — API Integration (Web Admin), 10. CORS & Production, 1. Base Configuration, 2. JSON Envelope — WAJIB Dipahami, 3.1 Login Flow, 3.2 Token Refresh, 3.3 Profil Login, 3.4 Header Standar (+8 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (13): 03 — State Management & Data Flow (Web Admin), 1. Server State (Data dari API), 2. Auth State (Global), 3. UI State (Lokal), 4. Form Management, API Client, Data Fetching Pattern, Pagination Pattern (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (13): 06 — System Constraints (Web Admin), 1. Pencairan Saldo — TANPA Payment Gateway, 2. Penjemputan — TANPA GPS Live Tracking, 3. Hardware — TANPA Integrasi Fisik, 4. TIDAK ADA Integrasi Dukcapil, 5. Google Maps — Sederhana Saja, 6. Multi-Tenant, ⚠️ Batasan KERAS — Jangan Implementasikan (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (13): 09 — Data Dictionary & Reference Values (Web Admin), A. HARGA SAMPAH — Seed Data Awal, B. ATURAN VALIDASI DI WEB ADMIN, C. KATALOG REWARD, D. ISIAN FORM LAPORAN, E. JENIS PENGADUAN (untuk filter & pelaporan), F. STANDAR WAKTU (untuk SLA display di UI), Form Input Setoran (+5 more)

### Community 11 - "Community 11"
Cohesion: 0.15
Nodes (12): 05 — Business Rules & SOPs (Web Admin), 10. Indikator Keberhasilan (untuk Dashboard), 1. Transaksi Setoran, 2. Penjemputan, 3. Penarikan Saldo, 4. Penukaran Poin, 5. Penjualan ke Mitra, 6. Pengaduan (+4 more)

### Community 12 - "Community 12"
Cohesion: 0.17
Nodes (11): 00 — System Prompt & Clean Code Rules (Web Admin), 1. Struktur Folder, 2. Komponen, 3. State Management, 4. Styling, 5. TypeScript, 6. Data Fetching, 7. Error Handling (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.05
Nodes (86): COMPLAINT_TYPE_LABELS, TabDefinition, TabKey, TABS, CustomerFormData, CustomerFormProps, FormErrors, CustomerRow (+78 more)

### Community 14 - "Community 14"
Cohesion: 0.20
Nodes (9): 01 — Project Overview (Web Admin), 3 Repositori Sistem (GitHub Terpisah), Informasi Branding, Jam Layanan Operasional, Latar Belakang, Posisi dalam Ekosistem, Referensi Dokumen Terkait, Standar Integrasi dengan Backend (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.20
Nodes (9): 07 — Modules & Features (Web Admin), 17 Modul — Implementasi di Web Admin, Dashboard (`/`), Halaman Detail per Modul, Laporan (`/reports`), Layout Dashboard, Nasabah (`/customers`), Penjemputan (`/pickups`) (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.29
Nodes (6): 02 — Architecture & Stack (Web Admin), Alur Data, Arsitektur, Environment Variables, Struktur Folder yang Diharapkan, Tech Stack

### Community 17 - "Community 17"
Cohesion: 0.08
Nodes (20): TabDefinition, TabKey, TABS, PickupAction, Announcement, Complaint, ComplaintStatus, ComplaintType (+12 more)

### Community 18 - "Community 18"
Cohesion: 0.33
Nodes (5): Graphify Knowledge Graph, MIRU Web Admin — Agent Rules, Stack, This is NOT the Next.js you know, Token Savers (WAJIB)

### Community 19 - "Community 19"
Cohesion: 0.33
Nodes (5): ⚠️ AI Steering — baca on-demand (jangan semua sekaligus), Aturan Keras, graphify, MIRU Bank Sampah — Web Admin (Next.js), Referensi Cepat

### Community 20 - "Community 20"
Cohesion: 0.33
Nodes (5): graphify, Hook-Based Usage, Installation Verification, Meta Commands (always use rtk directly), RTK - Rust Token Killer

### Community 21 - "Community 21"
Cohesion: 0.22
Nodes (8): CustomerDetail(), formatDateWIT(), rupiahFormatter, toNumber(), weightFormatter, DetailDepositModal(), getStatusBadgeVariant(), getStatusLabel()

### Community 23 - "Community 23"
Cohesion: 0.06
Nodes (45): LoginForm(), LoginSessionSync(), CardSkeleton(), DashboardAuthShell(), DashboardAuthShellProps, ApiClient, clearTokens(), fetchWithTimeout() (+37 more)

### Community 28 - "Community 28"
Cohesion: 0.11
Nodes (24): DashboardLayout(), DashboardLayoutProps, Header(), HeaderProps, HeaderUser, Sidebar(), SidebarProps, validateWebAdminRole() (+16 more)

### Community 29 - "Community 29"
Cohesion: 0.11
Nodes (12): DailyReport, getCurrentWeek(), MonthlyReport, MONTHS, Periode, ReportsClient(), TabKey, TABS (+4 more)

### Community 30 - "Community 30"
Cohesion: 0.14
Nodes (8): ACTIVITY_ICONS, ACTIVITY_LABELS, ActivityItem, ChartDay, DashboardOverview, DepositChart, MONTHS, StatCardProps

### Community 31 - "Community 31"
Cohesion: 0.21
Nodes (12): OverviewCards(), StockMiniSummary(), DetailRowInput(), formatRupiah(), formatWeightKg(), DailyReportView(), MonthlyReportView(), todayISO() (+4 more)

### Community 34 - "Community 34"
Cohesion: 0.33
Nodes (6): calculateSLADays(), DetailPengaduanModal(), getComplaintTypeLabel(), getSLAStatus(), getStatusBadgeVariant(), getStatusLabel()

## Knowledge Gaps
- **313 isolated node(s):** `geistSans`, `geistMono`, `metadata`, `CanWriteProps`, `TabKey` (+308 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `Community 0` to `Community 1`, `Community 13`, `Community 17`, `Community 21`, `Community 23`, `Community 30`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 13` to `Community 28`, `Community 23`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `Button` connect `Community 13` to `Community 0`, `Community 17`, `Community 23`, `Community 28`, `Community 29`, `Community 30`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `geistSans`, `geistMono`, `metadata` to the rest of the system?**
  _313 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05137844611528822 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.041666666666666664 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._