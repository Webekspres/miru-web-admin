'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { ArrowRight, BookOpen } from 'lucide-react'
import { api } from '@/lib/api'
import { excerptMarkdown } from '@/lib/education'
import { formatDateWIT } from '@/lib/format'
import { resolvePublicMediaUrl } from '@/lib/media'
import { PhotoBackdrop } from '@/components/landing/PhotoBackdrop'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { CardSkeleton } from '@/components/feedback/LoadingSkeleton'
import type { KontenEdukasiPublic } from '@/types/models'

export function PublicEducationList() {
  const { data: items, error, isLoading, mutate } = useSWR(
    ['public-edukasi', 'list'],
    () =>
      api.get<KontenEdukasiPublic[]>(
        '/edukasi/',
        { page_size: '20' },
        { skipAuth: true },
      ),
  )

  const list = items ?? []

  return (
    <div className="bg-[#f7f8f6]">
      <section className="relative min-h-[42vh] overflow-hidden text-white sm:min-h-[48vh]">
        <PhotoBackdrop
          src="/landing/illustrations/about.webp"
          alt=""
          overlay="hero"
          extraOverlay="heroBottom"
          priority
        />
        <div className="relative z-10 mx-auto flex min-h-[42vh] max-w-7xl flex-col justify-end px-4 py-10 sm:min-h-[48vh] sm:px-6 sm:py-14 lg:px-8">
          <p className="mb-3 text-sm font-medium text-emerald-100/85">
            Edukasi sampah · Distrik Mimika Baru
          </p>
          <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Panduan Pemilahan & Daur Ulang
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
            Artikel dan sosialisasi untuk warga — cara memilah, menyetor, dan
            memahami nilai sampah di bank sampah MIRU-G.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <CardSkeleton key={idx} className="h-64" />
              ))}
            </div>
          ) : error ? (
            <ErrorMessage
              title="Gagal memuat artikel"
              message="Tidak dapat mengambil konten edukasi. Periksa koneksi lalu coba lagi."
              onRetry={() => mutate()}
            />
          ) : list.length === 0 ? (
            <div className="rounded-xl bg-white px-6 py-16 text-center ring-1 ring-emerald-900/5">
              <BookOpen className="mx-auto size-10 text-emerald-700" />
              <h2 className="mt-4 text-lg font-extrabold">Belum ada artikel</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Konten edukasi akan tampil setelah admin menerbitkannya.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-emerald-600 px-5 text-sm font-bold text-white"
              >
                Kembali ke beranda
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((item, idx) => {
                const image = resolvePublicMediaUrl(item.gambar_url)
                return (
                  <Link
                    key={item.id}
                    href={`/edukasi/${item.id}`}
                    className="group overflow-hidden rounded-xl bg-white shadow-[0_18px_50px_-32px_rgba(6,78,59,0.55)] ring-1 ring-emerald-900/5 transition hover:-translate-y-0.5 motion-safe:animate-fade-up"
                    style={{ animationDelay: `${idx * 70}ms` }}
                  >
                    <div className="relative aspect-16/10 overflow-hidden bg-emerald-50">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt=""
                          className="size-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-emerald-700">
                          <BookOpen className="size-10" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
                        {item.kategori_terkait_nama ? (
                          <span className="font-bold tracking-wide text-emerald-700 uppercase">
                            {item.kategori_terkait_nama}
                          </span>
                        ) : null}
                        <span>
                          {formatDateWIT(item.created_at, { dateStyle: 'medium' })}
                        </span>
                      </div>
                      <h2 className="mt-2 line-clamp-2 text-base font-extrabold text-foreground">
                        {item.judul}
                      </h2>
                      <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">
                        {excerptMarkdown(item.isi, 140)}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
                        Baca artikel
                        <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
