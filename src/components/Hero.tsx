'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { SALON } from '@/lib/salon';
import type { GalleryPhoto } from '@/lib/unsplash';

export function Hero({ photos }: { photos: GalleryPhoto[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const photo = photos[currentIndex] || photos[0];

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % photos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoPlay, photos.length]);

  const goToPrevious = () => {
    setAutoPlay(false);
    setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
  };

  const goToNext = () => {
    setAutoPlay(false);
    setCurrentIndex((i) => (i + 1) % photos.length);
  };

  return (
    <section className="relative isolate grid min-h-[88vh] place-items-center overflow-hidden group">
      {/* Slideshow container */}
      <div className="absolute inset-0 -z-10">
        {photos.map((p, i) => (
          <img
            key={p.id}
            src={p.src}
            srcSet={p.srcSet || undefined}
            sizes="100vw"
            alt={p.alt}
            fetchPriority={i === 0 ? 'high' : 'low'}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity
                        duration-1000 ${i === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>

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

      {/* Slideshow controls */}
      {photos.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            onMouseEnter={() => setAutoPlay(false)}
            aria-label="Previous image"
            className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full
                       bg-white/10 hover:bg-white/20 text-white transition opacity-0
                       group-hover:opacity-100 backdrop-blur-sm"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
          </button>

          <button
            onClick={goToNext}
            onMouseEnter={() => setAutoPlay(false)}
            aria-label="Next image"
            className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full
                       bg-white/10 hover:bg-white/20 text-white transition opacity-0
                       group-hover:opacity-100 backdrop-blur-sm"
          >
            <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setAutoPlay(false);
                  setCurrentIndex(i);
                }}
                aria-label={`Go to image ${i + 1}`}
                className={`h-2 rounded-full transition ${
                  i === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
