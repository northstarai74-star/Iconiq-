import Link from 'next/link';

import { SALON } from '@/lib/salon';
import type { GalleryPhoto } from '@/lib/unsplash';

export function Hero({ photo }: { photo: GalleryPhoto }) {
  return (
    <section className="relative isolate grid min-h-[88vh] place-items-center overflow-hidden">
      {/*
        Plain <img> rather than next/image: this is the LCP element and the
        source is either a remote CDN URL or an inline SVG data URI, so the
        optimizer adds a hop without adding value. fetchPriority high tells the
        browser to start it before the fonts.
      */}
      <img
        src={photo.src}
        srcSet={photo.srcSet || undefined}
        sizes="100vw"
        alt={photo.alt}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/35 to-black/70"
      />

      <div className="mx-auto max-w-3xl px-6 text-center text-white">
        <p className="eyebrow text-white/70">
          Est. {SALON.established} · {SALON.neighbourhood}
        </p>
        <h1 className="mt-5 text-5xl text-balance sm:text-7xl">{SALON.tagline}</h1>
        <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-white/80">
          A small colour-led salon. We book one client per stylist at a time, so
          nobody sits under foils waiting to be remembered.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/book"
            className="rounded-full bg-white px-9 py-4 text-xs uppercase tracking-[0.2em]
                       text-ink-900 transition hover:bg-bone-200"
          >
            Book an appointment
          </Link>
          <a
            href={`tel:${SALON.phone}`}
            className="rounded-full border border-white/40 px-9 py-4 text-xs uppercase
                       tracking-[0.2em] text-white transition hover:border-white"
          >
            {SALON.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
