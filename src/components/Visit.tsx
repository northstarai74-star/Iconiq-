import { Clock, MapPin, Phone } from 'lucide-react';

import { HOURS, SALON, formatDayRange, formatTime } from '@/lib/salon';

export function Visit() {
  const mapsQuery = encodeURIComponent(
    `${SALON.address.street}, ${SALON.address.locality}, ${SALON.address.region} ${SALON.address.postalCode}`,
  );

  return (
    <section id="visit" className="bg-ink-900 py-24 text-bone-100 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 sm:grid-cols-2">
        <div>
          <p className="eyebrow text-bone-300/70">Visit</p>
          <h2 className="mt-4 text-4xl text-bone-50 sm:text-5xl">
            {SALON.address.street}
            <br />
            {SALON.neighbourhood}
          </h2>

          <dl className="mt-10 space-y-5 text-sm">
            <div className="flex gap-4">
              <dt>
                <MapPin className="h-5 w-5 text-bone-300/60" strokeWidth={1.25} aria-hidden="true" />
                <span className="sr-only">Address</span>
              </dt>
              <dd>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:underline"
                >
                  {SALON.address.street}, {SALON.address.locality} {SALON.address.postalCode}
                </a>
              </dd>
            </div>

            <div className="flex gap-4">
              <dt>
                <Phone className="h-5 w-5 text-bone-300/60" strokeWidth={1.25} aria-hidden="true" />
                <span className="sr-only">Phone</span>
              </dt>
              <dd>
                <a href={`tel:${SALON.phone}`} className="underline-offset-4 hover:underline">
                  {SALON.phone}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-bone-300/60" strokeWidth={1.25} aria-hidden="true" />
            <h3 className="text-xl text-bone-50">Opening hours</h3>
          </div>

          {/*
            Rendered from the same HOURS array that feeds the JSON-LD, so the
            hours Google shows and the hours on the page cannot drift.
          */}
          <dl className="mt-6 divide-y divide-white/10 border-y border-white/10 text-sm">
            {HOURS.map((block) => (
              <div key={block.days.join()} className="flex justify-between py-3">
                <dt className="text-bone-300/80">{formatDayRange(block.days)}</dt>
                <dd className="tabular-nums">
                  {formatTime(block.opens)} – {formatTime(block.closes)}
                </dd>
              </div>
            ))}
            <div className="flex justify-between py-3">
              <dt className="text-bone-300/80">Mon</dt>
              <dd className="text-bone-300/60">Closed</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
