/**
 * Single source of truth for the salon.
 *
 * The marketing copy, the service menu, the booking flow and the HairSalon
 * JSON-LD are all derived from this file, so a price change here updates the
 * page, the structured data and the booking summary together. Editing prices
 * in the markup is the classic way for a salon site to end up advertising a
 * balayage at $180 in Google and $210 at the chair.
 */

export type ServiceId =
  | 'cut-style'
  | 'balayage'
  | 'gloss-treatment'
  | 'colour-root'
  | 'bridal'
  | 'blow-dry';

export interface Service {
  id: ServiceId;
  name: string;
  blurb: string;
  /**
   * Starting price in whole currency units, formatted with SALON.currency.
   * PLACEHOLDER figures -- replace with the salon's real menu before launch.
   */
  fromPrice: number;
  /** Scheduled duration in minutes -- also sent to Square as the segment length. */
  durationMinutes: number;
  /** Lucide icon name, resolved in components/ServiceIcon.tsx. */
  icon: 'scissors' | 'sparkles' | 'droplet' | 'flower' | 'wand' | 'wind';
  /**
   * Square catalog service variation ID. Leave undefined until the catalog is
   * wired up -- the booking flow degrades to the enquiry form for these.
   */
  squareVariationId?: string;
}

export interface Stylist {
  id: string;
  name: string;
  title: string;
  /** Square team member ID, if this stylist is bookable online. */
  squareTeamMemberId?: string;
  specialties: string[];
  /** Portrait in public/, e.g. "/photos/team/nadia.jpg". Falls back to a monogram. */
  photo?: string;
}

export interface OpeningHours {
  /** Schema.org day names -- used verbatim in JSON-LD. */
  days: string[];
  /** 24h "HH:MM". */
  opens: string;
  closes: string;
}

export const SALON = {
  name: 'Iconiq Salon',
  tagline: 'Hair that behaves on the second day too.',
  established: 2019,
  neighbourhood: 'Nawanshahr, Punjab',
  /** Schema.org priceRange: a symbol run or a text range. */
  priceRange: '₹₹',
  currency: 'INR',
  timeZone: 'Asia/Kolkata',
  // PLACEHOLDER -- replace with the salon's real number before launch.
  phone: '+91 00000 00000',
  email: 'hello@iconiq.salon',
  address: {
    street: 'Kulam Road, near Shiv Mandir',
    locality: 'Nawanshahr',
    region: 'Punjab',
    postalCode: '144514',
    country: 'IN',
  },
  // Nawanshahr town centroid (31°07'N 76°08'E). Refine to the shopfront
  // once the exact pin is known -- this places the marker in the right town,
  // not on the right doorstep.
  geo: { latitude: 31.1167, longitude: 76.1333 },
  social: {
    instagram: 'https://www.instagram.com/iconiqsalon',
  },
} as const;

export const HOURS: OpeningHours[] = [
  // Open seven days, 9am-7pm. A closed day would be expressed by omission.
  {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '09:00',
    closes: '19:00',
  },
];

export const SERVICES: Service[] = [
  {
    id: 'cut-style',
    name: 'Cut & Style',
    blurb: 'A consultation first, scissors second. Cut dry so we shape what you actually have.',
    fromPrice: 400,
    durationMinutes: 45,
    icon: 'scissors',
  },
  {
    id: 'balayage',
    name: 'Balayage',
    blurb: 'Hand-painted, grown-out-gracefully colour. No harsh regrowth line at week six.',
    fromPrice: 4500,
    durationMinutes: 180,
    icon: 'sparkles',
  },
  {
    id: 'gloss-treatment',
    name: 'Gloss & Treatment',
    blurb: 'Bond-building gloss that resets shine between colour appointments.',
    fromPrice: 1800,
    durationMinutes: 60,
    icon: 'droplet',
  },
  {
    id: 'colour-root',
    name: 'Root Colour',
    blurb: 'Single-process coverage matched to your existing tone.',
    fromPrice: 1200,
    durationMinutes: 90,
    icon: 'wand',
  },
  {
    id: 'blow-dry',
    name: 'Blow-dry',
    blurb: 'Thirty minutes, in and out, good for three days.',
    fromPrice: 350,
    durationMinutes: 30,
    icon: 'wind',
  },
  {
    id: 'bridal',
    name: 'Bridal & Events',
    blurb: 'Trial, timeline and day-of styling. We travel within Manhattan.',
    fromPrice: 12000,
    durationMinutes: 120,
    icon: 'flower',
  },
];

export const STYLISTS: Stylist[] = [
  {
    id: 'nadia',
    name: 'Nadia Okonkwo',
    title: 'Founder · Colour Director',
    specialties: ['Balayage', 'Corrective colour', 'Curl'],
  },
  {
    id: 'marco',
    name: 'Marco Alvarez',
    title: 'Senior Stylist',
    specialties: ['Precision cutting', 'Fringe', 'Short shapes'],
  },
  {
    id: 'jun',
    name: 'Jun Park',
    title: 'Stylist · Treatment Specialist',
    specialties: ['Gloss', 'Bond repair', 'Blow-dry'],
  },
];

/** "Nadia Okonkwo" -> "NO". Used for the monogram portrait fallback. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function serviceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: SALON.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** "10:00" -> "10am", "20:00" -> "8pm". Compact enough for the hours table. */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12}${suffix}` : `${hour12}:${String(m).padStart(2, '0')}${suffix}`;
}

/** "Tuesday","Wednesday","Thursday","Friday" -> "Tue – Fri" */
export function formatDayRange(days: string[]): string {
  const short = (d: string) => d.slice(0, 3);
  if (days.length === 1) return short(days[0]);
  return `${short(days[0])} – ${short(days[days.length - 1])}`;
}

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
