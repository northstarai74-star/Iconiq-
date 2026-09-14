# Iconiq Salon

Salon website built on the stack selected in the asset research: **Next.js 16 (App Router) + Tailwind v4 + Lucide + Square Bookings + Unsplash**, with `HairSalon` structured data.

Every third-party integration is optional. With no `.env` at all the site builds, renders and deploys — booking degrades to a phone/email enquiry and the gallery renders local placeholders.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run typecheck    # tsc --noEmit
```

## Why these choices

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 App Router | Static home page + server routes for the Square token, in one deploy |
| CSS | Tailwind v4 (`@theme` tokens) | No config file; tokens live in `globals.css` |
| Icons | `lucide-react` | MIT. Free tiers of Flaticon/Icons8/IconScout require attribution |
| Type | Cormorant Garamond + Jost via `next/font` | Self-hosted at build: better LCP, and avoids the EU Google Fonts hotlinking problem |
| Booking | Square Bookings API | Free, GA, no copyleft. OpenSalon is AGPL-3.0 — fine for one salon, a problem for multi-tenant SaaS |
| Imagery | Unsplash API, server-side | Hotlinked + download-tracked + attributed, per their guidelines |
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
| `UNSPLASH_ACCESS_KEY` | Gallery renders generated local placeholders |
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
    └── unsplash.ts         gallery + attribution + fallbacks
```

## Before launch

- [ ] Replace placeholder imagery with real photography of the actual salon. Stock photos
      of *other people's* salons in a gallery read as fake, and repeat clients notice.
- [ ] Replace the sample address, phone, hours and stylists in `src/lib/salon.ts`.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real domain.
- [ ] Validate the rendered JSON-LD in Google's Rich Results Test — markup can be valid
      Schema.org and still fail Google's stricter eligibility rules.
- [ ] Swap `SQUARE_VARIATION_VERSION` for a live Catalog API lookup.
- [ ] Add an `opengraph-image` route (`layout.tsx` already points at one).
