import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { PiMagnifyingGlass, PiArrowRight, PiCommand } from 'react-icons/pi';
import Squares from '../components/ui/squares-background';
import ListingItem from '../components/ListingItem';
import ListingSkeleton from '../components/ListingSkeleton';
import ParallaxFadeIn from '../components/ui/parallax-fadein';
import { openPalette } from '../components/CommandPalette';
import { priceShort, activePrice } from '../lib/format';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2000&q=80&auto=format&fit=crop';

const QUICK = [
  { label: 'To rent', to: '/search?type=rent' },
  { label: 'For sale', to: '/search?type=sale' },
  { label: 'Discounted', to: '/search?offer=true' },
  { label: 'Furnished', to: '/search?furnished=true' },
];

export default function Home() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [term, setTerm] = useState('');
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  useEffect(() => {
    // One request instead of the original three chained ones. Everything on
    // this page is a different slice of the same collection.
    fetch('/api/listing/get?limit=100')
      .then((r) => {
        if (!r.ok) throw new Error('Request failed');
        return r.json();
      })
      .then((data) => setAll(Array.isArray(data) ? data : []))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  const { offers, rent, sale, stats } = useMemo(() => {
    const offers = all.filter((l) => l.offer);
    const rent = all.filter((l) => l.type === 'rent');
    const sale = all.filter((l) => l.type === 'sale');

    const rents = rent.map((l) => Number(activePrice(l))).filter(Boolean);
    const median = (xs) => {
      if (!xs.length) return 0;
      const s = [...xs].sort((a, b) => a - b);
      const mid = Math.floor(s.length / 2);
      return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
    };

    // The last comma-separated chunk of an address is "City PIN"; strip the PIN.
    const cities = new Set(
      all
        .map((l) =>
          (l.address || '')
            .split(',')
            .pop()
            .replace(/\d{6}/, '')
            .trim()
        )
        .filter(Boolean)
    );

    return {
      offers,
      rent,
      sale,
      stats: [
        { value: String(all.length), label: 'homes listed' },
        { value: String(cities.size), label: 'cities covered' },
        { value: priceShort(median(rents)), label: 'median rent' },
        { value: String(offers.length), label: 'with a discount' },
      ],
    };
  }, [all]);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/search?searchTerm=${encodeURIComponent(term)}`);
  };

  const [featured, ...restSale] = sale;

  return (
    <>
      {/* Hero: one full-bleed photograph carrying the whole first viewport. */}
      <section className='relative isolate min-h-[34rem] overflow-hidden lg:min-h-[40rem]'>
        <img
          src={HERO_IMAGE}
          alt=''
          aria-hidden='true'
          fetchpriority='high'
          className='absolute inset-0 -z-10 h-full w-full object-cover'
        />
        {/* Two layers: a flat floor so no bright patch of the photograph can
            drop the copy below AA, plus a directional gradient for depth. */}
        <div aria-hidden='true' className='absolute inset-0 -z-10 bg-black/35' />
        <div
          aria-hidden='true'
          className='absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/55 to-transparent'
        />
        <div
          aria-hidden='true'
          className='absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-canvas to-transparent'
        />

        <div className='shell flex min-h-[34rem] flex-col justify-center py-20 lg:min-h-[40rem]'>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className='max-w-2xl'
          >
            <h1 className='text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl'>
              Find a place that
              <br />
              feels like yours.
            </h1>
            <p className='mt-6 max-w-md text-lg leading-relaxed text-white/90'>
              Homes for rent and sale across India, listed by the people who own
              them.
            </p>

            <form onSubmit={onSearch} role='search' className='mt-9 max-w-lg'>
              <label htmlFor='hero-search' className='sr-only'>
                Search homes by name
              </label>
              <div className='flex flex-col gap-2.5 sm:flex-row'>
                <div className='relative flex-1'>
                  <PiMagnifyingGlass
                    aria-hidden='true'
                    className='pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-faint'
                  />
                  <input
                    id='hero-search'
                    type='search'
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder='Try "2 BHK Koramangala" or "Bandra"'
                    className='input h-14 rounded-card pl-12 text-base shadow-lg'
                  />
                </div>
                <button
                  type='submit'
                  className='btn btn-primary h-14 rounded-card px-8 text-base'
                >
                  Search
                </button>
              </div>
            </form>

            <div className='mt-6 flex flex-wrap items-center gap-2'>
              {QUICK.map((q) => (
                <Link
                  key={q.to}
                  to={q.to}
                  className='rounded-full border border-white/35 bg-white/15 px-4 py-1.5
                             text-sm text-white backdrop-blur-sm transition-colors
                             hover:border-white/60 hover:bg-white/25'
                >
                  {q.label}
                </Link>
              ))}
              <button
                type='button'
                onClick={openPalette}
                className='hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm
                           text-white/75 transition-colors hover:text-white md:inline-flex'
              >
                <PiCommand aria-hidden='true' className='h-4 w-4' />
                or press Ctrl K
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live numbers, computed from the same payload the page already has. */}
      <section className='border-b bg-sunken/50'>
        <div className='shell grid grid-cols-2 gap-y-8 py-10 sm:grid-cols-4'>
          {stats.map((s) => (
            <div key={s.label}>
              <p className='tnum font-display text-3xl font-semibold tracking-tight sm:text-4xl'>
                {loading ? '—' : s.value}
              </p>
              <p className='mt-1 text-sm text-muted'>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {failed && (
        <div className='shell py-16'>
          <p className='rounded-card border bg-danger-soft px-5 py-4 text-danger'>
            We could not load listings right now. Please refresh the page.
          </p>
        </div>
      )}

      {/* Offers: full-bleed rail whose first card lines up with the shell. */}
      {(loading || offers.length > 0) && (
        <ParallaxFadeIn>
          <section className='py-16 sm:py-20'>
            <div className='shell flex items-end justify-between gap-6'>
              <div>
                <h2 className='text-2xl font-semibold sm:text-3xl'>
                  Reduced this week
                </h2>
                <p className='mt-1.5 text-muted'>
                  Owners who have dropped their asking price.
                </p>
              </div>
              <Link to='/search?offer=true' className='btn btn-sm btn-ghost -mr-3 shrink-0'>
                All offers
                <PiArrowRight aria-hidden='true' className='h-4 w-4' />
              </Link>
            </div>

            <div className='rail mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4'>
              {loading
                ? Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className='w-[280px] shrink-0 sm:w-[320px]'>
                      <ListingSkeleton />
                    </div>
                  ))
                : offers.map((listing) => (
                    <div
                      key={listing._id}
                      className='w-[280px] shrink-0 snap-start sm:w-[320px]'
                    >
                      <ListingItem listing={listing} />
                    </div>
                  ))}
            </div>
          </section>
        </ParallaxFadeIn>
      )}

      {/* Rent: even grid. */}
      {(loading || rent.length > 0) && (
        <ParallaxFadeIn>
          <section className='shell border-t py-16 sm:py-20'>
            <div className='flex items-end justify-between gap-6'>
              <h2 className='text-2xl font-semibold sm:text-3xl'>
                Available to rent
              </h2>
              <Link to='/search?type=rent' className='btn btn-sm btn-ghost -mr-3 shrink-0'>
                All rentals
                <PiArrowRight aria-hidden='true' className='h-4 w-4' />
              </Link>
            </div>

            <div className='mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3'>
              {loading
                ? Array.from({ length: 3 }, (_, i) => <ListingSkeleton key={i} />)
                : rent
                    .slice(0, 6)
                    .map((listing) => (
                      <ListingItem key={listing._id} listing={listing} />
                    ))}
            </div>
          </section>
        </ParallaxFadeIn>
      )}

      {/* Sale: one lead property carrying a smaller column beside it. */}
      {!loading && featured && (
        <ParallaxFadeIn>
          <section className='shell border-t py-16 sm:py-20'>
            <div className='flex items-end justify-between gap-6'>
              <h2 className='text-2xl font-semibold sm:text-3xl'>Homes for sale</h2>
              <Link to='/search?type=sale' className='btn btn-sm btn-ghost -mr-3 shrink-0'>
                All sales
                <PiArrowRight aria-hidden='true' className='h-4 w-4' />
              </Link>
            </div>

            <div className='mt-8 grid gap-x-8 gap-y-10 lg:grid-cols-12'>
              <div className='lg:col-span-7'>
                <ListingItem listing={featured} />
              </div>
              <div className='grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1'>
                {restSale.slice(0, 2).map((listing) => (
                  <ListingItem key={listing._id} listing={listing} />
                ))}
              </div>
            </div>
          </section>
        </ParallaxFadeIn>
      )}

      {/* Closing band, with the drifting grid as the page's one signature moment. */}
      <ParallaxFadeIn>
        <section className='shell py-16 sm:py-24'>
          <div className='relative isolate overflow-hidden rounded-feature border bg-sunken px-6 py-14 sm:px-12 sm:py-20'>
            <div aria-hidden='true' className='absolute inset-0 -z-10 opacity-80'>
              <Squares />
            </div>
            <div className='max-w-xl'>
              <h2 className='text-3xl font-semibold sm:text-4xl'>
                Have a place to let or sell?
              </h2>
              <p className='mt-4 text-lg leading-relaxed text-muted'>
                Publish photos, price, rooms and amenities in a few minutes.
                Interested people reach you by email or WhatsApp.
              </p>
              <Link to='/create-listing' className='btn btn-lg btn-primary mt-8'>
                List your property
              </Link>
            </div>
          </div>
        </section>
      </ParallaxFadeIn>
    </>
  );
}
