# Graph Report - web-admin  (2026-08-18)

## Corpus Check
- 176 files · ~152,764 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 961 nodes · 2429 edges · 65 communities (55 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e10bc1a2`
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
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 62 edges
2. `useAuth()` - 54 edges
3. `useToast()` - 42 edges
4. `api` - 40 edges
5. `Button` - 37 edges
6. `Card()` - 32 edges
7. `ErrorMessage()` - 30 edges
8. `TableSkeleton()` - 28 edges
9. `formatRupiah()` - 27 edges
10. `canMutate()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `ReportsPage()` --calls--> `useAuth()`  [EXTRACTED]
  app/(dashboard)/reports/page.tsx → providers/AuthProvider.tsx
- `RecentActivity()` --calls--> `cn()`  [EXTRACTED]
  components/dashboard/DashboardClient.tsx → lib/cn.ts
- `ToastCard()` --calls--> `cn()`  [EXTRACTED]
  components/feedback/Toast.tsx → lib/cn.ts
- `DetailRowInput()` --calls--> `formatRupiah()`  [EXTRACTED]
  components/forms/DepositForm.tsx → lib/format.ts
- `fetchNotifications()` --calls--> `getAccessToken()`  [EXTRACTED]
  hooks/useNotifications.ts → lib/api.ts

## Import Cycles
- None detected.

## Communities (65 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.19
Nodes (13): SetujuiModal(), OverviewStatCards(), StockMiniSummary(), DepositForm(), formatRupiah(), formatWeightKg(), toNumber(), DailyReportView() (+5 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (18): 10. Mapping Task List, 11. Aturan untuk AI / Engineer, 11 — Security & Privacy (Web Admin), 1. Ruang Lingkup, 2. Autentikasi & Penyimpanan Token, 3. Otorisasi di Client (RBAC UI), 4. Perlindungan Data di UI (PDP), 5. Komunikasi ke API (+10 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (48): 08 — Task List: Web Admin Development Roadmap, 7.0 Keamanan Client — sisa, 7.1 Testing — sisa, 7.2 UX & Accessibility — sisa, 7.3 Error & Edge Cases — sisa, 9.1 Modul 4 — Edukasi sampah, 9.2 Modul 1 / 3 / 7 — Wilayah layanan, 9.3 Modul 5 — Perubahan harga H-3 (+40 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (19): 10 — Integration & Roles (Web Admin), 1. Role di Web Admin, 2. Matriks Permission per Role, 3. Menu Sidebar per Role, 4. Redirect Setelah Login, 5.1 Setoran Sampah (Petugas → Backend → Mobile), 5.2 Penjemputan (Mobile → Web Admin → Backend), 5.3 Penarikan Saldo (Mobile → Admin → Manual) (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.04
Nodes (44): dependencies, date-fns, @hookform/resolvers, html5-qrcode, lucide-react, next, react, react-dom (+36 more)

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
Nodes (5): DetailRow, DetailRowInput(), EMPTY_DETAIL_ROW, NasabahLookupUser, NasabahOption

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
Cohesion: 0.21
Nodes (18): ACTION_COLORS, ACTION_LABELS, getAccessToken(), TabDef, TabKey, TABS, Partner, WasteCategory (+10 more)

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
Cohesion: 0.12
Nodes (11): MONTHS, DailyReport, getCurrentWeek(), MonthlyReport, Periode, TabKey, TABS, TonaseItem (+3 more)

### Community 23 - "Community 23"
Cohesion: 0.12
Nodes (20): EMPTY_BADGES, fetchCount(), SidebarBadgeCounts, useSidebarBadges(), Sidebar(), ADMIN_MENU, getGroupedNavForRole(), getNavItemsForRole() (+12 more)

### Community 28 - "Community 28"
Cohesion: 0.16
Nodes (10): HERO_BACKDROPS, KeywordMarquee(), KEYWORDS, CATEGORIES, FAQS, FEATURES, LandingPage(), PILLARS (+2 more)

### Community 29 - "Community 29"
Cohesion: 0.27
Nodes (10): DashboardLayoutProps, HeaderProps, HeaderUser, ProfileDropdown(), ProfileDropdownProps, SidebarProps, ROLE_LABELS, WebAdminRole (+2 more)

### Community 30 - "Community 30"
Cohesion: 0.05
Nodes (53): DashboardAuthShell(), DashboardAuthShellProps, ApiClient, clearTokens(), fetchWithTimeout(), getRefreshToken(), clearApiErrorHandlers(), ForbiddenHandler (+45 more)

### Community 31 - "Community 31"
Cohesion: 0.11
Nodes (12): ACTIONS_BY_STATUS, AssignModalMode, PETUGAS_TAB_KEYS, TabDefinition, TabKey, TABS, ROLE_BADGE_VARIANTS, ROLE_TABS (+4 more)

### Community 32 - "Community 32"
Cohesion: 0.14
Nodes (8): CustomerRow, ErrorMessage(), ErrorMessageProps, LoadingSkeletonProps, TableSkeleton(), FormErrors, FormState, PriceHistoryItem

### Community 33 - "Community 33"
Cohesion: 0.10
Nodes (12): ACTIVITY_ICONS, ACTIVITY_LABELS, ActivityItem, ChartDay, DashboardOverview, DepositChart, DONUT_COLORS, PetugasOverview (+4 more)

### Community 34 - "Community 34"
Cohesion: 0.18
Nodes (9): CustomerForm(), CustomerFormData, CustomerFormProps, FormErrors, LoadingSkeleton(), CardFooter(), iconClass, sizeClass (+1 more)

### Community 36 - "Community 36"
Cohesion: 0.15
Nodes (7): DashboardClient(), EducationManagement(), ModulePlaceholder(), ModulePlaceholderProps, RewardManagement(), ITEMS, SettingsHub()

### Community 37 - "Community 37"
Cohesion: 0.19
Nodes (11): api, getStockLabel(), Card(), CardContent(), CardHeader(), CardHeaderProps, getStockLabelLocal(), InventoryItem (+3 more)

### Community 38 - "Community 38"
Cohesion: 0.18
Nodes (8): LoginForm(), LoginSessionSync(), MiruLogo(), MiruLogoProps, MiruLogoVariant, VARIANTS, KeywordOrbit(), CardDescription()

### Community 39 - "Community 39"
Cohesion: 0.18
Nodes (8): TabDefinition, TabKey, TABS, Withdrawal, Button, Modal(), ModalProps, sizeClasses

### Community 40 - "Community 40"
Cohesion: 0.27
Nodes (10): calculateSLADays(), COMPLAINT_TYPE_LABELS, DetailPengaduanModal(), getComplaintTypeLabel(), getSLAStatus(), getStatusBadgeVariant(), getStatusLabel(), TabDefinition (+2 more)

### Community 41 - "Community 41"
Cohesion: 0.25
Nodes (4): AnnouncementManagement(), CustomerDetail(), canMutate(), isReadOnlyRole()

### Community 42 - "Community 42"
Cohesion: 0.33
Nodes (6): formatDateWIT(), rupiahFormatter, weightFormatter, DetailDepositModal(), getStatusBadgeVariant(), getStatusLabel()

### Community 43 - "Community 43"
Cohesion: 0.23
Nodes (9): EmptyState(), EmptyStateProps, DashboardLayout(), Header(), cn(), ImageDropzone(), RichTextEditor(), RichTextEditorProps (+1 more)

### Community 44 - "Community 44"
Cohesion: 0.10
Nodes (18): geistMono, geistSans, metadata, ToastCard(), ToastContext, ToastContextValue, ToastItem, ToastProvider() (+10 more)

### Community 45 - "Community 45"
Cohesion: 0.18
Nodes (5): TabDefinition, TabKey, TABS, Deposit, RewardRedemption

### Community 46 - "Community 46"
Cohesion: 0.08
Nodes (23): fetchNotifications(), PickupAction, StaffEditClient(), FormErrors, ROLE_OPTIONS, StaffForm(), StaffFormData, StaffFormProps (+15 more)

### Community 47 - "Community 47"
Cohesion: 0.18
Nodes (13): Badge(), BadgeProps, BadgeVariant, variants, ButtonProps, ButtonSize, ButtonVariant, sizes (+5 more)

### Community 48 - "Community 48"
Cohesion: 0.17
Nodes (8): WithdrawalManagement(), useToast(), ProfileEditClient(), ApiErrorBridge(), RedemptionList(), RewardCatalog(), InstitutionEditClient(), PartnerManagement()

### Community 49 - "Community 49"
Cohesion: 0.07
Nodes (15): PublicLegalDoc(), PublicLegalDocProps, metadata, InstitutionView(), MarkdownDocEdit(), MarkdownDocView(), SettingsPageHeader(), metadata (+7 more)

### Community 50 - "Community 50"
Cohesion: 0.32
Nodes (5): CanWrite(), CanWriteProps, useCanWrite(), useAuth(), StaffList()

### Community 51 - "Community 51"
Cohesion: 0.33
Nodes (3): ReportsPage(), ReportsClient(), DepositHistory()

### Community 52 - "Community 52"
Cohesion: 0.08
Nodes (21): PublicEducationArticle(), PublicEducationList(), PublicEducationPreview(), metadata, CardSkeleton(), metadata, CropArea, getCroppedFile() (+13 more)

### Community 53 - "Community 53"
Cohesion: 0.24
Nodes (6): EducationEditClient(), EducationForm(), EducationFormProps, FormErrors, FormState, KontenEdukasi

### Community 54 - "Community 54"
Cohesion: 0.50
Nodes (3): useNotifications(), NotificationBell(), NotificationBellProps

### Community 58 - "Community 58"
Cohesion: 0.21
Nodes (6): ForgotPasswordForm(), Step, OVERLAY, PhotoBackdrop(), PasswordInput, PasswordInputProps

### Community 59 - "Community 59"
Cohesion: 0.40
Nodes (4): buildPriceAnnouncementPreview(), getMinTanggalBerlaku(), validateTanggalBerlaku(), WasteCategoryList()

### Community 60 - "Community 60"
Cohesion: 0.60
Nodes (3): coercePositiveInt(), MiruNasabahQrPayload, parseMiruNasabahQr()

## Knowledge Gaps
- **366 isolated node(s):** `metadata`, `metadata`, `geistSans`, `geistMono`, `metadata` (+361 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 43` to `Community 32`, `Community 33`, `Community 34`, `Community 37`, `Community 38`, `Community 39`, `Community 44`, `Community 47`, `Community 17`, `Community 52`, `Community 54`, `Community 23`, `Community 58`, `Community 28`, `Community 29`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `Community 50` to `Community 17`, `Community 30`, `Community 31`, `Community 32`, `Community 33`, `Community 36`, `Community 37`, `Community 38`, `Community 39`, `Community 40`, `Community 41`, `Community 42`, `Community 45`, `Community 48`, `Community 49`, `Community 51`, `Community 52`, `Community 53`, `Community 57`, `Community 59`, `Community 61`, `Community 62`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `api` connect `Community 37` to `Community 13`, `Community 17`, `Community 21`, `Community 23`, `Community 30`, `Community 31`, `Community 32`, `Community 33`, `Community 34`, `Community 39`, `Community 40`, `Community 42`, `Community 45`, `Community 46`, `Community 49`, `Community 52`, `Community 53`, `Community 54`, `Community 58`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `metadata`, `metadata`, `geistSans` to the rest of the system?**
  _366 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0467687074829932 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._