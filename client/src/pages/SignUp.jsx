import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import AuthErrorDialog from '../components/AuthErrorDialog';
import ParallaxFadeIn from '../components/ui/parallax-fadein';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogMsg, setErrorDialogMsg] = useState('');
  const [errorDialogTitle, setErrorDialogTitle] = useState('Sign Up Error');
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check for missing username, email, or password
    if (!formData.username || !formData.email || !formData.password) {
      setErrorDialogMsg('Please Fill All Fields!');
      setShowErrorDialog(true);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        setLoading(false);
        setErrorDialogMsg('Username or Password Is Incorrect');
        setShowErrorDialog(true);
        return;
      }
      setLoading(false);
      setError(null);
      navigate('/sign-in');
    } catch (error) {
      setLoading(false);
      setErrorDialogMsg('Username or Password Is Incorrect');
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
        <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input
            type='text'
            placeholder='Username'
            className='border p-3 rounded-lg'
            id='username'
            onChange={handleChange}
          />
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
          <input
            type='text'
            placeholder='Phone'
            className='border p-3 rounded-lg'
            id='phone'
            onChange={handleChange}
          />
          <button
            disabled={loading}
            className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
          <OAuth/>
        </form>
        <div className='flex gap-2 mt-5'>
          <p>Have an account?</p>
          <Link to={'/sign-in'}>
            <span className='text-blue-700'>Sign in</span>
          </Link>
        </div>
        {/* Removed error text under input, now handled by dialog */}
      </div>
    </ParallaxFadeIn>
  );
}
