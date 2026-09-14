/**
 * Snapshots real Wikimedia Commons photos into src/data/commons-photos.json.
 *
 *   npm run fetch:photos                      # default salon categories
 *   npm run fetch:photos -- --count 8         # how many to keep
 *   npm run fetch:photos -- --query "barber shop interior"
 *
 * Run this on a machine with outbound access to commons.wikimedia.org. Every
 * entry is verified before it is written: the thumbnail URL must return 200 and
 * an image/* content-type, and the file must carry an author and a licence.
 * Anything failing those checks is dropped rather than guessed at, because a
 * fabricated CC credit is a licensing violation, not a cosmetic bug.
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ENDPOINT = 'https://commons.wikimedia.org/w/api.php';
const UA =
  process.env.WIKIMEDIA_USER_AGENT ??
  'IconiqSalonSite/0.1 (https://github.com/northstarai74-star/Iconiq-)';

const CATEGORIES = [
  'Category:Hairdressing salons',
  'Category:Hairdressing',
  'Category:Beauty salons',
];

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const COUNT = Number(arg('count', '6'));
const QUERY = arg('query', 'hair salon interior');

const strip = (v?: string) =>
  (v ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const titleToAlt = (t: string) =>
  t.replace(/^File:/, '').replace(/\.(jpe?g|png|webp)$/i, '').replace(/[_-]+/g, ' ').trim();

async function api(params: Record<string, string>) {
  const url = `${ENDPOINT}?${new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|mime',
    iiurlwidth: '1600',
    ...params,
  })}`;

  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`api.php responded ${res.status}`);
  const data = (await res.json()) as { query?: { pages?: any[] } };
  return data.query?.pages ?? [];
}

/** A URL that 404s or serves HTML would render as a broken tile. Check it. */
async function verify(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': UA } });
    return res.ok && (res.headers.get('content-type') ?? '').startsWith('image/');
  } catch {
    return false;
  }
}

async function collect() {
  const seen = new Set<number>();
  const out: any[] = [];

  const sources = [
    ...CATEGORIES.map((c) => ({
      label: c,
      params: { generator: 'categorymembers', gcmtitle: c, gcmtype: 'file', gcmlimit: '60' },
    })),
    {
      label: `search: ${QUERY}`,
      params: {
        generator: 'search',
        gsrsearch: `${QUERY} filetype:bitmap`,
        gsrnamespace: '6',
        gsrlimit: '50',
      },
    },
  ];

  for (const source of sources) {
    if (out.length >= COUNT) break;
    let pages: any[] = [];
    try {
      pages = await api(source.params);
      console.log(`  ${source.label}: ${pages.length} candidates`);
    } catch (err) {
      console.log(`  ${source.label}: FAILED (${(err as Error).message})`);
      continue;
    }

    for (const page of pages) {
      if (out.length >= COUNT) break;
      if (seen.has(page.pageid)) continue;
      seen.add(page.pageid);

      const info = page.imageinfo?.[0];
      if (!info) continue;
      if (!/^image\/(jpeg|png|webp)$/.test(info.mime ?? '')) continue;

      const src = info.thumburl ?? info.url;
      const meta = info.extmetadata ?? {};
      const author = strip(meta.Artist?.value);
      const license = strip(meta.LicenseShortName?.value);

      // No author or no licence means we cannot attribute it correctly.
      if (!src || !author || !license) {
        console.log(`    skip (no attribution): ${page.title}`);
        continue;
      }

      if (!(await verify(src))) {
        console.log(`    skip (URL not a live image): ${page.title}`);
        continue;
      }

      out.push({
        id: `commons-${page.pageid}`,
        src,
        alt: strip(meta.ImageDescription?.value) || titleToAlt(page.title),
        width: info.thumbwidth ?? 1600,
        height: info.thumbheight ?? 1067,
        author,
        license,
        licenseUrl: strip(meta.LicenseUrl?.value) || info.descriptionurl,
        descriptionUrl: info.descriptionurl,
      });
      console.log(`    kept: ${page.title} — ${author} (${license})`);
    }
  }

  return out;
}

const photos = await collect();

if (photos.length === 0) {
  console.error('\nNo verifiable photos found. Nothing written.');
  process.exit(1);
}

const target = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'data',
  'commons-photos.json',
);

await writeFile(
  target,
  `${JSON.stringify(
    {
      note: 'Generated by `npm run fetch:photos`. Do not hand-edit: every author and licence here came from the Commons API.',
      fetchedAt: new Date().toISOString(),
      query: QUERY,
      photos,
    },
    null,
    2,
  )}\n`,
);

console.log(`\nWrote ${photos.length} verified photos to src/data/commons-photos.json`);
