/**
 * Square Bookings API client.
 *
 * Deliberately a thin fetch wrapper rather than the Square SDK: we use three
 * endpoints, and the SDK pulls a large dependency into the server bundle for
 * no benefit here.
 *
 * Docs: https://developer.squareup.com/docs/bookings-api/what-it-is
 *
 * Everything is guarded by isSquareConfigured(). With no credentials the
 * booking UI falls back to a phone/email enquiry rather than erroring, so the
 * site is deployable before the salon's Square account exists.
 */

import { SALON, type Service } from './salon';

const SQUARE_VERSION = '2026-01-22';

function baseUrl(): string {
  return process.env.SQUARE_ENVIRONMENT === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';
}

export function isSquareConfigured(): boolean {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID);
}

export interface Slot {
  /** RFC3339 start instant, e.g. "2026-09-15T14:00:00Z". */
  startAt: string;
  teamMemberId: string;
}

export interface BookingRequest {
  serviceVariationId: string;
  serviceVariationVersion: number;
  teamMemberId: string;
  startAt: string;
  customer: { givenName: string; familyName?: string; email: string; phone?: string };
  note?: string;
}

class SquareError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = 'SquareError';
  }
}

async function squareFetch<T>(path: string, body: unknown): Promise<T> {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) throw new SquareError('Square is not configured', 503);

  const res = await fetch(`${baseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Square-Version': SQUARE_VERSION,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    // Availability changes minute to minute; never let Next cache it.
    cache: 'no-store',
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Square returns { errors: [{ category, code, detail }] }.
    const detail = (json as { errors?: Array<{ detail?: string }> })?.errors?.[0]?.detail;
    throw new SquareError(detail ?? `Square request failed (${res.status})`, res.status, json);
  }

  return json as T;
}

/**
 * POST /v2/bookings/availability/search
 *
 * Square caps the search window at 32 days and only returns slots that fit the
 * full service duration, so the caller does not need to filter by length.
 */
export async function searchAvailability(
  service: Service,
  from: Date,
  to: Date,
  teamMemberIds?: string[],
): Promise<Slot[]> {
  if (!service.squareVariationId) return [];

  const json = await squareFetch<{
    availabilities?: Array<{
      start_at: string;
      appointment_segments?: Array<{ team_member_id: string }>;
    }>;
  }>('/v2/bookings/availability/search', {
    query: {
      filter: {
        start_at_range: { start_at: from.toISOString(), end_at: to.toISOString() },
        location_id: process.env.SQUARE_LOCATION_ID,
        segment_filters: [
          {
            service_variation_id: service.squareVariationId,
            ...(teamMemberIds?.length
              ? { team_member_id_filter: { any: teamMemberIds } }
              : {}),
          },
        ],
      },
    },
  });

  return (json.availabilities ?? []).map((a) => ({
    startAt: a.start_at,
    teamMemberId: a.appointment_segments?.[0]?.team_member_id ?? '',
  }));
}

/**
 * Creates (or reuses) a customer, then the booking.
 *
 * The idempotency_key is what stops a double-tapped "Confirm" button from
 * booking the same chair twice -- Square replays the original response instead
 * of creating a second appointment.
 */
export async function createBooking(req: BookingRequest): Promise<{ id: string; status: string }> {
  const customer = await squareFetch<{ customer?: { id: string } }>('/v2/customers', {
    idempotency_key: crypto.randomUUID(),
    given_name: req.customer.givenName,
    family_name: req.customer.familyName,
    email_address: req.customer.email,
    phone_number: req.customer.phone,
  });

  const json = await squareFetch<{ booking?: { id: string; status: string } }>('/v2/bookings', {
    idempotency_key: crypto.randomUUID(),
    booking: {
      location_id: process.env.SQUARE_LOCATION_ID,
      customer_id: customer.customer?.id,
      start_at: req.startAt,
      customer_note: req.note,
      appointment_segments: [
        {
          team_member_id: req.teamMemberId,
          service_variation_id: req.serviceVariationId,
          // Required, and it must match the current catalog version --
          // Square rejects the booking after any catalog edit otherwise.
          service_variation_version: req.serviceVariationVersion,
        },
      ],
    },
  });

  if (!json.booking) throw new SquareError('Square returned no booking', 502, json);
  return { id: json.booking.id, status: json.booking.status };
}

/** Human-facing fallback when online booking is unavailable. */
export const enquiryFallback = {
  phone: SALON.phone,
  email: SALON.email,
  message: 'Online booking is not connected yet — call or email and we will get you in.',
};

export { SquareError };
