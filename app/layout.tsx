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
