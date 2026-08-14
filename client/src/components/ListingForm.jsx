import { useState } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PiUploadSimple, PiTrash, PiLink } from 'react-icons/pi';
import { app } from '../firebase';

const MAX_IMAGES = 6;

export const EMPTY_LISTING = {
  imageUrls: [],
  name: '',
  description: '',
  address: '',
  type: 'rent',
  bedrooms: 1,
  bathrooms: 1,
  regularPrice: 50,
  discountPrice: 0,
  offer: false,
  parking: false,
  furnished: false,
};

/**
 * Create and update were two 390-line files differing only in how they seed
 * state and where they submit. This is the single form both now render.
 */
export default function ListingForm({ mode, initial, listingId }) {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initial);
  const [files, setFiles] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageError, setImageError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (patch) => setFormData((f) => ({ ...f, ...patch }));

  const storeImage = (file) =>
    new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const storageRef = ref(storage, new Date().getTime() + file.name);
      const task = uploadBytesResumable(storageRef, file);
      task.on(
        'state_changed',
        null,
        reject,
        () => getDownloadURL(task.snapshot.ref).then(resolve).catch(reject)
      );
    });

  const handleImageSubmit = async () => {
    setImageError('');
    if (files.length === 0) {
      setImageError('Choose at least one image file first.');
      return;
    }
    if (files.length + formData.imageUrls.length > MAX_IMAGES) {
      setImageError(`A listing can hold ${MAX_IMAGES} images in total.`);
      return;
    }
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(storeImage));
      set({ imageUrls: formData.imageUrls.concat(urls) });
      setFiles([]);
    } catch {
      setImageError(
        'Upload failed. Firebase Storage is unavailable for this project, so files cannot be saved. Paste an image URL below instead.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = () => {
    setImageError('');
    const url = imageUrlInput.trim();
    if (!url) return;
    if (!/^https?:\/\/\S+$/i.test(url)) {
      setImageError('Enter a full image URL starting with http or https.');
      return;
    }
    if (formData.imageUrls.length >= MAX_IMAGES) {
      setImageError(`A listing can hold ${MAX_IMAGES} images in total.`);
      return;
    }
    set({ imageUrls: [...formData.imageUrls, url] });
    setImageUrlInput('');
  };

  const removeImage = (index) =>
    set({ imageUrls: formData.imageUrls.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.imageUrls.length < 1) {
      setError('Add at least one image so people can see the property.');
      return;
    }
    if (formData.offer && +formData.regularPrice < +formData.discountPrice) {
      setError('The discounted price must be lower than the regular price.');
      return;
    }

    try {
      setLoading(true);

      let token = null;
      try {
        const auth = getAuth();
        if (auth.currentUser) token = await auth.currentUser.getIdToken();
      } catch {
        // Firebase is optional here; the JWT cookie is the real credential.
      }
      if (!token) token = currentUser?.token || localStorage.getItem('jwtToken');

      const url =
        mode === 'create'
          ? '/api/listing/create'
          : `/api/listing/update/${listingId}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ ...formData, userRef: currentUser._id }),
      });
      const data = await res.json();

      if (!res.ok || data.success === false) {
        setError(data.message || 'We could not save this listing.');
        return;
      }
      navigate(`/listing/${data._id}`);
    } catch {
      setError('We could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const amenities = [
    { id: 'parking', label: 'Parking spot' },
    { id: 'furnished', label: 'Furnished' },
    { id: 'offer', label: 'Offer a discounted price' },
  ];

  return (
    <form onSubmit={handleSubmit} className='mt-10 flex flex-col gap-12'>
      {/* Details */}
      <section className='grid gap-8 lg:grid-cols-[200px_1fr]'>
        <div>
          <h2 className='font-semibold'>Property</h2>
          <p className='mt-1.5 text-sm leading-relaxed text-muted'>
            What it is called and where it is.
          </p>
        </div>

        <div className='flex flex-col gap-5'>
          <div className='field'>
            <label htmlFor='name' className='label'>
              Listing name
            </label>
            <input
              id='name'
              type='text'
              className='input'
              maxLength='62'
              minLength='10'
              required
              placeholder='3 BHK with balcony in Indiranagar'
              value={formData.name}
              onChange={(e) => set({ name: e.target.value })}
            />
            <p className='hint'>Between 10 and 62 characters.</p>
          </div>

          <div className='field'>
            <label htmlFor='address' className='label'>
              Address
            </label>
            <input
              id='address'
              type='text'
              className='input'
              required
              placeholder='12th Main Road, Indiranagar, Bengaluru 560038'
              value={formData.address}
              onChange={(e) => set({ address: e.target.value })}
            />
          </div>

          <div className='field'>
            <label htmlFor='description' className='label'>
              Description
            </label>
            <textarea
              id='description'
              rows='5'
              className='input'
              required
              placeholder='Describe the layout, the neighbourhood, and what is included.'
              value={formData.description}
              onChange={(e) => set({ description: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* Terms */}
      <section className='grid gap-8 border-t pt-12 lg:grid-cols-[200px_1fr]'>
        <div>
          <h2 className='font-semibold'>Terms</h2>
          <p className='mt-1.5 text-sm leading-relaxed text-muted'>
            How you are offering it and at what price.
          </p>
        </div>

        <div className='flex flex-col gap-8'>
          <fieldset className='flex flex-col gap-3'>
            <legend className='label mb-1'>This property is</legend>
            <div className='flex gap-6'>
              {[
                { id: 'rent', label: 'To rent' },
                { id: 'sale', label: 'For sale' },
              ].map((t) => (
                <label
                  key={t.id}
                  className='flex cursor-pointer items-center gap-2.5 text-[0.9375rem]'
                >
                  <input
                    type='radio'
                    name='listing-type'
                    checked={formData.type === t.id}
                    onChange={() => set({ type: t.id })}
                    className='check rounded-full'
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className='flex flex-col gap-3'>
            <legend className='label mb-1'>Amenities</legend>
            {amenities.map((a) => (
              <label
                key={a.id}
                className='flex cursor-pointer items-center gap-2.5 text-[0.9375rem]'
              >
                <input
                  type='checkbox'
                  checked={formData[a.id]}
                  onChange={(e) => set({ [a.id]: e.target.checked })}
                  className='check'
                />
                {a.label}
              </label>
            ))}
          </fieldset>

          <div className='grid gap-5 sm:grid-cols-2'>
            <div className='field'>
              <label htmlFor='bedrooms' className='label'>
                Bedrooms
              </label>
              <input
                id='bedrooms'
                type='number'
                min='1'
                max='10'
                required
                className='input tnum'
                value={formData.bedrooms}
                onChange={(e) => set({ bedrooms: e.target.value })}
              />
            </div>

            <div className='field'>
              <label htmlFor='bathrooms' className='label'>
                Bathrooms
              </label>
              <input
                id='bathrooms'
                type='number'
                min='1'
                max='10'
                required
                className='input tnum'
                value={formData.bathrooms}
                onChange={(e) => set({ bathrooms: e.target.value })}
              />
            </div>

            <div className='field'>
              <label htmlFor='regularPrice' className='label'>
                Regular price
              </label>
              <input
                id='regularPrice'
                type='number'
                min='50'
                max='10000000'
                required
                className='input tnum'
                value={formData.regularPrice}
                onChange={(e) => set({ regularPrice: e.target.value })}
              />
              <p className='hint'>
                In rupees{formData.type === 'rent' ? ', per month' : ''}.
              </p>
            </div>

            {formData.offer && (
              <div className='field'>
                <label htmlFor='discountPrice' className='label'>
                  Discounted price
                </label>
                <input
                  id='discountPrice'
                  type='number'
                  min='0'
                  max='10000000'
                  required
                  className='input tnum'
                  value={formData.discountPrice}
                  onChange={(e) => set({ discountPrice: e.target.value })}
                />
                <p className='hint'>
                  In rupees{formData.type === 'rent' ? ', per month' : ''}. Must
                  be lower than the regular price.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Images */}
      <section className='grid gap-8 border-t pt-12 lg:grid-cols-[200px_1fr]'>
        <div>
          <h2 className='font-semibold'>Photos</h2>
          <p className='mt-1.5 text-sm leading-relaxed text-muted'>
            Up to {MAX_IMAGES}. The first one is the cover.
          </p>
        </div>

        <div className='flex flex-col gap-5'>
          <div className='field'>
            <label htmlFor='images' className='label'>
              Upload from your device
            </label>
            <div className='flex flex-col gap-2 sm:flex-row'>
              <input
                id='images'
                type='file'
                accept='image/*'
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files))}
                className='input h-auto py-2.5 file:mr-3 file:rounded-control file:border-0
                           file:bg-sunken file:px-3 file:py-1.5 file:text-sm file:text-ink'
              />
              <button
                type='button'
                disabled={uploading}
                onClick={handleImageSubmit}
                className='btn btn-md btn-secondary shrink-0'
              >
                <PiUploadSimple aria-hidden='true' className='h-4 w-4' />
                {uploading ? 'Uploading' : 'Upload'}
              </button>
            </div>
          </div>

          <div className='field'>
            <label htmlFor='image-url' className='label'>
              Or paste an image URL
            </label>
            <div className='flex flex-col gap-2 sm:flex-row'>
              <input
                id='image-url'
                type='url'
                className='input'
                placeholder='https://images.unsplash.com/photo-...'
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
              />
              <button
                type='button'
                onClick={handleAddUrl}
                className='btn btn-md btn-secondary shrink-0'
              >
                <PiLink aria-hidden='true' className='h-4 w-4' />
                Add
              </button>
            </div>
          </div>

          {imageError && (
            <p role='alert' className='text-[0.8125rem] leading-relaxed text-danger'>
              {imageError}
            </p>
          )}

          {formData.imageUrls.length > 0 ? (
            <ul className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
              {formData.imageUrls.map((url, index) => (
                <li key={url} className='group relative'>
                  <div className='aspect-[4/3] overflow-hidden rounded-control border bg-sunken'>
                    <img
                      src={url}
                      alt={`Listing photo ${index + 1}`}
                      className='h-full w-full object-cover'
                    />
                  </div>
                  {index === 0 && (
                    <span className='badge badge-neutral absolute left-2 top-2 bg-surface/95'>
                      Cover
                    </span>
                  )}
                  <button
                    type='button'
                    onClick={() => removeImage(index)}
                    aria-label={`Remove photo ${index + 1}`}
                    className='absolute right-2 top-2 flex h-7 w-7 items-center justify-center
                               rounded-control border bg-surface/95 text-danger backdrop-blur
                               transition-opacity hover:bg-danger-soft'
                  >
                    <PiTrash className='h-3.5 w-3.5' />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className='rounded-control border border-dashed px-4 py-8 text-center text-sm text-muted'>
              No photos yet. Add at least one before publishing.
            </p>
          )}
        </div>
      </section>

      <div className='flex flex-col gap-3 border-t pt-8'>
        {error && (
          <p
            role='alert'
            className='rounded-control bg-danger-soft px-3.5 py-3 text-sm text-danger'
          >
            {error}
          </p>
        )}
        <div className='flex flex-wrap gap-3'>
          <button
            disabled={loading || uploading}
            className='btn btn-lg btn-primary'
          >
            {loading
              ? 'Saving'
              : mode === 'create'
              ? 'Publish listing'
              : 'Save changes'}
          </button>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='btn btn-lg btn-secondary'
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
