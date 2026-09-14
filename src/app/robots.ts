import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/salon';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Booking endpoints are transactional; nothing to index.
      disallow: '/api/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
