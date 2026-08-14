import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';
import AuthLayout from '../components/AuthLayout';

export default function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const { loading } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.id]: e.target.value }));
    setFieldErrors((f) => ({ ...f, [e.target.id]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) errors.email = 'Enter your email address.';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      errors.email = 'That does not look like an email address.';
    if (!formData.password) errors.password = 'Enter your password.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        setFormError('That email and password do not match an account.');
        return;
      }
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error.message));
      setFormError('We could not reach the server. Please try again.');
    }
  };

  return (
    <AuthLayout
      title='Sign in'
      subtitle='Save listings, publish your own property and message owners.'
    >
      <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-5'>
        {formError && (
          <p
            role='alert'
            className='rounded-control bg-danger-soft px-3.5 py-3 text-sm text-danger'
          >
            {formError}
          </p>
        )}

        <div className='field'>
          <label htmlFor='email' className='label'>
            Email
          </label>
          <input
            id='email'
            type='email'
            autoComplete='email'
            className='input'
            value={formData.email}
            onChange={handleChange}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          />
          {fieldErrors.email && (
            <p id='email-error' className='text-[0.8125rem] text-danger'>
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className='field'>
          <label htmlFor='password' className='label'>
            Password
          </label>
          <input
            id='password'
            type='password'
            autoComplete='current-password'
            className='input'
            value={formData.password}
            onChange={handleChange}
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
          />
          {fieldErrors.password && (
            <p id='password-error' className='text-[0.8125rem] text-danger'>
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button
          disabled={loading}
          className='btn btn-lg btn-primary mt-1 w-full'
        >
          {loading ? 'Signing in' : 'Sign in'}
        </button>

        <div className='flex items-center gap-4 py-1'>
          <span className='h-px flex-1 bg-line' />
          <span className='text-[0.8125rem] text-muted'>or</span>
          <span className='h-px flex-1 bg-line' />
        </div>

        <OAuth onError={setFormError} />
      </form>

      <p className='mt-8 text-sm text-muted'>
        New to CasaConnect?{' '}
        <Link to='/sign-up' className='link'>
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
