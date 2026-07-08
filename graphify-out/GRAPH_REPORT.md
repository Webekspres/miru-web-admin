# Graph Report - web-admin  (2026-07-08)

## Corpus Check
- 84 files · ~18,559 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 528 nodes · 778 edges · 30 communities (26 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2bf87cdb`
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

## God Nodes (most connected - your core abstractions)
1. `cn()` - 38 edges
2. `ModulePlaceholder()` - 16 edges
3. `compilerOptions` - 16 edges
4. `08 — Task List: Web Admin Development Roadmap` - 16 edges
5. `useAuth()` - 12 edges
6. `WebAdminRole` - 11 edges
7. `04 — API Integration (Web Admin)` - 11 edges
8. `Ringkasan Aturan yang Wajib Dipatuhi di UI Web Admin` - 11 edges
9. `MIRU Bank Sampah — Web Admin` - 11 edges
10. `10 — Integration & Roles (Web Admin)` - 10 edges

## Surprising Connections (you probably didn't know these)
- `ToastCard()` --calls--> `cn()`  [EXTRACTED]
  components/feedback/Toast.tsx → lib/cn.ts
- `CanWrite()` --calls--> `useAuth()`  [EXTRACTED]
  components/auth/CanWrite.tsx → providers/AuthProvider.tsx
- `useCanWrite()` --calls--> `useAuth()`  [EXTRACTED]
  components/auth/CanWrite.tsx → providers/AuthProvider.tsx
- `EmptyState()` --calls--> `cn()`  [EXTRACTED]
  components/feedback/EmptyState.tsx → lib/cn.ts
- `ErrorMessage()` --calls--> `cn()`  [EXTRACTED]
  components/feedback/ErrorMessage.tsx → lib/cn.ts

## Import Cycles
- None detected.

## Communities (30 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (23): geistMono, geistSans, metadata, ToastCard(), ToastContext, ToastContextValue, ToastItem, ToastProvider() (+15 more)

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (48): 08 — Task List: Web Admin Development Roadmap, 0.1 Project Setup ✅, 1.1 Dependencies & Environment, 1.2 API Client & Types (Modul 2 — infrastruktur), 1.3 Layout Shell & Shared UI, 1.4 Routing Structure, 2.1 Auth Provider, 2.2 Login Page (+40 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (19): 10 — Integration & Roles (Web Admin), 1. Role di Web Admin, 2. Matriks Permission per Role, 3. Menu Sidebar per Role, 4. Redirect Setelah Login, 5.1 Setoran Sampah (Petugas → Backend → Mobile), 5.2 Penjemputan (Mobile → Web Admin → Backend), 5.3 Penarikan Saldo (Mobile → Admin → Manual) (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (33): dependencies, date-fns, @hookform/resolvers, lucide-react, next, react, react-dom, react-hook-form (+25 more)

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
Cohesion: 0.09
Nodes (40): EmptyState(), EmptyStateProps, ErrorMessage(), ErrorMessageProps, CardSkeleton(), LoadingSkeleton(), LoadingSkeletonProps, TableSkeleton() (+32 more)

### Community 14 - "Community 14"
Cohesion: 0.20
Nodes (9): 01 — Project Overview (Web Admin), 3 Repositori Sistem (GitHub Terpisah), Informasi Branding, Jam Layanan Operasional, Latar Belakang, Posisi dalam Ekosistem, Referensi Dokumen Terkait, Standar Integrasi dengan Backend (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.20
Nodes (9): 07 — Modules & Features (Web Admin), 17 Modul — Implementasi di Web Admin, Dashboard (`/`), Halaman Detail per Modul, Laporan (`/laporan`), Layout Dashboard, Nasabah (`/nasabah`), Penjemputan (`/penjemputan`) (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.29
Nodes (6): 02 — Architecture & Stack (Web Admin), Alur Data, Arsitektur, Environment Variables, Struktur Folder yang Diharapkan, Tech Stack

### Community 17 - "Community 17"
Cohesion: 0.11
Nodes (18): Announcement, Complaint, ComplaintStatus, ComplaintType, Deposit, DepositDetail, InstitutionSettings, Partner (+10 more)

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
Cohesion: 0.43
Nodes (6): formatDateWIT(), formatRupiah(), formatWeightKg(), rupiahFormatter, toNumber(), weightFormatter

### Community 23 - "Community 23"
Cohesion: 0.08
Nodes (42): LoginForm(), LoginSessionSync(), DashboardAuthShell(), DashboardAuthShellProps, api, clearTokens(), fetchWithTimeout(), getAccessToken() (+34 more)

### Community 28 - "Community 28"
Cohesion: 0.11
Nodes (21): DashboardLayout(), DashboardLayoutProps, Header(), HeaderProps, HeaderUser, Sidebar(), SidebarProps, validateWebAdminRole() (+13 more)

### Community 29 - "Community 29"
Cohesion: 0.46
Nodes (5): CanWrite(), CanWriteProps, useCanWrite(), canMutate(), isReadOnlyRole()

## Knowledge Gaps
- **268 isolated node(s):** `geistSans`, `geistMono`, `metadata`, `CanWriteProps`, `EmptyStateProps` (+263 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 13` to `Community 0`, `Community 28`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `Community 23` to `Community 0`, `Community 29`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `geistSans`, `geistMono`, `metadata` to the rest of the system?**
  _268 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07777777777777778 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08901515151515152 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._