import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleGoogleClick = async () => {
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();

      // Sign in with Google
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Send user data to backend for authentication
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to authenticate with backend');
      }

      const data = await res.json();
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      console.error('Google Sign-In Error:', error.message);
    }
  };

  return (
    <button
      onClick={handleGoogleClick}
      type="button"
      className="bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95"
    >
      Continue with Google
    </button>
  );
}
