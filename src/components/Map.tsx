'use client';

import { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

import { SALON } from '@/lib/salon';

/**
 * Location map, loaded on demand.
 *
 * The embed is Google Maps' `output=embed` endpoint, which needs no API key and
 * no billing account (the Maps JavaScript API needs both). It is NOT mounted on
 * first paint, for three reasons:
 *
 *  - A blocked or offline frame paints its own opaque error page, so a failed
 *    iframe leaves a grey void with a broken-document icon. Nothing rendered
 *    behind it can show through.
 *  - It drops Google cookies on every visitor before they ask for a map.
 *  - It is a third-party frame on the critical path for no benefit to someone
 *    who never scrolls this far.
 *
 * So the branded panel is the default state, and the frame replaces it on
 * click. The address and the "Directions" link sit outside the frame either
 * way, so the section still does its job if Google is unreachable entirely.
 */
export function Map() {
  const [showFrame, setShowFrame] = useState(false);

  const query = [
    SALON.address.street,
    SALON.address.locality,
    SALON.address.region,
    SALON.address.postalCode,
    'India',
  ].join(', ');

  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
  const linkHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <section id="map" aria-labelledby="map-heading" className="scroll-mt-20 bg-bone-100">
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-10 sm:pt-24">
        <p className="eyebrow text-ink-400">Find us</p>
        <h2 id="map-heading" className="mt-4 max-w-lg text-4xl sm:text-5xl">
          Kulam Road, by the Shiv Mandir.
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-600">
          Two minutes from the mandir on Kulam Road. Parking is on the street
          directly outside.
        </p>
      </div>

      <div className="relative aspect-4/3 w-full overflow-hidden border-y border-bone-200 sm:aspect-21/9">
        {showFrame ? (
          <iframe
            src={embedSrc}
            title={`Map showing ${SALON.name}, ${SALON.address.street}, ${SALON.address.locality}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#cbb5a0] to-[#6b5340] px-6">
            {/* Suggestion of streets, so the panel reads as a map rather than a blank tile. */}
            <svg
              aria-hidden="true"
              className="absolute inset-0 h-full w-full opacity-25"
              viewBox="0 0 1200 500"
              preserveAspectRatio="xMidYMid slice"
            >
              <g stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round">
                <path d="M-20 190 L560 150 L1220 215" strokeWidth="7" />
                <path d="M470 -20 L520 520" strokeWidth="5" />
                <path d="M-20 370 L1220 330" />
                <path d="M840 -20 L880 520" />
                <path d="M180 -20 L210 520" />
              </g>
            </svg>

            <div className="relative text-center">
              <MapPin className="mx-auto h-7 w-7 text-white/85" strokeWidth={1.25} aria-hidden="true" />
              <p className="mt-4 font-[family-name:var(--font-display)] text-2xl text-white">
                {SALON.address.street}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/70">
                {SALON.address.locality} · {SALON.address.postalCode}
              </p>
              <button
                type="button"
                onClick={() => setShowFrame(true)}
                className="mt-6 rounded-full bg-white px-7 py-3 text-xs uppercase
                           tracking-[0.2em] text-ink-900 transition hover:bg-bone-200"
              >
                Load map
              </button>
              <p className="mt-3 text-[0.65rem] text-white/60">Loads Google Maps</p>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-8">
        <p className="flex items-center gap-3 text-sm text-ink-600">
          <MapPin className="h-5 w-5 shrink-0 text-ink-400" strokeWidth={1.25} aria-hidden="true" />
          {SALON.address.street}, {SALON.address.locality}, {SALON.address.region}{' '}
          {SALON.address.postalCode}
        </p>
        <a
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-ink-400/40 px-6 py-3
                     text-xs uppercase tracking-[0.2em] text-ink-800 transition hover:border-ink-800"
        >
          <Navigation className="h-4 w-4" strokeWidth={1.25} aria-hidden="true" />
          Directions
        </a>
      </div>
    </section>
  );
}
