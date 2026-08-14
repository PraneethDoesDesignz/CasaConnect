import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ListingForm from '../components/ListingForm';

export default function UpdateListing() {
  const params = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
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

  if (loading) {
    return (
      <div className='shell max-w-4xl py-12 sm:py-16'>
        <div className='skeleton h-9 w-64 rounded-control' />
        <div className='mt-10 flex flex-col gap-4'>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className='skeleton h-11 rounded-control' />
          ))}
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className='shell flex min-h-[50vh] max-w-4xl flex-col items-start justify-center py-16'>
        <h1 className='text-3xl font-semibold'>We could not load that listing.</h1>
        <p className='mt-3 max-w-md leading-relaxed text-muted'>
          It may have been deleted, or the link is wrong.
        </p>
        <Link to='/profile' className='btn btn-md btn-primary mt-8'>
          Back to your listings
        </Link>
      </div>
    );
  }

  return (
    <div className='shell max-w-4xl py-12 sm:py-16'>
      <header>
        <h1 className='text-3xl font-semibold'>Edit listing</h1>
        <p className='mt-2 max-w-lg leading-relaxed text-muted'>
          Changes go live as soon as you save.
        </p>
      </header>

      <ListingForm
        mode='update'
        initial={listing}
        listingId={params.listingId}
      />
    </div>
  );
}
