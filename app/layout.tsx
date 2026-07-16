import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ToastProvider } from '@/components/feedback/Toast'
import { APP_NAME } from '@/lib/config'
import { AuthProvider } from '@/providers/AuthProvider'
import { ApiErrorBridge } from '@/providers/ApiErrorBridge'
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
  manifest: '/brand/site.webmanifest',
  icons: {
    icon: [
      { url: '/brand/favicon.ico', sizes: 'any' },
      { url: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/brand/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: APP_NAME,
    description:
      'Panel administrasi MIRU Bank Sampah — kelola nasabah, transaksi setoran, penjemputan, dan laporan.',
    images: [{ url: '/brand/og-image.png', width: 1200, height: 630, alt: 'MIRU Bank Sampah' }],
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
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
