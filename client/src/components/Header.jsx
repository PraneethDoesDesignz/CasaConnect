import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PiMagnifyingGlass, PiList, PiX, PiHeart } from 'react-icons/pi';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { openPalette } from './CommandPalette';
import useSaved from '../lib/useSaved';

const NAV = [
  { to: '/search', label: 'Browse' },
  { to: '/about', label: 'About' },
  { to: '/about#contact', label: 'Contact' },
];

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { count } = useSaved();

  useEffect(() => {
    setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform));
  }, []);

  useEffect(() => {
    const term = new URLSearchParams(location.search).get('searchTerm');
    setSearchTerm(term || '');
  }, [location.search]);

  useEffect(() => setMenuOpen(false), [location.pathname, location.hash]);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?searchTerm=${encodeURIComponent(searchTerm)}`);
  };

  const navClass = ({ isActive }) =>
    `relative text-sm transition-colors ${
      isActive
        ? 'text-ink font-medium after:absolute after:-bottom-[21px] after:left-0 after:h-px after:w-full after:bg-accent'
        : 'text-muted hover:text-ink'
    }`;

  return (
    <>
      <a
        href='#main'
        className='sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70]
                   focus:rounded-control focus:bg-accent focus:px-4 focus:py-2
                   focus:text-sm focus:text-[rgb(var(--on-accent))]'
      >
        Skip to content
      </a>

      <header className='sticky top-0 z-40 border-b bg-canvas/80 backdrop-blur-xl'>
        <div className='shell flex h-16 items-center gap-4'>
          <Logo />

          {/* Opens the command palette rather than being a second search box. */}
          <button
            type='button'
            onClick={openPalette}
            className='group ml-auto hidden h-9 items-center gap-2 rounded-control border
                       bg-surface pl-3 pr-2 text-sm text-faint transition-colors
                       hover:border-[rgb(var(--faint))] md:flex lg:w-64'
          >
            <PiMagnifyingGlass aria-hidden='true' className='h-4 w-4' />
            <span className='hidden lg:inline'>Search or jump to</span>
            <span className='lg:hidden'>Search</span>
            <kbd className='kbd ml-auto hidden lg:inline-flex'>
              {isMac ? '⌘' : 'Ctrl'} K
            </kbd>
          </button>

          <nav className='hidden items-center gap-6 md:flex'>
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className='ml-auto flex items-center gap-1 md:ml-0 md:gap-2'>
            <Link
              to='/search?saved=true'
              aria-label={`Saved listings, ${count} saved`}
              className='relative flex h-9 w-9 items-center justify-center rounded-control
                         text-muted transition-colors hover:bg-sunken hover:text-ink'
            >
              <PiHeart aria-hidden='true' className='h-[18px] w-[18px]' />
              {count > 0 && (
                <span
                  className='tnum absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px]
                             items-center justify-center rounded-full bg-accent px-1
                             text-[10px] font-semibold text-[rgb(var(--on-accent))]'
                >
                  {count}
                </span>
              )}
            </Link>

            <ThemeToggle />

            {currentUser ? (
              <Link
                to='/profile'
                className='ml-1 rounded-control transition-opacity hover:opacity-80'
              >
                <img
                  className='h-8 w-8 rounded-[8px] border object-cover'
                  src={currentUser.avatar}
                  alt={`${currentUser.username || 'Your'} profile`}
                />
              </Link>
            ) : (
              <Link to='/sign-in' className='btn btn-sm btn-primary ml-1 hidden md:inline-flex'>
                Sign in
              </Link>
            )}

            <button
              type='button'
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls='mobile-nav'
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className='btn btn-sm btn-ghost -mr-1 w-9 px-0 md:hidden'
            >
              {menuOpen ? <PiX className='h-5 w-5' /> : <PiList className='h-5 w-5' />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div id='mobile-nav' className='border-t bg-canvas md:hidden'>
            <div className='shell flex flex-col gap-4 py-4'>
              <form onSubmit={handleSubmit} role='search' className='relative'>
                <label htmlFor='mobile-search' className='sr-only'>
                  Search listings by name
                </label>
                <PiMagnifyingGlass
                  aria-hidden='true'
                  className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint'
                />
                <input
                  id='mobile-search'
                  type='search'
                  placeholder='Search listings'
                  className='input pl-9'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
              <nav className='flex flex-col divide-y'>
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `py-3 text-[0.9375rem] ${
                        isActive ? 'font-medium text-ink' : 'text-muted'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              {!currentUser && (
                <Link to='/sign-in' className='btn btn-md btn-primary w-full'>
                  Sign in
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
