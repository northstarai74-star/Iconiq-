import type { Metadata } from 'next';
import Link from 'next/link';

import { BookingForm } from '@/components/BookingForm';
import { Footer } from '@/components/Footer';
import { SALON } from '@/lib/salon';

export const metadata: Metadata = {
  title: 'Book an appointment',
  description: `Check live availability and book with a stylist at ${SALON.name}.`,
  alternates: { canonical: '/book' },
};

export default function BookPage() {
  return (
    <>
      <header className="border-b border-bone-200">
        <nav aria-label="Primary" className="mx-auto max-w-3xl px-6 py-6">
          <Link href="/" className="font-[family-name:var(--font-display)] text-2xl">
            {SALON.name}
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <p className="eyebrow text-ink-400">Booking</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">Find a chair.</h1>
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-ink-600">
          Times shown are live from our book. Consultations are included — if the
          shape you want needs longer, we&apos;ll adjust when you arrive.
        </p>

        <div className="mt-14">
          <BookingForm />
        </div>
      </main>

      <Footer />
    </>
  );
}
