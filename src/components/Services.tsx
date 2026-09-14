import Link from 'next/link';

import { SERVICES, formatPrice } from '@/lib/salon';
import { ServiceIcon } from './ServiceIcon';

export function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24 sm:py-32">
      <div className="max-w-xl">
        <p className="eyebrow text-ink-400">The menu</p>
        <h2 className="mt-4 text-4xl sm:text-5xl">Priced from, never priced vaguely.</h2>
        <p className="mt-5 text-sm leading-relaxed text-ink-600">
          Final price depends on hair length and density — your stylist confirms
          it at consultation, before anything is mixed.
        </p>
      </div>

      <ul className="mt-14 grid gap-px overflow-hidden rounded-lg bg-bone-200 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <li key={service.id} className="group bg-bone-50 p-8 transition hover:bg-white">
            <ServiceIcon
              name={service.icon}
              className="h-6 w-6 text-ink-400 transition group-hover:text-accent-500"
            />
            <h3 className="mt-6 text-2xl">{service.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{service.blurb}</p>
            <p className="mt-5 text-xs uppercase tracking-[0.15em] text-ink-400">
              from {formatPrice(service.fromPrice)} ·{' '}
              <span className="tabular-nums">{service.durationMinutes}</span> min
            </p>
          </li>
        ))}
      </ul>

      <Link
        href="/book"
        className="mt-12 inline-block rounded-full bg-ink-900 px-9 py-4 text-xs uppercase
                   tracking-[0.2em] text-bone-50 transition hover:bg-accent-600"
      >
        Check availability
      </Link>
    </section>
  );
}
