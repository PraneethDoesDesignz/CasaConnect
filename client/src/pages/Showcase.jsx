import { useState } from 'react';
import { PiDownloadSimple, PiArrowSquareOut, PiX } from 'react-icons/pi';

const DIR = '/screenshots';

const GROUPS = [
  {
    id: 'home',
    title: 'Home',
    blurb: 'The marketing surface, section by section.',
    shots: [
      {
        file: 'home-01-hero.jpg',
        title: 'Hero',
        caption:
          'Full-bleed photography under a two-layer scrim, so the copy holds its contrast wherever the image runs bright.',
        wide: true,
      },
      {
        file: 'home-02-hero-dark.jpg',
        title: 'Hero, dark theme',
        caption:
          'The same markup with only token values swapped. There is no duplicated dark-mode markup in the codebase.',
        wide: true,
      },
      {
        file: 'home-03-nav.jpg',
        title: 'Navigation bar',
        caption:
          'Sticky header with the palette trigger, saved-listing count, theme control and active-route underline.',
        wide: true,
      },
      {
        file: 'home-04-stats.jpg',
        title: 'Statistics band',
        caption:
          'Listing count, distinct cities, median rent and discount count, all computed from live records rather than hardcoded.',
        wide: true,
      },
      {
        file: 'home-05-offers-rail.jpg',
        title: 'Discounted rail',
        caption:
          'Full-bleed horizontal scroller whose first card lines up exactly with the page gutter at any viewport width.',
        wide: true,
      },
      {
        file: 'home-06-rent-grid.jpg',
        title: 'Rental grid',
        caption:
          'Three-column card grid. Price leads, tabular figures keep the numbers aligned down the column.',
      },
      {
        file: 'home-07-sale-editorial.jpg',
        title: 'Sale section',
        caption:
          'Asymmetric layout: one lead property carrying a narrower column, so the page does not repeat a grid rhythm.',
      },
      {
        file: 'home-08-cta-band.jpg',
        title: 'Owner call to action',
        caption:
          'Closing band over the drifting survey grid, the page’s one animated flourish.',
      },
      {
        file: 'home-09-footer.jpg',
        title: 'Footer',
        caption: 'Honest project framing and the secondary navigation paths.',
      },
      {
        file: 'home-10-full-page.jpg',
        title: 'Full page',
        caption: 'The entire home page in one image.',
      },
      {
        file: 'home-11-full-page-dark.jpg',
        title: 'Full page, dark theme',
        caption: 'The same scroll in dark.',
      },
    ],
  },
  {
    id: 'search',
    title: 'Search',
    blurb: 'Filtering, results and the empty case.',
    shots: [
      {
        file: 'search-01-page.jpg',
        title: 'Search page',
        caption:
          'Sticky filter rail beside the result grid. Every filter is mirrored into the URL, so a search can be shared.',
        wide: true,
      },
      {
        file: 'search-02-page-dark.jpg',
        title: 'Search, dark theme',
        caption: 'Rail and grid holding contrast across both themes.',
        wide: true,
      },
      {
        file: 'search-03-filter-rail.jpg',
        title: 'Filter rail',
        caption:
          'Dual-handle price slider over a histogram of the current results, plus radio and checkbox groups in real fieldsets.',
      },
      {
        file: 'search-04-results-grid.jpg',
        title: 'Filtered results',
        caption: 'Rentals only, with the result count reflecting the active filters.',
      },
      {
        file: 'search-05-empty-state.jpg',
        title: 'Empty state',
        caption:
          'A composed no-results view that explains why nothing matched and offers a way out.',
      },
      {
        file: 'search-06-full-page.jpg',
        title: 'Full page',
        caption: 'The whole search surface in one image.',
      },
    ],
  },
  {
    id: 'listing',
    title: 'Listing detail',
    blurb: 'The page a visitor actually decides on.',
    shots: [
      {
        file: 'listing-01-gallery.jpg',
        title: 'Gallery mosaic',
        caption:
          'Lead photograph with a four-tile mosaic beside it, and a photo count that opens the viewer.',
        wide: true,
      },
      {
        file: 'listing-02-gallery-dark.jpg',
        title: 'Gallery, dark theme',
        caption: 'Photography carries the page; surfaces re-tint around it.',
        wide: true,
      },
      {
        file: 'listing-06-lightbox.jpg',
        title: 'Lightbox',
        caption:
          'Keyboard-driven viewer with arrow navigation, a thumbnail strip and focus returned to the trigger on close. Replaced Swiper and cut 60KB from the bundle.',
        wide: true,
      },
      {
        file: 'listing-03-specs.jpg',
        title: 'Specification grid',
        caption: 'Bedrooms, bathrooms, parking and furnishing as a definition list.',
      },
      {
        file: 'listing-04-price-panel.jpg',
        title: 'Price panel',
        caption:
          'Sticky panel showing the discounted price against the struck-through regular price.',
      },
      {
        file: 'listing-07-offer-page.jpg',
        title: 'Discounted listing',
        caption: 'A property carrying an active offer, with the saving badged.',
      },
      {
        file: 'listing-05-full-page.jpg',
        title: 'Full page',
        caption: 'Gallery, details and contact panel in one image.',
      },
    ],
  },
  {
    id: 'ui',
    title: 'Command palette',
    blurb: 'States that only exist once you use the interface.',
    shots: [
      {
        file: 'ui-01-command-palette-actions.jpg',
        title: 'Actions',
        caption:
          'Ctrl or Command K from anywhere. Opens on navigation and theme actions before you type.',
        wide: true,
      },
      {
        file: 'ui-02-command-palette-search.jpg',
        title: 'Live listing search',
        caption:
          'Searches the API behind a 220ms debounce, with in-flight requests aborted so a stale response can never overwrite a newer one.',
        wide: true,
      },
      {
        file: 'ui-03-command-palette-dark.jpg',
        title: 'Dark theme',
        caption: 'The same palette against the dark token set.',
        wide: true,
      },
    ],
  },
  {
    id: 'auth',
    title: 'Accounts',
    blurb: 'Sign in and registration.',
    shots: [
      {
        file: 'auth-01-sign-in.jpg',
        title: 'Sign in',
        caption:
          'Split layout with labels above inputs, inline field validation and Google sign-in through Firebase.',
      },
      {
        file: 'auth-03-sign-in-dark.jpg',
        title: 'Sign in, dark theme',
        caption: 'The same frame against the dark token set.',
      },
      {
        file: 'auth-02-sign-up.jpg',
        title: 'Sign up',
        caption:
          'Per-field rules, an explicitly optional phone number, and hints that explain why it is collected.',
      },
    ],
  },
  {
    id: 'about',
    title: 'About',
    blurb: 'Project context, written honestly.',
    shots: [
      {
        file: 'about-01-intro.jpg',
        title: 'Introduction',
        caption:
          'States plainly that this is an academic project rather than a working agency.',
      },
      {
        file: 'about-02-capabilities.jpg',
        title: 'Capabilities',
        caption: 'What the application actually does, in four grouped statements.',
      },
      {
        file: 'about-03-stack.jpg',
        title: 'Stack',
        caption: 'Interface, server, data and integrations as a definition list.',
      },
      {
        file: 'about-04-contact.jpg',
        title: 'Contact',
        caption:
          'Routes property questions to the listing owner and project questions to email.',
      },
      {
        file: 'about-05-full-page.jpg',
        title: 'Full page',
        caption: 'The whole About surface in one image.',
      },
    ],
  },
  {
    id: 'misc',
    title: 'Edge cases',
    blurb: 'The screens that usually get skipped.',
    shots: [
      {
        file: 'misc-01-not-found.jpg',
        title: 'Not found',
        caption: 'A designed 404 with real routes back into the application.',
        wide: true,
      },
    ],
  },
];

