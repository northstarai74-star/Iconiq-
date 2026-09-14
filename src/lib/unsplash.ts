/**
 * Unsplash gallery source.
 *
 * Three API rules drive the shape of this file:
 *
 *  1. Hotlink. We must embed the CDN URLs Unsplash returns, not re-host the
 *     bytes, so remotePatterns in next.config.ts allows images.unsplash.com.
 *  2. Track. When a photo is actually used, ping links.download_location.
 *  3. Attribute. Photographer + Unsplash links, with utm params.
 *
 * Rate limit is 50 req/hour in demo mode and 1000/hour approved, which is far
 * too low for per-request fetching -- hence the 24h revalidate and the fact
 * that the key is read only on the server. Never ship UNSPLASH_ACCESS_KEY to
 * the client.
 *
 * NOTE: source.unsplash.com (the old keyless `?salon` endpoint) was deprecated
 * in 2021 and shut down in 2024. It is dead; do not reintroduce it.
 */

import 'server-only';

export interface PhotoCredit {
  /** Photographer or Commons author. */
  name: string;
  profileUrl: string;
  photoUrl: string;
  /** Which service the photo came from -- rendered in the credit line. */
  source: 'Unsplash' | 'Wikimedia Commons';
  /** Required for Commons (CC-BY / CC-BY-SA); Unsplash needs no licence name. */
  license?: string;
  licenseUrl?: string;
}

export interface GalleryPhoto {
  id: string;
  src: string;
  srcSet: string;
  alt: string;
  blurHash: string | null;
  width: number;
  height: number;
  credit: PhotoCredit | null;
  /** Unsplash download-tracking endpoint; null for fallback images. */
  trackDownload: string | null;
}

const WIDTHS = [640, 1024, 1600, 2048];
const UTM = 'utm_source=iconiq_salon&utm_medium=referral';

/** Unsplash raw URLs already carry a query string; append params safely. */
function buildSrcSet(rawUrl: string): string {
  const sep = rawUrl.includes('?') ? '&' : '?';
  return WIDTHS.map((w) => `${rawUrl}${sep}auto=format&fit=crop&w=${w}&q=70 ${w}w`).join(', ');
}

interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  blur_hash: string | null;
  alt_description: string | null;
  description: string | null;
  urls: { raw: string };
  links: { html: string; download_location: string };
  user: { name: string; links: { html: string } };
}

/**
 * Fallback tiles, rendered locally as inline SVG data URIs.
 *
 * Deliberately NOT hard-coded Unsplash photo IDs: an ID that has been taken
 * down 404s and the gallery renders as broken images. A generated placeholder
 * always draws, works offline and in CI, and is visibly a placeholder -- which
 * is the honest signal that this salon still needs real photography or an
 * UNSPLASH_ACCESS_KEY.
 */
const PLACEHOLDER_TONES: Array<[string, string]> = [
  ['#8a7460', '#42342a'], // hero: deep enough for white type to sit on
  ['#c4a892', '#7d6149'],
  ['#d8cabb', '#9a8065'],
  ['#b9a894', '#6f5a46'],
  ['#e0d3c4', '#a98d72'],
  ['#cbb5a0', '#836a53'],
];

/** SVG is XML: an unescaped & or < in a label breaks the whole document. */
function xmlEscape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Art-directed placeholder tiles.
 *
 * Deliberately not flat gradients: a blank rectangle reads as a broken or
 * unfinished page, whereas a composed tonal study reads as intentional while
 * the real photography is still being shot. Layered radial washes plus a
 * fractal-noise grain give each tile depth and a film-like surface, so the
 * gallery holds together as a designed object rather than looking empty.
 *
 * `label` is optional: the hero renders full-bleed behind the headline, so a
 * caption there collides with the h1. Omit it for that slot.
 */
