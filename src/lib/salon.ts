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
  | 'colour-root'
  | 'bridal'
  | 'nails'
  | 'skin-care'
  | 'makeup';

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
  name: 'Iconiq Hair & Beauty Unisex Studio',
  tagline: 'Premium Hair, Nails, Skin & Make-up Services',
  established: 2019,
  neighbourhood: 'Nawanshahr, Punjab',
  /** Schema.org priceRange: a symbol run or a text range. */
  priceRange: '₹₹',
  currency: 'INR',
  timeZone: 'Asia/Kolkata',
  phone: '+91 79018-95498',
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
    whatsapp: 'https://wa.me/917901895498',
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
    name: 'Hair Cutting & Styling',
    blurb: 'Professional haircuts and styling tailored to your face shape and hair type.',
    fromPrice: 300,
    durationMinutes: 45,
    icon: 'scissors',
  },
  {
    id: 'balayage',
    name: 'Hair Colouring',
    blurb: 'Expert colour services including balayage, highlights, and full colour treatments.',
    fromPrice: 1500,
    durationMinutes: 120,
    icon: 'sparkles',
  },
  {
    id: 'colour-root',
    name: 'Hair Treatment & Keratin',
    blurb: 'Nourishing treatments and keratin smoothing for healthy, shiny hair.',
    fromPrice: 1200,
    durationMinutes: 90,
    icon: 'droplet',
  },
  {
    id: 'nails',
    name: 'Nail Services',
    blurb: 'Manicure, pedicure, nail art, and gel extensions with premium finishes.',
    fromPrice: 400,
    durationMinutes: 60,
    icon: 'sparkles',
  },
  {
    id: 'skin-care',
    name: 'Skincare & Facials',
    blurb: 'Professional facials, threading, bleaching, and skin treatments.',
    fromPrice: 500,
    durationMinutes: 45,
    icon: 'flower',
  },
  {
    id: 'makeup',
    name: 'Makeup Services',
    blurb: 'Professional makeup for special occasions, daily looks, and bridal packages.',
    fromPrice: 800,
    durationMinutes: 60,
    icon: 'wand',
  },
];

export const STYLISTS: Stylist[] = [
  {
    id: 'founder',
    name: 'Owner & Founder',
    title: 'Proprietor',
    specialties: ['Hair Colouring', 'Styling', 'Treatments'],
  },
  {
    id: 'stylist1',
    name: 'Senior Hair Stylist',
    title: 'Master Stylist',
    specialties: ['Cutting', 'Colouring', 'Hair Treatment'],
  },
  {
    id: 'specialist',
    name: 'Beauty Specialist',
    title: 'Multi-Service Expert',
    specialties: ['Nails', 'Skincare', 'Makeup', 'Threading'],
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
