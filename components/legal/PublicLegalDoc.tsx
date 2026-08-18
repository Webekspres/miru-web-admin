'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { ArrowLeft, FileText, Shield } from 'lucide-react'
import { api } from '@/lib/api'
import { PhotoBackdrop } from '@/components/landing/PhotoBackdrop'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import type { LegalDocument } from '@/types/models'

type PublicLegalDocProps = {
  kind: 'privacy' | 'terms'
  apiPath: '/privacy-policy/' | '/terms/'
  heroLabel: string
  heroTitle: string
  heroDescription: string
  icon: 'shield' | 'file'
  relatedHref: string
  relatedLabel: string
}

export function PublicLegalDoc({
  kind,
  apiPath,
  heroLabel,
  heroTitle,
  heroDescription,
  icon,
  relatedHref,
  relatedLabel,
}: PublicLegalDocProps) {
  const { data, error, isLoading, mutate } = useSWR(
    ['public-legal', kind],
    () => api.get<LegalDocument>(apiPath, undefined, { skipAuth: true }),
  )

  const HeroIcon = icon === 'shield' ? Shield : FileText

  return (
    <div className="bg-[#f7f8f6]">
      <section className="relative min-h-[38vh] overflow-hidden text-white sm:min-h-[42vh]">
        <PhotoBackdrop
          src="/landing/illustrations/about.webp"
          alt=""
          overlay="hero"
          extraOverlay="heroBottom"
          priority
        />
        <div className="relative z-10 mx-auto flex min-h-[38vh] max-w-7xl flex-col justify-end px-4 py-10 sm:min-h-[42vh] sm:px-6 sm:py-14 lg:px-8">
          <p className="mb-3 text-sm font-medium text-emerald-100/85">{heroLabel}</p>
          <div className="flex items-start gap-3">
            <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <HeroIcon className="size-5" aria-hidden />
            </span>
            <div>
              <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
                {heroTitle}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
                {heroDescription}
              </p>
              {data?.versi ? (
                <p className="mt-3 text-xs font-semibold text-emerald-100/90">
                  Versi dokumen: {data.versi}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Kembali ke beranda
          </Link>

          {isLoading ? (
            <div className="rounded-xl bg-white p-6 ring-1 ring-emerald-900/5">
              <TableSkeleton rows={12} cols={1} />
            </div>
          ) : error ? (
            <ErrorMessage
              title="Gagal memuat dokumen"
              message="Tidak dapat mengambil dokumen legal. Periksa koneksi lalu coba lagi."
              onRetry={() => mutate()}
            />
          ) : (
            <article className="rounded-xl bg-white p-6 shadow-[0_18px_50px_-32px_rgba(6,78,59,0.55)] ring-1 ring-emerald-900/5 sm:p-8">
              {data?.ringkasan ? (
                <p className="mb-6 rounded-lg border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm leading-relaxed text-emerald-900">
                  {data.ringkasan}
                </p>
              ) : null}
              <MarkdownContent source={data?.konten ?? '_Dokumen belum tersedia._'} />
            </article>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-white px-5 py-4 text-sm">
            <p className="text-muted-foreground">
              Dokumen resmi MIRU-G · Distrik Mimika Baru
            </p>
            <Link
              href={relatedHref}
              className="font-bold text-emerald-700 underline-offset-2 hover:underline"
            >
              {relatedLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
