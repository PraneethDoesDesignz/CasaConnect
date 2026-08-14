import { useCallback, useEffect, useRef, useState } from 'react';
import { PiX, PiCaretLeft, PiCaretRight, PiImages } from 'react-icons/pi';

const FALLBACK =
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1600&q=80&auto=format&fit=crop';

/**
 * Mosaic gallery with a keyboard-driven lightbox. Replaces Swiper here, which
 * was the only remaining use of that dependency.
 */
export default function Gallery({ images, title }) {
  const photos = images?.length ? images : [FALLBACK];
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const closeRef = useRef(null);
  const lastFocused = useRef(null);

  const go = useCallback(
    (delta) => setIndex((i) => (i + delta + photos.length) % photos.length),
    [photos.length]
  );

  const openAt = (i) => {
    lastFocused.current = document.activeElement;
    setIndex(i);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) {
      // Return focus to whatever opened the lightbox.
      lastFocused.current?.focus?.();
      return;
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, go]);

  const img = (src, alt, className, onClick) => (
    <button
      type='button'
      onClick={onClick}
      className={`group relative overflow-hidden bg-sunken ${className}`}
    >
      <img
        src={src}
        onError={(e) => {
          e.currentTarget.src = FALLBACK;
        }}
        alt={alt}
        className='h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]'
      />
      <span
        aria-hidden='true'
        className='absolute inset-0 bg-[rgb(var(--shadow-tint))]/0 transition-colors group-hover:bg-[rgb(var(--shadow-tint))]/10'
      />
    </button>
  );

  return (
    <>
      <div className='relative overflow-hidden rounded-feature'>
        {photos.length === 1 ? (
          img(
            photos[0],
            `${title}, photo 1 of 1`,
            'aspect-[4/3] w-full sm:aspect-[16/9]',
            () => openAt(0)
          )
        ) : (
          <div className='grid aspect-[4/3] grid-cols-4 grid-rows-2 gap-1.5 sm:aspect-[16/9]'>
            {img(
              photos[0],
              `${title}, photo 1 of ${photos.length}`,
              'col-span-4 row-span-2 sm:col-span-2',
              () => openAt(0)
            )}
            {photos.slice(1, 5).map((src, i) =>
              img(
                src,
                `${title}, photo ${i + 2} of ${photos.length}`,
                'hidden sm:block',
                () => openAt(i + 1)
              )
            )}
            {/* Keep the mosaic square even when there are fewer than 5 photos. */}
            {photos.length < 5 &&
              Array.from({ length: 5 - photos.length }, (_, i) => (
                <div key={`gap-${i}`} className='hidden bg-sunken sm:block' />
              ))}
          </div>
        )}

        <button
          type='button'
          onClick={() => openAt(0)}
          className='absolute bottom-4 right-4 flex h-10 items-center gap-2 rounded-control
                     border bg-surface/95 px-3.5 text-sm font-medium backdrop-blur
                     transition-colors hover:bg-surface'
        >
          <PiImages aria-hidden='true' className='h-4 w-4' />
          <span className='tnum'>
            {photos.length} photo{photos.length === 1 ? '' : 's'}
          </span>
        </button>
      </div>

      {open && (
        <div
          role='dialog'
          aria-modal='true'
          aria-label={`${title} photo gallery`}
          className='fixed inset-0 z-[60] flex flex-col bg-[rgb(var(--shadow-tint))]/95 backdrop-blur-sm'
        >
          <div className='flex items-center justify-between px-4 py-3 sm:px-6'>
            <p className='tnum text-sm text-white/70'>
              {index + 1} of {photos.length}
            </p>
            <button
              ref={closeRef}
              type='button'
              onClick={() => setOpen(false)}
              aria-label='Close gallery'
              className='flex h-10 w-10 items-center justify-center rounded-control
                         text-white/80 transition-colors hover:bg-white/10 hover:text-white'
            >
              <PiX className='h-5 w-5' />
            </button>
          </div>

          <div className='relative flex flex-1 items-center justify-center px-4 pb-2 sm:px-16'>
            <img
              src={photos[index]}
              onError={(e) => {
                e.currentTarget.src = FALLBACK;
              }}
              alt={`${title}, photo ${index + 1} of ${photos.length}`}
              className='max-h-full max-w-full rounded-card object-contain'
            />

            {photos.length > 1 && (
              <>
                <button
                  type='button'
                  onClick={() => go(-1)}
                  aria-label='Previous photo'
                  className='absolute left-2 flex h-11 w-11 items-center justify-center rounded-full
                             bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 sm:left-4'
                >
                  <PiCaretLeft className='h-5 w-5' />
                </button>
                <button
                  type='button'
                  onClick={() => go(1)}
                  aria-label='Next photo'
                  className='absolute right-2 flex h-11 w-11 items-center justify-center rounded-full
                             bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 sm:right-4'
                >
                  <PiCaretRight className='h-5 w-5' />
                </button>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <div className='flex justify-center gap-2 overflow-x-auto px-4 py-4'>
              {photos.map((src, i) => (
                <button
                  key={src}
                  type='button'
                  onClick={() => setIndex(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === index}
                  className={`h-14 w-20 shrink-0 overflow-hidden rounded-[6px] border-2 transition-all ${
                    i === index
                      ? 'border-white opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={src} alt='' className='h-full w-full object-cover' />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
