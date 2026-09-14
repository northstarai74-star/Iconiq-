import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <h1 className="text-5xl">Nothing here.</h1>
        <p className="mt-4 text-sm text-ink-600">That page has grown out.</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-ink-900 px-8 py-3 text-xs uppercase
                     tracking-[0.2em] text-bone-50 transition hover:bg-accent-600"
        >
          Back to the salon
        </Link>
      </div>
    </main>
  );
}
