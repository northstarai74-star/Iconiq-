// Verifies Commons response parsing without network: stubs fetch with a
// realistic api.php payload (HTML-laden extmetadata, an SVG and a PDF that
// must be filtered out, a missing-author file).
const PAYLOAD = {
  query: {
    pages: [
      {
        pageid: 101,
        title: 'File:Hair_salon_interior_Tokyo.jpg',
        imageinfo: [{
          url: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Hair_salon.jpg',
          thumburl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Hair_salon.jpg/1600px-Hair_salon.jpg',
          descriptionurl: 'https://commons.wikimedia.org/wiki/File:Hair_salon_interior_Tokyo.jpg',
          thumbwidth: 1600, thumbheight: 1067, mime: 'image/jpeg',
          extmetadata: {
            Artist: { value: '<a href="//commons.wikimedia.org/wiki/User:Someone" title="User:Someone">Jane &amp; Co. Photography</a>' },
            LicenseShortName: { value: 'CC BY-SA 4.0' },
            LicenseUrl: { value: 'https://creativecommons.org/licenses/by-sa/4.0' },
            ImageDescription: { value: '<p>Interior of a  hair salon in\nTokyo</p>' },
          },
        }],
      },
      {
        pageid: 102, title: 'File:Scissors_icon.svg',
        imageinfo: [{ url: 'x', descriptionurl: 'y', mime: 'image/svg+xml', extmetadata: {} }],
      },
      {
        pageid: 103, title: 'File:Salon_price_list.pdf',
        imageinfo: [{ url: 'x', descriptionurl: 'y', mime: 'application/pdf', extmetadata: {} }],
      },
      {
        pageid: 104,
        title: 'File:Barber_shop_chair.png',
        imageinfo: [{
          url: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Barber.png',
          descriptionurl: 'https://commons.wikimedia.org/wiki/File:Barber_shop_chair.png',
          mime: 'image/png', extmetadata: {},
        }],
      },
    ],
  },
};

let capturedUrl = '';
let capturedUA = '';
globalThis.fetch = (async (url: any, init: any) => {
  capturedUrl = String(url);
  capturedUA = init?.headers?.['User-Agent'] ?? '';
  return { ok: true, status: 200, json: async () => PAYLOAD };
}) as any;

const { searchCommons } = await import('../src/lib/wikimedia.ts');
const photos = await searchCommons('hair salon interior', 6);

const assert = (cond: boolean, msg: string) => {
  console.log(cond ? `  ✓ ${msg}` : `  ✗ FAIL: ${msg}`);
  if (!cond) process.exitCode = 1;
};

console.log('request:');
assert(capturedUrl.includes('gsrnamespace=6'), 'queries the File namespace');
assert(capturedUrl.includes('filetype%3Abitmap'), 'restricts search to bitmaps');
assert(capturedUrl.includes('iiurlwidth=1600'), 'requests a 1600px thumbnail');
assert(/IconiqSalonSite/.test(capturedUA), 'sends a descriptive User-Agent');

console.log('filtering:');
assert(photos.length === 2, `keeps only raster photos (got ${photos.length}, expected 2)`);
assert(!photos.some((p) => p.id.includes('102')), 'drops the SVG');
assert(!photos.some((p) => p.id.includes('103')), 'drops the PDF');

console.log('parsing:');
const [first, second] = photos;
assert(first.credit?.name === 'Jane & Co. Photography',
  `strips HTML + decodes entities in author (got "${first.credit?.name}")`);
assert(first.credit?.license === 'CC BY-SA 4.0', 'extracts licence name');
assert(first.credit?.source === 'Wikimedia Commons', 'labels the source');
assert(first.alt === 'Interior of a hair salon in Tokyo',
  `collapses whitespace in alt (got "${first.alt}")`);
assert(first.src.includes('1600px'), 'prefers the thumbnail URL');
assert(second.credit?.name === 'Unknown author', 'falls back when author missing');
assert(second.alt === 'Barber shop chair', 'derives alt from the file title');
assert(second.src.includes('Barber.png'), 'falls back to full URL with no thumb');



// ---------------------------------------------------------------------------
// Category generator + fallthrough order
// ---------------------------------------------------------------------------

