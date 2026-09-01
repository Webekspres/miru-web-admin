import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ToastProvider } from '@/components/feedback/Toast'
import { APP_NAME } from '@/lib/config'
import { AuthProvider } from '@/providers/AuthProvider'
import { ApiErrorBridge } from '@/providers/ApiErrorBridge'
import { PublicSiteLayout } from '@/components/layout/PublicSiteLayout'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description:
    'Panel administrasi MIRU Bank Sampah — kelola nasabah, transaksi setoran, penjemputan, dan laporan.',
  applicationName: 'MIRU',
  manifest: '/brand/favicon/site.webmanifest',
  icons: {
    // PNG first: reliable in all tabs. SVG is a clean logo (no nested/white-only export).
    icon: [
      {
        url: '/brand/favicon/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      { url: '/brand/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/brand/favicon/favicon.ico', sizes: '48x48' },
    ],
    apple: [
      {
        url: '/brand/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  openGraph: {
    title: APP_NAME,
    description:
      'Panel administrasi MIRU Bank Sampah — kelola nasabah, transaksi setoran, penjemputan, dan laporan.',
    images: [{ url: '/brand/logo-with-text.svg', alt: 'MIRU Bank Sampah' }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ToastProvider>
          <AuthProvider>
            <ApiErrorBridge />
            <PublicSiteLayout>{children}</PublicSiteLayout>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
