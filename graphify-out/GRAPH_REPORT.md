# Graph Report - web-admin  (2026-07-14)

## Corpus Check
- 118 files · ~45,952 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 750 nodes · 1753 edges · 45 communities (41 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `68ce5002`
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
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 42 edges
2. `useAuth()` - 37 edges
3. `useToast()` - 28 edges
4. `Button` - 27 edges
5. `formatRupiah()` - 26 edges
6. `api` - 24 edges
7. `Card()` - 23 edges
8. `canMutate()` - 23 edges
9. `ErrorMessage()` - 20 edges
10. `CardHeader()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `SetujuiModal()` --calls--> `formatRupiah()`  [EXTRACTED]
  components/balance/WithdrawalManagement.tsx → lib/format.ts
- `StockMiniSummary()` --calls--> `formatRupiah()`  [EXTRACTED]
  components/dashboard/DashboardClient.tsx → lib/format.ts
- `ToastCard()` --calls--> `cn()`  [EXTRACTED]
  components/feedback/Toast.tsx → lib/cn.ts
- `DetailRowInput()` --calls--> `formatRupiah()`  [EXTRACTED]
  components/forms/DepositForm.tsx → lib/format.ts
- `LoginForm()` --calls--> `useAuth()`  [EXTRACTED]
  components/auth/LoginForm.tsx → providers/AuthProvider.tsx

## Import Cycles
- None detected.

## Communities (45 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (32): CanWrite(), CanWriteProps, useCanWrite(), WithdrawalManagement(), calculateSLADays(), COMPLAINT_TYPE_LABELS, ComplaintManagement(), DetailPengaduanModal() (+24 more)

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (12): geistMono, geistSans, metadata, ToastCard(), ToastContext, ToastContextValue, ToastItem, ToastProvider() (+4 more)

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
Cohesion: 0.15
Nodes (18): CustomerRow, api, TabDef, TabKey, TABS, PaginationMeta, Partner, WasteCategory (+10 more)

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
Cohesion: 0.07
Nodes (23): TabDefinition, TabKey, TABS, PickupAction, ACTION_COLORS, ACTION_LABELS, TabKey, TABS (+15 more)

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
Cohesion: 0.17
Nodes (9): fetchNotifications(), EMPTY_BADGES, fetchCount(), SidebarBadgeCounts, BENEFITS, LandingPage(), getAccessToken(), AUTH (+1 more)

### Community 23 - "Community 23"
Cohesion: 0.07
Nodes (46): EmptyState(), EmptyStateProps, useNotifications(), useSidebarBadges(), DashboardLayout(), DashboardLayoutProps, Header(), HeaderProps (+38 more)

### Community 28 - "Community 28"
Cohesion: 0.18
Nodes (12): fetchWithTimeout(), parseEnvelope(), RequestOptions, setAccessToken(), setTokens(), toNetworkError(), setAccessTokenCookie(), ApiEnvelope (+4 more)

### Community 29 - "Community 29"
Cohesion: 0.11
Nodes (12): DailyReport, getCurrentWeek(), MonthlyReport, MONTHS, Periode, ReportsClient(), TabKey, TABS (+4 more)

### Community 30 - "Community 30"
Cohesion: 0.08
Nodes (14): ACTIVITY_ICONS, ACTIVITY_LABELS, ActivityItem, ChartDay, DashboardClient(), DashboardOverview, DepositChart, MONTHS (+6 more)

### Community 31 - "Community 31"
Cohesion: 0.18
Nodes (16): OverviewCards(), formatDateWIT(), formatRupiah(), formatWeightKg(), rupiahFormatter, toNumber(), weightFormatter, DailyReportView() (+8 more)

### Community 32 - "Community 32"
Cohesion: 0.09
Nodes (16): CustomerForm(), CustomerFormData, CustomerFormProps, FormErrors, CustomerEditClient(), LoadingSkeleton(), StaffEditClient(), FormErrors (+8 more)

### Community 33 - "Community 33"
Cohesion: 0.22
Nodes (14): AUTH_ROUTES, PUBLIC_ROUTES, TOKEN_KEYS, ALLOWED_PREFIXES, canAccessRoute(), getLandingPathForRole(), isWebAdminRoleValue(), LANDING_PATH_BY_ROLE (+6 more)

### Community 34 - "Community 34"
Cohesion: 0.21
Nodes (11): clearRoleCookie(), setRoleCookie(), validateWebAdminRole(), WebAdminAccessError, isWebAdminRole(), WebAdminRole, AuthContext, AuthContextValue (+3 more)

### Community 35 - "Community 35"
Cohesion: 0.19
Nodes (8): ErrorMessage(), ErrorMessageProps, Button, Modal(), sizeClasses, FormErrors, FormState, PriceHistoryItem

### Community 36 - "Community 36"
Cohesion: 0.18
Nodes (7): SetujuiModal(), TabDefinition, TabKey, TABS, WithdrawalStatus, Card(), CardHeader()

### Community 37 - "Community 37"
Cohesion: 0.17
Nodes (6): LoadingSkeletonProps, TableSkeleton(), ACTIONS_BY_STATUS, TabDefinition, TabKey, TABS

### Community 38 - "Community 38"
Cohesion: 0.18
Nodes (5): DepositForm(), DetailRow, DetailRowInput(), EMPTY_DETAIL_ROW, NasabahOption

### Community 39 - "Community 39"
Cohesion: 0.20
Nodes (5): InventoryItem, InventorySummary, StockHistoryData, StockHistoryEntry, WarehouseStock()

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (3): ApiClient, getRefreshToken(), refreshAccessToken()

### Community 41 - "Community 41"
Cohesion: 0.20
Nodes (5): ROLE_BADGE_VARIANTS, ROLE_TABS, StaffRole, StaffTab, TableCell()

### Community 43 - "Community 43"
Cohesion: 0.32
Nodes (5): CardSkeleton(), DashboardAuthShell(), DashboardAuthShellProps, clearTokens(), clearAccessTokenCookie()

### Community 44 - "Community 44"
Cohesion: 0.32
Nodes (6): clearApiErrorHandlers(), ForbiddenHandler, notifyForbidden(), notifyUnauthorized(), setApiErrorHandlers(), UnauthorizedHandler

## Knowledge Gaps
- **319 isolated node(s):** `geistSans`, `geistMono`, `metadata`, `CanWriteProps`, `TabKey` (+314 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `Community 0` to `Community 34`, `Community 35`, `Community 36`, `Community 37`, `Community 41`, `Community 42`, `Community 43`, `Community 44`, `Community 13`, `Community 17`, `Community 23`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 23` to `Community 32`, `Community 1`, `Community 35`, `Community 36`, `Community 37`, `Community 41`, `Community 43`, `Community 13`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `Button` connect `Community 35` to `Community 0`, `Community 32`, `Community 36`, `Community 37`, `Community 38`, `Community 39`, `Community 41`, `Community 42`, `Community 13`, `Community 17`, `Community 23`, `Community 29`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `geistSans`, `geistMono`, `metadata` to the rest of the system?**
  _319 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.061683599419448475 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.041666666666666664 - nodes in this community are weakly interconnected._