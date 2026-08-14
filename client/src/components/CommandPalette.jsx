import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  PiMagnifyingGlass,
  PiHouseLine,
  PiPlusCircle,
  PiUser,
  PiInfo,
  PiSun,
  PiMoon,
  PiDesktopTower,
  PiHeart,
  PiArrowRight,
} from 'react-icons/pi';
import useTheme from '../lib/useTheme';
import { price, activePrice } from '../lib/format';

export const OPEN_EVENT = 'casaconnect:open-palette';
export const openPalette = () => window.dispatchEvent(new Event(OPEN_EVENT));

/**
 * Cmd+K palette. Static actions are filtered locally; listing results come
 * from the API behind a 220ms debounce with the in-flight request aborted on
 * every new keystroke, so a fast typist never sees an older response land.
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { setMode } = useTheme();
  const { currentUser } = useSelector((state) => state.user);

  const actions = useMemo(
    () => [
      { id: 'home', label: 'Go to home', icon: PiHouseLine, run: () => navigate('/') },
      {
        id: 'browse',
        label: 'Browse all listings',
        icon: PiMagnifyingGlass,
        run: () => navigate('/search'),
      },
      {
        id: 'rent',
        label: 'Browse homes to rent',
        icon: PiHouseLine,
        run: () => navigate('/search?type=rent'),
      },
      {
        id: 'sale',
        label: 'Browse homes for sale',
        icon: PiHouseLine,
        run: () => navigate('/search?type=sale'),
      },
      {
        id: 'saved',
        label: 'View saved listings',
        icon: PiHeart,
        run: () => navigate('/search?saved=true'),
      },
      {
        id: 'create',
        label: 'List a property',
        icon: PiPlusCircle,
        run: () => navigate('/create-listing'),
      },
      {
        id: 'profile',
        label: currentUser ? 'Go to your account' : 'Sign in',
        icon: PiUser,
        run: () => navigate(currentUser ? '/profile' : '/sign-in'),
      },
      { id: 'about', label: 'About this project', icon: PiInfo, run: () => navigate('/about') },
      {
        id: 'theme-light',
        label: 'Switch to light theme',
        icon: PiSun,
        run: () => setMode('light'),
      },
      {
        id: 'theme-dark',
        label: 'Switch to dark theme',
        icon: PiMoon,
        run: () => setMode('dark'),
      },
      {
        id: 'theme-system',
        label: 'Match system theme',
        icon: PiDesktopTower,
        run: () => setMode('system'),
      },
    ],
    [navigate, setMode, currentUser]
  );

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions.slice(0, 6);
    return actions.filter((a) => a.label.toLowerCase().includes(q));
  }, [actions, query]);

  const items = useMemo(
    () => [
      ...filteredActions.map((a) => ({ kind: 'action', ...a })),
      ...results.map((l) => ({ kind: 'listing', id: l._id, listing: l })),
    ],
    [filteredActions, results]
  );

  // Open and close on Cmd/Ctrl+K from anywhere. The custom event lets the
  // header trigger open it without threading a context through the tree.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setActive(0);
      return;
    }
    // Focus lands after the dialog paints, otherwise the caret is lost.
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/listing/get?searchTerm=${encodeURIComponent(q)}&limit=5`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== 'AbortError') setResults([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 220);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  useEffect(() => setActive(0), [query]);

  // Keep the highlighted row inside the scroll viewport.
  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const runItem = (item) => {
    setOpen(false);
    if (item.kind === 'action') item.run();
    else navigate(`/listing/${item.listing._id}`);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (items.length ? (i + 1) % items.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (items.length ? (i - 1 + items.length) % items.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[active]) runItem(items[active]);
      else if (query.trim())
        {
          setOpen(false);
          navigate(`/search?searchTerm=${encodeURIComponent(query.trim())}`);
        }
    }
  };

  if (!open) return null;

  return (
    <div
      className='fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]'
      role='dialog'
      aria-modal='true'
      aria-label='Command palette'
    >
      <div
        className='absolute inset-0 bg-[rgb(var(--shadow-tint))]/50 backdrop-blur-[2px]'
        onClick={() => setOpen(false)}
      />

      <div className='card-raised relative w-full max-w-xl overflow-hidden'>
        <div className='flex items-center gap-3 border-b px-4'>
          <PiMagnifyingGlass
            aria-hidden='true'
            className='h-[18px] w-[18px] shrink-0 text-faint'
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder='Search listings or jump to a page'
            aria-label='Search listings or jump to a page'
            className='h-14 flex-1 bg-transparent text-[0.9375rem] text-ink outline-none placeholder:text-faint'
          />
          <kbd className='kbd'>Esc</kbd>
        </div>

        <div ref={listRef} className='max-h-[52vh] overflow-y-auto p-2'>
          {filteredActions.length > 0 && (
            <p className='px-2 pb-1 pt-2 text-[0.6875rem] font-medium uppercase tracking-wider text-faint'>
              Actions
            </p>
          )}

          {items.map((item, i) => {
            const isActive = i === active;
            const rowClass = `flex w-full items-center gap-3 rounded-control px-2 py-2.5 text-left transition-colors ${
              isActive ? 'bg-sunken' : ''
            }`;
            // The listings group header belongs above its first row.
            const groupHeader =
              item.kind === 'listing' && i === filteredActions.length ? (
                <p className='px-2 pb-1 pt-3 text-[0.6875rem] font-medium uppercase tracking-wider text-faint'>
                  Listings
                </p>
              ) : null;

            if (item.kind === 'action') {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  data-active={isActive}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => runItem(item)}
                  className={rowClass}
                >
                  <Icon aria-hidden='true' className='h-[18px] w-[18px] shrink-0 text-muted' />
                  <span className='flex-1 text-[0.9375rem]'>{item.label}</span>
                  {isActive && (
                    <PiArrowRight aria-hidden='true' className='h-4 w-4 text-faint' />
                  )}
                </button>
              );
            }

            const l = item.listing;
            return (
              <div key={l._id}>
                {groupHeader}
                <button
                  data-active={isActive}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => runItem(item)}
                  className={rowClass}
                >
                  <img
                    src={l.imageUrls?.[0]}
                    alt=''
                    className='h-10 w-12 shrink-0 rounded-[4px] border object-cover'
                  />
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-[0.9375rem]'>{l.name}</span>
                    <span className='tnum block truncate text-[0.8125rem] text-muted'>
                      {price(activePrice(l))} · {l.address}
                    </span>
                  </span>
                </button>
              </div>
            );
          })}

          {items.length === 0 && (
            <p className='px-2 py-8 text-center text-sm text-muted'>
              {searching
                ? 'Searching'
                : query.trim()
                ? `Nothing matched "${query.trim()}". Press Enter to search anyway.`
                : 'Type to search.'}
            </p>
          )}
        </div>

        <div className='flex items-center gap-4 border-t bg-sunken/60 px-4 py-2.5 text-[0.75rem] text-muted'>
          <span className='flex items-center gap-1.5'>
            <kbd className='kbd'>↑</kbd>
            <kbd className='kbd'>↓</kbd>
            navigate
          </span>
          <span className='flex items-center gap-1.5'>
            <kbd className='kbd'>↵</kbd>
            open
          </span>
        </div>
      </div>
    </div>
  );
}
