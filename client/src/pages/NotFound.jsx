import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className='shell flex min-h-[60vh] flex-col items-start justify-center py-20'>
      <p className='font-mono text-sm text-muted'>404</p>
      <h1 className='mt-3 max-w-lg text-3xl font-semibold sm:text-4xl'>
        We could not find that page.
      </h1>
      <p className='mt-3 max-w-md leading-relaxed text-muted'>
        The listing may have been removed by its owner, or the link is wrong.
      </p>
      <div className='mt-8 flex flex-wrap gap-3'>
        <Link to='/search' className='btn btn-md btn-primary'>
          Browse homes
        </Link>
        <Link to='/' className='btn btn-md btn-secondary'>
          Go home
        </Link>
      </div>
    </div>
  );
}
