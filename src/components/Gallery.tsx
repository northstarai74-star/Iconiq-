import type { GalleryPhoto } from '@/lib/unsplash';

/**
 * Attribution is a legal requirement, not decoration:
 *   - Unsplash API usage requires photographer + Unsplash links.
 *   - Wikimedia Commons files are CC-BY / CC-BY-SA, so the author AND the
 *     licence name must both be visible and linked.
 * Locally generated placeholders carry no credit, so the block only renders
 * when `credit` is present.
 *
 * The credit sits always-visible (not hover-only) for Commons photos --
 * a credit that requires a mouse hover is not attribution on a phone.
 */
export function Gallery({ photos }: { photos: GalleryPhoto[] }) {
  if (!photos.length) return null;

  return (
    <section id="work" className="bg-bone-100 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <p className="eyebrow text-ink-400">Recent work</p>
        <h2 className="mt-4 max-w-lg text-4xl sm:text-5xl">
          Colour that grows out on your terms.
        </h2>

        <ul className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {photos.map((photo, i) => (
            <li
              key={photo.id}
              className="group relative overflow-hidden rounded-md bg-bone-200"
            >
              <img
                src={photo.src}
                srcSet={photo.srcSet || undefined}
                sizes="(min-width: 1024px) 33vw, 50vw"
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                /* Only the first row is likely above the fold. */
                loading={i < 3 ? 'eager' : 'lazy'}
                decoding="async"
                className="aspect-4/3 w-full object-cover transition duration-500
                           group-hover:scale-[1.03]"
              />

              {photo.credit && (
                <span
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70
                             to-transparent px-3 pb-2 pt-8 text-[0.65rem] leading-tight
                             text-white/85"
                >
                  <a
                    href={photo.credit.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="underline-offset-2 hover:underline"
                  >
                    {photo.credit.name}
                  </a>
                  {photo.credit.license && (
                    <>
                      {' · '}
                      <a
                        href={photo.credit.licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow license"
                        className="underline-offset-2 hover:underline"
                      >
                        {photo.credit.license}
                      </a>
                    </>
                  )}{' '}
                  <span className="text-white/60">via</span>{' '}
                  <a
                    href={photo.credit.photoUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="underline-offset-2 hover:underline"
                  >
                    {photo.credit.source}
                  </a>
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
