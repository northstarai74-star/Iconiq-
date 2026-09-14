# Iconiq Salon

Salon website built on the stack selected in the asset research: **Next.js 16 (App Router) + Tailwind v4 + Lucide + Square Bookings + Unsplash**, with `HairSalon` structured data.

Every third-party integration is optional. With no `.env` at all the site builds, renders and deploys — booking degrades to a phone/email enquiry and the gallery renders local placeholders.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm test             # Commons parsing + fallthrough (stubbed fetch, no network)
npm run fetch:photos # snapshot real Commons photos into src/data (needs network)
```

## Why these choices

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 App Router | Static home page + server routes for the Square token, in one deploy |
| CSS | Tailwind v4 (`@theme` tokens) | No config file; tokens live in `globals.css` |
| Icons | `lucide-react` | MIT. Free tiers of Flaticon/Icons8/IconScout require attribution |
| Type | Cormorant Garamond + Jost via `next/font` | Self-hosted at build: better LCP, and avoids the EU Google Fonts hotlinking problem |
| Booking | Square Bookings API | Free, GA, no copyleft. OpenSalon is AGPL-3.0 — fine for one salon, a problem for multi-tenant SaaS |
| Imagery | Unsplash → Wikimedia Commons → local | Commons needs no key, so a fresh clone renders real photos |
| SEO | `HairSalon` JSON-LD | First-class LocalBusiness subtype; feeds Google local rich results |

## Configuration

`src/lib/salon.ts` is the single source of truth — services, prices, hours, address, stylists.
The page copy, the booking flow and the JSON-LD all derive from it, so a price change
updates the menu, the structured data and the booking summary together. Never hard-code a
price in markup: that is how a salon ends up advertising $180 in Google and charging $210
at the chair.

Copy `.env.example` to `.env.local` and fill in what you have:

| Variable | Effect if unset |
|---|---|
| `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID` | Booking falls back to the phone/email enquiry panel |
| `UNSPLASH_ACCESS_KEY` | Gallery falls through to Wikimedia Commons |
| `WIKIMEDIA_USER_AGENT` | A default UA is sent; set your own per Wikimedia's policy |
| `DISABLE_WIKIMEDIA=1` | Skips Commons, going straight to local placeholders |
| `NEXT_PUBLIC_SITE_URL` | JSON-LD and canonical URLs use `http://localhost:3000` |

### Wiring up Square

1. Create the service menu in the Square **Catalog**, then set each `squareVariationId`
   in `src/lib/salon.ts`. Services without one stay on the enquiry fallback.
2. Set `squareTeamMemberId` on each stylist in `STYLISTS`.
3. `service_variation_version` must match the current catalog version — Square rejects
   bookings after any catalog edit otherwise. It currently reads
   `SQUARE_VARIATION_VERSION`; replace that with a Catalog API lookup before launch.
4. OAuth scopes: `APPOINTMENTS_READ`, `APPOINTMENTS_WRITE`, `ITEMS_READ`, `CUSTOMERS_WRITE`.
5. Square's [Bookings webhooks](https://developer.squareup.com/reference/square/bookings-api/webhooks)
   push cancellations made in the salon's POS back to the site.

### Image sources

`getGallery()` in `src/lib/unsplash.ts` tries three tiers and falls through on
any failure, so a blocked network or a revoked key degrades the gallery instead
of breaking the page:

| Tier | Needs a key? | Needs network at request time? | Attribution |
|---|---|---|---|
| **`public/photos/`** | **no** | **no** | none — the salon owns them |
| Unsplash | yes | yes | Photographer + Unsplash link |
| **Commons (live)** | **no** | yes | **Author + licence, both linked — legally required** |
| **Commons (cached)** | **no** | **no** | same, from the snapshot |
| Local placeholders | no | no | none |

The live tier queries curated categories first — `Category:Hairdressing salons`,
then `Category:Hairdressing`, then `Category:Beauty salons` — and only falls back
to keyword search. Categories are maintained by Commons editors, so the hit rate
for actual salon interiors is far better than a full-text match, which happily
returns product shots and diagrams.

### Adding the salon's own photography (do this one)

Drop image files into `public/photos/` and they beat every remote source:

```
public/photos/
  01-interior.jpg
  02-colour-work.jpg
  03-wash-room.jpg
```

