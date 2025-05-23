import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
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
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import AuthErrorDialog from '../components/AuthErrorDialog';
import ParallaxFadeIn from '../components/ui/parallax-fadein';
import { InteractiveHoverButton } from "../components/ui/interactive-hover-button";

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogMsg, setErrorDialogMsg] = useState('');
  const [errorDialogTitle, setErrorDialogTitle] = useState('Error');
  const dispatch = useDispatch();

  // firebase storage
  // allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 * 1024 &&
  // request.resource.contentType.matches('image/.*')

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        setErrorDialogTitle('Profile Update Error');
        setErrorDialogMsg(data.message || 'Failed to update profile.');
        setShowErrorDialog(true);
        return;
      }

      dispatch(updateUserSuccess(data));
      setErrorDialogTitle('Success');
      setErrorDialogMsg('User is updated successfully!');
      setShowErrorDialog(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      setErrorDialogTitle('Profile Update Error');
      setErrorDialogMsg(error.message || 'Failed to update profile.');
      setShowErrorDialog(true);
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        setErrorDialogTitle('Delete Account Error');
        setErrorDialogMsg(data.message || 'Failed to delete account.');
        setShowErrorDialog(true);
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
      setErrorDialogTitle('Delete Account Error');
      setErrorDialogMsg(error.message || 'Failed to delete account.');
      setShowErrorDialog(true);
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
      dispatch(deleteUserFailure(data.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      setLoadingListings(true);
      const res = await fetch(`/api/user/listings/${currentUser._id}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setLoadingListings(false);
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data.listings); 
    } catch (error) {
      setLoadingListings(false);
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      setLoadingListings(true);
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      setLoadingListings(false);
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      setLoadingListings(false);
      console.log(error);
    }
  };

  const handleListingUpdate = async (listingId, updateData) => {
    try {
      setLoadingListings(true);
      const res = await fetch(`/api/listing/update/${listingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
        credentials: 'include',
      });
      const data = await res.json();
      setLoadingListings(false);
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserListings((prev) =>
        prev.map((listing) =>
          listing._id === listingId ? { ...listing, ...updateData } : listing
        )
      );
    } catch (error) {
      setLoadingListings(false);
      console.log(error);
    }
  };

  return (
    <ParallaxFadeIn>
      <div className='p-3 max-w-lg mx-auto'>
        {loadingListings && (
          <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50'>
            <div className='loader border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 animate-spin'></div>
          </div>
        )}
        <AuthErrorDialog
          open={showErrorDialog}
          onOpenChange={setShowErrorDialog}
          errorMessage={errorDialogMsg}
          errorTitle={errorDialogTitle}
        />
        <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input
            onChange={(e) => setFile(e.target.files[0])}
            type='file'
            ref={fileRef}
            hidden
            accept='image/*'
          />
          <img
            onClick={() => fileRef.current.click()}
            src={formData.avatar || currentUser.avatar}
            alt='profile'
            className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
          />
          <p className='text-sm self-center'>
            {fileUploadError ? (
              <span className='text-red-700'>
                Error Image upload (image must be less than 2 mb)
              </span>
            ) : filePerc > 0 && filePerc < 100 ? (
              <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
            ) : filePerc === 100 ? (
              <span className='text-green-700'>Image successfully uploaded!</span>
            ) : (
              ''
            )}
          </p>
          <input
            type='text'
            placeholder='Username'
            defaultValue={currentUser.username}
            id='username'
            className='border p-3 rounded-lg'
            onChange={handleChange}
          />
          <input
            type='email'
            placeholder='Email'
            id='email'
            defaultValue={currentUser.email}
            className='border p-3 rounded-lg'
            onChange={handleChange}
          />
          <input
            type='password'
            placeholder='Password'
            onChange={handleChange}
            id='password'
            className='border p-3 rounded-lg'
          />
          <input
            type='text'
            placeholder='Phone'
            className='border p-3 rounded-lg'
            id='phone'
            onChange={handleChange}
          />
          <button
            disabled={loading}
            className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'
          >
            {loading ? 'Loading...' : 'Update'}
          </button>
          <Link
            className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'
            to={'/create-listing'}
          >
            Create Listing
          </Link>
        </form>
        <div className='flex justify-between mt-5'>
          <span
            onClick={handleDeleteUser}
            className='text-red-700 cursor-pointer'
          >
            Delete account
          </span>
          <InteractiveHoverButton text="Sign Out" onClick={handleSignOut} className="!w-32" />
        </div>

        <button onClick={handleShowListings} className='text-green-700 w-full'>
          Show Listings
        </button>
        <p className='text-red-700 mt-5'>
          {showListingsError ? 'Error showing listings' : ''}
        </p>

        {userListings && userListings.length > 0 && (
          <div className='flex flex-col gap-4'>
            <h1 className='text-center mt-7 text-2xl font-semibold'>
              Your Listings
            </h1>
            {userListings.map((listing) => (
              <div
                key={listing._id}
                className='border rounded-lg p-3 flex justify-between items-center gap-4'
              >
                <Link to={`/listing/${listing._id}`}>
                  <img
                    src={listing.imageUrls[0]}
                    alt='listing cover'
                    className='h-16 w-16 object-contain'
                  />
                </Link>
                <Link
                  className='text-slate-700 font-semibold  hover:underline truncate flex-1'
                  to={`/listing/${listing._id}`}
                >
                  <p>{listing.name}</p>
                </Link>

                <div className='flex flex-col item-center'>
                  <button
                    onClick={() => handleListingDelete(listing._id)}
                    className='text-red-700 uppercase'
                  >
                    Delete
                  </button>
                  <Link to={`/update-listing/${listing._id}`}>
                    <button className='text-green-700 uppercase'>Edit</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ParallaxFadeIn>
  );
}
