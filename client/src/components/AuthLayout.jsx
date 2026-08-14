const IMAGE =
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80&auto=format&fit=crop';

/** Shared two-column frame for sign in and sign up so the pair reads as one flow. */
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className='grid lg:grid-cols-2'>
      <div className='flex items-center justify-center px-5 py-16 sm:px-8 sm:py-20'>
        <div className='w-full max-w-sm'>
          <h1 className='text-3xl font-semibold'>{title}</h1>
          <p className='mt-2.5 leading-relaxed text-muted'>{subtitle}</p>
          <div className='mt-9'>{children}</div>
        </div>
      </div>

      <div className='relative hidden border-l lg:block'>
        <img
          src={IMAGE}
          alt='A bright dining area with wooden furniture and large windows'
          className='absolute inset-0 h-full w-full object-cover'
        />
      </div>
    </div>
  );
}
