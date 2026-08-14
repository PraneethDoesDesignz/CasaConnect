import { useSelector, useDispatch } from 'react-redux';
import { useRef, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { PiCamera, PiPencilSimple, PiTrash, PiPlus } from 'react-icons/pi';
import { app } from '../firebase';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
} from '../redux/user/userSlice';
import AuthErrorDialog from '../components/AuthErrorDialog';
import { price, priceShort, activePrice } from '../lib/format';

const FALLBACK =
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80&auto=format&fit=crop';

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState('');
  const [formData, setFormData] = useState({});
  const [userListings, setUserListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [dialog, setDialog] = useState({ open: false, title: '', message: '' });

  const notify = (title, message) => setDialog({ open: true, title, message });

  useEffect(() => {
    if (file) handleFileUpload(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // Listings load with the page. The old build hid them behind a button.
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/user/listings/${currentUser._id}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success === false) throw new Error();
        setUserListings(data.listings || []);
      } catch {
        setListingsError(true);
      } finally {
        setListingsLoading(false);
      }
    };
    run();
  }, [currentUser._id]);

  const portfolio = useMemo(() => {
    if (!userListings.length) return null;
    const rent = userListings.filter((l) => l.type === 'rent');
    const sale = userListings.filter((l) => l.type === 'sale');
    const monthly = rent.reduce((sum, l) => sum + Number(activePrice(l)), 0);
    const saleValue = sale.reduce((sum, l) => sum + Number(activePrice(l)), 0);
    const peak = Math.max(...userListings.map((l) => Number(activePrice(l))), 1);

    return {
      rent,
      sale,
      peak,
      tiles: [
        { value: String(userListings.length), label: 'listings' },
        { value: priceShort(monthly), label: 'monthly rent' },
        { value: priceShort(saleValue), label: 'sale value' },
        {
          value: String(userListings.filter((l) => l.offer).length),
          label: 'discounted',
        },
      ],
    };
  }, [userListings]);

  const handleFileUpload = (file) => {
    setFileUploadError('');
    const storage = getStorage(app);
    const storageRef = ref(storage, new Date().getTime() + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) =>
        setFilePerc(
          Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        ),
      () =>
        setFileUploadError(
          'Image upload failed. Firebase Storage is unavailable for this project, so the photo could not be saved.'
        ),
      () =>
        getDownloadURL(uploadTask.snapshot.ref).then((url) =>
          setFormData((f) => ({ ...f, avatar: url }))
        )
    );
  };

  const handleChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.id]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        notify('Update failed', data.message || 'We could not save your changes.');
        return;
      }
      dispatch(updateUserSuccess(data));
      notify('Success', 'Your profile has been updated.');
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      notify('Update failed', 'We could not reach the server. Please try again.');
    }
  };

  const handleDeleteUser = async () => {
    if (
      !window.confirm(
        'Delete your account permanently? Your listings will stay in the database but you will lose access to them.'
      )
    )
      return;
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        notify('Delete failed', data.message || 'We could not delete your account.');
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
      notify('Delete failed', 'We could not reach the server. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleListingDelete = async (listingId) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    setDeletingId(listingId);
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success === false) {
        notify('Delete failed', data.message || 'We could not delete that listing.');
        return;
      }
      setUserListings((prev) => prev.filter((l) => l._id !== listingId));
    } catch {
      notify('Delete failed', 'We could not reach the server. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className='shell max-w-3xl py-12 sm:py-16'>
      <AuthErrorDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        errorTitle={dialog.title}
        errorMessage={dialog.message}
      />

      <header className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-semibold'>Your account</h1>
          <p className='mt-1.5 text-muted'>{currentUser.email}</p>
        </div>
        <button onClick={handleSignOut} className='btn btn-md btn-secondary'>
          Sign out
        </button>
      </header>

      {/* Account details */}
      <section className='card mt-10 p-6 sm:p-8'>
        <h2 className='text-lg font-semibold'>Profile</h2>

        <form onSubmit={handleSubmit} className='mt-6 flex flex-col gap-5'>
          <input
            onChange={(e) => setFile(e.target.files[0])}
            type='file'
            ref={fileRef}
            hidden
            accept='image/*'
          />

          <div className='flex items-center gap-5'>
            <button
              type='button'
              onClick={() => fileRef.current.click()}
              className='group relative h-20 w-20 shrink-0 overflow-hidden rounded-card border'
              aria-label='Change profile photo'
            >
              <img
                src={formData.avatar || currentUser.avatar}
                alt=''
                className='h-full w-full object-cover'
              />
              <span
                className='absolute inset-0 flex items-center justify-center bg-[rgb(var(--shadow-tint))]/55
                           opacity-0 transition-opacity group-hover:opacity-100'
              >
                <PiCamera aria-hidden='true' className='h-5 w-5 text-white' />
              </span>
            </button>

            <div className='min-w-0'>
              <p className='font-medium'>{currentUser.username}</p>
              {fileUploadError ? (
                <p className='mt-1 text-[0.8125rem] leading-snug text-danger'>
                  {fileUploadError}
                </p>
              ) : filePerc > 0 && filePerc < 100 ? (
                <p className='tnum mt-1 text-[0.8125rem] text-muted'>
                  Uploading {filePerc}%
                </p>
              ) : filePerc === 100 ? (
                <p className='mt-1 text-[0.8125rem] text-accent-ink'>
                  Photo uploaded. Save to apply it.
                </p>
              ) : (
                <p className='mt-1 text-[0.8125rem] text-muted'>
                  Click the photo to change it.
                </p>
              )}
            </div>
          </div>

          <div className='grid gap-5 sm:grid-cols-2'>
            <div className='field'>
              <label htmlFor='username' className='label'>
                Username
              </label>
              <input
                id='username'
                type='text'
                defaultValue={currentUser.username}
                className='input'
                onChange={handleChange}
              />
            </div>

            <div className='field'>
              <label htmlFor='email' className='label'>
                Email
              </label>
              <input
                id='email'
                type='email'
                defaultValue={currentUser.email}
                className='input'
                onChange={handleChange}
              />
            </div>

            <div className='field'>
              <label htmlFor='password' className='label'>
                New password
              </label>
              <input
                id='password'
                type='password'
                autoComplete='new-password'
                className='input'
                onChange={handleChange}
              />
              <p className='hint'>Leave blank to keep your current password.</p>
            </div>

            <div className='field'>
              <label htmlFor='phone' className='label'>
                Phone
              </label>
              <input
                id='phone'
                type='tel'
                defaultValue={currentUser.phone || ''}
                className='input'
                onChange={handleChange}
              />
              <p className='hint'>Used for WhatsApp enquiries on your listings.</p>
            </div>
          </div>

          <div className='flex gap-3'>
            <button disabled={loading} className='btn btn-md btn-primary'>
              {loading ? 'Saving' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>

      {/* Portfolio at a glance, derived from the listings already loaded. */}
      {portfolio && (
        <section className='card-raised mt-12 p-6 sm:p-8'>
          <h2 className='text-lg font-semibold'>Your portfolio</h2>

          <div className='mt-6 grid grid-cols-2 gap-y-6 sm:grid-cols-4'>
            {portfolio.tiles.map((t) => (
              <div key={t.label}>
                <p className='tnum font-display text-2xl font-semibold tracking-tight'>
                  {t.value}
                </p>
                <p className='mt-0.5 text-[0.8125rem] text-muted'>{t.label}</p>
              </div>
            ))}
          </div>

          <div className='mt-8 border-t pt-6'>
            <h3 className='text-[0.8125rem] font-medium text-muted'>
              Asking price by listing
            </h3>
            <ul className='mt-4 flex flex-col gap-3'>
              {userListings.map((l) => {
                const value = Number(activePrice(l));
                return (
                  <li key={l._id} className='flex items-center gap-4'>
                    <span className='w-32 shrink-0 truncate text-[0.8125rem] text-muted sm:w-44'>
                      {l.name}
                    </span>
                    <span className='h-2 flex-1 overflow-hidden rounded-full bg-sunken'>
                      <span
                        className={`block h-full rounded-full ${
                          l.type === 'rent' ? 'bg-accent' : 'bg-ink'
                        }`}
                        style={{
                          width: `${Math.max(3, (value / portfolio.peak) * 100)}%`,
                        }}
                      />
                    </span>
                    <span className='tnum w-20 shrink-0 text-right text-[0.8125rem]'>
                      {priceShort(value)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className='mt-4 flex items-center gap-4 text-[0.75rem] text-muted'>
              <span className='flex items-center gap-1.5'>
                <span className='h-2 w-2 rounded-full bg-accent' />
                rent, per month
              </span>
              <span className='flex items-center gap-1.5'>
                <span className='h-2 w-2 rounded-full bg-ink' />
                sale
              </span>
            </p>
          </div>
        </section>
      )}

      {/* Listings */}
      <section className='mt-12'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <h2 className='text-lg font-semibold'>Your listings</h2>
          <Link to='/create-listing' className='btn btn-sm btn-secondary'>
            <PiPlus aria-hidden='true' className='h-4 w-4' />
            New listing
          </Link>
        </div>

        <div className='mt-5'>
          {listingsLoading ? (
            <div className='flex flex-col gap-3'>
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className='skeleton h-[88px] rounded-card' />
              ))}
            </div>
          ) : listingsError ? (
            <p className='rounded-control bg-danger-soft px-4 py-3 text-sm text-danger'>
              We could not load your listings. Please refresh the page.
            </p>
          ) : userListings.length === 0 ? (
            <div className='rounded-card border border-dashed px-6 py-14 text-center'>
              <h3 className='font-medium'>You have not listed anything yet</h3>
              <p className='mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted'>
                Publish photos, price, rooms and amenities. Interested people
                reach you by email or WhatsApp.
              </p>
              <Link to='/create-listing' className='btn btn-md btn-primary mt-6'>
                Create your first listing
              </Link>
            </div>
          ) : (
            <ul className='flex flex-col gap-3'>
              {userListings.map((listing) => (
                <li
                  key={listing._id}
                  className='card flex items-center gap-4 p-3'
                >
                  <Link
                    to={`/listing/${listing._id}`}
                    className='h-16 w-20 shrink-0 overflow-hidden rounded-control bg-sunken'
                  >
                    <img
                      src={listing.imageUrls?.[0] || FALLBACK}
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK;
                      }}
                      alt=''
                      className='h-full w-full object-cover'
                    />
                  </Link>

                  <div className='min-w-0 flex-1'>
                    <Link
                      to={`/listing/${listing._id}`}
                      className='block truncate font-medium hover:text-accent-ink'
                    >
                      {listing.name}
                    </Link>
                    <p className='tnum mt-0.5 text-sm text-muted'>
                      {price(activePrice(listing))}
                      <span className='mx-1.5 text-faint'>/</span>
                      {listing.type === 'rent' ? 'Rent' : 'Sale'}
                    </p>
                  </div>

                  <div className='flex shrink-0 gap-1'>
                    <Link
                      to={`/update-listing/${listing._id}`}
                      className='btn btn-sm btn-ghost px-2'
                      aria-label={`Edit ${listing.name}`}
                    >
                      <PiPencilSimple className='h-4 w-4' />
                    </Link>
                    <button
                      onClick={() => handleListingDelete(listing._id)}
                      disabled={deletingId === listing._id}
                      className='btn btn-sm btn-ghost px-2 text-danger hover:bg-danger-soft'
                      aria-label={`Delete ${listing.name}`}
                    >
                      <PiTrash className='h-4 w-4' />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Account removal, kept away from everyday actions */}
      <section className='mt-16 border-t pt-8'>
        <h2 className='font-medium'>Delete account</h2>
        <p className='mt-1.5 max-w-lg text-sm leading-relaxed text-muted'>
          This removes your account permanently. It cannot be undone.
        </p>
        <button onClick={handleDeleteUser} className='btn btn-md btn-danger mt-4'>
          Delete my account
        </button>
      </section>
    </div>
  );
}
