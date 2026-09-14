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

console.log(process.exitCode ? '\nSOME CHECKS FAILED' : '\nALL COMMONS PARSING CHECKS PASSED');
