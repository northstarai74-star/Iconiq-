import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/salon';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/book`, changeFrequency: 'weekly', priority: 0.8 },
  ];
}
