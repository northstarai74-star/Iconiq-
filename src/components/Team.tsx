import { STYLISTS } from '@/lib/salon';

export function Team() {
  return (
    <section id="team" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24 sm:py-32">
      <p className="eyebrow text-ink-400">Who you'll sit with</p>
      <h2 className="mt-4 max-w-lg text-4xl sm:text-5xl">Three chairs. No rotation.</h2>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-600">
        You book a person, not a slot. If your stylist is away, we will say so
        rather than quietly reassigning you.
      </p>

      <ul className="mt-14 grid gap-10 sm:grid-cols-3">
        {STYLISTS.map((stylist) => (
          <li key={stylist.id}>
            <div
              aria-hidden="true"
              className="aspect-3/4 w-full rounded-md bg-gradient-to-br from-bone-200 to-bone-300"
            />
            <h3 className="mt-5 text-2xl">{stylist.name}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-ink-400">
              {stylist.title}
            </p>
            <p className="mt-3 text-sm text-ink-600">{stylist.specialties.join(' · ')}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
