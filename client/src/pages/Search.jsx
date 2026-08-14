import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PiSliders, PiX, PiMagnifyingGlass, PiHeart } from 'react-icons/pi';
import ListingItem from '../components/ListingItem';
import ListingSkeleton from '../components/ListingSkeleton';
import PriceRange from '../components/PriceRange';
import useSaved from '../lib/useSaved';
import { activePrice } from '../lib/format';

const PAGE_SIZE = 9;

const TYPES = [
  { id: 'all', label: 'Rent and sale' },
  { id: 'rent', label: 'Rent only' },
  { id: 'sale', label: 'Sale only' },
];

const SORTS = [
  { value: 'createdAt_desc', label: 'Newest first' },
  { value: 'createdAt_asc', label: 'Oldest first' },
  { value: 'regularPrice_asc', label: 'Price: low to high' },
  { value: 'regularPrice_desc', label: 'Price: high to low' },
];

const DEFAULTS = {
  searchTerm: '',
  type: 'all',
  parking: false,
  furnished: false,
  offer: false,
  saved: false,
  sort: 'createdAt',
  order: 'desc',
};

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ids: savedIds, count: savedCount } = useSaved();

  const [filters, setFilters] = useState(DEFAULTS);
  const [matched, setMatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [panelOpen, setPanelOpen] = useState(false);
  const [range, setRange] = useState(null);

  // Server handles the categorical filters and sorting. Price is applied on
  // the client so dragging the slider is instant and the histogram always has
  // the full distribution to draw.
  // ponytail: fetches up to 200 rows; move price to a Mongo $gte/$lte range
  // and paginate server-side if the collection ever outgrows that.
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setFilters({
      searchTerm: p.get('searchTerm') || '',
      type: p.get('type') || 'all',
      parking: p.get('parking') === 'true',
      furnished: p.get('furnished') === 'true',
      offer: p.get('offer') === 'true',
      saved: p.get('saved') === 'true',
      sort: p.get('sort') || 'createdAt',
      order: p.get('order') || 'desc',
    });

    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      setFailed(false);
      setVisible(PAGE_SIZE);
      try {
        const q = new URLSearchParams(p);
        q.delete('saved');
        q.set('limit', '200');
        const res = await fetch(`/api/listing/get?${q.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Request failed');
        const data = await res.json();
        setMatched(Array.isArray(data) ? data : []);
        setRange(null);
      } catch (err) {
        if (err.name !== 'AbortError') setFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [location.search]);

  const scoped = useMemo(
    () =>
      filters.saved ? matched.filter((l) => savedIds.includes(l._id)) : matched,
    [matched, filters.saved, savedIds]
  );

  const prices = useMemo(
    () => scoped.map((l) => Number(activePrice(l))).filter((n) => n > 0),
    [scoped]
  );

  const bounds = useMemo(() => {
    if (!prices.length) return [0, 0];
    return [Math.min(...prices), Math.max(...prices)];
  }, [prices]);

  const activeRange = range ?? bounds;

  const listings = useMemo(() => {
    const [lo, hi] = activeRange;
    if (hi <= lo) return scoped;
    return scoped.filter((l) => {
      const p = Number(activePrice(l));
      return p >= lo && p <= hi;
    });
  }, [scoped, activeRange]);

  const set = (patch) => setFilters((f) => ({ ...f, ...patch }));

  const submit = (e) => {
    e?.preventDefault();
    const p = new URLSearchParams();
    if (filters.searchTerm) p.set('searchTerm', filters.searchTerm);
    if (filters.type !== 'all') p.set('type', filters.type);
    if (filters.parking) p.set('parking', 'true');
    if (filters.furnished) p.set('furnished', 'true');
    if (filters.offer) p.set('offer', 'true');
    if (filters.saved) p.set('saved', 'true');
    p.set('sort', filters.sort);
    p.set('order', filters.order);
    setPanelOpen(false);
    navigate(`/search?${p.toString()}`);
  };

  const clearAll = () => {
    setFilters(DEFAULTS);
    setRange(null);
    setPanelOpen(false);
    navigate('/search');
  };

  const priceNarrowed =
    range && (range[0] > bounds[0] || range[1] < bounds[1]);

  const activeCount =
    (filters.type !== 'all' ? 1 : 0) +
    (filters.parking ? 1 : 0) +
    (filters.furnished ? 1 : 0) +
    (filters.offer ? 1 : 0) +
    (filters.saved ? 1 : 0) +
    (priceNarrowed ? 1 : 0);

  const form = (
    <form onSubmit={submit} className='flex flex-col gap-8'>
      <div className='field'>
        <label htmlFor='filter-term' className='label'>
          Keyword
        </label>
        <div className='relative'>
          <PiMagnifyingGlass
            aria-hidden='true'
            className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint'
          />
          <input
            id='filter-term'
            type='search'
            className='input pl-9'
            placeholder='Name of the listing'
            value={filters.searchTerm}
            onChange={(e) => set({ searchTerm: e.target.value })}
          />
        </div>
      </div>

      {prices.length > 1 && (
        <PriceRange
          prices={prices}
          min={bounds[0]}
          max={bounds[1]}
          value={activeRange}
          onChange={setRange}
        />
      )}

      <fieldset className='flex flex-col gap-3'>
        <legend className='label mb-1'>Listing type</legend>
        {TYPES.map((t) => (
          <label
            key={t.id}
            className='flex cursor-pointer items-center gap-2.5 text-[0.9375rem] text-ink'
          >
            <input
              type='radio'
              name='listing-type'
              value={t.id}
              checked={filters.type === t.id}
              onChange={() => set({ type: t.id })}
              className='check rounded-full'
            />
            {t.label}
          </label>
        ))}
      </fieldset>

      <fieldset className='flex flex-col gap-3'>
        <legend className='label mb-1'>Must have</legend>
        {[
          { id: 'offer', label: 'Discounted price' },
          { id: 'parking', label: 'Parking' },
          { id: 'furnished', label: 'Furnished' },
        ].map((c) => (
          <label
            key={c.id}
            className='flex cursor-pointer items-center gap-2.5 text-[0.9375rem] text-ink'
          >
            <input
              type='checkbox'
              checked={filters[c.id]}
              onChange={(e) => set({ [c.id]: e.target.checked })}
              className='check'
            />
            {c.label}
          </label>
        ))}
        <label className='flex cursor-pointer items-center gap-2.5 text-[0.9375rem] text-ink'>
          <input
            type='checkbox'
            checked={filters.saved}
            onChange={(e) => set({ saved: e.target.checked })}
            className='check'
          />
          <span className='flex items-center gap-1.5'>
            Saved by me
            {savedCount > 0 && (
              <span className='tnum text-[0.8125rem] text-muted'>({savedCount})</span>
            )}
          </span>
        </label>
      </fieldset>

      <div className='field'>
        <label htmlFor='filter-sort' className='label'>
          Sort by
        </label>
        <select
          id='filter-sort'
          className='input'
          value={`${filters.sort}_${filters.order}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split('_');
            set({ sort, order });
          }}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className='flex flex-col gap-2'>
        <button type='submit' className='btn btn-md btn-primary w-full'>
          Apply filters
        </button>
        {activeCount > 0 && (
          <button type='button' onClick={clearAll} className='btn btn-md btn-ghost w-full'>
            Clear all
          </button>
        )}
      </div>
    </form>
  );

  return (
    <div className='shell grid gap-10 py-10 lg:grid-cols-[268px_1fr] lg:gap-12'>
      <aside className='hidden lg:block'>
        <div className='sticky top-24'>
          <h2 className='mb-6 text-sm font-medium text-ink'>Filters</h2>
          {form}
        </div>
      </aside>

      <section>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h1 className='flex items-center gap-2.5 text-2xl font-semibold sm:text-3xl'>
              {filters.saved && (
                <PiHeart aria-hidden='true' className='h-6 w-6 text-danger' />
              )}
              {filters.saved
                ? 'Saved listings'
                : filters.searchTerm
                ? `Results for "${filters.searchTerm}"`
                : 'All listings'}
            </h1>
            <p className='tnum mt-1.5 text-sm text-muted'>
              {loading
                ? 'Searching'
                : `${listings.length} ${
                    listings.length === 1 ? 'property' : 'properties'
                  }${
                    priceNarrowed && scoped.length > listings.length
                      ? ` of ${scoped.length} in this price range`
                      : ''
                  }`}
            </p>
          </div>

          <button
            type='button'
            onClick={() => setPanelOpen(true)}
            className='btn btn-md btn-secondary lg:hidden'
          >
            <PiSliders aria-hidden='true' className='h-4 w-4' />
            Filters
            {activeCount > 0 && (
              <span className='tnum ml-0.5 rounded-full bg-accent px-1.5 text-xs text-[rgb(var(--on-accent))]'>
                {activeCount}
              </span>
            )}
          </button>
        </div>

        <div className='mt-8'>
          {failed ? (
            <p className='rounded-card border bg-danger-soft px-5 py-4 text-danger'>
              We could not load listings right now. Please refresh the page.
            </p>
          ) : loading ? (
            <div className='grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3'>
              {Array.from({ length: 6 }, (_, i) => (
                <ListingSkeleton key={i} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className='rounded-card border border-dashed px-6 py-16 text-center'>
              <h2 className='text-lg font-medium'>
                {filters.saved && savedCount === 0
                  ? 'You have not saved anything yet'
                  : 'Nothing matched those filters'}
              </h2>
              <p className='mx-auto mt-2 max-w-sm leading-relaxed text-muted'>
                {filters.saved && savedCount === 0
                  ? 'Tap the heart on any listing to keep it here. Saved listings stay in this browser.'
                  : 'Try widening the price range or removing a filter. Listing names are matched, not addresses.'}
              </p>
              {activeCount > 0 && (
                <button
                  type='button'
                  onClick={clearAll}
                  className='btn btn-md btn-secondary mt-6'
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className='grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3'>
                {listings.slice(0, visible).map((listing) => (
                  <ListingItem key={listing._id} listing={listing} />
                ))}
              </div>

              {visible < listings.length && (
                <div className='mt-12 flex justify-center'>
                  <button
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className='btn btn-md btn-secondary'
                  >
                    Show {Math.min(PAGE_SIZE, listings.length - visible)} more
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {panelOpen && (
        <div className='fixed inset-0 z-50 lg:hidden'>
          <div
            className='absolute inset-0 bg-[rgb(var(--shadow-tint))]/40'
            onClick={() => setPanelOpen(false)}
          />
          <div className='absolute inset-y-0 right-0 flex w-[min(340px,90vw)] flex-col bg-canvas'>
            <div className='flex items-center justify-between border-b px-5 py-4'>
              <h2 className='font-medium'>Filters</h2>
              <button
                type='button'
                onClick={() => setPanelOpen(false)}
                aria-label='Close filters'
                className='btn btn-sm btn-ghost w-9 px-0'
              >
                <PiX className='h-5 w-5' />
              </button>
            </div>
            <div className='flex-1 overflow-y-auto px-5 py-6'>{form}</div>
          </div>
        </div>
      )}
    </div>
  );
}
