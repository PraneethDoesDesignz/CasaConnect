import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  PiBed,
  PiBathtub,
  PiCar,
  PiArmchair,
  PiMapPin,
  PiShareNetwork,
  PiCheck,
} from 'react-icons/pi';
import Contact from '../components/Contact';
import Gallery from '../components/Gallery';
import SaveButton from '../components/SaveButton';
import { price, activePrice, priceSuffix } from '../lib/format';

export default function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      setError(false);
      setContact(false);
      try {
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (!res.ok || data.success === false) throw new Error();
        setListing(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  const share = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className='shell py-8'>
        <div className='skeleton aspect-[4/3] w-full rounded-feature sm:aspect-[16/9]' />
        <div className='mt-8 flex flex-col gap-3'>
          <div className='skeleton h-9 w-72 rounded-control' />
          <div className='skeleton h-4 w-96 rounded-control' />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className='shell flex min-h-[50vh] flex-col items-start justify-center py-20'>
        <h1 className='text-3xl font-semibold'>This listing is not available.</h1>
        <p className='mt-3 max-w-md leading-relaxed text-muted'>
          It may have been removed by its owner, or the link is wrong.
        </p>
        <Link to='/search' className='btn btn-md btn-primary mt-8'>
          Browse other homes
        </Link>
      </div>
    );
  }

  const saving = listing.offer
    ? Number(listing.regularPrice) - Number(listing.discountPrice)
    : 0;

  const specs = [
    {
      icon: PiBed,
      label: listing.bedrooms > 1 ? 'Bedrooms' : 'Bedroom',
      value: listing.bedrooms,
    },
    {
      icon: PiBathtub,
      label: listing.bathrooms > 1 ? 'Bathrooms' : 'Bathroom',
      value: listing.bathrooms,
    },
    { icon: PiCar, label: 'Parking', value: listing.parking ? 'Included' : 'None' },
    {
      icon: PiArmchair,
      label: 'Furnishing',
      value: listing.furnished ? 'Furnished' : 'Unfurnished',
    },
  ];

  const isOwner = currentUser && listing.userRef === currentUser._id;

  return (
    <article className='shell py-6 sm:py-8'>
      <Gallery images={listing.imageUrls} title={listing.name} />

      <div className='mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16'>
        <div className='lg:col-span-7'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='badge badge-neutral'>
              {listing.type === 'rent' ? 'For rent' : 'For sale'}
            </span>
            {saving > 0 && (
              <span className='badge badge-accent'>Save {price(saving)}</span>
            )}
          </div>

          <h1 className='mt-4 text-3xl font-semibold sm:text-4xl'>{listing.name}</h1>

          <div className='mt-4 flex flex-wrap items-center gap-3'>
            <p className='flex items-center gap-2 text-muted'>
              <PiMapPin
                aria-hidden='true'
                className='h-[18px] w-[18px] shrink-0 text-faint'
              />
              {listing.address}
            </p>
          </div>

          <div className='mt-6 flex gap-2'>
            <SaveButton listingId={listing._id} name={listing.name} />
            <button
              type='button'
              onClick={share}
              className='flex h-9 items-center gap-2 rounded-control border bg-surface px-3
                         text-sm font-medium transition-colors hover:bg-sunken'
            >
              {copied ? (
                <PiCheck aria-hidden='true' className='h-4 w-4 text-accent-ink' />
              ) : (
                <PiShareNetwork aria-hidden='true' className='h-4 w-4' />
              )}
              {copied ? 'Link copied' : 'Share'}
            </button>
          </div>

          <dl className='mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t pt-8 sm:grid-cols-4'>
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label}>
                <Icon aria-hidden='true' className='h-5 w-5 text-accent-ink' />
                <dt className='mt-3 text-[0.8125rem] text-muted'>{label}</dt>
                <dd className='tnum mt-0.5 font-medium text-ink'>{value}</dd>
              </div>
            ))}
          </dl>

          <div className='mt-10 border-t pt-8'>
            <h2 className='text-lg font-semibold'>About this property</h2>
            <p className='mt-4 max-w-[65ch] whitespace-pre-line leading-relaxed text-muted'>
              {listing.description}
            </p>
          </div>
        </div>

        <aside className='lg:col-span-5'>
          <div className='card-raised sticky top-24 p-6'>
            <p className='tnum font-display text-3xl font-semibold tracking-tight'>
              {price(activePrice(listing))}
              <span className='font-sans text-base font-normal text-muted'>
                {priceSuffix(listing)}
              </span>
            </p>

            {saving > 0 && (
              <p className='tnum mt-1.5 text-sm text-muted'>
                <span className='line-through'>{price(listing.regularPrice)}</span>{' '}
                regular price
              </p>
            )}

            <div className='mt-6 border-t pt-6'>
              {isOwner ? (
                <>
                  <p className='text-sm leading-relaxed text-muted'>
                    This is your listing. Edit it from your profile.
                  </p>
                  <Link
                    to={`/update-listing/${listing._id}`}
                    className='btn btn-lg btn-secondary mt-4 w-full'
                  >
                    Edit listing
                  </Link>
                </>
              ) : !currentUser ? (
                <>
                  <p className='text-sm leading-relaxed text-muted'>
                    Sign in to message the owner directly.
                  </p>
                  <Link to='/sign-in' className='btn btn-lg btn-primary mt-4 w-full'>
                    Sign in to contact
                  </Link>
                </>
              ) : contact ? (
                <Contact listing={listing} />
              ) : (
                <button
                  onClick={() => setContact(true)}
                  className='btn btn-lg btn-primary w-full'
                >
                  Contact the owner
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
