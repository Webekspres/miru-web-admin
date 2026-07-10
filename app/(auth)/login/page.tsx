import Link from 'next/link'
import { Suspense } from 'react'
import { Leaf } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'
import { LoginSessionSync } from '@/components/auth/LoginSessionSync'
import { CardSkeleton } from '@/components/feedback/LoadingSkeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { APP_NAME } from '@/lib/config'

function LoginFormFallback() {
  return (
    <div className="space-y-4">
      <CardSkeleton className="h-16" />
      <CardSkeleton className="h-16" />
      <CardSkeleton className="h-10" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={null}>
        <LoginSessionSync />
      </Suspense>

      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="size-6" aria-hidden />
          </div>
          <CardTitle>MIRU Bank Sampah</CardTitle>
          <CardDescription>{APP_NAME}</CardDescription>
        </CardHeader>

        <CardContent>
          <p className="mb-4 text-center text-sm text-muted-foreground">
            Masuk dengan akun petugas atau admin untuk mengelola operasional bank
            sampah.
          </p>

          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/" className="font-medium text-primary hover:underline">
              Kembali ke halaman utama
            </Link>
          </p>
        </CardContent>
      </Card>
    </>
  )
}
