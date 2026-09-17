# Graph Report - web  (2026-09-17)

## Corpus Check
- 207 files · ~142,578 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1225 nodes · 2923 edges · 84 communities (65 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `118d0297`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- formatRupiah
- 11 — Security & Privacy (Web Admin)
- 08 — Task List: Web Admin
- 10 — Integration & Roles (Web Admin)
- devDependencies
- compilerOptions
- MIRU Bank Sampah — Web Admin
- 04 — API Integration (Web Admin)
- 03 — State Management & Data Flow (Web Admin)
- ⚠️ Batasan KERAS — Jangan Implementasikan
- 09 — Data Dictionary & Reference Values (Web Admin)
- Ringkasan Aturan yang Wajib Dipatuhi di UI Web Admin
- Aturan Clean Code
- dependencies
- 01 — Project Overview (Web Admin)
- Halaman Detail per Modul
- README.md
- models.ts
- MIRU Web Admin — Agent Rules
- graphify
- RTK - Rust Token Killer
- ReportsClient.tsx
- eslint.config.mjs
- navigation.ts
- next.config.ts
- postcss.config.mjs
- StaffForm.tsx
- LandingPage.tsx
- formatDateWIT
- lib/api.ts
- DepositForm
- LoginForm.tsx
- DashboardClient.tsx
- DailyReportView
- PublicEducationArticle.tsx
- MiruLogo.tsx
- MarkdownDocView.tsx
- app/layout.tsx
- ComplaintManagement
- CustomerForm
- canMutate
- Selesai
- AnnouncementManagement
- Toast.tsx
- cn
- PickupManagement
- useToast
- WasteCategoryList.tsx
- useAuth
- MarkdownContent.tsx
- cropImage.ts
- EducationForm.tsx
- RewardCatalog
- WithdrawalManagement
- DepositHistory
- contrast.ts
- RouteErrorView.tsx
- NasabahQrInput
- PublicLegalDoc.tsx
- helpers.ts
- PublicAbout.tsx
- MarkdownDocEdit.tsx
- StaffList
- PartnerManagement
- CustomerList
- InstitutionEditClient
- ProfileEditClient
- DeleteAccountForm.tsx
- 3. Autentikasi
- CustomerDetail
- EducationManagement
- AssignPetugasModal
- Local Development
- NasabahQrCameraScanner
- NasabahSearch
- ModulePlaceholder.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 67 edges
2. `useAuth()` - 56 edges
3. `api` - 42 edges
4. `formatRupiah()` - 42 edges
5. `useToast()` - 40 edges
6. `Button` - 40 edges
7. `formatDateWIT()` - 38 edges
8. `ErrorMessage()` - 31 edges
9. `Card()` - 31 edges
10. `formatWeightKg()` - 30 edges

## Surprising Connections (you probably didn't know these)
- `ReportsPage()` --calls--> `useAuth()`  [EXTRACTED]
  app/(dashboard)/reports/page.tsx → providers/AuthProvider.tsx
- `ToastCard()` --calls--> `cn()`  [EXTRACTED]
  components/feedback/Toast.tsx → lib/cn.ts
- `AnnouncementManagement()` --calls--> `canMutate()`  [EXTRACTED]
  components/announcements/AnnouncementManagement.tsx → lib/permissions.ts
- `AnnouncementManagement()` --calls--> `useAuth()`  [EXTRACTED]
  components/announcements/AnnouncementManagement.tsx → providers/AuthProvider.tsx
- `CanWrite()` --calls--> `canMutate()`  [EXTRACTED]
  components/auth/CanWrite.tsx → lib/permissions.ts

## Import Cycles
- None detected.

## Communities (84 total, 11 thin omitted)

### Community 0 - "formatRupiah"
Cohesion: 0.17
Nodes (14): SetujuiModal(), DepositChartView(), OverviewStatCards(), RecentActivity(), StockMiniSummary(), TonaseTable(), SalesInput(), handleSubmit() (+6 more)

### Community 1 - "11 — Security & Privacy (Web Admin)"
Cohesion: 0.11
Nodes (18): 10. Mapping Task List, 11. Aturan untuk AI / Engineer, 11 — Security & Privacy (Web Admin), 1. Ruang Lingkup, 2. Autentikasi & Penyimpanan Token, 3. Otorisasi di Client (RBAC UI), 4. Perlindungan Data di UI (PDP), 5. Komunikasi ke API (+10 more)

### Community 2 - "08 — Task List: Web Admin"
Cohesion: 0.17
Nodes (11): 08 — Task List: Web Admin, Bisa langsung, Bisa langsung, Bisa langsung (API sudah ✅), Fase 7 — Kualitas & UAT, Fase 8 — Production deploy, Fase 9 — Pengembangan lanjutan, Out of scope (+3 more)

### Community 3 - "10 — Integration & Roles (Web Admin)"
Cohesion: 0.11
Nodes (19): 10 — Integration & Roles (Web Admin), 1. Role di Web Admin, 2. Matriks Permission per Role, 3. Menu Sidebar per Role, 4. Redirect Setelah Login, 5.1 Setoran Sampah (Petugas → Backend → Mobile), 5.2 Penjemputan (Mobile → Web Admin → Backend), 5.3 Penarikan Saldo (Mobile → Admin → Manual) (+11 more)

### Community 4 - "devDependencies"
Cohesion: 0.05
Nodes (44): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, @playwright/test (+36 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 6 - "MIRU Bank Sampah — Web Admin"
Cohesion: 0.15
Nodes (13): Autentikasi, Branding, Dokumentasi Proyek, Endpoint Utama (English routes), Format Response — JSON Envelope, Integrasi Backend API, MIRU Bank Sampah — Web Admin, Prerequisites (+5 more)

### Community 7 - "04 — API Integration (Web Admin)"
Cohesion: 0.18
Nodes (11): 04 — API Integration (Web Admin), 10. CORS & Production, 1. Base Configuration, 2. JSON Envelope — WAJIB Dipahami, 4. API Client (`lib/api.ts`), 5. Endpoint Web Admin (English Routes), 6. Auth Context, 7. Error Handling Pattern (+3 more)

### Community 8 - "03 — State Management & Data Flow (Web Admin)"
Cohesion: 0.14
Nodes (13): 03 — State Management & Data Flow (Web Admin), 1. Server State (Data dari API), 2. Auth State (Global), 3. UI State (Lokal), 4. Form Management, API Client, Data Fetching Pattern, Pagination Pattern (+5 more)

### Community 9 - "⚠️ Batasan KERAS — Jangan Implementasikan"
Cohesion: 0.14
Nodes (13): 06 — System Constraints (Web Admin), 1. Pencairan Saldo — TANPA Payment Gateway, 2. Penjemputan — TANPA GPS Live Tracking, 3. Hardware — TANPA Integrasi Fisik, 4. TIDAK ADA Integrasi Dukcapil, 5. Google Maps — Sederhana Saja, 6. Multi-Tenant, ⚠️ Batasan KERAS — Jangan Implementasikan (+5 more)

### Community 10 - "09 — Data Dictionary & Reference Values (Web Admin)"
Cohesion: 0.14
Nodes (13): 09 — Data Dictionary & Reference Values (Web Admin), A. HARGA SAMPAH — Seed Data Awal, B. ATURAN VALIDASI DI WEB ADMIN, C. KATALOG REWARD, D. ISIAN FORM LAPORAN, E. JENIS PENGADUAN (untuk filter & pelaporan), F. STANDAR WAKTU (untuk SLA display di UI), Form Input Setoran (+5 more)

### Community 11 - "Ringkasan Aturan yang Wajib Dipatuhi di UI Web Admin"
Cohesion: 0.15
Nodes (12): 05 — Business Rules & SOPs (Web Admin), 10. Indikator Keberhasilan (untuk Dashboard), 1. Transaksi Setoran, 2. Penjemputan, 3. Penarikan Saldo, 4. Penukaran Poin, 5. Penjualan ke Mitra, 6. Pengaduan (+4 more)

### Community 12 - "Aturan Clean Code"
Cohesion: 0.17
Nodes (11): 00 — System Prompt & Clean Code Rules (Web Admin), 1. Struktur Folder, 2. Komponen, 3. State Management, 4. Styling, 5. TypeScript, 6. Data Fetching, 7. Error Handling (+3 more)

### Community 13 - "dependencies"
Cohesion: 0.05
Nodes (43): date-fns, @hookform/resolvers, html5-qrcode, lucide-react, next, dependencies, date-fns, @hookform/resolvers (+35 more)

### Community 14 - "01 — Project Overview (Web Admin)"
Cohesion: 0.22
Nodes (9): 01 — Project Overview (Web Admin), 3 Repositori Sistem (GitHub Terpisah), Informasi Branding, Jam Layanan Operasional, Latar Belakang, Posisi dalam Ekosistem, Referensi Dokumen Terkait, Standar Integrasi dengan Backend (+1 more)

### Community 15 - "Halaman Detail per Modul"
Cohesion: 0.20
Nodes (9): 07 — Modules & Features (Web Admin), 17 Modul — Implementasi di Web Admin, Dashboard (`/`), Halaman Detail per Modul, Laporan (`/reports`), Layout Dashboard, Nasabah (`/customers`), Penjemputan (`/pickups`) (+1 more)

### Community 16 - "README.md"
Cohesion: 0.18
Nodes (6): 02 — Architecture & Stack (Web Admin), Alur Data, Arsitektur, Environment Variables, Struktur Folder yang Diharapkan, Tech Stack

### Community 17 - "models.ts"
Cohesion: 0.14
Nodes (13): PickupAction, Announcement, AuditLog, ComplaintStatus, ComplaintType, DepositDetail, PartnerSale, Pickup (+5 more)

### Community 18 - "MIRU Web Admin — Agent Rules"
Cohesion: 0.33
Nodes (5): Graphify Knowledge Graph, MIRU Web Admin — Agent Rules, Stack, This is NOT the Next.js you know, Token Savers (WAJIB)

### Community 19 - "graphify"
Cohesion: 0.33
Nodes (5): ⚠️ AI Steering — baca on-demand (jangan semua sekaligus), Aturan Keras, graphify, MIRU Bank Sampah — Web Admin (Next.js), Referensi Cepat

### Community 20 - "RTK - Rust Token Killer"
Cohesion: 0.33
Nodes (5): graphify, Hook-Based Usage, Installation Verification, Meta Commands (always use rtk directly), RTK - Rust Token Killer

### Community 21 - "ReportsClient.tsx"
Cohesion: 0.13
Nodes (13): ReportsPage(), DailyReport, MonthlyReport, Periode, ReportsClient(), TabKey, TABS, TonaseItem (+5 more)

### Community 23 - "navigation.ts"
Cohesion: 0.07
Nodes (35): DashboardLayoutProps, Header(), HeaderProps, HeaderUser, NotificationBell(), NotificationBellProps, truncateText(), ProfileDropdownProps (+27 more)

### Community 27 - "StaffForm.tsx"
Cohesion: 0.11
Nodes (20): ForgotPasswordForm(), clearAlerts(), handleOtp(), handlePassword(), handlePhone(), handleUsername(), mapFieldErrors(), Step (+12 more)

### Community 28 - "LandingPage.tsx"
Cohesion: 0.15
Nodes (10): HERO_BACKDROPS, KeywordMarquee(), KEYWORDS, CATEGORIES, FAQS, FEATURES, LandingPage(), PILLARS (+2 more)

### Community 29 - "formatDateWIT"
Cohesion: 0.18
Nodes (11): DepositTable(), getStatusBadge(), getStatusLabel(), RedemptionTable(), WithdrawalTable(), PetugasDashboard(), SalesHistory(), getSumberLabel() (+3 more)

### Community 30 - "lib/api.ts"
Cohesion: 0.06
Nodes (54): EMPTY_BADGES, SidebarBadgeCounts, ApiClient, clearTokens(), defaultErrorMessage(), fetchWithTimeout(), ForbiddenHandler, notifyForbidden() (+46 more)

### Community 31 - "DepositForm"
Cohesion: 0.16
Nodes (14): DepositForm(), addRow(), handleConfirmSave(), validate(), DetailRowInput(), handleBeratChange(), handleKategoriChange(), generateId() (+6 more)

### Community 32 - "LoginForm.tsx"
Cohesion: 0.06
Nodes (38): LoginForm(), handleSubmit(), mapFieldErrors(), LoginSessionSync(), CardSkeleton(), DashboardAuthShell(), DashboardAuthShellProps, DashboardLayout() (+30 more)

### Community 33 - "DashboardClient.tsx"
Cohesion: 0.10
Nodes (14): ACTIVITY_ICONS, ACTIVITY_LABELS, ActivityItem, ChartDay, DashboardClient(), DashboardOverview, DepositChart, DONUT_COLORS (+6 more)

### Community 34 - "DailyReportView"
Cohesion: 0.11
Nodes (17): DailyReportView(), exportCsv(), exportExcelDaily(), downloadFile(), exportExcel(), getCurrentWeek(), MonthlyReportView(), exportCsv() (+9 more)

### Community 35 - "PublicEducationArticle.tsx"
Cohesion: 0.21
Nodes (8): metadata, metadata, PublicEducationArticle(), PublicEducationList(), PublicEducationPreview(), excerptMarkdown(), resolvePublicMediaUrl(), KontenEdukasiPublic

### Community 36 - "MiruLogo.tsx"
Cohesion: 0.19
Nodes (12): MiruLogo(), MiruLogoProps, MiruLogoVariant, VARIANTS, FOOTER_LEGAL_LINKS, PublicFooter(), NAV_LINKS, PublicNavbar() (+4 more)

### Community 38 - "app/layout.tsx"
Cohesion: 0.24
Nodes (5): geistMono, geistSans, metadata, OfflineBanner(), useOnlineStatus()

### Community 39 - "ComplaintManagement"
Cohesion: 0.16
Nodes (7): calculateSLADays(), ComplaintManagement(), DetailPengaduanModal(), getComplaintTypeLabel(), getSLAStatus(), getStatusBadgeVariant(), getStatusLabel()

### Community 40 - "CustomerForm"
Cohesion: 0.40
Nodes (3): CustomerForm(), handleSubmit(), validate()

### Community 41 - "canMutate"
Cohesion: 0.36
Nodes (6): RewardManagement(), canApproveRedemption(), canApproveWithdrawal(), canCreateDeposit(), canMutate(), isReadOnlyRole()

### Community 42 - "Selesai"
Cohesion: 0.20
Nodes (10): Fase 0 — Scaffold, Fase 1 — Foundation, Fase 2 — Auth & RBAC, Fase 3 — Operasional, Fase 4 — Manajemen & stok, Fase 5 — Monitoring & laporan, Fase 6 — Governance UI, Fase 7 (sebagian) (+2 more)

### Community 44 - "Toast.tsx"
Cohesion: 0.14
Nodes (11): ToastCard(), ToastContext, ToastContextValue, ToastItem, ToastProvider(), ToastVariant, variantIcons, variantStyles (+3 more)

### Community 46 - "cn"
Cohesion: 0.05
Nodes (107): CustomerEditClient(), ACTION_COLORS, ACTION_LABELS, AuditLogManagement(), TabDefinition, TabKey, TABS, TolakSaldoModal() (+99 more)

### Community 47 - "PickupManagement"
Cohesion: 0.24
Nodes (9): getStatusBadgeVariant(), getStatusLabel(), PickupManagement(), executeStatusUpdate(), handleAction(), handleApproveAssign(), handleAssignOnly(), handleTolak() (+1 more)

### Community 48 - "useToast"
Cohesion: 0.36
Nodes (7): useToast(), apiErrorDetail(), RedemptionList(), handleApprove(), clearApiErrorHandlers(), setApiErrorHandlers(), ApiErrorBridge()

### Community 49 - "WasteCategoryList.tsx"
Cohesion: 0.15
Nodes (14): getStockLabelLocal(), buildPriceAnnouncementPreview(), FormErrors, FormState, getMinTanggalBerlaku(), getStockBadge(), PriceHistoryItem, PriceHistoryModal() (+6 more)

### Community 50 - "useAuth"
Cohesion: 0.22
Nodes (6): CanWrite(), CanWriteProps, useCanWrite(), ProfileClient(), InstitutionView(), useAuth()

### Community 51 - "MarkdownContent.tsx"
Cohesion: 0.43
Nodes (6): InlineNode, isSafeUrl(), MarkdownContent(), MarkdownListItem(), parseInline(), renderInline()

### Community 52 - "cropImage.ts"
Cohesion: 0.50
Nodes (4): handleConfirm(), CropArea, getCroppedFile(), loadImage()

### Community 53 - "EducationForm.tsx"
Cohesion: 0.17
Nodes (10): EducationEditClient(), EducationForm(), handleSubmit(), validate(), EducationFormProps, FormErrors, FormState, getMarkdown() (+2 more)

### Community 55 - "RewardCatalog"
Cohesion: 0.40
Nodes (3): RewardCatalog(), handleSubmit(), validate()

### Community 56 - "WithdrawalManagement"
Cohesion: 0.18
Nodes (3): getStatusBadgeVariant(), getStatusLabel(), WithdrawalManagement()

### Community 57 - "DepositHistory"
Cohesion: 0.22
Nodes (5): DepositHistory(), DetailDepositModal(), getStatusBadgeVariant(), getStatusLabel(), getTodayWIT()

### Community 58 - "contrast.ts"
Cohesion: 0.33
Nodes (7): channelToLinear(), contrastRatio(), hexToRgb(), relativeLuminance(), WCAG_AA_LARGE, WCAG_AA_NORMAL, THEME

### Community 60 - "NasabahQrInput"
Cohesion: 0.25
Nodes (8): assertNasabahLookup(), formatLookupError(), NasabahQrInput(), handleKeyDown(), handleSearch(), coercePositiveInt(), MiruNasabahQrPayload, parseMiruNasabahQr()

### Community 61 - "PublicLegalDoc.tsx"
Cohesion: 0.24
Nodes (5): metadata, metadata, PublicLegalDoc(), PublicLegalDocProps, LegalDocument

### Community 62 - "helpers.ts"
Cohesion: 0.42
Nodes (6): E2ERole, envelope(), errorEnvelope(), loginAs(), mockApi(), mockUser()

### Community 63 - "PublicAbout.tsx"
Cohesion: 0.24
Nodes (5): metadata, OVERLAY, PhotoBackdrop(), PublicAbout(), InstitutionSettings

### Community 64 - "MarkdownDocEdit.tsx"
Cohesion: 0.15
Nodes (10): MarkdownDocEdit(), API_BASE_URL, API_DEBUG, AUTH, PLAY_STORE_URL, MediaUploadResult, uploadAvatarImage(), uploadContentImage() (+2 more)

### Community 65 - "StaffList"
Cohesion: 0.25
Nodes (4): getRoleLabel(), getStatusBadge(), getStatusLabel(), StaffList()

### Community 66 - "PartnerManagement"
Cohesion: 0.29
Nodes (3): PartnerManagement(), handleSubmit(), validate()

### Community 70 - "CustomerList"
Cohesion: 0.25
Nodes (5): CustomerList(), handleExportCSV(), exportToCSV(), getStatusBadge(), getStatusLabel()

### Community 71 - "InstitutionEditClient"
Cohesion: 0.33
Nodes (4): InstitutionEditClient(), handleSave(), toApiTime(), toTimeInput()

### Community 72 - "ProfileEditClient"
Cohesion: 0.29
Nodes (4): fieldError(), ProfileEditClient(), handleCropped(), handleSave()

### Community 73 - "DeleteAccountForm.tsx"
Cohesion: 0.22
Nodes (11): metadata, CheckResponse, DeleteAccountForm(), clearAlerts(), handleConfirm(), handlePhone(), handleUsername(), mapFieldErrors() (+3 more)

### Community 75 - "3. Autentikasi"
Cohesion: 0.40
Nodes (5): 3.1 Login Flow, 3.2 Token Refresh, 3.3 Profil Login, 3.4 Header Standar, 3. Autentikasi

### Community 83 - "Local Development"
Cohesion: 0.50
Nodes (4): 1. Environment Variables, 2. Install & Run, 3. Login dengan Akun Demo, Local Development

### Community 85 - "NasabahSearch"
Cohesion: 1.00
Nodes (3): NasabahSearch(), handleKeyDown(), handleSelect()

## Knowledge Gaps
- **376 isolated node(s):** `metadata`, `metadata`, `metadata`, `geistSans`, `geistMono` (+371 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 530 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `formatRupiah`, `DashboardClient.tsx`, `LoginForm.tsx`, `MiruLogo.tsx`, `Toast.tsx`, `EducationForm.tsx`, `navigation.ts`, `StaffForm.tsx`, `LandingPage.tsx`, `PublicAbout.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `useToast()` connect `useToast` to `formatRupiah`, `StaffForm.tsx`, `DepositForm`, `ComplaintManagement`, `CustomerForm`, `AnnouncementManagement`, `Toast.tsx`, `cn`, `PickupManagement`, `WasteCategoryList.tsx`, `EducationForm.tsx`, `RewardCatalog`, `WithdrawalManagement`, `MarkdownDocEdit.tsx`, `PartnerManagement`, `CustomerList`, `InstitutionEditClient`, `ProfileEditClient`, `CustomerDetail`, `EducationManagement`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `useAuth` to `ReportsClient.tsx`, `navigation.ts`, `lib/api.ts`, `LoginForm.tsx`, `DashboardClient.tsx`, `MarkdownDocView.tsx`, `ComplaintManagement`, `canMutate`, `AnnouncementManagement`, `cn`, `PickupManagement`, `useToast`, `WasteCategoryList.tsx`, `EducationForm.tsx`, `WithdrawalManagement`, `DepositHistory`, `MarkdownDocEdit.tsx`, `StaffList`, `CustomerList`, `InstitutionEditClient`, `ProfileEditClient`, `CustomerDetail`, `EducationManagement`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `metadata`, `metadata`, `metadata` to the rest of the system?**
  _376 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `11 — Security & Privacy (Web Admin)` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `10 — Integration & Roles (Web Admin)` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046464646464646465 - nodes in this community are weakly interconnected._