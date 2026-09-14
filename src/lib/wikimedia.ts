/**
 * Wikimedia Commons image source.
 *
 * Why it's here: Commons needs no API key and no signup, so it gives the site
 * real photography out of the box, where Unsplash needs a key provisioned
 * first. The trade-off is licensing -- Commons files are CC-BY / CC-BY-SA /
 * public domain rather than Unsplash's blanket permission, so attribution is
 * not optional. Every photo carries author + licence, and Gallery.tsx renders
 * them. Dropping that credit makes the site non-compliant with CC-BY.
 *
 * API: https://commons.wikimedia.org/w/api.php (MediaWiki Action API)
 * Wikimedia's User-Agent policy requires a descriptive UA on API calls:
 * https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_User-Agent_Policy
 */

import 'server-only';

import type { GalleryPhoto } from './unsplash';

const ENDPOINT = 'https://commons.wikimedia.org/w/api.php';

const USER_AGENT =
  process.env.WIKIMEDIA_USER_AGENT ??
  'IconiqSalonSite/0.1 (https://github.com/northstarai74-star/Iconiq-)';

interface CommonsPage {
  pageid: number;
  title: string;
  imageinfo?: Array<{
    url: string;
    thumburl?: string;
    descriptionurl: string;
    thumbwidth?: number;
    thumbheight?: number;
    mime?: string;
    extmetadata?: Record<string, { value?: string }>;
  }>;
}

/**
 * extmetadata fields arrive as HTML fragments (`<a href=...>Name</a>`).
 * Strip tags and decode the handful of entities MediaWiki actually emits --
 * this text is rendered as the photo credit, so it must not carry markup.
 */
function stripHtml(value: string | undefined): string {
  if (!value) return '';
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Commons titles look like "File:Some salon.jpg"; the prefix is noise in alt text. */
function titleToAlt(title: string): string {
  return title
    .replace(/^File:/, '')
    .replace(/\.(jpe?g|png|webp|tiff?)$/i, '')
    .replace(/[_-]+/g, ' ')
    .trim();
}

/**
 * Searches Commons for usable photographs.
 *
 * Filters to raster images: SVGs and PDFs live in the same File namespace and
 * are useless as gallery photography.
 */
export async function searchCommons(
  query: string,
  count: number,
): Promise<GalleryPhoto[]> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: '6', // File:
    gsrlimit: String(Math.min(count * 3, 50)), // over-fetch; many get filtered
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|mime',
    iiurlwidth: '1600',
  });

  const res = await fetch(`${ENDPOINT}?${params}`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) throw new Error(`Commons responded ${res.status}`);

  const data = (await res.json()) as { query?: { pages?: CommonsPage[] } };
  const pages = data.query?.pages ?? [];

  return pages
    .flatMap((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return [];
      // Raster photographs only.
      if (!/^image\/(jpeg|png|webp)$/.test(info.mime ?? '')) return [];

      const src = info.thumburl ?? info.url;
      if (!src) return [];

      const meta = info.extmetadata ?? {};
      const author = stripHtml(meta.Artist?.value) || 'Unknown author';
      const licence = stripHtml(meta.LicenseShortName?.value) || 'See file page';
      const description = stripHtml(meta.ImageDescription?.value);

      return [
        {
          id: `commons-${page.pageid}`,
          src,
          // Commons thumbs are a fixed rendered width, so there is no srcset
          // to build the way Unsplash's Imgix URLs allow.
          srcSet: '',
          alt: description || titleToAlt(page.title),
          blurHash: null,
          width: info.thumbwidth ?? 1600,
          height: info.thumbheight ?? 1067,
          credit: {
            name: author,
            profileUrl: info.descriptionurl,
            photoUrl: info.descriptionurl,
            source: 'Wikimedia Commons' as const,
            license: licence,
            licenseUrl: stripHtml(meta.LicenseUrl?.value) || info.descriptionurl,
          },
          trackDownload: null,
        } satisfies GalleryPhoto,
      ];
    })
    .slice(0, count);
}
