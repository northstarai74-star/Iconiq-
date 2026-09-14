import { STYLISTS, initials } from '@/lib/salon';

/**
 * Portraits fall back to a monogram rather than an empty rectangle.
 *
 * A blank tonal block reads as a broken image; a set letter on a tonal ground
 * reads as a deliberate choice, which is what salons actually run before the
 * team photoshoot happens. Add `photo` to a stylist in salon.ts to replace it.
 */
export function Team() {
  return (
    <section id="team" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24 sm:py-32">
      <p className="eyebrow text-ink-400">Who you&apos;ll sit with</p>
      <h2 className="mt-4 max-w-lg text-4xl sm:text-5xl">Three chairs. No rotation.</h2>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-600">
        You book a person, not a slot. If your stylist is away, we will say so
        rather than quietly reassigning you.
      </p>

      <ul className="mt-14 grid gap-10 sm:grid-cols-3">
        {STYLISTS.map((stylist, i) => (
          <li key={stylist.id}>
            {stylist.photo ? (
              <img
                src={stylist.photo}
                alt={`${stylist.name}, ${stylist.title}`}
                width={900}
                height={1200}
                loading="lazy"
                decoding="async"
                className="aspect-3/4 w-full rounded-md object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className={`grid aspect-3/4 w-full place-items-center rounded-md
                            bg-gradient-to-br ${MONOGRAM_TONES[i % MONOGRAM_TONES.length]}`}
              >
                <span
                  className="font-[family-name:var(--font-display)] text-6xl font-light
                             text-white/70"
                >
                  {initials(stylist.name)}
                </span>
              </div>
            )}

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

/** Warm tonal grounds, deep enough for the white monogram to hold contrast. */
const MONOGRAM_TONES = [
  'from-[#a98d72] to-[#6b5340]',
  'from-[#c0a88e] to-[#7a6047]',
  'from-[#b39a80] to-[#5f4a3a]',
];
