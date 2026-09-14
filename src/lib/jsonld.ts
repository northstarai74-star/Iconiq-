/**
 * HairSalon structured data.
 *
 * HairSalon is a first-class Schema.org subtype of LocalBusiness, so Google
 * treats it as a local business entity for map/rich results. Everything here is
 * derived from src/lib/salon.ts -- never hand-write a second copy of the hours
 * or prices, or the markup and the page will disagree.
 *
 * Validate changes with Google's Rich Results Test: markup can be valid
 * Schema.org and still fail Google's stricter eligibility rules.
 */

import { HOURS, SALON, SERVICES, siteUrl } from './salon';

export function hairSalonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': `${siteUrl}/#salon`,
    name: SALON.name,
    description: SALON.tagline,
    url: siteUrl,
    image: `${siteUrl}/opengraph-image`,
    telephone: SALON.phone,
    email: SALON.email,
    priceRange: SALON.priceRange,
    currenciesAccepted: SALON.currency,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SALON.address.street,
      addressLocality: SALON.address.locality,
      addressRegion: SALON.address.region,
      postalCode: SALON.address.postalCode,
      addressCountry: SALON.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SALON.geo.latitude,
      longitude: SALON.geo.longitude,
    },
    openingHoursSpecification: HOURS.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      // Schema.org accepts a string or an array; arrays of one read oddly in
      // some validators, so collapse single-day entries.
      dayOfWeek: h.days.length === 1 ? h.days[0] : h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: Object.values(SALON.social),
    makesOffer: SERVICES.map((s) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: s.name,
        description: s.blurb,
      },
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: s.fromPrice,
        priceCurrency: SALON.currency,
      },
    })),
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/book`,
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform',
        ],
      },
      result: {
        '@type': 'Reservation',
        name: `Book at ${SALON.name}`,
      },
    },
  };
}

/**
 * Renders JSON-LD into a script tag. The `<` escape prevents a stray `</script>`
 * inside any string field from closing the tag early -- the standard XSS hole in
 * hand-rolled JSON-LD injection.
 */
export function jsonLdScriptProps(data: unknown) {
  return {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data).replace(/</g, '\\u003c'),
    },
  };
}