function placeholderSvg(from: string, to: string, seed: number, label?: string): string {
  const caption = label
    ? `<text x="50%" y="92%" text-anchor="middle" font-family="Georgia,serif" ` +
      `font-size="34" letter-spacing="1.5" fill="#ffffff" opacity="0.62">` +
      `${xmlEscape(label)}</text>`
    : '';

  // Offsets derived from the seed so no two tiles share a composition.
  const cx1 = 24 + ((seed * 17) % 40);
  const cy1 = 18 + ((seed * 29) % 34);
  const cx2 = 58 + ((seed * 13) % 34);
  const cy2 = 60 + ((seed * 23) % 30);

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1067">` +
    `<defs>` +
      `<linearGradient id="base" x1="0" y1="0" x2="1" y2="1">` +
        `<stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>` +
      `</linearGradient>` +
      // Two soft light sources, the way a window falls across a salon floor.
      `<radialGradient id="glow" cx="${cx1}%" cy="${cy1}%" r="62%">` +
        `<stop offset="0%" stop-color="#ffffff" stop-opacity="0.42"/>` +
        `<stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>` +
      `</radialGradient>` +
      `<radialGradient id="shade" cx="${cx2}%" cy="${cy2}%" r="58%">` +
        `<stop offset="0%" stop-color="#2b2724" stop-opacity="0.34"/>` +
        `<stop offset="100%" stop-color="#2b2724" stop-opacity="0"/>` +
      `</radialGradient>` +
      // Grain: keeps large flat areas from banding on wide gamut screens.
      `<filter id="grain" x="0" y="0" width="100%" height="100%">` +
        `<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${seed}"/>` +
        `<feColorMatrix type="saturate" values="0"/>` +
      `</filter>` +
      `<linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="55%" stop-color="#000000" stop-opacity="0"/>` +
        `<stop offset="100%" stop-color="#000000" stop-opacity="0.42"/>` +
      `</linearGradient>` +
    `</defs>` +
    `<rect width="1600" height="1067" fill="url(#base)"/>` +
    `<rect width="1600" height="1067" fill="url(#glow)"/>` +
    `<rect width="1600" height="1067" fill="url(#shade)"/>` +
    `<rect width="1600" height="1067" filter="url(#grain)" opacity="0.11"/>` +
    (label ? `<rect width="1600" height="1067" fill="url(#scrim)"/>` : '') +
    caption +
    `</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const FALLBACK: GalleryPhoto[] = [
  // Index 0 is consumed as the hero background, so it carries no caption.
  '',
  'Colour work',
  'Cut & finish',
  'The wash room',
  'At the mirror',
  'Styling detail',
].map((label, i) => {
  const [from, to] = PLACEHOLDER_TONES[i % PLACEHOLDER_TONES.length];
  return {
    id: `placeholder-${i}`,
    src: placeholderSvg(from, to, i + 1, label || undefined),
    srcSet: '',
    alt: label ? `${label} — placeholder image` : 'Salon interior — placeholder image',
    blurHash: null,
    width: 1600,
    height: 1067,
    credit: null,
    trackDownload: null,
  };
});

/**
 * Fetches gallery imagery, preferring the best source available.
 *
 *   0. public/photos -- the salon's own files. Always wins when present.
 *   1. Unsplash      -- only when UNSPLASH_ACCESS_KEY is set. Best quality and
 *                       responsive srcsets, but needs a provisioned key.
 *   2. Commons live  -- no key required. Curated categories first, keyword
 *                       search as backstop. CC-licensed: attribution required.
 *   3. Commons cache -- real photos snapshotted by `npm run fetch:photos`.
 *                       Covers request-time environments with no outbound
 *                       network (locked-down CI, air-gapped previews).
 *   4. Local         -- generated placeholders, for offline dev with no cache.
 *
 * Each tier falls through on failure, so a blocked network or a revoked key
 * degrades the gallery rather than breaking the page.
 */
export async function getGallery(
  query = 'hair salon interior',
  count = 6,
): Promise<GalleryPhoto[]> {
  // The salon's own photography always wins -- see src/lib/localPhotos.ts.
  const { getLocalPhotos } = await import('./localPhotos');
  const own = getLocalPhotos(count);
  if (own.length) {
    console.info(`[gallery] using ${own.length} photos from public/photos`);
    return own;
  }

  const fromUnsplash = await tryUnsplash(query, count);
  if (fromUnsplash.length) return fromUnsplash;

  if (process.env.DISABLE_WIKIMEDIA !== '1') {
    try {
      const { getCommonsPhotos } = await import('./wikimedia');
      const live = await getCommonsPhotos(query, count);
      if (live.length) return live;
    } catch (error) {
      console.warn('[gallery] Commons lookup failed:', error);
    }
  }

  const { getCachedCommonsPhotos } = await import('./commonsCache');
  const cached = getCachedCommonsPhotos(count);
  if (cached.length) {
    console.info(`[gallery] using ${cached.length} cached Commons photos`);
    return cached;
  }

  console.warn(
    '[gallery] no Commons photos available — rendering placeholders. ' +
      'Run `npm run fetch:photos` on a connected machine to cache real ones.',
  );
  return FALLBACK.slice(0, count);
}

/** Returns [] rather than throwing, so getGallery can just fall through. */
async function tryUnsplash(query: string, count: number): Promise<GalleryPhoto[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return [];

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}` +
        `&per_page=${count}&orientation=landscape&content_filter=high`,
      {
        headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' },
        next: { revalidate: 60 * 60 * 24 },
      },
    );

    if (!res.ok) return [];

    const { results } = (await res.json()) as { results: UnsplashPhoto[] };
    if (!results?.length) return [];

    return results.map((p) => ({
      id: p.id,
      src: `${p.urls.raw}&auto=format&fit=crop&w=1600&q=70`,
      srcSet: buildSrcSet(p.urls.raw),
      alt: p.alt_description ?? p.description ?? query,
      blurHash: p.blur_hash,
      width: p.width,
      height: p.height,
      credit: {
        name: p.user.name,
        profileUrl: `${p.user.links.html}?${UTM}`,
        photoUrl: `${p.links.html}?${UTM}`,
        source: 'Unsplash' as const,
      },
      trackDownload: p.links.download_location,
    }));
  } catch {
    // Network failure must never take down the page -- the gallery is decorative.
    return [];
  }
}

/**
 * Required by the Unsplash API guidelines whenever a photo is genuinely "used"
 * (selected, downloaded, published). Fire-and-forget: a failed analytics ping
 * is not worth failing a request over.
 */
export async function trackDownload(downloadLocation: string): Promise<void> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return;
  try {
    await fetch(downloadLocation, { headers: { Authorization: `Client-ID ${key}` } });
  } catch {
    /* ignore */
  }
}
