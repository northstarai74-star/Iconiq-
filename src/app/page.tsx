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
  const photos = await getGallery('hair salon interior', 7);
  const [hero, ...rest] = photos;

  return (
    <>
      <Header />
      <main>
        <Hero photo={hero} />
        <Services />
        <Gallery photos={rest} />
        <Team />
        <Visit />
        <Map />
      </main>
      <Footer />
    </>
  );
}
