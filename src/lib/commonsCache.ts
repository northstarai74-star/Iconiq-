/**
 * Build-time cache of Wikimedia Commons photos.
 *
 * Why this tier exists: the live Commons lookup needs outbound network access
 * at request time, which is not always available (locked-down CI, an air-gapped
 * preview deploy, or simply a blocked host). Running `npm run fetch:photos`
 * once on a connected machine snapshots real, verified files into
 * src/data/commons-photos.json, which then ships with the repo.
 *
 * The JSON is empty until that script is run. It is never hand-edited: every
 * entry must carry the author and licence that api.php actually returned,
 * because inventing CC attribution is worse than showing no photo at all.
 */

import 'server-only';

import cache from '@/data/commons-photos.json';
import type { GalleryPhoto } from './unsplash';

interface CachedPhoto {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  author: string;
  license: string;
  licenseUrl: string;
  descriptionUrl: string;
}

interface CacheFile {
  fetchedAt: string | null;
  query: string | null;
  photos: CachedPhoto[];
}

export function getCachedCommonsPhotos(count: number): GalleryPhoto[] {
  const { photos } = cache as unknown as CacheFile;
  if (!Array.isArray(photos) || photos.length === 0) return [];

  return photos.slice(0, count).map((p) => ({
    id: p.id,
    src: p.src,
    srcSet: '',
    alt: p.alt,
    blurHash: null,
    width: p.width,
    height: p.height,
    credit: {
      name: p.author,
      profileUrl: p.descriptionUrl,
      photoUrl: p.descriptionUrl,
      source: 'Wikimedia Commons' as const,
      license: p.license,
      licenseUrl: p.licenseUrl,
    },
    trackDownload: null,
  }));
}

export const cacheMeta = {
  fetchedAt: (cache as unknown as CacheFile).fetchedAt,
  count: (cache as unknown as CacheFile).photos?.length ?? 0,
};
