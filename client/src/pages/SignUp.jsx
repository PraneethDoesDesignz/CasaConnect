import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import AuthLayout from '../components/AuthLayout';

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.id]: e.target.value }));
    setFieldErrors((f) => ({ ...f, [e.target.id]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = 'Choose a username.';
    else if (formData.username.trim().length < 3)
      errors.username = 'Use at least 3 characters.';
    if (!formData.email.trim()) errors.email = 'Enter your email address.';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      errors.email = 'That does not look like an email address.';
    if (!formData.password) errors.password = 'Choose a password.';
    else if (formData.password.length < 6)
      errors.password = 'Use at least 6 characters.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        setFormError(
          data.message?.includes('duplicate')
            ? 'That username or email is already registered.'
            : 'We could not create your account. Please check your details.'
        );
        return;
      }
      navigate('/sign-in');
    } catch {
      setFormError('We could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      id: 'username',
      label: 'Username',
      type: 'text',
      autoComplete: 'username',
      hint: null,
    },
    {
      id: 'email',
      label: 'Email',
      type: 'email',
      autoComplete: 'email',
      hint: null,
    },
    {
      id: 'password',
      label: 'Password',
      type: 'password',
      autoComplete: 'new-password',
      hint: 'At least 6 characters.',
    },
    {
      id: 'phone',
      label: 'Phone',
      type: 'tel',
      autoComplete: 'tel',
      hint: 'Optional. Shown to people enquiring about your listings, so they can reach you on WhatsApp.',
    },
  ];

  return (
    <AuthLayout
      title='Create an account'
      subtitle='It takes a minute. You need one to publish a listing or contact an owner.'
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

        {fields.map((f) => (
          <div key={f.id} className='field'>
            <label htmlFor={f.id} className='label'>
              {f.label}
              {f.id === 'phone' && (
                <span className='ml-1.5 font-normal text-muted'>optional</span>
              )}
            </label>
            <input
              id={f.id}
              type={f.type}
              autoComplete={f.autoComplete}
              className='input'
              value={formData[f.id]}
              onChange={handleChange}
              aria-invalid={!!fieldErrors[f.id]}
              aria-describedby={
                fieldErrors[f.id]
                  ? `${f.id}-error`
                  : f.hint
                  ? `${f.id}-hint`
                  : undefined
              }
            />
            {fieldErrors[f.id] ? (
              <p id={`${f.id}-error`} className='text-[0.8125rem] text-danger'>
                {fieldErrors[f.id]}
              </p>
            ) : (
              f.hint && (
                <p id={`${f.id}-hint`} className='hint'>
                  {f.hint}
                </p>
              )
            )}
          </div>
        ))}

        <button disabled={loading} className='btn btn-lg btn-primary mt-1 w-full'>
          {loading ? 'Creating account' : 'Create account'}
        </button>

        <div className='flex items-center gap-4 py-1'>
          <span className='h-px flex-1 bg-line' />
          <span className='text-[0.8125rem] text-muted'>or</span>
          <span className='h-px flex-1 bg-line' />
        </div>

        <OAuth onError={setFormError} />
      </form>

      <p className='mt-8 text-sm text-muted'>
        Already registered?{' '}
        <Link to='/sign-in' className='link'>
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
