import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';
import AuthErrorDialog from '../components/AuthErrorDialog';
import ParallaxFadeIn from '../components/ui/parallax-fadein';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogMsg, setErrorDialogMsg] = useState('');
  const [errorDialogTitle, setErrorDialogTitle] = useState('Sign In Error');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check for missing email or password
    if (!formData.email || !formData.password) {
      setErrorDialogMsg('Please Fill All Fields!');
      setShowErrorDialog(true);
      return;
    }
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        setErrorDialogMsg('Incorrect Email or Password');
        setShowErrorDialog(true);
        return;
      }
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error.message));
      setErrorDialogMsg('Incorrect Email or Password');
      setShowErrorDialog(true);
    }
  };
  return (
    <ParallaxFadeIn>
      <div className='p-3 max-w-lg mx-auto'>
        <AuthErrorDialog
          open={showErrorDialog}
          onOpenChange={setShowErrorDialog}
          errorMessage={errorDialogMsg}
          errorTitle={errorDialogTitle}
        />
        <h1 className='text-3xl text-center font-semibold my-7'>Sign In</h1>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input
            type='email'
            placeholder='Email'
            className='border p-3 rounded-lg'
            id='email'
            onChange={handleChange}
          />
          <input
            type='password'
            placeholder='Password'
            className='border p-3 rounded-lg'
            id='password'
            onChange={handleChange}
          />

          <button
            disabled={loading}
            className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
          <OAuth/>
        </form>
        <div className='flex gap-2 mt-5'>
          <p>Dont have an account?</p>
          <Link to={'/sign-up'}>
            <span className='text-blue-700'>Sign up</span>
          </Link>
        </div>
        {/* Removed error text under input, now handled by dialog */}
      </div>
    </ParallaxFadeIn>
  );
}
