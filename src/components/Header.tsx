import Link from 'next/link';

import { SALON } from '@/lib/salon';

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6"
      >
        <Link href="/" className="font-[family-name:var(--font-display)] text-2xl text-white">
          {SALON.name}
        </Link>

        <div className="flex items-center gap-8">
          <ul className="hidden items-center gap-8 text-sm text-white/80 sm:flex">
            <li>
              <a href="/#services" className="transition hover:text-white">
                Services
              </a>
            </li>
            <li>
              <a href="/#team" className="transition hover:text-white">
                Team
              </a>
            </li>
            <li>
              <a href="/#visit" className="transition hover:text-white">
                Visit
              </a>
            </li>
          </ul>

          <Link
            href="/book"
            className="rounded-full border border-white/40 px-5 py-2 text-xs uppercase
                       tracking-[0.2em] text-white transition hover:bg-white
                       hover:text-ink-900"
          >
            Book
          </Link>
        </div>
      </nav>
    </header>
  );
}
