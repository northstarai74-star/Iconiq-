import { Footer } from '@/components/Footer';
import { Gallery } from '@/components/Gallery';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Map } from '@/components/Map';
import { Services } from '@/components/Services';
import { Team } from '@/components/Team';
import { Visit } from '@/components/Visit';
import { getGallery } from '@/lib/unsplash';

// Statically rendered; the gallery's own fetch revalidates on its 24h cycle.
export const revalidate = 86400;

export default async function HomePage() {
  const photos = await getGallery('hair salon interior', 10);

  return (
    <>
      <Header />
      <main>
        <Hero photos={photos.slice(0, 7)} />
        <Services />
        <Gallery photos={photos.slice(1)} />
        <Team />
        <Visit />
        <Map />
      </main>
      <Footer />
    </>
  );
}
