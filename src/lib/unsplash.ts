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

export interface GalleryPhoto {
  id: string;
  src: string;
  srcSet: string;
  alt: string;
  blurHash: string | null;
  width: number;
  height: number;
  credit: { name: string; profileUrl: string; photoUrl: string } | null;
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
  ['#e7ded6', '#cbbcae'],
  ['#ded6d2', '#bfa89c'],
  ['#e4ddd4', '#c2b3a3'],
  ['#dcd4cd', '#b8a695'],
  ['#eae3db', '#cdbdad'],
  ['#d8cfc7', '#b2a091'],
];

function placeholderSvg(from: string, to: string, label: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1067">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>` +
    `</linearGradient></defs>` +
    `<rect width="1600" height="1067" fill="url(#g)"/>` +
    `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" ` +
    `font-family="Georgia,serif" font-size="44" fill="#6b5d52" opacity="0.55">${label}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const FALLBACK: GalleryPhoto[] = [
  'Salon interior',
  'Colour work',
  'Cut & finish',
  'The wash room',
  'At the mirror',
  'Styling detail',
].map((label, i) => {
  const [from, to] = PLACEHOLDER_TONES[i % PLACEHOLDER_TONES.length];
  const src = placeholderSvg(from, to, label);
  return {
    id: `placeholder-${i}`,
    src,
    srcSet: '',
    alt: `${label} — placeholder image`,
    blurHash: null,
    width: 1600,
    height: 1067,
    credit: null,
    trackDownload: null,
  };
});

/**
 * Fetches gallery imagery. Revalidates daily -- salon galleries do not need to
 * be fresher than that, and it keeps us far inside the rate limit.
 */
export async function getGallery(
  query = 'hair salon interior',
  count = 6,
): Promise<GalleryPhoto[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return FALLBACK.slice(0, count);

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}` +
        `&per_page=${count}&orientation=landscape&content_filter=high`,
      {
        headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' },
        next: { revalidate: 60 * 60 * 24 },
      },
    );

    if (!res.ok) return FALLBACK.slice(0, count);

    const { results } = (await res.json()) as { results: UnsplashPhoto[] };
    if (!results?.length) return FALLBACK.slice(0, count);

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
      },
      trackDownload: p.links.download_location,
    }));
  } catch {
    // Network failure must never take down the page -- the gallery is decorative.
    return FALLBACK.slice(0, count);
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