const CATEGORY_PAYLOAD = {
  query: {
    pages: [
      {
        pageid: 201,
        title: 'File:Hairdressing_salon_Jastrzebie-Zdroj.png',
        imageinfo: [{
          url: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Salon.png',
          thumburl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Salon.png/1600px-Salon.png',
          descriptionurl: 'https://commons.wikimedia.org/wiki/File:Hairdressing_salon_Jastrzebie-Zdroj.png',
          thumbwidth: 1600, thumbheight: 900, mime: 'image/png',
          extmetadata: {
            Artist: { value: 'Some Editor' },
            LicenseShortName: { value: 'CC BY 3.0' },
            LicenseUrl: { value: 'https://creativecommons.org/licenses/by/3.0' },
          },
        }],
      },
      {
        pageid: 202,
        title: 'File:Friseursalon_Tuebingen.jpg',
        imageinfo: [{
          url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Friseur.jpg',
          thumburl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Friseur.jpg/1600px-Friseur.jpg',
          descriptionurl: 'https://commons.wikimedia.org/wiki/File:Friseursalon_Tuebingen.jpg',
          thumbwidth: 1600, thumbheight: 1200, mime: 'image/jpeg',
          extmetadata: { Artist: { value: 'Another Editor' }, LicenseShortName: { value: 'CC BY-SA 3.0' } },
        }],
      },
      {
        pageid: 203,
        title: 'File:Third_salon.jpg',
        imageinfo: [{
          url: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Third.jpg',
          descriptionurl: 'https://commons.wikimedia.org/wiki/File:Third_salon.jpg',
          mime: 'image/jpeg',
          extmetadata: { Artist: { value: 'Ed' }, LicenseShortName: { value: 'PD' } },
        }],
      },
    ],
  },
};

console.log('\ncategory generator:');
const calls: string[] = [];
globalThis.fetch = (async (url: any) => {
  calls.push(String(url));
  return { ok: true, status: 200, json: async () => CATEGORY_PAYLOAD };
}) as any;

const { categoryCommons, getCommonsPhotos, SALON_CATEGORIES } =
  await import('../src/lib/wikimedia.ts');

calls.length = 0;
const catPhotos = await categoryCommons('Hairdressing salons', 3);
assert(calls[0].includes('generator=categorymembers'), 'uses the categorymembers generator');
assert(calls[0].includes('gcmtitle=Category%3AHairdressing+salons'),
  'prefixes a bare name with Category:');
assert(calls[0].includes('gcmtype=file'), 'restricts to files');
assert(catPhotos.length === 3, `maps all three category files (got ${catPhotos.length})`);
assert(catPhotos[0].credit?.license === 'CC BY 3.0', 'reads licence from category results');

console.log('lookup order:');
calls.length = 0;
const chained = await getCommonsPhotos('hair salon interior', 3);
assert(calls.length === 1, `stops at the first category that satisfies (made ${calls.length} calls)`);
assert(calls[0].includes(encodeURIComponent(SALON_CATEGORIES[0]).replace(/%20/g, '+')) ||
       calls[0].includes('Hairdressing+salons'), 'tries Category:Hairdressing salons first');
assert(chained.length === 3, 'returns the category photos');

console.log('falls back to search when categories are empty:');
calls.length = 0;
globalThis.fetch = (async (url: any) => {
  calls.push(String(url));
  const isSearch = String(url).includes('generator=search');
  return { ok: true, status: 200, json: async () => (isSearch ? PAYLOAD : { query: { pages: [] } }) };
}) as any;
const searched = await getCommonsPhotos('hair salon interior', 3);
assert(calls.length === SALON_CATEGORIES.length + 1,
  `tries every category then search (made ${calls.length} calls)`);
assert(calls[calls.length - 1].includes('generator=search'), 'search is the final attempt');
assert(searched.length === 2, 'returns the filtered search results');

console.log('survives a category error:');
calls.length = 0;
globalThis.fetch = (async (url: any) => {
  calls.push(String(url));
  if (!String(url).includes('generator=search')) return { ok: false, status: 403, json: async () => ({}) };
  return { ok: true, status: 200, json: async () => PAYLOAD };
}) as any;
const afterError = await getCommonsPhotos('hair salon interior', 3);
assert(afterError.length === 2, 'a 403 on categories still reaches search');

console.log(process.exitCode ? '\nSOME CHECKS FAILED' : '\nALL COMMONS CHECKS PASSED');
