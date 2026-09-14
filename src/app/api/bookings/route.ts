import { NextResponse } from 'next/server';

import { serviceById } from '@/lib/salon';
import { SquareError, createBooking, isSquareConfigured } from '@/lib/square';

export const dynamic = 'force-dynamic';

interface Payload {
  serviceId?: unknown;
  startAt?: unknown;
  teamMemberId?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  note?: unknown;
}

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

export async function POST(request: Request) {
  if (!isSquareConfigured()) {
    return NextResponse.json({ error: 'Online booking is not enabled.' }, { status: 503 });
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const service = isNonEmptyString(body.serviceId) ? serviceById(body.serviceId) : undefined;

  if (
    !service?.squareVariationId ||
    !isNonEmptyString(body.startAt) ||
    !isNonEmptyString(body.teamMemberId) ||
    !isNonEmptyString(body.name) ||
    !isNonEmptyString(body.email)
  ) {
    return NextResponse.json({ error: 'Missing booking details.' }, { status: 400 });
  }

  // Reject slots in the past outright rather than letting Square do it --
  // saves a round trip and gives a clearer message.
  const startAt = new Date(body.startAt);
  if (Number.isNaN(startAt.getTime()) || startAt.getTime() < Date.now()) {
    return NextResponse.json({ error: 'That time has already passed.' }, { status: 400 });
  }

  const [givenName, ...restName] = body.name.trim().split(/\s+/);

  try {
    const booking = await createBooking({
      serviceVariationId: service.squareVariationId,
      // Catalog version is required by Square and must be current. Wire this to
      // a Catalog API lookup once the service menu lives in Square.
      serviceVariationVersion: Number(process.env.SQUARE_VARIATION_VERSION ?? 0),
      teamMemberId: body.teamMemberId,
      startAt: startAt.toISOString(),
      customer: {
        givenName,
        familyName: restName.join(' ') || undefined,
        email: body.email,
        phone: isNonEmptyString(body.phone) ? body.phone : undefined,
      },
      note: isNonEmptyString(body.note) ? body.note : undefined,
    });

    return NextResponse.json({ id: booking.id, status: booking.status }, { status: 201 });
  } catch (error) {
    console.error('[bookings]', error);
    const status = error instanceof SquareError ? error.status : 502;
    return NextResponse.json(
      { error: 'We could not confirm that booking. Please call us.' },
      { status: status >= 400 && status < 500 ? 409 : 502 },
    );
  }
}
