import { SALON } from '@/lib/salon';

export function Footer() {
  return (
    <footer className="border-t border-bone-200 bg-bone-50 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {SALON.name}
        </p>
        <div className="flex gap-6">
          <a
            href={SALON.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-ink-800"
          >
            Instagram
          </a>
          <a href={`mailto:${SALON.email}`} className="transition hover:text-ink-800">
            {SALON.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
