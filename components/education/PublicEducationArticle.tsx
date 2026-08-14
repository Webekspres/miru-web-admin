'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDateWIT } from '@/lib/format'
import { resolvePublicMediaUrl } from '@/lib/media'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import { PhotoBackdrop } from '@/components/landing/PhotoBackdrop'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { CardSkeleton } from '@/components/feedback/LoadingSkeleton'
import type { KontenEdukasiPublic } from '@/types/models'

export function PublicEducationArticle() {
  const params = useParams<{ id: string }>()
  const id = params?.id

  const { data, error, isLoading, mutate } = useSWR(
    id ? ['public-edukasi', id] : null,
    () => api.get<KontenEdukasiPublic>(`/edukasi/${id}/`, undefined, { skipAuth: true }),
  )

  const image = resolvePublicMediaUrl(data?.gambar_url)

  return (
    <div className="bg-[#f7f8f6]">
      <section className="relative min-h-[36vh] overflow-hidden text-white sm:min-h-[42vh]">
        {image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              className="absolute inset-0 size-full object-cover motion-safe:animate-ken-burns"
            />
            <div className="absolute inset-0 bg-linear-to-t from-emerald-950/90 via-emerald-950/45 to-emerald-950/25" />
          </>
        ) : (
          <PhotoBackdrop
            src="/landing/illustrations/about.webp"
            alt=""
            overlay="hero"
            extraOverlay="heroBottom"
            priority
          />
        )}
        <div className="relative z-10 mx-auto flex min-h-[36vh] max-w-7xl flex-col justify-end px-4 py-10 sm:min-h-[42vh] sm:px-6 sm:py-12 lg:px-8">
          <Link
            href="/edukasi"
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
          >
            <ArrowLeft className="size-4" />
            Semua artikel
          </Link>
            {data ? (
              <>
                {data.kategori_terkait_nama ? (
                  <p className="mb-2 text-xs font-bold tracking-[0.16em] text-emerald-200 uppercase">
                    {data.kategori_terkait_nama}
                  </p>
                ) : null}
                <h1 className="max-w-3xl text-2xl font-extrabold tracking-tight sm:text-4xl">
                  {data.judul}
                </h1>
                <p className="mt-3 text-sm text-white/75">
                  {formatDateWIT(data.created_at, { dateStyle: 'long' })}
                </p>
              </>
            ) : (
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Artikel edukasi
              </h1>
            )}
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {isLoading ? (
            <div className="space-y-3">
              <CardSkeleton className="h-8" />
              <CardSkeleton className="h-40" />
            </div>
          ) : error || !data ? (
            <ErrorMessage
              title="Artikel tidak ditemukan"
              message="Konten edukasi ini tidak tersedia atau sudah tidak dipublikasikan."
              onRetry={() => mutate()}
            />
          ) : (
            <article className="rounded-xl bg-white p-6 shadow-[0_18px_50px_-32px_rgba(6,78,59,0.45)] ring-1 ring-emerald-900/5 sm:p-10">
              <div className="prose-miru">
                <MarkdownContent source={data.isi} />
              </div>
              <div className="mt-10 flex items-center gap-3 border-t border-border pt-6 text-sm text-muted-foreground">
                <BookOpen className="size-4 text-emerald-700" />
                Bank Sampah MIRU-G · Edukasi publik
              </div>
            </article>
          )}
        </div>
      </section>
    </div>
  )
}