const ALL = GROUPS.flatMap((g) => g.shots);

export default function Showcase() {
  const [preview, setPreview] = useState(null);

  return (
    <div className='shell py-12 sm:py-16'>
      <header className='max-w-2xl'>
        <h1 className='text-4xl font-semibold sm:text-5xl'>Screens</h1>
        <p className='mt-5 text-lg leading-relaxed text-muted'>
          Every section of CasaConnect, captured from the running application
          against its real database. Free to download for a portfolio or report.
        </p>
        <p className='tnum mt-3 text-sm text-muted'>
          {ALL.length} desktop images at 1440 x 900, 2x pixel density. Source
          files live in{' '}
          <code className='font-mono text-[0.875em]'>client/public/screenshots</code>.
        </p>
      </header>

      <nav aria-label='Sections' className='mt-8 flex flex-wrap gap-2'>
        {GROUPS.map((g) => (
          <a
            key={g.id}
            href={`#${g.id}`}
            className='rounded-full border px-3.5 py-1.5 text-sm text-muted
                       transition-colors hover:border-[rgb(var(--faint))] hover:text-ink'
          >
            {g.title}
            <span className='tnum ml-1.5 text-faint'>{g.shots.length}</span>
          </a>
        ))}
      </nav>

      {GROUPS.map((group) => (
        <section
          key={group.id}
          id={group.id}
          className='mt-16 scroll-mt-24 border-t pt-10'
        >
          <div className='flex flex-wrap items-baseline justify-between gap-3'>
            <h2 className='text-2xl font-semibold'>{group.title}</h2>
            <p className='text-sm text-muted'>{group.blurb}</p>
          </div>

          <div className='mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2'>
            {group.shots.map((shot) => (
              <figure
                key={shot.file}
                className={shot.wide ? 'sm:col-span-2' : undefined}
              >
                <button
                  type='button'
                  onClick={() => setPreview(shot)}
                  aria-label={`View ${shot.title} full size`}
                  className='group block w-full overflow-hidden rounded-card border bg-sunken'
                >
                  <img
                    src={`${DIR}/${shot.file}`}
                    alt={`${shot.title} screen of CasaConnect`}
                    loading='lazy'
                    className='max-h-[560px] w-full object-cover object-top transition-transform
                               duration-500 ease-out group-hover:scale-[1.01]'
                  />
                </button>

                <figcaption className='mt-4'>
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <h3 className='font-medium'>{shot.title}</h3>
                    <div className='flex gap-1'>
                      <a
                        href={`${DIR}/${shot.file}`}
                        download={`casaconnect-${shot.file}`}
                        className='btn btn-sm btn-secondary'
                      >
                        <PiDownloadSimple aria-hidden='true' className='h-4 w-4' />
                        Download
                      </a>
                      <a
                        href={`${DIR}/${shot.file}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label={`Open ${shot.title} in a new tab`}
                        className='btn btn-sm btn-ghost w-8 px-0'
                      >
                        <PiArrowSquareOut aria-hidden='true' className='h-4 w-4' />
                      </a>
                    </div>
                  </div>
                  <p className='mt-1.5 max-w-[60ch] text-sm leading-relaxed text-muted'>
                    {shot.caption}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}

      {preview && (
        <div
          role='dialog'
          aria-modal='true'
          aria-label={`${preview.title}, full size`}
          className='fixed inset-0 z-[60] flex flex-col bg-[rgb(var(--shadow-tint))]/95 backdrop-blur-sm'
          onClick={() => setPreview(null)}
        >
          <div className='flex shrink-0 items-center justify-between px-4 py-3 sm:px-6'>
            <p className='text-sm text-white/80'>{preview.title}</p>
            <div className='flex items-center gap-2'>
              <a
                href={`${DIR}/${preview.file}`}
                download={`casaconnect-${preview.file}`}
                onClick={(e) => e.stopPropagation()}
                className='flex h-9 items-center gap-2 rounded-control bg-white/10 px-3
                           text-sm text-white transition-colors hover:bg-white/20'
              >
                <PiDownloadSimple aria-hidden='true' className='h-4 w-4' />
                Download
              </a>
              <button
                type='button'
                onClick={() => setPreview(null)}
                aria-label='Close preview'
                className='flex h-9 w-9 items-center justify-center rounded-control
                           text-white/80 transition-colors hover:bg-white/10 hover:text-white'
              >
                <PiX className='h-5 w-5' />
              </button>
            </div>
          </div>
          <div className='flex-1 overflow-auto px-4 pb-6 sm:px-6'>
            <img
              src={`${DIR}/${preview.file}`}
              alt={`${preview.title} screen of CasaConnect, full size`}
              onClick={(e) => e.stopPropagation()}
              className='mx-auto w-full max-w-5xl rounded-card'
            />
          </div>
        </div>
      )}
    </div>
  );
}
