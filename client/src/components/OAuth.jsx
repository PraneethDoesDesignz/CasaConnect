import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

export default function OAuth({ onError }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleClick = async () => {
    try {
      setLoading(true);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
        }),
      });

      if (!res.ok) throw new Error('We could not sign you in. Please try again.');

      const data = await res.json();
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      // Closing the popup is a deliberate cancel, not a failure worth reporting.
      if (error.code === 'auth/popup-closed-by-user') return;
      onError?.(error.message || 'We could not sign you in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleClick}
      type='button'
      disabled={loading}
      className='btn btn-lg btn-secondary w-full'
    >
      <svg viewBox='0 0 24 24' aria-hidden='true' className='h-[18px] w-[18px]'>
        <path
          fill='#4285F4'
          d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z'
        />
        <path
          fill='#34A853'
          d='M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z'
        />
        <path
          fill='#FBBC05'
          d='M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z'
        />
        <path
          fill='#EA4335'
          d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z'
        />
      </svg>
      {loading ? 'Opening Google' : 'Continue with Google'}
    </button>
  );
}
