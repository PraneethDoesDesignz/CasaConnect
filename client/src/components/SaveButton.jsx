import { PiHeart, PiHeartFill } from 'react-icons/pi';
import useSaved from '../lib/useSaved';

export default function SaveButton({ listingId, name, className = '' }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(listingId);

  return (
    <button
      type='button'
      // Cards wrap their content in a Link; without this the click navigates.
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(listingId);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved` : `Save ${name}`}
      title={saved ? 'Remove from saved' : 'Save for later'}
      className={`flex h-9 w-9 items-center justify-center rounded-control border
                  bg-surface/90 backdrop-blur transition-all duration-200
                  hover:bg-surface active:scale-90 ${
                    saved ? 'text-danger' : 'text-muted hover:text-ink'
                  } ${className}`}
    >
      {saved ? (
        <PiHeartFill aria-hidden='true' className='h-[18px] w-[18px]' />
      ) : (
        <PiHeart aria-hidden='true' className='h-[18px] w-[18px]' />
      )}
    </button>
  );
}
