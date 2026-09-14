import { NextResponse } from 'next/server';

import { serviceById } from '@/lib/salon';
import { SquareError, isSquareConfigured, searchAvailability } from '@/lib/square';

export const dynamic = 'force-dynamic';

/** Square caps the availability window at 32 days. */
const MAX_WINDOW_DAYS = 31;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get('service');
  const stylistId = searchParams.get('stylist');

  const service = serviceId ? serviceById(serviceId) : undefined;
  if (!service) {
    return NextResponse.json({ error: 'Unknown service' }, { status: 400 });
  }

  if (!isSquareConfigured() || !service.squareVariationId) {
    // 200, not an error: "no online booking for this service" is a normal
    // state the UI renders as the enquiry fallback.
    return NextResponse.json({ configured: false, slots: [] });
  }

  const from = new Date();
  const to = new Date(from.getTime() + MAX_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  try {
    const slots = await searchAvailability(
      service,
      from,
      to,
      stylistId ? [stylistId] : undefined,
    );
    return NextResponse.json({ configured: true, slots });
  } catch (error) {
    const status = error instanceof SquareError ? error.status : 502;
    console.error('[availability]', error);
    // Never surface Square's raw error text to the client -- it can leak
    // location IDs and internal catalog identifiers.
    return NextResponse.json(
      { error: 'Could not load availability right now.' },
      { status: status === 503 ? 503 : 502 },
    );
  }
}
