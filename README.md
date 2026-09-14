# Iconiq Salon

Salon website built on the stack selected in the asset research: **Next.js 16 (App Router) + Tailwind v4 + Lucide + Square Bookings + Unsplash**, with `HairSalon` structured data.

Every third-party integration is optional. With no `.env` at all the site builds, renders and deploys — booking degrades to a phone/email enquiry and the gallery renders local placeholders.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm test             # Commons response parsing (stubbed fetch, no network)
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

| Tier | Needs a key? | Licence | Attribution |
|---|---|---|---|
| Unsplash | yes | Unsplash License | Photographer + Unsplash link |
| **Wikimedia Commons** | **no** | CC-BY / CC-BY-SA / PD | **Author + licence name, both linked — legally required** |
| Local placeholders | no | n/a | none |

Commons is what a fresh clone actually renders. Because those files are
CC-licensed, `Gallery.tsx` shows the credit **always-visible rather than on
hover** — a credit that needs a mouse is not attribution on a phone. Do not
"clean up" that overlay without replacing the attribution somewhere visible.

Commons parsing is covered by `tests/wikimedia.test.mts`, which stubs `fetch`
with a realistic `api.php` payload: HTML-laden `extmetadata`, an SVG and a PDF
that must be filtered out, and a file with no author.

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
    ├── unsplash.ts         gallery source chain + Unsplash tier
    └── wikimedia.ts        Wikimedia Commons tier (no API key)
tests/
└── wikimedia.test.mts      Commons parsing, stubbed fetch
```

## Before launch

- [ ] Replace gallery imagery with real photography of the actual salon. Stock photos —
      Unsplash or Commons — of *other people's* salons read as fake, and repeat clients
      notice. Commons is the sane default for launch day, not the destination.
- [ ] Confirm the Commons credit overlay renders against the live API. It is covered by
      unit tests but was never exercised against real `api.php` traffic (the network was
      blocked in the environment where this was built).
- [ ] Replace the sample address, phone, hours and stylists in `src/lib/salon.ts`.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real domain.
- [ ] Validate the rendered JSON-LD in Google's Rich Results Test — markup can be valid
      Schema.org and still fail Google's stricter eligibility rules.
- [ ] Swap `SQUARE_VARIATION_VERSION` for a live Catalog API lookup.
- [ ] Add an `opengraph-image` route (`layout.tsx` already points at one).
