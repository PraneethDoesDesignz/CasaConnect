import { Link } from 'react-router-dom';
import { PiBed, PiBathtub, PiMapPin } from 'react-icons/pi';
import SaveButton from './SaveButton';
import { activePrice, price, priceSuffix } from '../lib/format';

const FALLBACK =
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80&auto=format&fit=crop';

export default function ListingItem({ listing }) {
  const saving = listing.offer
    ? Number(listing.regularPrice) - Number(listing.discountPrice)
    : 0;

  return (
    <article className='group'>
      <Link to={`/listing/${listing._id}`} className='block'>
        <div className='relative aspect-[4/3] overflow-hidden rounded-card bg-sunken'>
          <img
            src={listing.imageUrls?.[0] || FALLBACK}
            onError={(e) => {
              e.currentTarget.src = FALLBACK;
            }}
            alt={`${listing.name}, ${listing.address}`}
            loading='lazy'
            className='h-full w-full object-cover transition-transform duration-500 ease-out
                       group-hover:scale-[1.03]'
          />
          {saving > 0 && (
            <span className='badge badge-accent absolute left-3 top-3 shadow-sm backdrop-blur'>
              Save {price(saving)}
            </span>
          )}

          <SaveButton
            listingId={listing._id}
            name={listing.name}
            className='absolute right-3 top-3'
          />

          {/* Weight at the base of the photo so the price below it has a
              foundation instead of floating against a hard edge. */}
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t
                       from-[rgb(var(--shadow-tint))]/25 to-transparent opacity-0
                       transition-opacity duration-500 group-hover:opacity-100'
          />
        </div>

        <div className='mt-3.5 flex flex-col gap-1.5'>
          <div className='flex items-baseline justify-between gap-3'>
            <p className='tnum text-lg font-semibold tracking-tight'>
              {price(activePrice(listing))}
              <span className='text-sm font-normal text-muted'>
                {priceSuffix(listing)}
              </span>
            </p>
            <span className='text-[0.6875rem] font-medium uppercase tracking-wider text-muted'>
              {listing.type === 'rent' ? 'Rent' : 'Sale'}
            </span>
          </div>

          <h3 className='truncate font-medium text-ink transition-colors group-hover:text-accent-ink'>
            {listing.name}
          </h3>

          <p className='flex items-center gap-1.5 text-sm text-muted'>
            <PiMapPin aria-hidden='true' className='h-4 w-4 shrink-0 text-faint' />
            <span className='truncate'>{listing.address}</span>
          </p>

          <p className='tnum mt-1 flex items-center gap-4 text-sm text-muted'>
            <span className='flex items-center gap-1.5'>
              <PiBed aria-hidden='true' className='h-4 w-4 text-faint' />
              {listing.bedrooms} {listing.bedrooms > 1 ? 'beds' : 'bed'}
            </span>
            <span className='flex items-center gap-1.5'>
              <PiBathtub aria-hidden='true' className='h-4 w-4 text-faint' />
              {listing.bathrooms} {listing.bathrooms > 1 ? 'baths' : 'bath'}
            </span>
            {listing.furnished && (
              <span className='hidden sm:inline'>Furnished</span>
            )}
          </p>
        </div>
      </Link>
    </article>
  );
}
