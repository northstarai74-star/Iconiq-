import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Unsplash guidelines require hotlinking their CDN rather than re-hosting,
    // so we allow the remote host instead of downloading into /public.
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      // Wikimedia Commons serves files and thumbnails from upload.wikimedia.org
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
};

export default nextConfig;
