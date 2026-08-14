import { Link } from 'react-router-dom';

export default function Logo({ className = '' }) {
  return (
    <Link
      to='/'
      aria-label='CasaConnect home'
      className={`inline-flex items-center gap-2.5 ${className}`}
    >
      <svg
        viewBox='0 0 32 32'
        aria-hidden='true'
        className='h-7 w-7 shrink-0 rounded-[7px]'
      >
        <rect width='32' height='32' rx='7' fill='rgb(var(--accent))' />
        <path
          d='M8 15.2 16 8.5l8 6.7V24a1 1 0 0 1-1 1h-5v-6h-4v6H9a1 1 0 0 1-1-1z'
          fill='none'
          stroke='rgb(var(--on-accent))'
          strokeWidth='2.1'
          strokeLinejoin='round'
          strokeLinecap='round'
        />
      </svg>
      <span className='text-[0.9375rem] font-semibold tracking-tight text-ink'>
        CasaConnect
      </span>
    </Link>
  );
}