No config, no rebuild of any source file. Order follows the filename, so number
them. Alt text is derived from the filename (`02-colour-work.jpg` → "Colour
work"); for better descriptions add `public/photos/captions.json`:

```json
{ "02-colour-work.jpg": "Hand-painted balayage on mid-lengths" }
```

Stylist portraits work the same way — set `photo` on a stylist in
`src/lib/salon.ts` (e.g. `"/photos/team/nadia.jpg"`). Without one, the card
renders a monogram on a tonal ground rather than an empty rectangle.

### Borrowed photography (`npm run fetch:photos`)

`src/data/commons-photos.json` ships **empty on purpose**. Run:

```bash
npm run fetch:photos                          # 6 photos, default categories
npm run fetch:photos -- --count 8
npm run fetch:photos -- --query "barber shop interior"
```

on a machine that can reach `commons.wikimedia.org`, and it writes verified
entries into that file. Verified means, per photo: the thumbnail URL returns
200 with an `image/*` content-type, and api.php supplied both an author and a
licence. Anything failing is dropped, and if nothing survives the script exits
non-zero without writing.

**Never hand-edit that JSON.** A guessed URL renders as a broken tile; a guessed
author or licence is a false CC attribution, which is a licensing violation
rather than a cosmetic bug.

Commons is what a fresh clone actually renders. Because those files are
CC-licensed, `Gallery.tsx` shows the credit **always-visible rather than on
hover** — a credit that needs a mouse is not attribution on a phone. Do not
"clean up" that overlay without replacing the attribution somewhere visible.

`tests/wikimedia.test.mts` covers this with a stubbed `fetch`: HTML-laden
`extmetadata`, an SVG and a PDF that must be filtered out, a file with no
author, the category generator, and the full fallthrough order including a 403
on categories still reaching search.

### Unsplash rules honored in `src/lib/unsplash.ts`

- **Hotlink** the returned CDN URLs (hence `remotePatterns` in `next.config.ts`) — never re-host.
- **Track** `links.download_location` when a photo is genuinely used.
- **Attribute** photographer and Unsplash with `utm` params — rendered by `Gallery.tsx`.
- Rate limit is 50 req/hr demo, 1000/hr approved, so the fetch revalidates every 24h and
  the key is server-only. Never expose `UNSPLASH_ACCESS_KEY` to the browser.

> `source.unsplash.com` — the old keyless `?salon` endpoint in most tutorials — was
> deprecated in 2021 and shut down in 2024. It is dead. Do not reintroduce it.

## Layout

```
src/
├── app/
│   ├── layout.tsx          fonts, metadata, sitewide JSON-LD
│   ├── page.tsx            home (hero, services, gallery, team, visit)
│   ├── book/page.tsx       booking flow
│   ├── sitemap.ts robots.ts
│   └── api/
│       ├── availability/   GET  -> Square availability search
│       └── bookings/       POST -> Square create booking
├── components/             Hero, Services, Gallery, Team, Visit, BookingForm…
└── lib/
    ├── salon.ts            single source of truth
    ├── jsonld.ts           HairSalon schema, derived from salon.ts
    ├── square.ts           Bookings API client
    ├── localPhotos.ts      public/photos tier — the salon's own files
    ├── unsplash.ts         gallery source chain + Unsplash tier
    ├── wikimedia.ts        Commons live tier (categories, then search)
    ├── commonsCache.ts     Commons cached tier
    └── data/
        └── commons-photos.json   written by npm run fetch:photos
scripts/
└── fetch-photos.mts        snapshots + verifies Commons photos
tests/
└── wikimedia.test.mts      Commons parsing + fallthrough, stubbed fetch
```

## Before launch

- [ ] **Put real photography in `public/photos/`.** This is the one that matters. Stock
      photos — Unsplash or Commons — of *other people's* salons read as fake, and repeat
      clients notice. Borrowed imagery is a launch-day stopgap, not the destination.
- [ ] **Run `npm run fetch:photos`.** The Commons path is covered by unit tests but has
      never run against real `api.php` traffic — that host was blocked by egress policy in
      the environment where this was built, so no real photo URLs could be captured. Until
      you run it (or deploy somewhere with outbound access), the gallery shows
      placeholders. Commit the resulting JSON so CI and previews get real photos too.
- [ ] Replace the sample address, phone, hours and stylists in `src/lib/salon.ts`.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real domain.
- [ ] Validate the rendered JSON-LD in Google's Rich Results Test — markup can be valid
      Schema.org and still fail Google's stricter eligibility rules.
- [ ] Swap `SQUARE_VARIATION_VERSION` for a live Catalog API lookup.
- [ ] Add an `opengraph-image` route (`layout.tsx` already points at one).
