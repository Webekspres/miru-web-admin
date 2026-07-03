# 02 — Architecture & Stack (Web Admin)

## Tech Stack

| Komponen | Teknologi | Versi |
|----------|-----------|-------|
| Framework | Next.js | 16.2.10 |
| Bahasa | TypeScript | 5.x (strict mode) |
| Styling | Tailwind CSS | v4 (PostCSS) |
| Font | Geist (Geist Sans + Geist Mono) | via next/font |
| Linting | ESLint | 9.x |
| State/Data | SWR / React Query | (belum ditambahkan) |
| HTTP Client | fetch API (built-in) | - |
| Auth | JWT (localStorage) | - |

## Arsitektur

```
┌─────────────────────────────────────────────────┐
│                 Next.js App                      │
│  ┌─────────────────────────────────────────────┐│
│  │           Root Layout (layout.tsx)          ││
│  │  ├── Auth Layout → Login Page              ││
│  │  └── Dashboard Layout → Protected Pages    ││
│  │                                           ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐  ││
│  │  │Server    │ │Client    │ │Shared    │  ││
│  │  │Components│ │Components│ │Services  │  ││
│  │  └──────────┘ └──────────┘ └──────────┘  ││
│  └─────────────────────────────────────────────┘│
│                      │ HTTP (JSON + JWT)          │
│                      ▼                            │
│              Backend API (Django)                  │
│              http://localhost:8000/api/            │
└─────────────────────────────────────────────────┘
```

## Alur Data

1. **Server Components** → fetch data langsung di komponen (async/await).
2. **Client Components** → gunakan SWR/React Query untuk caching & revalidation.
3. **Auth** → JWT token disimpan di localStorage, dikirim via `Authorization` header.
4. **Error Handling** → setiap fetch bungkus dalam try/catch atau gunakan SWR error handler.

## Environment Variables
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Struktur Folder yang Diharapkan
```
miru-web-admin/
├── .ai-steering/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx        # Sidebar + Header layout
│   │   ├── page.tsx           # Dashboard overview
│   │   ├── nasabah/
│   │   ├── transaksi/
│   │   ├── penjemputan/
│   │   ├── saldo/
│   │   ├── reward/
│   │   ├── gudang/
│   │   ├── pengaduan/
│   │   ├── laporan/
│   │   └── pengaturan/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── layout/               # Sidebar, Header, etc.
│   └── forms/                # Form components
├── lib/
│   └── api.ts                # API client
├── types/
│   └── index.ts              # TypeScript interfaces
├── public/
│   └── logo.svg              # Logo MIRU
├── .claude.md
├── next.config.ts
├── package.json
└── tsconfig.json
```
