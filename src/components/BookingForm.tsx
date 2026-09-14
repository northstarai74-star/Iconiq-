'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, Loader2, PhoneCall } from 'lucide-react';

import { SERVICES, SALON, formatPrice, type ServiceId } from '@/lib/salon';
import { ServiceIcon } from './ServiceIcon';

interface Slot {
  startAt: string;
  teamMemberId: string;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'unavailable' }
  | { kind: 'ready'; slots: Slot[] }
  | { kind: 'error'; message: string }
  | { kind: 'confirmed'; id: string };

export function BookingForm() {
  const [serviceId, setServiceId] = useState<ServiceId>(SERVICES[0].id);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [slot, setSlot] = useState<Slot | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const service = SERVICES.find((s) => s.id === serviceId)!;

  useEffect(() => {
    // AbortController stops a slow response for a previously-selected service
    // from overwriting the slots for the one the user just picked.
    const controller = new AbortController();
    setSlot(null);
    setStatus({ kind: 'loading' });

    fetch(`/api/availability?service=${serviceId}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error('unavailable');
        return res.json() as Promise<{ configured: boolean; slots: Slot[] }>;
      })
      .then((data) => {
        setStatus(
          data.configured ? { kind: 'ready', slots: data.slots } : { kind: 'unavailable' },
        );
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setStatus({ kind: 'unavailable' });
      });

    return () => controller.abort();
  }, [serviceId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!slot) return;

    setSubmitting(true);
    const form = new FormData(event.currentTarget);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          startAt: slot.startAt,
          teamMemberId: slot.teamMemberId,
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          note: form.get('note'),
        }),
      });

      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Booking failed');
      setStatus({ kind: 'confirmed', id: data.id! });
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Booking failed',
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (status.kind === 'confirmed') {
    return (
      <div className="rounded-lg border border-bone-200 bg-white p-10 text-center">
        <CalendarCheck className="mx-auto h-8 w-8 text-accent-500" strokeWidth={1.25} />
        <h2 className="mt-5 text-3xl">You&apos;re booked.</h2>
        <p className="mt-3 text-sm text-ink-600">
          A confirmation is on its way. Reference{' '}
          <span className="font-medium text-ink-800">{status.id.slice(0, 8)}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <fieldset>
        <legend className="eyebrow text-ink-400">1 · Choose a service</legend>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {SERVICES.map((s) => {
            const selected = s.id === serviceId;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setServiceId(s.id)}
                  aria-pressed={selected}
                  className={`flex w-full items-start gap-4 rounded-md border p-4 text-left transition ${
                    selected
                      ? 'border-accent-500 bg-white'
                      : 'border-bone-200 bg-bone-50 hover:border-bone-300'
                  }`}
                >
                  <ServiceIcon
                    name={s.icon}
                    className={`mt-0.5 h-5 w-5 ${selected ? 'text-accent-500' : 'text-ink-400'}`}
                  />
                  <span>
                    <span className="block text-lg leading-tight">{s.name}</span>
                    <span className="mt-1 block text-xs text-ink-400">
                      from {formatPrice(s.fromPrice)} · {s.durationMinutes} min
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="eyebrow text-ink-400">2 · Pick a time</legend>

        {status.kind === 'loading' && (
          <p className="mt-5 flex items-center gap-2 text-sm text-ink-400">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Checking the book…
          </p>
        )}

        {status.kind === 'unavailable' && (
          <div className="mt-5 rounded-md border border-bone-200 bg-bone-100 p-6">
            <p className="flex items-center gap-2 text-sm text-ink-600">
              <PhoneCall className="h-4 w-4 text-ink-400" strokeWidth={1.25} aria-hidden="true" />
              Online booking isn&apos;t connected for {service.name} yet.
            </p>
            <p className="mt-3 text-sm text-ink-600">
              Call{' '}
              <a href={`tel:${SALON.phone}`} className="underline underline-offset-4">
                {SALON.phone}
              </a>{' '}
              or email{' '}
              <a href={`mailto:${SALON.email}`} className="underline underline-offset-4">
                {SALON.email}
              </a>{' '}
              and we&apos;ll get you in.
            </p>
          </div>
        )}

        {status.kind === 'ready' && status.slots.length === 0 && (
          <p className="mt-5 text-sm text-ink-600">
            Nothing free in the next month for {service.name}. Call us — we keep a
            cancellation list.
          </p>
        )}

        {status.kind === 'ready' && status.slots.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {status.slots.slice(0, 24).map((s) => {
              const selected = slot?.startAt === s.startAt;
              return (
                <li key={`${s.startAt}-${s.teamMemberId}`}>
                  <button
                    type="button"
                    onClick={() => setSlot(s)}
                    aria-pressed={selected}
                    className={`rounded-full border px-4 py-2 text-xs tabular-nums transition ${
                      selected
                        ? 'border-accent-500 bg-accent-500 text-white'
                        : 'border-bone-300 hover:border-ink-400'
                    }`}
                  >
                    {new Intl.DateTimeFormat('en-US', {
                      weekday: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      timeZone: SALON.timeZone,
                    }).format(new Date(s.startAt))}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </fieldset>

      <fieldset disabled={!slot} className="transition disabled:opacity-40">
        <legend className="eyebrow text-ink-400">3 · Your details</legend>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field name="name" label="Name" required />
          <Field name="email" label="Email" type="email" required />
          <Field name="phone" label="Phone" type="tel" />
          <Field name="note" label="Anything we should know?" />
        </div>

        <button
          type="submit"
          disabled={!slot || submitting}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink-900 px-9 py-4
                     text-xs uppercase tracking-[0.2em] text-bone-50 transition
                     hover:bg-accent-600 disabled:cursor-not-allowed"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitting ? 'Confirming…' : 'Confirm booking'}
        </button>

        {status.kind === 'error' && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {status.message}
          </p>
        )}
      </fieldset>
    </form>
  );
}

function Field({
  name,
  label,
  type = 'text',
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.15em] text-ink-400">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={
          name === 'name' ? 'name' : name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'off'
        }
        className="mt-2 w-full border-b border-bone-300 bg-transparent py-2 text-sm
                   outline-none transition focus:border-accent-500"
      />
    </label>
  );
}
