/**
 * The salon's own photography — the highest-priority image source.
 *
 * Drop files into public/photos/ and they win over every remote source. No
 * config, no API key, no rebuild of this file:
 *
 *   public/photos/01-interior.jpg
 *   public/photos/02-colour-work.jpg
 *
 * Files are used in filename order, so a numeric prefix controls the gallery
 * sequence. Alt text is derived from the filename ("02-colour-work.jpg" ->
 * "Colour work"); for anything better, add public/photos/captions.json:
 *
 *   { "02-colour-work.jpg": "Hand-painted balayage on mid-lengths" }
 *
 * This exists because stock photography of *other people's* salons is the one
 * thing every client notices. Real photos of the real room beat the best
 * Unsplash result every time.
 */

import 'server-only';

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import type { GalleryPhoto } from './unsplash';

const PHOTO_DIR = path.join(process.cwd(), 'public', 'photos');
const EXTENSIONS = /\.(jpe?g|png|webp|avif)$/i;

function filenameToAlt(file: string): string {
  return file
    .replace(EXTENSIONS, '')
    .replace(/^\d+[-_.\s]*/, '') // strip the ordering prefix
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

function readCaptions(): Record<string, string> {
  try {
    return JSON.parse(readFileSync(path.join(PHOTO_DIR, 'captions.json'), 'utf8'));
  } catch {
    return {};
  }
}

export function getLocalPhotos(count: number): GalleryPhoto[] {
  let files: string[];
  try {
    files = readdirSync(PHOTO_DIR).filter((f) => EXTENSIONS.test(f)).sort();
  } catch {
    return []; // directory absent — normal before the photoshoot
  }

  if (files.length === 0) return [];
  const captions = readCaptions();

  return files.slice(0, count).map((file) => ({
    id: `local-${file}`,
    src: `/photos/${encodeURIComponent(file)}`,
    srcSet: '',
    alt: captions[file] ?? filenameToAlt(file),
    blurHash: null,
    // The real dimensions are unknown without decoding the file; the gallery
    // constrains tiles with aspect-ratio, so this only seeds the intrinsic
    // ratio and prevents layout shift.
    width: 1600,
    height: 1067,
    // The salon owns these, so there is nobody to credit.
    credit: null,
    trackDownload: null,
  }));
}
