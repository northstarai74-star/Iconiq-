import type { Metadata } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';

import { hairSalonJsonLd, jsonLdScriptProps } from '@/lib/jsonld';
import { SALON, siteUrl } from '@/lib/salon';
import './globals.css';

/*
 * next/font self-hosts the font files at build time. That kills the
 * fonts.googleapis.com round trip (better LCP) and sidesteps the EU ruling
 * that hotlinking Google Fonts is a data transfer -- relevant if the salon
 * ever takes EU clients.
 */
const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-display-loaded',
  display: 'swap',
});

const sans = Jost({
  subsets: ['latin'],
  weight: ['200', '400', '500'],
  variable: '--font-sans-loaded',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SALON.name} — Hair salon in ${SALON.neighbourhood}`,
    template: `%s · ${SALON.name}`,
  },
  description: SALON.tagline,
  openGraph: {
    title: `${SALON.name} — ${SALON.neighbourhood}`,
    description: SALON.tagline,
    url: siteUrl,
    siteName: SALON.name,
    locale: 'en_US',
    type: 'website',
  },
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        {/* HairSalon structured data -- sitewide, so every route inherits the
            local-business entity rather than only the home page. */}
        <script {...jsonLdScriptProps(hairSalonJsonLd())} />
        {children}
      </body>
    </html>
  );
}
