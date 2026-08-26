const KEYWORDS = [
  'Edukasi',
  'Pemilahan',
  'Daur Ulang',
  'Setoran Digital',
  'Penjemputan',
  'Penimbangan',
  'Tabungan Sampah',
  'Laporan Distrik',
] as const

/** Ulangi supaya satu track ≥ lebar viewport; 2 track identik → loop translate -50% tanpa gap. */
const REPEAT = 4

function MarqueeTrack({
  words,
  hidden,
}: {
  words: readonly string[]
  hidden?: boolean
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-8 px-8"
      aria-hidden={hidden || undefined}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="flex items-center gap-8 text-xs font-bold tracking-[0.22em] text-emerald-50/90 uppercase"
        >
          {word}
          <span className="size-1.5 shrink-0 rounded-full bg-emerald-400" />
        </span>
      ))}
    </div>
  )
}

export function KeywordMarquee() {
  const track = Array.from({ length: REPEAT }, () => [...KEYWORDS]).flat()

  return (
    <div className="overflow-hidden bg-emerald-950 py-3" role="presentation">
      <div className="flex w-max motion-safe:animate-marquee-x motion-reduce:animate-none">
        <MarqueeTrack words={track} />
        <MarqueeTrack words={track} hidden />
      </div>
    </div>
  )
}
