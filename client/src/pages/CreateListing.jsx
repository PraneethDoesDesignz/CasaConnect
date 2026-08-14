import ListingForm, { EMPTY_LISTING } from '../components/ListingForm';

export default function CreateListing() {
  return (
    <div className='shell max-w-4xl py-12 sm:py-16'>
      <header>
        <h1 className='text-3xl font-semibold'>List a property</h1>
        <p className='mt-2 max-w-lg leading-relaxed text-muted'>
          Publish it to CasaConnect. People who are interested will contact you
          by email or WhatsApp.
        </p>
      </header>

      <ListingForm mode='create' initial={EMPTY_LISTING} />
    </div>
  );
}
